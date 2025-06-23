import cv2
import mediapipe as mp
import pyautogui
import signal
from flask import Flask, render_template, jsonify, Response, redirect, url_for, session, request
import json
from utils import calculate_iris_center, initialize_calibration, finalize_calibration
import threading
from flask_cors import CORS
import win32api, win32con
import os
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify
from database import init_database, save_communication, save_phrase

app = Flask(__name__)
app.secret_key = 'eye_tracking_secret_key'  
CORS(app)

calibration_points = {}
calibration_steps = ["top_left", "top_right", "bottom_left", "bottom_right"]
current_step = 0
calibration_done = False
last_mouse_x, last_mouse_y = pyautogui.position()
screen_w, screen_h = pyautogui.size()

cam = cv2.VideoCapture(0)
face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)

def move_mouse(x, y):
    win32api.SetCursorPos((int(x), int(y)))

def generate_frames():
    while True:
        success, frame = cam.read()
        if not success:
            break
        else:
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            output = face_mesh.process(rgb_frame)
            
            if output.multi_face_landmarks:
                landmarks = output.multi_face_landmarks[0].landmark
                frame_h, frame_w, _ = frame.shape
                iris_x, iris_y = calculate_iris_center(landmarks, frame_w, frame_h)
                
                line_length = 10
                line_thickness = 2
                color = (0, 255, 0)
                
                cv2.line(frame, (int(iris_x - line_length), int(iris_y)),
                        (int(iris_x + line_length), int(iris_y)), color, line_thickness)
                cv2.line(frame, (int(iris_x), int(iris_y - line_length)),
                        (int(iris_x), int(iris_y + line_length)), color, line_thickness)
                
                face_landmarks = output.multi_face_landmarks[0].landmark
                x_coords = [landmark.x * frame_w for landmark in face_landmarks]
                y_coords = [landmark.y * frame_h for landmark in face_landmarks]
                
                left = int(min(x_coords))
                right = int(max(x_coords))
                top = int(min(y_coords))
                bottom = int(max(y_coords))
                
                margin = 20
                left = max(0, left - margin)
                right = min(frame_w, right + margin)
                top = max(0, top - margin)
                bottom = min(frame_h, bottom + margin)
                
                cv2.rectangle(frame, (left, top), (right, bottom), (255, 255, 255), 2)
                
                font = cv2.FONT_HERSHEY_SIMPLEX
                text = "Usuario 1"
                text_size = cv2.getTextSize(text, font, 1, 2)[0]
                text_x = left
                text_y = top - 10 if top - 10 > text_size[1] else top + text_size[1]
                
                cv2.putText(frame, text, (text_x, text_y), font, 1, (255, 255, 255), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

init_database()

@app.route('/save_communication', methods=['POST'])
def save_communication_route():
    try:
        data = request.get_json()
        save_communication(data)
        return jsonify({"status": "success", "message": "Comunicação salva"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/save_phrase', methods=['POST'])
def save_phrase_route():
    try:
        data = request.get_json()
        save_phrase(data)
        return jsonify({"status": "success", "message": "Frase salva"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == 'admin' and password == 'admin':
            session['logged_in'] = True
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Credenciais inválidas')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/calibration')
@login_required
def calibration():
    global current_step, calibration_done, calibration_points
    current_step = 0
    calibration_done = False
    calibration_points = {}
    return render_template('calibration.html', step=calibration_steps[0])

@app.route('/history')
@login_required
def history():
    return render_template('history.html')

@app.route('/settings')
@login_required
def settings():
    return render_template('settings.html')

@app.route('/video_feed')
@login_required
def video_feed():
    return Response(generate_frames(), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/calibrate', methods=['POST'])
@login_required
def calibrate():
    global current_step, calibration_done, calibration_points
    
    success, frame = cam.read()
    if success:
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        output = face_mesh.process(rgb_frame)
        
        if output.multi_face_landmarks:
            landmarks = output.multi_face_landmarks[0].landmark
            frame_h, frame_w, _ = frame.shape
            iris_x, iris_y = calculate_iris_center(landmarks, frame_w, frame_h)
            
            step_name = calibration_steps[current_step]
            calibration_points[step_name] = (iris_x, iris_y)
            
            current_step += 1
            if current_step >= len(calibration_steps):
                calibration_done = True
                return jsonify({
                    "status": "complete",
                    "message": "Calibration complete!"
                })
            
            return jsonify({
                "status": "success",
                "current_step": current_step,
                "next_point": calibration_steps[current_step]
            })
    
    return jsonify({"status": "error", "message": "Failed to capture frame"})

@app.route('/get_mouse_position', methods=['GET'])
@login_required
def get_mouse_position():
    global last_mouse_x, last_mouse_y
    
    if not calibration_done:
        return jsonify({"status": "error", "message": "Calibration not complete"})
    
    success, frame = cam.read()
    if success:
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        output = face_mesh.process(rgb_frame)
        
        if output.multi_face_landmarks:
            landmarks = output.multi_face_landmarks[0].landmark
            frame_h, frame_w, _ = frame.shape
            iris_x, iris_y = calculate_iris_center(landmarks, frame_w, frame_h)
            
            screen_x, screen_y = finalize_calibration(iris_x, iris_y, calibration_points, screen_w, screen_h)
            
            smooth_mouse_x = last_mouse_x + (screen_x - last_mouse_x) * 0.3
            smooth_mouse_y = last_mouse_y + (screen_y - last_mouse_y) * 0.3
            
            move_mouse(smooth_mouse_x, smooth_mouse_y)
            
            last_mouse_x, last_mouse_y = smooth_mouse_x, smooth_mouse_y
            
            return jsonify({
                "status": "success",
                "x": smooth_mouse_x,
                "y": smooth_mouse_y
            })
    
    return jsonify({"status": "error", "message": "Failed to capture frame"})

@app.route('/log_communication', methods=['POST'])
@login_required
def log_communication():
    data = request.json
    message = data.get('message')
    
    if message:
        return jsonify({
            "status": "success",
            "message": f"Logged communication: {message}"
        })
    
    return jsonify({"status": "error", "message": "No message provided"})

def cleanup(signal_received, frame):
    print("Cleaning up...")
    cam.release()
    cv2.destroyAllWindows()
    exit(0)

signal.signal(signal.SIGINT, cleanup)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
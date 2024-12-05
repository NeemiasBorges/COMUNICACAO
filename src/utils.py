import numpy as np

# Inicializar variáveis de calibração
def initialize_calibration():
    calibration_points = {"top_left": None, "top_right": None, "bottom_left": None, "bottom_right": None}
    calibration_steps = ["top_left", "top_right", "bottom_left", "bottom_right"]
    current_step = 0
    return calibration_points, calibration_steps, current_step

# Calcular centro da íris
def calculate_iris_center(landmarks, frame_w, frame_h):
    iris_right = landmarks[474:478]
    x_coords = [int(landmark.x * frame_w) for landmark in iris_right]
    y_coords = [int(landmark.y * frame_h) for landmark in iris_right]
    iris_center_x = int(np.mean(x_coords))
    iris_center_y = int(np.mean(y_coords))
    return iris_center_x, iris_center_y

# Finalizar calibração (mapeamento de íris para tela)
def finalize_calibration(iris_x, iris_y, calibration_points, screen_w, screen_h):
    top_left = calibration_points["top_left"]
    top_right = calibration_points["top_right"]
    bottom_left = calibration_points["bottom_left"]
    bottom_right = calibration_points["bottom_right"]

    x_ratio = (iris_x - top_left[0]) / (top_right[0] - top_left[0])
    y_ratio = (iris_y - top_left[1]) / (bottom_left[1] - top_left[1])

    screen_x = x_ratio * screen_w
    screen_y = y_ratio * screen_h
    return screen_x, screen_y
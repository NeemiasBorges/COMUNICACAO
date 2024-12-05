import cv2
import numpy as np

class EyePositionMapper:
    def __init__(self):
        # Carregar classificadores do OpenCV
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    def detect_iris_position(self, eye_roi):
        # Converter para escala de cinza
        gray = cv2.cvtColor(eye_roi, cv2.COLOR_BGR2GRAY)
        
        # Aplicar blur para reduzir ruído
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        
        # Threshold adaptativo
        thresh = cv2.adaptiveThreshold(
            blurred, 
            255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 
            11, 
            2
        )
        
        # Encontrar contornos
        contours, _ = cv2.findContours(
            thresh, 
            cv2.RETR_EXTERNAL, 
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Filtrar contornos para encontrar a íris
        iris_contours = [cnt for cnt in contours if 10 < cv2.contourArea(cnt) < 500]
        
        if iris_contours:
            # Encontrar o maior contorno (presumivelmente a íris)
            largest_contour = max(iris_contours, key=cv2.contourArea)
            
            # Encontrar o centro do contorno
            M = cv2.moments(largest_contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                return (cx, cy)
        
        return None
    
    def determine_eye_zone(self, eye_width, eye_height, iris_x, iris_y):
        """
        Determina a zona do olho baseado na posição da íris
        Dividindo o olho em 9 zonas (3x3)
        """
        zones = {
            'top_left': (0, eye_width/3, 0, eye_height/3),
            'top_center': (eye_width/3, 2*eye_width/3, 0, eye_height/3),
            'top_right': (2*eye_width/3, eye_width, 0, eye_height/3),
            
            'middle_left': (0, eye_width/3, eye_height/3, 2*eye_height/3),
            'middle_center': (eye_width/3, 2*eye_width/3, eye_height/3, 2*eye_height/3),
            'middle_right': (2*eye_width/3, eye_width, eye_height/3, 2*eye_height/3),
            
            'bottom_left': (0, eye_width/3, 2*eye_height/3, eye_height),
            'bottom_center': (eye_width/3, 2*eye_width/3, 2*eye_height/3, eye_height),
            'bottom_right': (2*eye_width/3, eye_width, 2*eye_height/3, eye_height)
        }
        
        for zone_name, (x_start, x_end, y_start, y_end) in zones.items():
            if (x_start <= iris_x < x_end and y_start <= iris_y < y_end):
                return zone_name
        
        return 'undefined'
    
    def map_eye_position(self, frame):
        # Converter para escala de cinza
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detectar rostos
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        
        for (x, y, w, h) in faces:
            # Região de interesse do rosto
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = frame[y:y+h, x:x+w]
            
            # Detectar olhos
            eyes = self.eye_cascade.detectMultiScale(roi_gray)
            
            for (ex, ey, ew, eh) in eyes:
                # Verificar se o olho está no lado direito do rosto
                if ex + ew/2 > w/2:
                    # Extrair região do olho direito
                    right_eye_roi = roi_color[ey:ey+eh, ex:ex+ew]
                    
                    # Detectar movimento da íris
                    iris_center = self.detect_iris_position(right_eye_roi)
                    
                    if iris_center:
                        # Determinar a zona do olho
                        zone = self.determine_eye_zone(ew, eh, iris_center[0], iris_center[1])
                        
                        # Desenhar círculo na íris
                        cv2.circle(
                            frame, 
                            (x+ex+iris_center[0], y+ey+iris_center[1]), 
                            5, 
                            (255, 0, 0),  # Cor azul
                            -1
                        )
                        
                        # Adicionar texto da zona
                        cv2.putText(
                            frame, 
                            f"Zone: {zone}", 
                            (x+ex, y+ey-10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 
                            0.5, 
                            (0, 255, 0), 
                            2
                        )
                    
                    # Desenhar grade no olho
                    for i in range(1, 3):
                        # Linhas horizontais
                        cv2.line(
                            frame, 
                            (x+ex, y+ey+int(i*eh/3)), 
                            (x+ex+ew, y+ey+int(i*eh/3)), 
                            (0, 255, 0), 
                            1
                        )
                        # Linhas verticais
                        cv2.line(
                            frame, 
                            (x+ex+int(i*ew/3), y+ey), 
                            (x+ex+int(i*ew/3), y+ey+eh), 
                            (0, 255, 0), 
                            1
                        )

        return frame

def main():
    # Iniciar captura de vídeo
    cap = cv2.VideoCapture(0)
    
    # Criar instância do mapeador
    eye_mapper = EyePositionMapper()
    
    while True:
        # Capturar frame
        ret, frame = cap.read()
        if not ret:
            break
        
        # Mapear posição do olho
        processed_frame = eye_mapper.map_eye_position(frame)
        
        # Exibir frame
        cv2.imshow('Eye Position Mapping', processed_frame)
        
        # Sair com 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Liberar recursos
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
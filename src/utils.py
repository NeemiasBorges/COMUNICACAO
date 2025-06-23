def calculate_iris_center(landmarks, frame_w, frame_h):
    """
    Calculate the center position of the iris based on facial landmarks.
    
    Parameters:
    - landmarks: Face landmarks from mediapipe
    - frame_w: Frame width
    - frame_h: Frame height
    
    Returns:
    - tuple: (x, y) coordinates of the iris center
    """
    # MediaPipe indexes for iris landmarks
    LEFT_IRIS = [474, 475, 476, 477]
    RIGHT_IRIS = [469, 470, 471, 472]
    
    # We'll use the right eye for tracking
    iris_points = []
    for idx in RIGHT_IRIS:
        x = landmarks[idx].x * frame_w
        y = landmarks[idx].y * frame_h
        iris_points.append((x, y))
    
    # Calculate the center of the iris points
    iris_x = sum(p[0] for p in iris_points) / len(iris_points)
    iris_y = sum(p[1] for p in iris_points) / len(iris_points)
    
    return iris_x, iris_y

def initialize_calibration():
    """
    Initialize the calibration process.
    
    Returns:
    - dict: Empty dictionary to store calibration points
    """
    return {}

def finalize_calibration(iris_x, iris_y, calibration_points, screen_w, screen_h):
    """
    Map the iris position to screen coordinates based on calibration.
    
    Parameters:
    - iris_x: Current iris x position
    - iris_y: Current iris y position
    - calibration_points: Dictionary with calibration data
    - screen_w: Screen width
    - screen_h: Screen height
    
    Returns:
    - tuple: (x, y) screen coordinates
    """
    # Extract calibration points
    tl = calibration_points["top_left"]
    tr = calibration_points["top_right"]
    bl = calibration_points["bottom_left"]
    br = calibration_points["bottom_right"]
    
    # Calculate the horizontal and vertical ranges in iris coordinates
    iris_width = tr[0] - tl[0]
    iris_height = bl[1] - tl[1]
    
    # Map iris coordinates to screen coordinates
    # Normalize the iris position within the calibrated range
    if iris_width > 0 and iris_height > 0:
        x_ratio = (iris_x - tl[0]) / iris_width
        y_ratio = (iris_y - tl[1]) / iris_height
        
        # Apply ratios to screen dimensions
        screen_x = x_ratio * screen_w
        screen_y = y_ratio * screen_h
        
        # Constrain to screen boundaries
        screen_x = max(0, min(screen_x, screen_w))
        screen_y = max(0, min(screen_y, screen_h))
        
        return screen_x, screen_y
    
    # Fallback if calibration data is invalid
    return screen_w / 2, screen_h / 2
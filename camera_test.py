import cv2
cap = cv2.VideoCapture(0)  # Use 0 for default webcam, change if multiple cameras exist
if not cap.isOpened():
    print("Error: Could not open webcam.")
else:
    print("Webcam opened successfully.")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow('Test Camera', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()

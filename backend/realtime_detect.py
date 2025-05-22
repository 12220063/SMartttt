import cv2
from ultralytics import YOLO
import requests
import base64
import json
import time
import os

# --- CONFIGURATION ---
API_URL = 'http://localhost:5000/save'  # Your backend endpoint
model = YOLO('best.pt')  # Load your trained YOLO model
cap = cv2.VideoCapture(0)  # Start webcam

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Perform detection
    results = model(frame)

    # Annotate the frame (draw boxes, class names, confidence)
    annotated_frame = results[0].plot()

    # Show it in window
    cv2.imshow('SmartSort - Real-time Detection', annotated_frame)

    # Handle key presses
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):  # Quit
        break

    if key == ord('s'):  # Save
        print("Saving current frame and detections...")

        # Generate a unique filename for the image
        filename = f"frame_{int(time.time())}.jpg"
        image_path = os.path.join('uploads', filename)

        # Encode frame as JPEG for sending
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # Collect detections
        detections = []
        for box in results[0].boxes:
            cls = int(box.cls[0]) if hasattr(box.cls, '_len_') else int(box.cls)
            conf = float(box.conf[0]) if hasattr(box.conf, '_len_') else float(box.conf)
            coords = box.xyxy[0].tolist() if hasattr(box.xyxy, '_len_') else box.xyxy.tolist()
            detections.append({
                "class": cls,
                "confidence": conf,
                "box": coords
            })

        # Prepare the payload with the image and detections
        payload = {
            "filename": filename,
            "image": jpg_as_text,
            "detections": detections
        }

        try:
            res = requests.post(API_URL, json=payload)
            if res.ok:
                print("Saved successfully to MongoDB")
            else:
                print("Failed to save:", res.text)
        except Exception as e:
            print("Error:", e)

# Cleanup
cap.release()
cv2.destroyAllWindows()
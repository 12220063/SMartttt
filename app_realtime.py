# app_realtime.py
from flask import Flask, Response
import cv2
from ultralytics import YOLO  # If using YOLOv8

app = Flask(__name__)

# Load your trained YOLOv8 model
model = YOLO('../backend/best.pt')  # <-- Replace 'best.pt' with your trained weights

camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # YOLO prediction
            results = model.predict(frame, imgsz=640, conf=0.5, verbose=False)
            annotated_frame = results[0].plot()

            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/realtime')
def realtime():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
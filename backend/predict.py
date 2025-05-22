import sys
import json
import contextlib
import os
from ultralytics import YOLO

def main(image_path):
    # Suppress stdout
    with open(os.devnull, 'w') as fnull:
        with contextlib.redirect_stdout(fnull):
            model = YOLO('best.pt')  # Load model
            results = model(image_path)  # Run prediction

    predictions = []
    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy()

        for i in range(len(boxes)):
            prediction = {
                'class_id': int(classes[i]),
                'confidence': float(confidences[i]),
                'box': boxes[i].tolist()
            }
            predictions.append(prediction)

    # OUTPUT ONLY JSON
    print(json.dumps(predictions))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    main(image_path)

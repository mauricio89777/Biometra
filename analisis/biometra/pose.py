"""Wrapper de MediaPipe PoseLandmarker."""
import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision


class PoseExtractor:
    def __init__(self, model_path):
        options = vision.PoseLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=model_path),
            running_mode=vision.RunningMode.VIDEO,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self._detector = vision.PoseLandmarker.create_from_options(options)

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self._detector.close()

    def detect(self, frame_bgr, timestamp_ms):
        """Devuelve array (33, 4) [x, y, z, visibility] o None si no hay persona."""
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = self._detector.detect_for_video(image, timestamp_ms)
        if not result.pose_landmarks:
            return None
        return np.array(
            [[p.x, p.y, p.z, p.visibility] for p in result.pose_landmarks[0]],
            dtype=np.float32,
        )

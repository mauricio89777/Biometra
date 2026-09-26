import cv2
import mediapipe as mp
import csv
import os
import sys

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# ============================================================
# CONFIGURACIÓN
# ============================================================

VIDEO_PATH = sys.argv[1] if len(sys.argv) > 1 else "videos/movimiento.mp4"

MODEL_PATH = "models/pose_landmarker_full.task"

VIDEO_NAME = os.path.splitext(
    os.path.basename(VIDEO_PATH)
)[0]

OUTPUT_VIDEO = f"output/{VIDEO_NAME}_pose.mp4"
OUTPUT_CSV = f"output/{VIDEO_NAME}_landmarks.csv"


# ============================================================
# COMPROBACIONES
# ============================================================

if not os.path.exists(VIDEO_PATH):
    print(f"ERROR: no existe el video:")
    print(VIDEO_PATH)
    sys.exit(1)

if not os.path.exists(MODEL_PATH):
    print("ERROR: no existe el modelo:")
    print(MODEL_PATH)
    sys.exit(1)

os.makedirs("output", exist_ok=True)


# ============================================================
# CONFIGURAR MEDIAPIPE
# ============================================================

base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO,
    num_poses=2,
    min_pose_detection_confidence=0.5,
    min_pose_presence_confidence=0.5,
    min_tracking_confidence=0.5
)

detector = vision.PoseLandmarker.create_from_options(options)


# ============================================================
# ABRIR VIDEO
# ============================================================

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print("ERROR: no se pudo abrir el video.")
    sys.exit(1)


width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

if fps <= 0:
    fps = 30

total_frames = int(
    cap.get(cv2.CAP_PROP_FRAME_COUNT)
)


print("===================================")
print("MediaPipe Pose Test")
print("===================================")
print(f"Video:       {VIDEO_PATH}")
print(f"Resolución:  {width}x{height}")
print(f"FPS:         {fps:.2f}")
print(f"Frames:      {total_frames}")
print()


# ============================================================
# VIDEO DE SALIDA
# ============================================================

fourcc = cv2.VideoWriter_fourcc(*"mp4v")

out = cv2.VideoWriter(
    OUTPUT_VIDEO,
    fourcc,
    fps,
    (width, height)
)


# ============================================================
# CSV
# ============================================================

csv_file = open(
    OUTPUT_CSV,
    mode="w",
    newline="",
    encoding="utf-8"
)

csv_writer = csv.writer(csv_file)

csv_writer.writerow([
    "frame",
    "time",
    "landmark_id",
    "x",
    "y",
    "z",
    "visibility"
])


# ============================================================
# PROCESAMIENTO
# ============================================================

frame_number = 0


while cap.isOpened():

    success, frame = cap.read()

    if not success:
        break

    frame_number += 1

    # --------------------------------------------------------
    # Convertir BGR -> RGB
    # --------------------------------------------------------

    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    # --------------------------------------------------------
    # Crear imagen de MediaPipe
    # --------------------------------------------------------

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_frame
    )

    # --------------------------------------------------------
    # Timestamp
    # --------------------------------------------------------

    timestamp_ms = int(
        (frame_number / fps) * 1000
    )

    # --------------------------------------------------------
    # Detectar pose
    # --------------------------------------------------------

    result = detector.detect_for_video(
        mp_image,
        timestamp_ms
    )


    # ========================================================
    # LANDMARKS
    # ========================================================

    if result.pose_landmarks:

        landmarks = result.pose_landmarks[0]



        # ----------------------------------------------------
        # GUARDAR DATOS
        # ----------------------------------------------------

        timestamp = frame_number / fps

        for landmark_id, landmark in enumerate(landmarks):

            csv_writer.writerow([
                frame_number,
                timestamp,
                landmark_id,
                landmark.x,
                landmark.y,
                landmark.z,
                landmark.visibility
            ])


        # ----------------------------------------------------
        # DIBUJAR LANDMARKS
        # ----------------------------------------------------

        for landmark_id, landmark in enumerate(landmarks):

            x = int(landmark.x * width)
            y = int(landmark.y * height)

            if 0 <= x < width and 0 <= y < height:

                # Punto
                cv2.circle(
                    frame,
                    (x, y),
                    5,
                    (0, 255, 0),
                    -1
                )

                # Número
                cv2.putText(
                    frame,
                    str(landmark_id),
                    (x + 5, y - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    (255, 255, 255),
                    1,
                    cv2.LINE_AA
                )


        # ----------------------------------------------------
        # CONEXIONES DEL ESQUELETO
        # ----------------------------------------------------

        # Los índices de MediaPipe Pose
        # se conectan según el modelo corporal.

        connections = [
            (11, 12),

            (11, 13),
            (13, 15),

            (12, 14),
            (14, 16),

            (11, 23),
            (12, 24),

            (23, 24),

            (23, 25),
            (25, 27),

            (24, 26),
            (26, 28),

            (27, 29),
            (29, 31),

            (28, 30),
            (30, 32),

            (0, 11),
            (0, 12)
        ]


        for start_id, end_id in connections:

            start = landmarks[start_id]
            end = landmarks[end_id]

            x1 = int(start.x * width)
            y1 = int(start.y * height)

            x2 = int(end.x * width)
            y2 = int(end.y * height)

            cv2.line(
                frame,
                (x1, y1),
                (x2, y2),
                (255, 0, 0),
                2
            )


    # ========================================================
    # INFORMACIÓN
    # ========================================================

    cv2.putText(
        frame,
        f"Frame: {frame_number}/{total_frames}",
        (20, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )


    # ========================================================
    # MOSTRAR
    # ========================================================

    cv2.imshow(
        "MediaPipe Pose",
        frame
    )

    out.write(frame)


    # Q = salir
    PLAYBACK_SPEED = 0.25

    delay = int((1000 / fps) / PLAYBACK_SPEED)

    if cv2.waitKey(delay) & 0xFF == ord("q"):
        break


# ============================================================
# FINALIZAR
# ============================================================

cap.release()
out.release()
csv_file.close()

detector.close()

cv2.destroyAllWindows()


print()
print("===================================")
print("Procesamiento terminado")
print("===================================")
print(f"Video generado:")
print(OUTPUT_VIDEO)
print()
print(f"Datos generados:")
print(OUTPUT_CSV)
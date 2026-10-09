import cv2
import mediapipe as mp
import csv
import os
import sys
import json

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# CONFIGURACIÓN


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

#logs

print("[DEBUG] Antes de VIDEO_PATH", file=sys.stderr)

VIDEO_PATH = (
    sys.argv[1]
    if len(sys.argv) > 1
    else os.path.join(BASE_DIR, "videos", "movimiento.mp4")
)

print("[DEBUG] Después de VIDEO_PATH", file=sys.stderr)
print(f"[DEBUG] VIDEO_PATH: {VIDEO_PATH}", file=sys.stderr)




MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "pose_landmarker_full.task"
)

OUTPUT_DIR = os.path.join(BASE_DIR, "output")

VIDEO_NAME = os.path.splitext(
    os.path.basename(VIDEO_PATH)
)[0]

OUTPUT_VIDEO = os.path.join(
    OUTPUT_DIR,
    f"{VIDEO_NAME}_pose.mp4"
)

OUTPUT_CSV = os.path.join(
    OUTPUT_DIR,
    f"{VIDEO_NAME}_landmarks.csv"
)


def resultado_json(
    estado,
    video=None,
    video_procesado=None,
    datos=None,
    error=None
):
    resultado = {
        "estado": estado
    }

    if video is not None:
        resultado["video"] = video

    if video_procesado is not None:
        resultado["video_procesado"] = video_procesado

    if datos is not None:
        resultado["datos"] = datos

    if error is not None:
        resultado["error"] = error

    print(
        json.dumps(
            resultado,
            ensure_ascii=False
        )
    )


# COMPROBACIONES

if not os.path.exists(VIDEO_PATH):
    resultado_json(
        "error",
        error=f"No existe el video: {VIDEO_PATH}"
    )
    sys.exit(1)


if not os.path.exists(MODEL_PATH):
    resultado_json(
        "error",
        error=f"No existe el modelo: {MODEL_PATH}"
    )
    sys.exit(1)


os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# CONFIGURAR MEDIAPIPE

try:

    print(
        "[DEBUG] Configurando MediaPipe...",
        file=sys.stderr
    )

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

    detector = vision.PoseLandmarker.create_from_options(
        options
    )

    print(
        "[DEBUG] MediaPipe configurado correctamente",
        file=sys.stderr
    )

except Exception as error:

    print(
        f"[DEBUG] Error configurando MediaPipe: {error}",
        file=sys.stderr
    )

    resultado_json(
        "error",
        error=f"Error al configurar MediaPipe: {str(error)}"
    )

    sys.exit(1)


# ABRIR VIDEO

print(
    "[DEBUG] Abriendo video...",
    file=sys.stderr
)

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():

    resultado_json(
        "error",
        error=f"No se pudo abrir el video: {VIDEO_PATH}"
    )

    sys.exit(1)

print(
    "[DEBUG] Video abierto correctamente",
    file=sys.stderr
)



width = int(
cap.get(cv2.CAP_PROP_FRAME_WIDTH)
)

height = int(
cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
)

fps = cap.get(
cv2.CAP_PROP_FPS
)

if fps <= 0:
    fps = 30

total_frames = int(
cap.get(cv2.CAP_PROP_FRAME_COUNT)
)

#informacion del procesamientos
print(
    f"procesando video:{VIDEO_PATH}",
    file=sys.stderr
)

print(
    f"resolucion: {width}x{height}",
    file=sys.stderr
)

print(
    f"FPS: {fps:.2f}",
    file=sys.stderr
)


print(
    f"Frames:{total_frames}",
    file=sys.stderr
)




# VIDEO DE SALIDA

fourcc = cv2.VideoWriter_fourcc(*"mp4v")

out = cv2.VideoWriter(
    OUTPUT_VIDEO,
    fourcc,
    fps,
    (width, height)
)


# CSV


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

# PROCESAMIENTO

frame_number = 0

try:

    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        frame_number += 1


        # ====================================================
        # CONVERTIR BGR -> RGB
        # ====================================================

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        # ====================================================
        # CREAR IMAGEN DE MEDIAPIPE
        # ====================================================

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )


        # ====================================================
        # TIMESTAMP
        # ====================================================

        timestamp_ms = int(
            (frame_number / fps) * 1000
        )


        # ====================================================
        # DETECTAR POSE
        # ====================================================

        result = detector.detect_for_video(
            mp_image,
            timestamp_ms
        )


        # ====================================================
        # LANDMARKS
        # ====================================================

        if result.pose_landmarks:

            landmarks = result.pose_landmarks[0]


            # ------------------------------------------------
            # GUARDAR DATOS
            # ------------------------------------------------

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


            # ------------------------------------------------
            # DIBUJAR LANDMARKS
            # ------------------------------------------------

            for landmark_id, landmark in enumerate(landmarks):

                x = int(
                    landmark.x * width
                )

                y = int(
                    landmark.y * height
                )

                if 0 <= x < width and 0 <= y < height:

                    cv2.circle(
                        frame,
                        (x, y),
                        5,
                        (0, 255, 0),
                        -1
                    )

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


             
            # CONEXIONES DEL ESQUELETO

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


        # ====================================================
        # INFORMACIÓN DEL VIDEO
        # ====================================================

        cv2.putText(
            frame,
            f"Frame: {frame_number}/{total_frames}",
            (20, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )


        # ====================================================
        # GUARDAR VIDEO
        # ====================================================

        out.write(frame)


        # ====================================================
        # MOSTRAR VIDEO
        # ====================================================

        cv2.imshow(
            "MediaPipe Pose",
            frame
        )


        # ====================================================
        # VELOCIDAD DE REPRODUCCIÓN
        # ====================================================

        PLAYBACK_SPEED = 0.25

        delay = int(
            (1000 / fps) / PLAYBACK_SPEED
        )


        # ====================================================
        # Q = SALIR
        # ====================================================

        if cv2.waitKey(delay) & 0xFF == ord("q"):
            break


except Exception as error:

    cap.release()
    out.release()
    csv_file.close()
    detector.close()
    cv2.destroyAllWindows()

    resultado_json(
        "error",
        error=f"Error durante el proceso: {str(error)}"
    )

    sys.exit(1)


# ============================================================
# FINALIZAR
# ============================================================

cap.release()
out.release()
csv_file.close()

detector.close()

cv2.destroyAllWindows()


# ============================================================
# RESULTADO EXITOSO
# ============================================================

resultado_json(
    estado="completado",
    video=VIDEO_PATH,
    video_procesado=OUTPUT_VIDEO,
    datos=OUTPUT_CSV
)

sys.exit(0)
import cv2
import mediapipe as mp
import csv
import os
import sys
import json

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


#medicion
import math
from collections import deque

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




def calcular_angulo(a, b, c):
   
    ba = (a.x - b.x, a.y - b.y)
    bc = (c.x - b.x, c.y - b.y)

    producto = ba[0] * bc[0] + ba[1] * bc[1]

    norma_ba = math.sqrt(ba[0]**2 + ba[1]**2)
    norma_bc = math.sqrt(bc[0]**2 + bc[1]**2)

    if norma_ba == 0 or norma_bc == 0:
        return None

    coseno = producto / (norma_ba * norma_bc)
    coseno = max(-1.0, min(1.0, coseno))

    return math.degrees(math.acos(coseno))


def visibilidad_suficiente(landmark, minimo=0.5):
    return getattr(landmark, "visibility", 0.0) >= minimo


def resultado_json(
    estado,
    video=None,
    video_procesado=None,
    datos=None,
    error=None,
    analisis=None
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

    if analisis is not None:
        resultado["analisis"] = analisis

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

# Métricas del press militar
lado_analizado = None
angulos = []
historial_angulos = deque(maxlen=5)

frames_con_angulo = 0
repeticiones = 0
fase_bajada = False

# Índices de landmarks de MediaPipe
lados = {
    "izquierdo": (11, 13, 15),  # hombro, codo, muñeca
    "derecho": (12, 14, 16)
}


try:

    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        frame_number += 1


        # CONVERTIR BGR -> RGB

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # CREAR IMAGEN DE MEDIAPIPE

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # TIMESTAMP

        timestamp_ms = int(
            (frame_number / fps) * 1000
        )


        # DETECTAR POSE

        result = detector.detect_for_video(
            mp_image,
            timestamp_ms
        )

        # LANDMARKS

        if result.pose_landmarks:

            landmarks = result.pose_landmarks[0]

            # Seleccionar el brazo con mejor visibilidad al inicio
            if lado_analizado is None:
                visibilidad_lados = {}

                for nombre, indices in lados.items():
                    puntos = [landmarks[i] for i in indices]

                    visibilidad_lados[nombre] = sum(
                        getattr(p, "visibility", 0.0)
                        for p in puntos
                    ) / 3

                mejor_lado = max(
                    visibilidad_lados,
                    key=visibilidad_lados.get
                )

                if visibilidad_lados[mejor_lado] >= 0.5:
                    lado_analizado = mejor_lado

            # Calcular el ángulo del codo
            angulo_actual = None

            if lado_analizado is not None:
                indices = lados[lado_analizado]
                hombro, codo, muneca = [
                    landmarks[i] for i in indices
                ]

                puntos_visibles = all(
                    visibilidad_suficiente(p)
                    for p in (hombro, codo, muneca)
                )

                if puntos_visibles:
                    angulo_actual = calcular_angulo(
                        hombro,
                        codo,
                        muneca
                    )

            # Suavizar pequeñas variaciones entre frames
            if angulo_actual is not None:
                historial_angulos.append(angulo_actual)

                angulo_suavizado = sum(
                    historial_angulos
                ) / len(historial_angulos)

                angulos.append(angulo_suavizado)
                frames_con_angulo += 1

                # Conteo experimental de repeticiones
                # Bajada: codo suficientemente flexionado
                if angulo_suavizado <= 110:
                    fase_bajada = True

                # Subida: codo vuelve a estar extendido
                elif angulo_suavizado >= 155 and fase_bajada:
                    repeticiones += 1
                    fase_bajada = False

                # Mostrar el ángulo en el video procesado
                cv2.putText(
                    frame,
                    f"Angulo codo: {angulo_suavizado:.1f} grados",
                    (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"Repeticiones estimadas: {repeticiones}",
                    (20, 90),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

            # GUARDAR DATOS

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

            # DIBUJAR LANDMARKS

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

        # INFORMACIÓN DEL VIDEO
        cv2.putText(
            frame,
            f"Frame: {frame_number}/{total_frames}",
            (20, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        # GUARDAR VIDEO

        out.write(frame)

        # MOSTRAR VIDEO    

        cv2.imshow(
            "MediaPipe Pose",
            frame
        )

        # VELOCIDAD DE REPRODUCCIÓN
        
        PLAYBACK_SPEED = 0.90

        delay = int(
            (1000 / fps) / PLAYBACK_SPEED
        )

        # Q = SALIR
        

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


# FINALIZAR

cap.release()
out.release()
csv_file.close()

detector.close()

cv2.destroyAllWindows()


# RESULTADO DEL ANÁLISIS
analisis = {
    "ejercicio": "press_militar_barra",
    "lado_analizado": lado_analizado,
    "repeticiones_estimadas": repeticiones,
    "frames_procesados": frame_number,
    "frames_con_angulo": frames_con_angulo,
    "porcentaje_frames_utiles": round(
        (frames_con_angulo / frame_number) * 100,
        2
    ) if frame_number > 0 else 0,
    "angulo_minimo": round(min(angulos), 2) if angulos else None,
    "angulo_maximo": round(max(angulos), 2) if angulos else None,
    "rango_angular": round(
        max(angulos) - min(angulos), 2
    ) if angulos else None,
    "unidad_angular": "grados",
    "advertencias": [
        "Las métricas son estimaciones experimentales en 2D.",
        "La barra puede ocultar puntos corporales.",
        "El conteo depende de los umbrales angulares configurados.",
        "No se determina automáticamente si la técnica es correcta."
    ]
}

resultado_json(
    estado="completado",
    video=VIDEO_PATH,
    video_procesado=OUTPUT_VIDEO,
    datos=OUTPUT_CSV,
    analisis=analisis
)

sys.exit(0)
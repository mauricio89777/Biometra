
# Biometra

Proyecto de Titulo Duoc uc 2026


El proyecto Biometra se enfoca en implementar una plataforma web que permita analizar movimientos corporales, registrar progreso técnico y gestionar información de entrenamiento mediante herramientas de visión computacional e inteligencia artificial.
este proyecto va dirigido para el publico que desee empezar su vida en el entrenamiento y mejorar su estilo de vida.
Con ayuda del analisis metrico podemas dar informacion al usuario para que mejore sus entrenamiento.

## Autores

- [@Felipe villanueva](https://www.github.com/Felipevillanueva)
- [@Jose Vasquez](https://www.github.com/GHtpks)
- [@Mauricio Domihual](https://www.github.com/mauricio89777)



## Tecnología

Frontend
- React
- JavaScript
- CSS
- Vite

Backend
- Node.js
- Express
- Prisma ORM
- Multer

Análisis de movimiento
- Python
- MediaPipe Pose Landmarker
- OpenCV
- NumPy
- FFmpeg


Base de Datos 
- MySql

## Roles 

- Mauricio Domihual: Srum Leader
- Felipe Villanueva: Product Owner
- Jose Vasquez: Scrum Team

## Metodología de trabajo

El proyecto se desarrolla utilizando la metodología ágil Scrum, organizando el trabajo mediante sprints, planificación de tareas, seguimiento de avances y retrospectivas.


## Requerimientos previa

- Node.js y npm.
- Python 3.14.7 (version del proyecto)
- MySQL Server o MariaDB.
- FFmpeg.
- Git.

También se necesita descargar el modelo pose_landmarker_full.task de MediaPipe.
https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker


## Instalacion

1. Clonar el repositorio

```bash
  git clone https://github.com/mauricio89777/Biometra.git
```

2. Ve al repositorio

```bash
  cd Biometra
```


3. inicia el backend
### Backend
```bash
cd Backend(Base de datos si es una version antigua)
npm ci
node server.js
crear arhivo .env
crear la carpeta uploads/originales (para almacenar videos)
```

4. Generar Prisma client y aplicar las migraciones existentes
```bash
  npx prisma generate
  npx prisma migrate deploy
```

5. Inicia el frontend
### Frontend
```bash
cd frontend
npm ci
npm run dev
```


6. Configurar el entorno de Python

Linux (Manjaro):
```bash
cd analisis
python -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```


Windows (PowerShell):
```bash
cd analisis
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

7. Descargar el modelo de MediaPipe

Descargar el modelo pose_landmarker_full.task y  heavy colocarlo en:

analisis/models/pose_landmarker_full.task
analisis/models/pose_landmarker_heavy.task


8. Instalar FFmpeg

FFmpeg se utiliza para procesar los videos y generar archivos de salida compatibles con navegadores web.

Manjaro Linux:

sudo pacman -S ffmpeg

Windows:

Descargar FFmpeg desde su sitio oficial:

https://ffmpeg.org/download.html

Configurar la carpeta bin de FFmpeg en la variable de entorno PATH de Windows.






Estructura del proyecto


```
Biometra/
├── analisis/
│   ├── biometra/
│   │   ├── exercises/
│   │   ├── geometry.py
│   │   ├── informe.py
│   │   ├── pose.py
│   │   └── video_io.py
│   ├── models/
│   ├── output/
│   ├── tests/
│   ├── tools/
│   ├── video/
│   ├── main.py
│   └── requirements.txt
│
├── Backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── prisma/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── documentacion/
└── README.md
```



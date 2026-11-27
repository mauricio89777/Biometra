
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
- MySql/Mariadb

## Roles 

- Mauricio Domihual: Srum Leader
- Felipe Villanueva: Product Owner
- Jose Vasquez: Scrum Team

## Metodología de trabajo

El proyecto se desarrolla utilizando la metodología ágil Scrum, organizando el trabajo mediante sprints, planificación de tareas, seguimiento de avances y retrospectivas.


# Biometra

Guía de instalación, configuración y despliegue del proyecto **Biometra** utilizando Docker.

---

## 📋 Requisitos Previos

- Node.js y npm.
- Python 3.14.7 (version del proyecto)
- MySQL Server o MariaDB.
- FFmpeg.
- Git.

También se necesita descargar el modelo pose_landmarker_full.task de MediaPipe.
https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker


* **Descargar el modelo de MediaPipe**

Descargar el modelo pose_landmarker_full.task y  heavy colocarlo en:

analisis/models/pose_landmarker_full.task
analisis/models/pose_landmarker_heavy.task

* **Instalar FFmpeg** FFmpeg se utiliza para procesar los videos y generar archivos de salida compatibles con navegadores web.

Manjaro Linux:

sudo pacman -S ffmpeg

Windows:

Descargar FFmpeg desde su sitio oficial:

https://ffmpeg.org/download.html

Configurar la carpeta bin de FFmpeg en la variable de entorno PATH de Windows.

* **Virtualización** habilitada en la BIOS/UEFI (cuando sea necesaria).
* **Permisos de administrador** para instalar los componentes requeridos.

*(Nota: Si deseas ejecutar el backend de forma local sin Docker, asegúrate de tener Node.js instalado y ejecuta:)*
```bash
cd Backend
npm ci
node server.js
```

---

## 🐧 Instalación en Linux (Arch Linux / Manjaro)

### 1. Actualizar el sistema
Abre una terminal y ejecuta:
```bash
sudo pacman -Syu
```

### 2. Instalar Docker y Docker Compose
```bash
sudo pacman -S docker docker-compose
```

### 3. Iniciar el servicio Docker
Este comando inicia Docker inmediatamente y configura su inicio automático cuando se enciende el equipo:
```bash
sudo systemctl enable --now docker
```

### 4. Comprobar la instalación
Verifica las versiones instaladas:
```bash
sudo docker --version
sudo docker compose version
```

---

## 🪟 Instalación en Windows

En Windows se utiliza **Docker Desktop**, el cual ya incluye Docker Engine y Docker Compose.

### 1. Instalar WSL 2
Abre **PowerShell como administrador** y ejecuta:
```powershell
wsl --install
```
> **Nota:** Reinicia el equipo si Windows lo solicita.

Después de reiniciar, comprueba la versión de WSL y actualízalo si es necesario:
```powershell
wsl --version
wsl --update
```

### 2. Descargar Docker Desktop
1. Ingresa al sitio oficial: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Descarga Docker Desktop para Windows y ejecuta el instalador.

### 3. Configurar Docker Desktop
Durante la instalación, asegúrate de seleccionar el motor basado en **WSL 2** cuando se ofrezca esa opción.

Una vez instalado:
1. Abre **Docker Desktop** desde el menú Inicio.
2. Acepta las condiciones de uso.
3. Espera a que Docker termine de iniciarse.
4. Comprueba que el servicio esté funcionando (estado: *Running*).

### 4. Comprobar la instalación
Abre PowerShell y ejecuta:
```powershell
docker --version
docker compose version
```

---

## 🚀 Despliegue del Proyecto Biometra

Una vez completada la configuración en Linux o Windows, sigue estos pasos:

### 1. Obtener el proyecto
Clona el repositorio e ingresa a la carpeta del proyecto:
```bash
git clone URL_DEL_REPOSITORIO
cd Biometra
```

### 2. Configurar las variables de entorno
Crea o edita los archivos `.env` necesarios según la configuración de tu entorno antes de levantar los contenedores *(ej. copiando `.env.example` a `.env`)*.

### 3. Iniciar Biometra con Docker
Desde la carpeta raíz del proyecto (donde se encuentra `docker-compose.yml`), ejecuta:

* **En Linux:**
  ```bash
  sudo docker compose up -d --build
  ```
* **En Windows (PowerShell):**
  ```powershell
  docker compose up -d --build
  ```

### 4. Comprobar los servicios
Verifica que todos los contenedores estén corriendo correctamente:
```bash
docker compose ps
```
*(En Linux, antepón `sudo` si tu usuario no pertenece al grupo `docker`).*

Los servicios esperados son:

| Servicio | Puerto | Función |
| :--- | :---: | :--- |
| **Frontend** | `5173` | Interfaz web de Biometra |
| **Backend** | `3000` | API y lógica del servidor |
| **MariaDB** | `3307` | Base de datos |

### 5. Cargar datos iniciales y acceder a Biometra
Desde la raíz del proyecto, ejecuta el siguiente comando para cargar los ejercicios en la base de datos (ejecutar *seed*):
```bash
sudo docker compose exec backend npm run seed
```
*(En Windows omite el `sudo`).*

Una vez iniciados los contenedores, abre tu navegador web:
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend:** [http://localhost:3000](http://localhost:3000)

> **Arquitectura:** El frontend se comunica con el backend, mientras que el backend utiliza MariaDB para la persistencia y el módulo de Python para procesar los análisis de movimiento.

---

## 🛠️ Comandos Útiles de Docker

| Comando | Descripción |
| :--- | :--- |
| `docker compose up -d` | Inicia los servicios en segundo plano. |
| `docker compose up -d --build` | Reconstruye las imágenes e inicia los servicios. |
| `docker compose down` | Detiene y elimina los contenedores y la red del proyecto. |
| `docker compose ps` | Muestra el estado actual de los servicios. |
| `docker compose logs` | Muestra los registros (logs) de todos los servicios. |
| `docker compose logs -f backend` | Muestra los registros del backend en tiempo real. |
| `docker compose restart backend` | Reinicia únicamente el servicio del backend. |
| `docker compose exec db bash` | Abre una terminal interactiva dentro del contenedor de MariaDB. |

---

## ⚠️ Importante: Persistencia de la Base de Datos

Biometra utiliza un **volumen de Docker** para conservar los datos de MariaDB de forma segura. 

Al ejecutar `docker compose down`, los contenedores se detienen y eliminan, **pero tus datos permanecerán intactos**. Si deseas eliminar también los datos de la base de datos de forma permanente, deberás añadir la bandera `-v` (`docker compose down -v`).

---

## 📚 Documentación Oficial

* [Docker Engine](https://docs.docker.com/engine/install/)
* [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
* [Docker Compose](https://docs.docker.com/compose/)

## Estructura del Proyecto

```text
Biometra/
├── analisis/                   
│   ├── biometra/               
│   ├── models/                 
│   ├── output/                
│   ├── tests/                  
│   ├── tools/                 
│   ├── video/                  
│   ├── main.py                 
│   └── requirements.txt        
├── Backend/                    
│   ├── controllers/            
│   ├── middlewares/           
│   ├── prisma/                 
│   ├── routes/                
│   ├── test/                   
│   ├── uploads/               
│   ├── utils/                  
│   ├── base datos (mysql).sql  
│   ├── Dockerfile              
│   ├── package.json            
│   └── server.js               
├── documentacion/              
│   ├── Fase 1/
│   ├── Fase 2/
│   └── Fase 3/
├── frontend/                   
│   ├── public/                 
│   ├── src/                   
│   ├── dockerfile              
│   ├── index.html              
│   ├── package.json            
│   └── vite.config.js         
├── docker-compose.yml           
└── README.md                   




Estructura del proyecto

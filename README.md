# TrafficVision AI

AI-Powered Traffic Violation Detection, License Plate Recognition, Smart Parking Analytics, and Enforcement Intelligence System.

---

# Features

* Vehicle Detection
* Helmet Violation Detection
* Triple Riding Detection
* Seatbelt Violation Detection
* Wrong Side Driving Detection
* Red Light Violation Detection
* Stop Line Violation Detection
* Illegal Parking Detection
* Number Plate Recognition (OCR)
* Violation Evidence Generation
* Violation Heatmaps
* Analytics Dashboard
* Enforcement Recommendation Engine

---

# Project Structure

```bash
trafficvision-ai/
│
├── frontend/
│   ├── nextjs-dashboard
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── database/
│   ├── utils/
│
├── ai-models/
│   ├── helmet_detection
│   ├── triple_riding
│   ├── parking_detection
│   ├── ocr
│
├── datasets/
│
├── docker/
│
├── docs/
│
└── README.md
```

---

# Prerequisites

Install:

## Python

Python 3.11+

Verify:

```bash
python --version
```

---

## Node.js

Install Node.js 22+

Verify:

```bash
node -v
npm -v
```

---

## PostgreSQL

Install PostgreSQL 16+

Verify:

```bash
psql --version
```

---

## Git

```bash
git --version
```

---

# Clone Repository

```bash
git clone https://github.com/yourusername/trafficvision-ai.git

cd trafficvision-ai
```

---

# Backend Setup

Move to backend:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment

Windows:

```bash
venv\Scripts\activate
```

Linux/Mac:

```bash
source venv/bin/activate
```

---

Install dependencies

```bash
pip install -U pip

pip install fastapi
pip install uvicorn
pip install ultralytics
pip install opencv-python
pip install paddleocr
pip install paddlepaddle
pip install numpy
pip install pandas
pip install sqlalchemy
pip install psycopg2-binary
pip install python-multipart
pip install pillow
pip install supervision
pip install folium
pip install geopandas
pip install matplotlib
pip install scikit-learn
pip install python-dotenv
```

Or:

```bash
pip install -r requirements.txt
```

---

# AI Model Installation

Install YOLO

```bash
pip install ultralytics
```

Verify:

```bash
yolo checks
```

Download pretrained model

```bash
yolo predict model=yolo11n.pt source=test.jpg
```

---

# OCR Installation

Install PaddleOCR

```bash
pip install paddleocr

pip install paddlepaddle
```

Test:

```python
from paddleocr import PaddleOCR

ocr = PaddleOCR()

result = ocr.ocr("plate.jpg")
```

---

# PostgreSQL Setup

Create database:

```sql
CREATE DATABASE trafficvision;
```

Create user:

```sql
CREATE USER trafficadmin
WITH PASSWORD 'password';
```

Grant privileges:

```sql
GRANT ALL PRIVILEGES
ON DATABASE trafficvision
TO trafficadmin;
```

---

# Environment Variables

Create:

```bash
backend/.env
```

```env
DATABASE_URL=postgresql://trafficadmin:password@localhost:5432/trafficvision

MODEL_PATH=models/

SECRET_KEY=hackathon_secret

UPLOAD_DIR=uploads/
```

---

# Run Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```bash
http://localhost:8000
```

Swagger Docs:

```bash
http://localhost:8000/docs
```

---

# Frontend Setup

Open new terminal:

```bash
cd frontend
```

Create Next.js project:

```bash
npx create-next-app@latest .
```

Install packages:

```bash
npm install axios
npm install react-query
npm install react-leaflet
npm install leaflet
npm install chart.js
npm install react-chartjs-2
npm install lucide-react
```

Run:

```bash
npm run dev
```

Frontend:

```bash
http://localhost:3000
```

---

# Recommended Datasets

## Vehicle Detection

COCO Dataset

```text
https://cocodataset.org
```

---

## Helmet Detection

Kaggle Helmet Dataset

```text
https://www.kaggle.com
```

Search:

Helmet Detection Dataset

---

## License Plate Recognition

CCPD Dataset

```text
Chinese City Parking Dataset
```

---

## Traffic Violation Dataset

Roboflow Universe

```text
https://universe.roboflow.com
```

Search:

* Helmet Detection
* Traffic Violations
* License Plate Detection
* Vehicle Detection

---

# Train Custom YOLO Model

```bash
yolo detect train \
model=yolo11n.pt \
data=data.yaml \
epochs=100 \
imgsz=640
```

---

# Run Prediction

```bash
yolo predict \
model=runs/detect/train/weights/best.pt \
source=test.jpg
```

---

# Docker Deployment

Build:

```bash
docker build -t trafficvision .
```

Run:

```bash
docker run -p 8000:8000 trafficvision
```

---

# Future Enhancements

* Real-Time CCTV Processing
* Drone Surveillance
* Automatic E-Challan Generation
* Repeat Offender Tracking
* Smart Parking Intelligence
* AI-Based Congestion Forecasting
* Edge AI Deployment
* Mobile Enforcement App

---


* GitHub Repository
* Demo Video

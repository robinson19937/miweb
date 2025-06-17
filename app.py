from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return 'Servidor Flask activo para subir archivos 📁'

@app.route('/upload', methods=['POST'])
def upload_file():
    idea = request.form.get('idea', '')
    file = request.files.get('file')

    if not file and not idea:
        return "Error: no se envió ni archivo ni idea", 400

    if file:
        filename = file.filename
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)

    if idea:
        with open(os.path.join(UPLOAD_FOLDER, 'ideas.txt'), 'a', encoding='utf-8') as f:
            f.write(idea + '\n---\n')

    return "Archivo o idea recibida correctamente ✅"

# ✅ NUEVO: listar archivos
@app.route('/archivos', methods=['GET'])
def listar_archivos():
    archivos = []
    for nombre in os.listdir(UPLOAD_FOLDER):
        if os.path.isfile(os.path.join(UPLOAD_FOLDER, nombre)):
            archivos.append(nombre)
    return jsonify(archivos)

# ✅ NUEVO: servir archivos por nombre
@app.route('/uploads/<path:filename>')
def descargar_archivo(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

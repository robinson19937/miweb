from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Carpeta donde se guardarán los archivos
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return '✅ Servidor en línea - Flask en Render'

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    idea = request.form.get('idea', '')

    if not file:
        return '❌ No se envió ningún archivo', 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    if idea:
        with open(os.path.join(UPLOAD_FOLDER, 'ideas.txt'), 'a') as f:
            f.write(f"📝 {idea}\nArchivo: {file.filename}\n---\n")

    return '✅ Cotización recibida con éxito'

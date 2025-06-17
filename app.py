from flask import Flask, request
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload():
    archivo = request.files.get('file')
    idea = request.form.get('idea', '')

    if archivo:
        ruta = os.path.join(UPLOAD_FOLDER, archivo.filename)
        archivo.save(ruta)

    if idea:
        with open(os.path.join(UPLOAD_FOLDER, 'ideas.txt'), 'a', encoding='utf-8') as f:
            f.write(idea + '\n---\n')

    if archivo or idea:
        return "Datos recibidos correctamente."
    else:
        return "No se recibió ni archivo ni idea.", 400

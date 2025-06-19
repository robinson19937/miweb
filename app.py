from flask import Flask, request, jsonify
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
import os

app = Flask(__name__)
CORS(app)

# Configura Cloudinary
cloudinary.config(
    cloud_name='dwhoutqan',
    api_key='993886694566122',
    api_secret='a6CEBBn195-2dDDsqrjufTkrInA'
)

IDEAS_FILE = 'ideas.txt'

@app.route('/')
def index():
    return 'Servidor Flask con Cloudinary activo ☁️📁'

@app.route('/upload', methods=['POST'])
def upload_file():
    idea = request.form.get('idea', '')
    file = request.files.get('file')

    result = {}
    archivo_url = None
    archivo_nombre = None

    if not file and not idea:
        return "Error: no se envió ni archivo ni idea", 400

    # Subida del archivo a Cloudinary
    if file:
        try:
            upload_result = cloudinary.uploader.upload(file)
            archivo_url = upload_result['secure_url']
            archivo_nombre = upload_result['original_filename']
            result['archivo_url'] = archivo_url
            result['archivo_nombre'] = archivo_nombre
        except Exception as e:
            return f"❌ Error al subir a Cloudinary: {str(e)}", 500

    # Construir entrada para almacenar
    entrada = ""
    if idea:
        entrada += f"Idea:\n{idea.strip()}\n"
    if archivo_url:
        entrada += f"Archivo subido: {archivo_nombre}\nURL: {archivo_url}\n"
    entrada += "---\n"

    # Guardar entrada en archivo de texto
    if entrada:
        with open(IDEAS_FILE, 'a', encoding='utf-8') as f:
            f.write(entrada)

    result['idea'] = idea

    return jsonify({
        "message": "✅ Cotización recibida correctamente",
        "data": result
    })

@app.route('/ideas', methods=['GET'])
def listar_ideas():
    if not os.path.exists(IDEAS_FILE):
        return jsonify([])
    with open(IDEAS_FILE, 'r', encoding='utf-8') as f:
        contenido = f.read()
        ideas = [bloque.strip() for bloque in contenido.split('---') if bloque.strip()]
        return jsonify(ideas)

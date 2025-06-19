from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import cloudinary
import cloudinary.uploader
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configurar Cloudinary
cloudinary.config(
    cloud_name='dwhoutqan',
    api_key='993886694566122',
    api_secret='a6CEBBn195-2dDDsqrjufTkrInA'
)

@app.route('/')
def index():
    return 'Servidor Flask activo para subir archivos 📁'

@app.route('/upload', methods=['POST'])
def upload_file():
    idea = request.form.get('idea', '').strip()
    file = request.files.get('file')

    if not file and not idea:
        return jsonify({"error": "Error: no se envió ni archivo ni idea"}), 400

    registro = ""

    # Subir archivo si existe
    if file:
        filename = file.filename
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)

        # Subir a Cloudinary
        result = cloudinary.uploader.upload(save_path)
        archivo_url = result.get("secure_url", "")
        registro += f"Archivo subido: {filename}\nURL: {archivo_url}\n"

    # Subir idea como archivo a Cloudinary si no hay archivo
    if idea and not file:
        now = datetime.now().strftime("%Y%m%d_%H%M%S")
        idea_filename = f"idea_{now}.txt"
        idea_path = os.path.join(UPLOAD_FOLDER, idea_filename)
        with open(idea_path, 'w', encoding='utf-8') as f:
            f.write(idea)

        # Subir idea.txt a Cloudinary
        result = cloudinary.uploader.upload(idea_path, resource_type="raw")
        idea_url = result.get("secure_url", "")
        registro += f"Idea:\n{idea}\nURL: {idea_url}\n"

    elif idea:
        registro += f"Idea:\n{idea}\n"

    # Guardar todo en ideas.txt (local)
    with open(os.path.join(UPLOAD_FOLDER, 'ideas.txt'), 'a', encoding='utf-8') as f:
        f.write(registro + "---\n")

    return jsonify({
        "message": "✅ Cotización recibida correctamente",
        "registro": registro
    })

@app.route('/ideas')
def listar_ideas():
    path = os.path.join(UPLOAD_FOLDER, 'ideas.txt')
    if not os.path.exists(path):
        return jsonify([])

    with open(path, 'r', encoding='utf-8') as f:
        contenido = f.read()

    bloques = contenido.strip().split('---\n')
    return jsonify([bloque.strip() for bloque in bloques if bloque.strip()])

@app.route('/uploads/<path:filename>')
def descargar_archivo(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ✅ NUEVO: Editar el archivo ideas.txt desde el navegador
@app.route('/editar_ideas', methods=['GET', 'POST'])
def editar_ideas():
    path = os.path.join(UPLOAD_FOLDER, 'ideas.txt')

    if request.method == 'POST':
        nuevo_contenido = request.form.get('contenido', '')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(nuevo_contenido)
        return "✅ ideas.txt actualizado correctamente"

    if not os.path.exists(path):
        return "<p>No hay ideas.txt aún.</p>"

    with open(path, 'r', encoding='utf-8') as f:
        contenido = f.read()

    return f'''
    <h2>Editar ideas.txt</h2>
    <form method="POST">
        <textarea name="contenido" style="width:100%; height:400px;">{contenido}</textarea><br>
        <button type="submit">Guardar cambios</button>
    </form>
    '''

from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging

app = Flask(__name__)

# Configuración de logging para depuración
logging.basicConfig(level=logging.INFO)

# Configuración de carpeta de subida
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Límite de tamaño de archivo (16 MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Habilitar CORS para GitHub Pages
CORS(app, origins=["https://robinson19937.github.io"])

# Ruta de inicio opcional
@app.route("/")
def index():
    return "<p>Servidor de carga de documentos activo.</p>"

# Ruta para subir archivos
@app.route("/upload", methods=["POST"])
def upload_file():
    app.logger.info("Received upload request")
    if 'file' not in request.files:
        app.logger.error("No file in request")
        return jsonify({"success": False, "message": "No se encontró el archivo en la solicitud"}), 400

    file = request.files['file']

    if file.filename == '':
        app.logger.error("No file selected")
        return jsonify({"success": False, "message": "No se seleccionó ningún archivo"}), 400

    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        app.logger.info(f"File {filename} uploaded successfully")
        return jsonify({"success": True, "message": "Archivo subido exitosamente", "filename": filename})
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"success": False, "message": f"Error interno: {str(e)}"}), 500

# Ruta para listar archivos subidos
@app.route("/uploads")
def list_files():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
        file_urls = [f"/uploads/{filename}" for filename in files]
        app.logger.info("Listed uploaded files")
        return jsonify({"success": True, "files": file_urls})
    except Exception as e:
        app.logger.error(f"List files error: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

# Ruta para servir archivos individuales
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        app.logger.error(f"File {filename} not found")
        abort(404)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)

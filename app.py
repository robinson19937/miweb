from flask import Flask, request, send_from_directory, render_template, abort
import os

app = Flask(__name__)

# Carpeta para guardar archivos subidos
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Página principal
@app.route("/")
def index():
    return render_template("index.html")

# Subida de archivos
@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files or request.files['file'].filename == '':
        return "No se seleccionó ningún archivo.", 400

    file = request.files['file']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    return "Archivo subido exitosamente."

# Para servir archivos subidos si lo deseas (puedes quitar esto si no es necesario)
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return abort(404)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# (Opcional) servir JS desde /static/
@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory("static", path)

if __name__ == "__main__":
    app.run(debug=True)

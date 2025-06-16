from flask import Flask, request, send_from_directory, render_template_string, abort
import os

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Página principal
@app.route("/")
def index():
    return '''
    <html><body>
    <h2>Subir documento para cotización</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
        <input type="file" name="file" required>
        <input type="submit" value="Subir">
    </form>
    <br><a href="/uploads">Ver archivos subidos</a>
    </body></html>
    '''

# Subida de archivos
@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files or request.files['file'].filename == '':
        return "<p>No se seleccionó ningún archivo. <a href='/'>Volver</a></p>"

    file = request.files['file']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    return "<p>Archivo subido con éxito. <a href='/'>Volver</a></p>"

# Lista de archivos subidos
@app.route("/uploads")
def list_files():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
    except FileNotFoundError:
        return "<p>No hay archivos subidos aún.</p>"

    links = [f"<li><a href='/uploads/{f}' target='_blank'>{f}</a></li>" for f in files]
    return f"<html><body><ul>{''.join(links)}</ul><a href='/'>Volver</a></body></html>"

# Descargar/ver un archivo
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return abort(404)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

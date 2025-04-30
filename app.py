from flask import Flask, request, send_from_directory, render_template_string, abort
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Carpeta para guardar archivos subidos (Render puede escribir aquí)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ruta raíz para servir index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Ruta para archivos estáticos (como fondo.png, sketch.js, etc.)
@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)

# Ruta para recibir archivos subidos desde el formulario
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return render_template_string('''
            <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
                <p>No se encontró el archivo en el formulario</p>
                <a href="/">Volver a intentar</a>
            </body></html>
        ''')
    file = request.files['file']
    if file.filename == '':
        return render_template_string('''
            <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
                <p>No se seleccionó ningún archivo</p>
                <a href="/">Volver a intentar</a>
            </body></html>
        ''')
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)
    return render_template_string('''
        <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
            <p>Archivo subido con éxito</p>
            <a href="/">Volver a la página principal</a>
        </body></html>
    ''')

# Ruta para acceder directamente a un archivo subido
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return abort(404)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Ruta para listar todos los archivos subidos
@app.route('/uploads')
def list_files():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
    except FileNotFoundError:
        return "<p>No hay archivos subidos aún.</p>"

    links = [
        f"<li><a href='/uploads/{f}' target='_blank'>{f}</a></li>"
        for f in files
    ]
    return f"""
    <html><body style="font-family:Arial;margin:40px;">
        <h2>Archivos Subidos</h2>
        <ul>{''.join(links)}</ul>
        <a href="/">Volver</a>
    </body></html>
    """

# Punto de entrada para ejecución local (Render usa gunicorn directamente)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)




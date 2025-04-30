from flask import Flask, request, send_from_directory, render_template_string
import os

app = Flask(__name__)

# Ruta montada desde Windows para subir archivos
UPLOAD_FOLDER = "/mnt/c/Users/robin/OneDrive/Escritorio/archivos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ruta raíz para mostrar index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Ruta para archivos estáticos (sketch.js, fondo.png, etc.)
@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)

# Ruta para recibir archivos subidos
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return render_template_string('''
            <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
                <p>No file part</p>
                <a href="/">Volver a intentar</a>
            </body></html>
        ''')
    file = request.files['file']
    if file.filename == '':
        return render_template_string('''
            <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
                <p>No selected file</p>
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

if __name__ == '__main__':
    app.run(host='0.0.0.0')


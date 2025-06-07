from flask import Flask, request, send_from_directory, render_template_string, jsonify, abort
from flask_cors import CORS
import os
import queue
import requests

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Dirección IP de la Raspberry Pi (¡ajusta esto!)
RASPBERRY_URL = "http://192.168.1.10:5001/comando"  # Cambia la IP por la de tu Raspberry

# ========== Función para enviar a Raspberry ==========
def enviar_a_raspberry(comando):
    try:
        res = requests.post(RASPBERRY_URL, json={"comando": comando}, timeout=1)
        return res.status_code == 200
    except requests.RequestException as e:
        print(f"[❌ ERROR] No se pudo enviar a Raspberry: {e}")
        return False

# ========== Rutas de archivos y subida ==========
@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or request.files['file'].filename == '':
        return render_template_string(
            '''<html><body>No se seleccionó ningún archivo <a href="/">Volver</a></body></html>'''
        )
    file = request.files['file']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)
    return render_template_string(
        '''<html><body>Archivo subido con éxito <a href="/">Volver</a></body></html>'''
    )

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return abort(404)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads')
def list_files():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
    except FileNotFoundError:
        return "<p>No hay archivos subidos aún.</p>"

    links = [f"<li><a href='/uploads/{f}' target='_blank'>{f}</a></li>" for f in files]
    return f"<html><body><ul>{''.join(links)}</ul><a href='/'>Volver</a></body></html>"

# ========== Terminal Web ==========
comando_queue = queue.Queue()

@app.route('/raspberry/enviar', methods=['POST'])
def recibir_comando():
    comando = request.form.get('comando', '')
    if comando:
        for c in comando + '\n':  # Simula entrada estilo Serial
            comando_queue.put(ord(c))

        # También enviar a la Raspberry Pi
        enviado = enviar_a_raspberry(comando)
        estado = "🟢 Enviado a Raspberry" if enviado else "🔴 Error al enviar a Raspberry"

        return f"Comando recibido: {comando} ({estado})"
    return "Sin comando"

# ========== Funciones estilo Serial para uso interno ==========
def Serial_available():
    return not comando_queue.empty()

def Serial_read():
    return comando_queue.get() if Serial_available() else 0

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

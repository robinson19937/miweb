from flask import Flask, request, send_from_directory, render_template, render_template_string, jsonify, abort
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# ========== AJEDREZ ==========
game_state = {
    "color": "white",
    "fen": "startpos"
}

@app.route("/chess")
def chess():
    return render_template("rob.html")  # asegúrate de que rob.html esté en la carpeta templates/

@app.route("/choose_color", methods=["POST"])
def choose_color():
    data = request.get_json()
    game_state["color"] = data.get("color", "white")
    return jsonify(success=True)

@app.route("/restart", methods=["POST"])
def restart():
    game_state["fen"] = "startpos"
    return jsonify(success=True)

# ========== SUBIDA DE ARCHIVOS ==========
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')  # Tu página principal para subir archivos

@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or request.files['file'].filename == '':
        return render_template_string('''
            <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
                <p>No se seleccionó ningún archivo</p>
                <a href="/">Volver</a>
            </body></html>
        ''')
    file = request.files['file']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)
    return render_template_string('''
        <html><body style="text-align:center; font-size:24px; margin-top:20%; font-family: Arial, sans-serif;">
            <p>Archivo subido con éxito</p>
            <a href="/">Volver a la página principal</a>
        </body></html>
    ''')

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

# Punto de entrada local (Render usa gunicorn directamente)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)




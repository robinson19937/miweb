from flask import Flask, request, send_from_directory, render_template, render_template_string, jsonify, abort
from flask_cors import CORS
import os
import chess

app = Flask(__name__)
CORS(app)

# ========== AJEDREZ ==========
board = chess.Board()

game_state = {
    "color": "white",
    "fen": board.fen()
}

@app.route("/chess")
def chess_page():
    return render_template("rob.html")

@app.route("/choose_color", methods=["POST"])
def choose_color():
    data = request.get_json()
    game_state["color"] = data.get("color", "white")
    return jsonify(success=True)

@app.route("/restart", methods=["POST"])
def restart():
    global board
    board = chess.Board()
    game_state["fen"] = board.fen()
    return jsonify(success=True, fen=board.fen())

@app.route("/move", methods=["POST"])
def move():
    global board
    data = request.get_json()
    move_uci = data.get("move")  # ejemplo: "e2e4"

    try:
        move = chess.Move.from_uci(move_uci)
        if move in board.legal_moves:
            board.push(move)
            game_state["fen"] = board.fen()
            return jsonify(success=True, fen=board.fen())
        else:
            return jsonify(success=False, error="Movimiento ilegal")
    except Exception as e:
        return jsonify(success=False, error=str(e))

# ========== SUBIDA DE ARCHIVOS ==========
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

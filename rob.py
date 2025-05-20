
import os

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Variables de juego
game_state = {
    "color": "white",
    "fen": "startpos"  # formato FEN para el estado del tablero
}

@app.route("/")
def index():
    return render_template("rob.html")

@app.route("/choose_color", methods=["POST"])
def choose_color():
    data = request.get_json()
    game_state["color"] = data.get("color", "white")
    return jsonify(success=True)

@app.route("/restart", methods=["POST"])
def restart():
    game_state["fen"] = "startpos"
    return jsonify(success=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

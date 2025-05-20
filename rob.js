let boardSize = 480;
let tileSize = boardSize / 8;

// Representación del tablero con piezas en Unicode
let pieces = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖']
];

function setup() {
  let canvas = createCanvas(boardSize, boardSize);
  canvas.parent("board-canvas");
  textAlign(CENTER, CENTER);
  textSize(tileSize * 0.8);
  noLoop();
  drawBoard();
}

function drawBoard() {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      // Dibujar casillas
      if ((x + y) % 2 === 0) {
        fill(240); // casilla clara
      } else {
        fill(100); // casilla oscura
      }
      rect(x * tileSize, y * tileSize, tileSize, tileSize);

      // Dibujar piezas
      let piece = pieces[y][x];
      if (piece !== '') {
        fill(piece === piece.toUpperCase() ? 0 : 255); // color opcional según tipo
        text(piece, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
      }
    }
  }
}

function chooseColor(color) {
  fetch('/choose_color', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color: color })
  }).then(() => {
    console.log("Color elegido:", color);
  });
}

function restartGame() {
  fetch('/restart', { method: 'POST' })
    .then(() => {
      console.log("Juego reiniciado");
      // Reiniciar tablero
      pieces = [
        ['♜','♞','♝','♛','♚','♝','♞','♜'],
        ['♟','♟','♟','♟','♟','♟','♟','♟'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['♙','♙','♙','♙','♙','♙','♙','♙'],
        ['♖','♘','♗','♕','♔','♗','♘','♖']
      ];
      drawBoard();
    });
}

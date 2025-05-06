let whitePieces = [];
let blackPieces = [];
let whitePawns = [];
let blackPawns = [];

let board = []; // 8x8 tablero
let squareSize;
let currentMove = -1;

// Ejemplo de jugadas (puedes cambiar esto por cualquier partida)
let moves = ["e2-e4", "e7-e5", "g1-f3", "b8-c6", "f1-c4", "f8-c5", "d1-h5", "g8-f6", "h5-f7"];

function preload() {
  whitePieces.push(loadImage('rey_blanco.png'));
  whitePieces.push(loadImage('reina_blanca.png'));
  whitePieces.push(loadImage('alfil_blanco.png'));
  whitePieces.push(loadImage('alfil_blanco.png'));
  whitePieces.push(loadImage('caballo_blanco.png'));
  whitePieces.push(loadImage('caballo_blanco.png'));
  whitePieces.push(loadImage('torre_blanca.png'));
  whitePieces.push(loadImage('torre_blanca.png'));

  blackPieces.push(loadImage('rey_negro.png'));
  blackPieces.push(loadImage('reina_negra.png'));
  blackPieces.push(loadImage('alfil_negro.png'));
  blackPieces.push(loadImage('alfil_negro.png'));
  blackPieces.push(loadImage('caballo_negro.png'));
  blackPieces.push(loadImage('caballo_negro.png'));
  blackPieces.push(loadImage('torre_negra.png'));
  blackPieces.push(loadImage('torre_negra.png'));

  for (let i = 0; i < 8; i++) {
    whitePawns.push(loadImage('peon_blanco.png'));
    blackPawns.push(loadImage('peon_negro.png'));
  }
}

function setup() {
  // Ajustar el tamaño de la cuadrícula dependiendo del tamaño de la ventana
  let boardSize = min(windowWidth, windowHeight) * 0.8; // El tablero ocupa el 80% de la ventana
  squareSize = boardSize / 8;

  createCanvas(boardSize, boardSize);
  
  // Crear los botones de navegación
  let prevButton = createButton('⬅️ Anterior');
  prevButton.position(20, height + 10);
  prevButton.mousePressed(prevMove);

  let nextButton = createButton('➡️ Siguiente');
  nextButton.position(100, height + 10);
  nextButton.mousePressed(nextMove);

  resetBoardToStart(); // Inicializar el tablero con las piezas en su posición inicial
  noLoop();
}

function draw() {
  clear(); // Limpiar el lienzo antes de redibujar
  drawBoard(squareSize); // Dibujar el tablero
  drawPieces(squareSize); // Dibujar las piezas en sus posiciones

  // Visualización del tamaño del lienzo para comprobar el ajuste
  stroke(255, 0, 0);
  noFill();
  rect(0, 0, width, height); // Dibuja un borde alrededor del canvas
}

// Dibuja el tablero de ajedrez
function drawBoard(size) {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      fill((x + y) % 2 === 0 ? 255 : 0);
      square(x * size, y * size, size);
    }
  }
}

// Dibuja todas las piezas desde el array 'board'
function drawPieces(size) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let piece = board[y][x];
      if (piece) {
        drawPiece(piece.img, x, y, size);
      }
    }
  }
}

function drawPiece(img, x, y, size) {
  image(img, x * size, y * size, size, size);
}

// Convierte "e2" → {x: 4, y: 6}
function notationToCoord(pos) {
  return {
    x: pos.charCodeAt(0) - 97,
    y: 8 - parseInt(pos[1])
  };
}

// Crea el tablero inicial
function resetBoardToStart() {
  board = Array(8).fill().map(() => Array(8).fill(null));

  // Piezas negras
  board[0][0] = { img: blackPieces[6] }; // Rook
  board[0][1] = { img: blackPieces[4] }; // Knight
  board[0][2] = { img: blackPieces[2] }; // Bishop
  board[0][3] = { img: blackPieces[1] }; // Queen
  board[0][4] = { img: blackPieces[0] }; // King
  board[0][5] = { img: blackPieces[3] }; // Bishop
  board[0][6] = { img: blackPieces[5] }; // Knight
  board[0][7] = { img: blackPieces[7] }; // Rook

  for (let i = 0; i < 8; i++) {
    board[1][i] = { img: blackPawns[i] };
  }

  // Piezas blancas
  board[7][0] = { img: whitePieces[6] }; // Rook
  board[7][1] = { img: whitePieces[4] }; // Knight
  board[7][2] = { img: whitePieces[2] }; // Bishop
  board[7][3] = { img: whitePieces[1] }; // Queen
  board[7][4] = { img: whitePieces[0] }; // King
  board[7][5] = { img: whitePieces[3] }; // Bishop
  board[7][6] = { img: whitePieces[5] }; // Knight
  board[7][7] = { img: whitePieces[7] }; // Rook

  for (let i = 0; i < 8; i++) {
    board[6][i] = { img: whitePawns[i] };
  }
}

// Aplica un movimiento como "e2-e4"
function applyMove(move) {
  const [from, to] = move.split("-");
  const f = notationToCoord(from);
  const t = notationToCoord(to);

  board[t.y][t.x] = board[f.y][f.x];
  board[f.y][f.x] = null;
}

// Ir al siguiente movimiento
function nextMove() {
  if (currentMove < moves.length - 1) {
    currentMove++;
    applyMove(moves[currentMove]);
    redraw();
  }
}

// Volver al movimiento anterior
function prevMove() {
  if (currentMove >= 0) {
    currentMove--;
    resetBoardToStart();
    for (let i = 0; i <= currentMove; i++) {
      applyMove(moves[i]);
    }
    redraw();
  }
}

// Función que ajusta el tamaño de la cuadrícula cuando el tamaño de la ventana cambia
function windowResized() {
  let boardSize = min(windowWidth, windowHeight) * 0.8; // El tablero ocupa el 80% de la ventana
  squareSize = boardSize / 8;
  resizeCanvas(boardSize, boardSize);
  redraw();
}

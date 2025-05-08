let whitePieces = [];
let blackPieces = [];
let whitePawns = [];
let blackPawns = [];

let board = [];
let squareSize = 40; // 320 / 8
let currentMove = -1;
let prevButton, nextButton;

let moves = [
  [[6, 4], [4, 4]], // e2-e4
  [[1, 4], [3, 4]], // e7-e5
  [[7, 3], [3, 7]], // d1-h5
  [[0, 1], [2, 2]], // b8-c6
  [[7, 5], [4, 2]], // f1-c4
  [[0, 6], [2, 5]], // g8-f6
  [[3, 7], [1, 5]]  // h5xf7 (jaque mate)
];
function preload() {
  // Piezas blancas: rey, reina, alfiles, caballos, torres
  whitePieces.push(loadImage('rey_blanco (1).png'));
  whitePieces.push(loadImage('reina_blanca (1).png'));
  whitePieces.push(loadImage('alfil_blanco.png'));
  whitePieces.push(loadImage('alfil_blanco.png'));
  whitePieces.push(loadImage('caballo_blanco.png'));
  whitePieces.push(loadImage('caballo_blanco.png'));
  whitePieces.push(loadImage('torre_blanca.png'));
  whitePieces.push(loadImage('torre_blanca.png'));

  // Piezas negras
  blackPieces.push(loadImage('rey_negro.png'));
  blackPieces.push(loadImage('reina_negra.png'));
  blackPieces.push(loadImage('alfil_negro.png'));
  blackPieces.push(loadImage('alfil_negro.png'));
  blackPieces.push(loadImage('caballo_negro.png'));
  blackPieces.push(loadImage('caballo_negro.png'));
  blackPieces.push(loadImage('torre_negra.png'));
  blackPieces.push(loadImage('torre_negra.png'));

  // Peones
  for (let i = 0; i < 8; i++) {
    whitePawns.push(loadImage('peon_blanco.png'));
    blackPawns.push(loadImage('peon_negro.png'));
  }
}

function setup() {
  createCanvas(320, 720); // 320 para el tablero, 400 para texto/botones
  prevButton = createButton('⬅️ Anterior');
  nextButton = createButton('➡️ Siguiente');
  styleButton(prevButton, '#4CAF50');
  styleButton(nextButton, '#2196F3');
  positionButtons();
  prevButton.mousePressed(prevMove);
  nextButton.mousePressed(nextMove);
  resetBoard();
  noLoop();
}

function styleButton(button, bgColor) {
  button.style('font-size', '18px');
  button.style('padding', '12px 20px');
  button.style('border-radius', '8px');
  button.style('background-color', bgColor);
  button.style('color', 'white');
  button.style('border', 'none');
  button.style('cursor', 'pointer');
  button.style('font-weight', 'bold');
  button.style('box-shadow', '0 3px 8px rgba(0,0,0,0.2)');
}

function positionButtons() {
  let spacing = 10;
  let buttonY = height - 80;
  prevButton.position(width / 2 - 160, buttonY);
  nextButton.position(width / 2 + 10, buttonY);
}

function draw() {
  clear();
  drawBoard();
  drawPieces();

  // Borde rojo
  stroke(255, 0, 0);
  noFill();
  rect(0, 0, width, 320); // solo sobre el tablero

  // Texto informativo
  textSize(18);
  textAlign(LEFT);
  fill(0);
  textLeading(24);
  let textX = 20;
  let textY = 360;
  let maxWidth = width - 40;
  let textContent = "Piezas blancas: Computador\n" +
                   "Piezas negras: Robinson López\n\n" +
                   "Desde muy niño me interesé por el juego de ajedrez, todavía recuerdo esos días en esas clases con el instituto de deportes y la actividad competitiva en un mundo genial, donde se lograron varias hazañas en esta disciplina. Pienso que debería ser una materia obligada en las instituciones, en el ajedrez podemos encontrar varios conceptos, como probabilidad, lógica, álgebra y notación, razonamiento espacial, patrones y muchas cosas más.";
  text(textContent, textX, textY, maxWidth);
}

function drawBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      fill((row + col) % 2 === 0 ? 255 : 0);
      square(col * squareSize, row * squareSize, squareSize);
    }
  }
}

function drawPieces() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]) {
        image(board[row][col], col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }
  }
}

function resetBoard() {
  board = Array(8).fill().map(() => Array(8).fill(null));

  // Piezas negras
  board[0] = [
    blackPieces[6], blackPieces[4], blackPieces[2], blackPieces[1],
    blackPieces[0], blackPieces[3], blackPieces[5], blackPieces[7]
  ];
  board[1] = blackPawns.slice();

  // Piezas blancas
  board[7] = [
    whitePieces[6], whitePieces[4], whitePieces[2], whitePieces[1],
    whitePieces[0], whitePieces[3], whitePieces[5], whitePieces[7]
  ];
  board[6] = whitePawns.slice();
}

function applyMove(move) {
  let [[fromRow, fromCol], [toRow, toCol]] = move;
  board[toRow][toCol] = board[fromRow][fromCol];
  board[fromRow][fromCol] = null;
}

function nextMove() {
  if (currentMove < moves.length - 1) {
    currentMove++;
    applyMove(moves[currentMove]);
    redraw();
  }
}

function prevMove() {
  if (currentMove >= 0) {
    currentMove--;
    resetBoard();
    for (let i = 0; i <= currentMove; i++) {
      applyMove(moves[i]);
    }
    redraw();
  }
}

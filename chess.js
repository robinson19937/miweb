let whitePieces = [];
let blackPieces = [];
let whitePawns = [];
let blackPawns = [];

let board = [];
let squareSize;
let currentMove = -1;

let prevButton, nextButton;

let moves = ["e2-e4", "e7-e5", "g1-f3", "b8-c6", "f1-c4", "f8-c5", "d1-h5", "g8-f6", "h5-f7"];

function preload() {
  whitePieces.push(loadImage('rey_blanco (1).png'));
  whitePieces.push(loadImage('reina_blanca (1).png'));
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
  let boardSize = min(windowWidth, windowHeight) * 0.8;
  squareSize = boardSize / 8;
  let extraHeight = 400; // Increased to accommodate text and buttons
  createCanvas(boardSize, boardSize + extraHeight);

  // Crear botones
  prevButton = createButton('⬅️ Anterior');
  nextButton = createButton('➡️ Siguiente');

  styleButton(prevButton, '#4CAF50');
  styleButton(nextButton, '#2196F3');

  positionButtons();

  prevButton.mousePressed(prevMove);
  nextButton.mousePressed(nextMove);

  resetBoardToStart();
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
  let spacing = 20;
  let buttonWidth = 150;
  let buttonY = height - 80; // Positioned below text
  prevButton.position(width / 2 - buttonWidth - spacing, buttonY);
  nextButton.position(width / 2 + spacing, buttonY);
}

function draw() {
  clear();
  drawBoard(squareSize);
  drawPieces(squareSize);

  stroke(255, 0, 0);
  noFill();
  rect(0, 0, width, height - 400);

  // Texto informativo
  textSize(18);
  textAlign(LEFT);
  fill(0);
  textLeading(24);

  let textX = 20;
  let textY = height - 320; // Adjusted for better spacing
  let maxWidth = width - 40;

  let fullText = "Piezas blancas: Computador\n" +
                 "Piezas negras: Robinson López\n\n" +
                 "Desde muy niño me interesé por el juego de ajedrez, todavía recuerdo esos días en esas clases con el instituto de deportes y la actividad competitiva en un mundo genial, donde se lograron varias hazañas en esta disciplina. Pienso que debería ser una materia obligada en las instituciones, en el ajedrez podemos encontrar varios conceptos, como probabilidad, lógica, álgebra y notación, razonamiento espacial, patrones y muchas cosas más.\n\n" +
                 "En el juego de arriba que podemos ver moviendo los botones hacia adelante o hacia atrás para mover las jugadas, representamos una partida en la que pudimos vencer a la computadora. Este proyecto muestra que un sistema computacional puede estar sujeto a errores y que el razonamiento humano siempre prevalece.";

  text(fullText, textX, textY, maxWidth);
}

function drawBoard(size) {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      fill((x + y) % 2 === 0 ? 255 : 0);
      square(x * size, y * size, size);
    }
  }
}

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

function notationToCoord(pos) {
  return {
    x: pos.charCodeAt(0) - 97,
    y: 8 - parseInt(pos[1])
  };
}

function resetBoardToStart() {
  board = Array(8).fill().map(() => Array(8).fill(null));

  board[0][0] = { img: blackPieces[6] };
  board[0][1] = { img: blackPieces[4] };
  board[0][2] = { img: blackPieces[2] };
  board[0][3] = { img: blackPieces[1] };
  board[0][4] = { img: blackPieces[0] };
  board[0][5] = { img: blackPieces[3] };
  board[0][6] = { img: blackPieces[5] };
  board[0][7] = { img: blackPieces[7] };

  for (let i = 0; i < 8; i++) {
    board[1][i] = { img: blackPawns[i] };
  }

  board[7][0] = { img: whitePieces[6] };
  board[7][1] = { img: whitePieces[4] };
  board[7][2] = { img: whitePieces[2] };
  board[7][3] = { img: whitePieces[1] };
  board[7][4] = { img: whitePieces[0] };
  board[7][5] = { img: whitePieces[3] };
  board[7][6] = { img: whitePieces[5] };
  board[7][7] = { img: whitePieces[7] };

  for (let i = 0; i < 8; i++) {
    board[6][i] = { img: whitePawns[i] };
  }
}

function applyMove(move) {
  const [from, to] = move.split("-");
  const f = notationToCoord(from);
  const t = notationToCoord(to);

  board[t.y][t.x] = board[f.y][f.x];
  board[f.y][f.x] = null;
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
    resetBoardToStart();
    for (let i = 0; i <= currentMove; i++) {
      applyMove(moves[i]);
    }
    redraw();
  }
}

function windowResized() {
  let boardSize = min(windowWidth, windowHeight) * 0.8;
  squareSize = boardSize / 8;
  resizeCanvas(boardSize, boardSize + 400);
  positionButtons();
  redraw();
}

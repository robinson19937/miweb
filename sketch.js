let fondo;
let mostrarInfo = false;
let botonX = 20, botonY = 20, botonW = 180, botonH = 50;
let infoBoxW = 330, infoBoxH = 240;

function preload() {
  fondo = loadImage('roblop.png');
}

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  textFont('sans-serif');
}

function draw() {
  background(0);
  image(fondo, 0, 0, width, height);

  // Botón "Quiénes somos"
  fill(30, 144, 255, 230);
  noStroke();
  rect(botonX, botonY, botonW, botonH, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Quiénes somos", botonX + botonW / 2, botonY + botonH / 2);

  // Botón "Proyectos"
  fill(50, 205, 50, 230);
  rect(botonX, botonY + botonH + 20, botonW, botonH, 10);
  fill(255);
  text("Proyectos", botonX + botonW / 2, botonY + botonH + 20 + botonH / 2);

  // Info desplegable
  if (mostrarInfo) {
    fill(255, 245);
    stroke(0);
    strokeWeight(1);
    rect(botonX, botonY + botonH * 2 + 30, infoBoxW, infoBoxH, 10);
    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(17);
    let mensaje = "Además de dedicarnos a la enseñanza, realizamos trabajos en áreas como trigonometría, álgebra, inglés, programación y robótica. También ofrecemos un portafolio creativo con ideas innovadoras para el diseño de páginas web.";
    text(mensaje, botonX + 15, botonY + botonH * 2 + 40, infoBoxW - 30, infoBoxH - 30);
  }
}

function mousePressed() {
  // Clic en "Quiénes somos"
  if (mouseX > botonX && mouseX < botonX + botonW &&
      mouseY > botonY && mouseY < botonY + botonH) {
    mostrarInfo = !mostrarInfo;
  }

  // Clic en "Proyectos"
  if (mouseX > botonX && mouseX < botonX + botonW &&
      mouseY > botonY + botonH + 20 && mouseY < botonY + botonH * 2 + 20) {
    window.open("https://www.roblop.com/proyectos", "_blank");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


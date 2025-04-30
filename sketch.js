let fondo;

function preload() {
  fondo = loadImage('fondo.png');
}

function setup() {
  pixelDensity(1); 
  createCanvas(windowWidth, windowHeight);
}

function draw() {

  background(0); 
  image(fondo, 0, 0, width, height); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

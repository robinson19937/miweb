// /var/www/html/p5upload/sketch.js
let fondo;

function preload() {
  fondo = loadImage('fondo.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(fondo);
}


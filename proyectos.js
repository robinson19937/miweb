let model;
let angleInput = 0;
let prediction = [0, 0, 0]; // [sin, cos, radianes]
let trainingData = [];
let isTrained = false;
let previousTouchX = 0;
let canvas;
let loadingModel = true;

async function setup() {
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  canvas = createCanvas(canvasSize, canvasSize);
  canvas.position((windowWidth - width) / 2, 150);

  console.log("Iniciando setup...");

  try {
    if (localStorage.getItem('mi-modelo')) {
      console.log("Cargando modelo desde localStorage...");
      model = await tf.loadLayersModel('localstorage://mi-modelo');
      console.log("Modelo cargado exitosamente.");
      isTrained = true;
      loadingModel = false;
    } else {
      console.log("No hay modelo en localStorage. Entrenando uno nuevo...");
      await trainModel();
    }
  } catch (error) {
    console.error("Error al cargar o entrenar el modelo:", error);
    isTrained = false;
    loadingModel = false;
  }

  window.addEventListener('keydown', handleKeyPress);
}

async function trainModel() {
  loadingModel = true;
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [1] }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3 }));
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  for (let i = 0; i < 500; i++) {
    let deg = random(0, 360);
    let rad = deg * PI / 180;
    trainingData.push({
      input: deg / 360,
      output: [sin(rad), cos(rad), rad]
    });
  }

  const xs = tf.tensor2d(trainingData.map(d => [d.input]));
  const ys = tf.tensor2d(trainingData.map(d => d.output));

  console.log("Entrenando modelo...");
  try {
    await model.fit(xs, ys, {
      epochs: 50,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
        }
      }
    });
    console.log("Entrenamiento completado.");
    isTrained = true;
    loadingModel = false;
    await model.save('localstorage://mi-modelo');
    console.log("Modelo guardado en localStorage.");
  } catch (error) {
    console.error("Error durante el entrenamiento:", error);
    loadingModel = false;
  }

  xs.dispose();
  ys.dispose();
}

function draw() {
  background(255);
  let textScale = width / 400;
  textSize(16 * textScale);
  textAlign(LEFT);
  fill(0);

  if (loadingModel) {
    push();
    textAlign(CENTER, CENTER);
    textSize(24 * textScale);
    fill(50);
    text("⏳ Cargando o entrenando modelo...", width / 2, height / 2);
    pop();
    return;
  }

  text(`Ángulo (grados): ${angleInput.toFixed(2)}`, 10 * textScale, 20 * textScale);
  text('Usa las flechas o desliza para cambiar el ángulo', 10 * textScale, 40 * textScale);

  if (isTrained && model) {
    try {
      let inputTensor = tf.tensor2d([[angleInput / 360]]);
      let outputTensor = model.predict(inputTensor);
      prediction = outputTensor.dataSync();
      inputTensor.dispose();
      outputTensor.dispose();

      text(`Seno: ${prediction[0].toFixed(4)}`, 10 * textScale, height - 60 * textScale);
      text(`Coseno: ${prediction[1].toFixed(4)}`, 10 * textScale, height - 40 * textScale);
      text(`Radianes: ${prediction[2].toFixed(4)}`, 10 * textScale, height - 20 * textScale);

      translate(width / 2, height / 2);
      scale(1, -1);

      stroke(0);
      line(-width * 0.25, 0, width * 0.25, 0);
      line(0, -height * 0.25, 0, height * 0.25);

      noFill();
      ellipse(0, 0, width * 0.5, width * 0.5);

      let x = prediction[1] * (width * 0.25);
      let y = prediction[0] * (width * 0.25);
      fill(255, 0, 0);
      ellipse(x, y, 10 * textScale, 10 * textScale);

      stroke(255, 0, 0);
      line(0, 0, x, y);
    } catch (error) {
      console.error("Error en la predicción:", error);
    }
  }
}

function handleKeyPress(event) {
  if (event.key === 'ArrowLeft') {
    angleInput -= 1;
  } else if (event.key === 'ArrowRight') {
    angleInput += 1;
  }
  angleInput = constrain(angleInput, 0, 360);
}

function touchMoved() {
  let deltaX = mouseX - previousTouchX;
  angleInput += deltaX * 0.2;
  angleInput = constrain(angleInput, 0, 360);
  previousTouchX = mouseX;
  return false;
}

function windowResized() {
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  resizeCanvas(canvasSize, canvasSize);
  canvas.position((windowWidth - width) / 2, 150);
}

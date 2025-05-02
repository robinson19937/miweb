let model;
let angleInput = 0;
let prediction = [0, 0, 0]; // [sin, cos, radianes]
let trainingData = [];
let isTrained = false;
let previousTouchX = 0;
let canvas;

async function setup() {
  // Create canvas with responsive dimensions
  let canvasSize = min(windowWidth * 0.8, windowHeight * 0.6);
  canvas = createCanvas(canvasSize, canvasSize);
  canvas.position((windowWidth - width) / 2, 150); // Position below description

  console.log("Starting setup...");

  try {
    // Attempt to load the model from localStorage
    if (localStorage.getItem('mi-modelo')) {
      console.log("Attempting to load model from localStorage...");
      model = await tf.loadLayersModel('localstorage://mi-modelo');
      console.log("Model loaded successfully!");
      isTrained = true;
    } else {
      console.log("No model found in localStorage. Training new model...");
      await trainModel();
    }
  } catch (error) {
    console.error("Error loading or training model:", error);
    isTrained = false;
  }

  // Add arrow key event listeners
  window.addEventListener('keydown', handleKeyPress);
}

async function trainModel() {
  console.log("Creating model...");
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [1] })); // Simplified model
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 3 }));
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });

  // Generate smaller training data for faster testing
  console.log("Generating training data...");
  for (let i = 0; i < 500; i++) { // Reduced to 500 samples
    let deg = random(0, 360);
    let rad = deg * PI / 180;
    trainingData.push({
      input: deg / 360,
      output: [sin(rad), cos(rad), rad]
    });
  }

  const xs = tf.tensor2d(trainingData.map(d => [d.input]));
  const ys = tf.tensor2d(trainingData.map(d => d.output));

  // Train with fewer epochs
  console.log("Training model...");
  try {
    await model.fit(xs, ys, {
      epochs: 20,  // Reduced to 20 epochs for faster testing
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
        }
      }
    });
    console.log("Training completed!");
  } catch (error) {
    console.error("Training error:", error);
  }

  xs.dispose();
  ys.dispose();
  isTrained = true;

  // Save model
  console.log("Saving model to localStorage...");
  try {
    await model.save('localstorage://mi-modelo');
    console.log("Model saved successfully!");
  } catch (error) {
    console.error("Error saving model:", error);
  }
}

function draw() {
  background(255);

  // Responsive text size
  let textScale = width / 400;
  textSize(16 * textScale);
  textAlign(LEFT);

  // Display UI
  text(`Angle (degrees): ${angleInput.toFixed(2)}`, 10 * textScale, 20 * textScale);
  text('Use arrows or swipe to change angle', 10 * textScale, 40 * textScale);

  if (isTrained && model) {
    // Predict
    try {
      let inputTensor = tf.tensor2d([[angleInput / 360]]);
      let outputTensor = model.predict(inputTensor);
      prediction = outputTensor.dataSync();
      inputTensor.dispose();
      outputTensor.dispose();

      // Display results
      text(`Sine: ${prediction[0].toFixed(4)}`, 10 * textScale, height - 60 * textScale);
      text(`Cosine: ${prediction[1].toFixed(4)}`, 10 * textScale, height - 40 * textScale);
      text(`Radians: ${prediction[2].toFixed(4)}`, 10 * textScale, height - 20 * textScale);

      // Draw graph
      translate(width / 2, height / 2);
      scale(1, -1);

      // Axes
      stroke(0);
      line(-width * 0.25, 0, width * 0.25, 0);
      line(0, -height * 0.25, 0, height * 0.25);

      // Unit circle
      noFill();
      ellipse(0, 0, width * 0.5, width * 0.5);

let fondo;
let mostrarInfo = false;
let botonX = 20, botonY = 20, botonW = 180, botonH = 50;
let infoBoxW = 330, infoBoxH = 240;

function preload() {
  fondo = loadImage('roblop.png?v=' + Date.now(),
    () => console.log("Imagen cargada exitosamente"),
    (err) => {
      console.error("Error cargando la imagen:", err);
      fondo = null;
    }
  );
}

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  textFont('sans-serif');
    // Crear contenedor del formulario
  let formulario = createDiv(`
    <label style="font-weight:bold; font-size:16px; color:#00f;">🚀 Cotiza tus trabajos aquí</label><br>
    <small style="font-size:14px;">Sube un documento o describe tu idea</small><br>
  `);
  formulario.position(20, height - 220); // Parte inferior izquierda
  formulario.style('background', 'rgba(0,0,0,0.7)');
  formulario.style('padding', '15px');
  formulario.style('border-radius', '12px');
  formulario.style('width', '270px');
  formulario.style('color', 'white');
  formulario.style('font-family', 'sans-serif');
  formulario.style('z-index', '100');

  // Input para archivo
  let fileInput = createFileInput(null);
  fileInput.parent(formulario);
  fileInput.style('margin-top', '10px');
  fileInput.style('width', '100%');
  fileInput.style('background', '#222');
  fileInput.style('color', 'white');
  fileInput.style('padding', '5px');
  fileInput.style('border', 'none');
  fileInput.style('border-radius', '8px');

  // Textarea para idea
  let ideaInput = createElement('textarea', '');
  ideaInput.attribute('placeholder', 'Describe tu idea aquí...');
  ideaInput.parent(formulario);
  ideaInput.style('margin-top', '10px');
  ideaInput.style('width', '100%');
  ideaInput.style('height', '60px');
  ideaInput.style('padding', '8px');
  ideaInput.style('border-radius', '8px');
  ideaInput.style('border', 'none');
  ideaInput.style('resize', 'none');
  ideaInput.style('font-family', 'sans-serif');

  // Botón para subir
  let subirBtn = createButton('Enviar cotización');
  subirBtn.parent(formulario);
  subirBtn.style('margin-top', '10px');
  subirBtn.style('padding', '10px');
  subirBtn.style('width', '100%');
  subirBtn.style('background', '#00c853');
  subirBtn.style('color', 'white');
  subirBtn.style('border', 'none');
  subirBtn.style('border-radius', '8px');
  subirBtn.style('font-weight', 'bold');

  subirBtn.mousePressed(() => {
    const ideaTexto = ideaInput.value().trim();
    const archivo = fileInput.elt.files[0];

    if (!archivo && !ideaTexto) {
      alert("Por favor sube un archivo o escribe tu idea.");
      return;
    }

    const formData = new FormData();
    if (archivo) formData.append('file', archivo);
    if (ideaTexto) formData.append('idea', ideaTexto);

    fetch('https://miweb-mj38.onrender.com/upload', {
      method: 'POST',
      body: formData
    })
    .then(res => res.text())
    .then(data => {
      alert("✅ Cotización enviada exitosamente.");
      fileInput.elt.value = "";
      ideaInput.value('');
    })
    .catch(err => {
      console.error('Error:', err);
      alert("❌ Error al enviar la cotización.");
    });
  });


}

function draw() {
  background(0);

  if (fondo) {
    image(fondo, 0, 0, width, height);
  } else {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("No se pudo cargar la imagen de fondo.", width / 2, height / 2);
  }



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

  // Botón "Red neuronal"
  fill(255, 140, 0, 230);
  rect(botonX, botonY + botonH * 2 + 40, botonW, botonH, 10);
  fill(255);
  text("Red neuronal", botonX + botonW / 2, botonY + botonH * 2 + 40 + botonH / 2);

  fill('orange');
  textAlign(LEFT, TOP);
  textSize(16);
  let textoY = botonY + botonH * 3 + 50;
  text("robinsonlopez1199@gmail.com", 20, textoY);
  text("tel 3209974513", 20, textoY + 20);
  

  // Info desplegable
  if (mostrarInfo) {
    fill(255, 245);
    stroke(0);
    strokeWeight(1);
    rect(botonX, botonY + botonH * 3 + 60, infoBoxW, infoBoxH, 10);
    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(17);
    let mensaje = "Además de dedicarnos a la enseñanza, realizamos trabajos en áreas como trigonometría, álgebra, inglés, programación y robótica. También ofrecemos un portafolio creativo con ideas innovadoras para el diseño de páginas web.";
    text(mensaje, botonX + 15, botonY + botonH * 3 + 70, infoBoxW - 30, infoBoxH - 30);
  }
}

function mousePressed() {
  if (mouseX > botonX && mouseX < botonX + botonW &&
      mouseY > botonY && mouseY < botonY + botonH) {
    mostrarInfo = !mostrarInfo;
  }

  if (mouseX > botonX && mouseX < botonX + botonW &&
      mouseY > botonY + botonH + 20 && mouseY < botonY + botonH * 2 + 20) {
    window.open("https://www.roblop.com/proyectos", "_blank");
  }

  if (mouseX > botonX && mouseX < botonX + botonW &&
      mouseY > botonY + botonH * 2 + 40 && mouseY < botonY + botonH * 3 + 40) {
    window.open("https://roblop.com/red-neuronal", "_blank");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

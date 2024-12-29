class Kaleidoscope {
  constructor({ canvas, slices = 8, radius = 300 }) {
    // Configuración inicial del caleidoscopio
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.bufferCanvas = document.createElement("canvas"); // Canvas temporal para los patrones
    this.bufferContext = this.bufferCanvas.getContext("2d");

    this.slices = slices; // Número de segmentos reflejados en el caleidoscopio
    this.radius = radius; // Radio del caleidoscopio

    // Parámetros del fractal y animación
    this.angle = Math.PI / 4; // Ángulo entre ramas del fractal
    this.scale = 0.7; // Escala para reducir el tamaño en cada iteración
    this.iterations = 5; // Número de niveles del fractal (más niveles = más detalle)
    this.animate = true; // Habilitar/deshabilitar animación
    this.rotationSpeed = 0.02; // Velocidad de rotación del caleidoscopio

    // Variables de estado
    this.rotation = 0; // Ángulo de rotación actual
    this.offsetX = 0; // Desplazamiento horizontal (sin uso en este caso)
    this.offsetY = 0; // Desplazamiento vertical (sin uso en este caso)
    this.hue = 0; // Color inicial para los patrones (usando HSL)

    // Ajuste inicial del tamaño del canvas
    this.resize();
    window.addEventListener("resize", () => this.resize()); // Redimensionar dinámicamente
  }

  resize() {
    // Ajustar el tamaño del canvas y el canvas temporal al tamaño de la ventana
    const { innerWidth: width, innerHeight: height } = window;
    this.canvas.width = width;
    this.canvas.height = height;
    this.bufferCanvas.width = width;
    this.bufferCanvas.height = height;

    // Posicionar el canvas temporal en el centro
    this.bufferContext.translate(width / 2, height);
  }

  drawFractal(x, y, angle, size, depth) {
    // Dibujar un fractal (patrón repetitivo) en el buffer
    if (depth <= 0) return; // Detener la recursión cuando la profundidad sea 0

    const endX = x + Math.cos(angle) * size; // Calcular posición final en X
    const endY = y + Math.sin(angle) * size; // Calcular posición final en Y

    // Estilo de las líneas del fractal
    this.bufferContext.strokeStyle = `hsl(${this.hue}, 100%, 70%)`; // Color dinámico en HSL
    this.bufferContext.lineWidth = 2; // Grosor fijo para las líneas

    // Dibujar una línea
    this.bufferContext.beginPath();
    this.bufferContext.moveTo(x, y); // Punto de inicio
    this.bufferContext.lineTo(endX, endY); // Punto final
    this.bufferContext.stroke();

    // Dibujar ramas adicionales a ambos lados
    this.drawFractal(
      endX,
      endY,
      angle + this.angle,
      size * this.scale,
      depth - 1
    );
    this.drawFractal(
      endX,
      endY,
      angle - this.angle,
      size * this.scale,
      depth - 1
    );
  }

  drawPattern() {
    // Dibujar el patrón en el canvas temporal (buffer)
    this.bufferContext.save(); // Guardar el estado actual del contexto
    this.bufferContext.setTransform(1, 0, 0, 1, 0, 0); // Restablecer transformaciones
    this.bufferContext.clearRect(
      0,
      0,
      this.bufferCanvas.width,
      this.bufferCanvas.height
    ); // Limpiar el canvas
    this.bufferContext.restore();

    // Dibujar el fractal principal desde el centro
    this.drawFractal(
      0,
      -this.radius * this.scale,
      -Math.PI / 2,
      this.radius,
      this.iterations
    );

    // Cambiar el color (hue) para el siguiente fotograma
    this.hue = (this.hue + 1) % 360; // Asegurarse de que hue esté entre 0 y 360
  }

  draw() {
    // Dibujar el caleidoscopio
    const ctx = this.context;
    const buffer = this.bufferCanvas;

    this.drawPattern(); // Dibujar el patrón en el buffer

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Restablecer transformaciones
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpiar el canvas principal

    // Posicionar el canvas principal en el centro
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

    const step = (Math.PI * 2) / this.slices; // Calcular el ángulo entre segmentos

    // Dibujar cada segmento del caleidoscopio
    for (let i = 0; i < this.slices; i++) {
      ctx.save();
      ctx.rotate(i * step + this.rotation); // Rotar cada segmento

      if (i % 2 === 1) {
        ctx.scale(-1, 1); // Reflejar cada segundo segmento
      }

      ctx.drawImage(buffer, -this.canvas.width / 2, -this.canvas.height); // Dibujar el patrón
      ctx.restore();
    }

    if (this.animate) {
      this.rotation += this.rotationSpeed; // Incrementar la rotación si la animación está habilitada
    }

    requestAnimationFrame(() => this.draw()); // Solicitar el siguiente fotograma
  }
}

// Configuración inicial
const canvas = document.getElementById("kaleidoscope");
const kaleidoscope = new Kaleidoscope({ canvas });

kaleidoscope.draw(); // Iniciar el dibujo

// Controles interactivos usando dat.GUI
const gui = new dat.GUI();
gui.add(kaleidoscope, "slices", 3, 20, 1).name("Segmentos"); // Número de segmentos
gui.add(kaleidoscope, "angle", 0, Math.PI).name("Ángulo entre ramas"); // Ángulo de las ramas
gui.add(kaleidoscope, "scale", 0.5, 1).name("Escala del fractal"); // Escala de los fractales
gui.add(kaleidoscope, "iterations", 1, 10, 1).name("Niveles de detalle"); // Niveles del fractal
gui.add(kaleidoscope, "animate").name("Animar"); // Habilitar o deshabilitar animación
gui.add(kaleidoscope, "rotationSpeed", 0, 0.1).name("Velocidad de rotación"); // Velocidad de rotación
gui.add(kaleidoscope, "radius", 100, 500).name("Radio del caleidoscopio"); // Tamaño del caleidoscopio
gui.close(); // Cerrar el panel de control por defecto

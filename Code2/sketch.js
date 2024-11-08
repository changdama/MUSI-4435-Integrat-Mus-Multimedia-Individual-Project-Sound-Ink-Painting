var inc = 0.1;
var scl = 10;
var cols, rows;
var zoff = 0;
var particles = [];
var flowfield;
var isAnimationRunning = true;
var animationStartTime;
var countdownValue; 
var mic;

function setup() {
  countdownValue = 10;
  isCountdown = false;
  createCanvas(600, 400);
  cols = floor(width / scl);
  rows = floor(height / scl);

  flowfield = new Array(cols * rows);

  for (var i = 0; i < 300; i++) {
    particles[i] = new FlowParticle();
  }
  background(255);
  
  // Start the audio input.
  mic = new p5.AudioIn();
  mic.start();

  animationStartTime = millis();
  isAnimationRunning = true;
}

function draw() {
  var vol = mic.getLevel(); // Get the volume from the microphone
  var repulsionForce = map(vol, 0, 1, 0, 5); // Map volume to repulsion force range
  var particleColor = vol > 0.05 ? 255 : 0; // Change color based on volume threshold
  var particleStrokeWeight;
if (vol <= 0.05) {
  // Map the volume to a range between 0 and 1 for the stroke weight
  particleStrokeWeight = map(vol, 0, 0.05, 0, 1);
} else {
  // Map the volume to a range between 2 and 5 for the stroke weight
  particleStrokeWeight = map(vol, 0.05, 1, 2, 5);
}
  
  
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0003;
  }
  
  for (var i = 0; i < particles.length; i++) {
    particles[i].applyRepulsion(repulsionForce, particleColor, particleStrokeWeight); // Apply dynamic repulsion based on volume
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
}
  
class FlowParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 2;
    this.prevPos = this.pos.copy();
    // Additional properties for color and stroke weight
    this.col=1
    this.strokeW=1
    
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  // New method to apply repulsion based on volume
  applyRepulsion(force, col, strokeW) {
    this.applyForce(p5.Vector.random2D().mult(force));
    this.col = col;
    this.strokeW = strokeW;
  }

  show() {
    stroke(this.col);
    strokeWeight( this.strokeW);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }

  follow(vectors) {
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = vectors[index];
    this.applyForce(force);
  }
}



var inc = 0.1;
var scl = 10;
var cols, rows;
var zoff = 0;
var particles = [];
var flowfield;
var isAnimationRunning = true;
var animationStartTime;
var countdownValue; 
 
let osc, delay;

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
  osc = new p5.Oscillator('triangle');
  osc.freq(440, 0.1);
  osc.start(); // You may want to control when it starts more carefully
  osc.amp(0);  // Set initial amplitude to 0

  delay = new p5.Delay();
  delay.setType('pingPong');
  delay.process(osc, 0.2, 0.7, 3000);
   animationStartTime = millis();
  isAnimationRunning = true;
}

function draw() {
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
    if (mouseIsPressed) {
      particles[i].repelFrom(createVector(mouseX, mouseY));
    } else {
      particles[i].attractTo(createVector(mouseX, mouseY));
    }
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
if (mouseIsPressed) {
    osc.amp(0.9, 0.1);  
  } else {
    osc.amp(0.0, 0.5); 
  }
if (isAnimationRunning && millis() - animationStartTime >= 10000) {
    noLoop(); 
    isAnimationRunning = false;
 }
   if (isAnimationRunning) {
  osc.freq(map(mouseY, height, 0, 200, 800), 0.5);
}
}

  class FlowParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 4;
    this.prevPos = this.pos.copy();
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

  show() {
    stroke(0, 5);
    strokeWeight(1);
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

  attractTo(target) {
    let force = p5.Vector.sub(target, this.pos);
    force.setMag(1); 
    this.applyForce(force);
  }
  
  repelFrom(target) {
    let force = p5.Vector.sub(this.pos, target);
    force.setMag(5); 
    this.applyForce(force);
  }
 

 } 
function mousePressed() {
  osc.amp(0.9, 0.1);
  if (!isAnimationRunning) {
    animationStartTime = millis(); 
    isAnimationRunning = true;
    loop(); 
  }
}

function mouseReleased() {
  osc.amp(0.0, 0.5);
}

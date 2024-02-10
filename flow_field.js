let inc = 0.1;
let scl = 10;
let cols, rows;

let zoff = 0;

let particles = [];

let flowfield = [];

let w, h;

let send = false;

function setup() {
  w = windowWidth;
  h = windowHeight;
  createCanvas(w, h);
  cols = floor(w / scl);
  rows = floor(h / scl);
  
  for(let i = 0; i < 100; i++){
    particles[i] = new Particle(i);
    console.log(particles[i]);
  }
  background(255);
}

function draw() {
  if(send){
    let yoff = 0;

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
        let index = x + y * cols;
        let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
        let v = p5.Vector.fromAngle(angle);
        v.setMag(1);
        flowfield[index] = v;
        xoff += inc;
        }
        yoff += inc;
        
        zoff += .0004;
    }

    for(let i = 0; i < particles.length; i++){
        particles[i].edges();
        particles[i].follow(flowfield);
        particles[i].update(); 
        particles[i].show();
    }
  }
}

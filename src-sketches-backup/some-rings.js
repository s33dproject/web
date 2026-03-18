let hue;
const rings = [];

function setup () {
  createCanvas(windowWidth, windowHeight);

  hue = random(0, 360);
  const count = floor(random(10, 20));
  for (let i = 0; i < count; i++) {
    const diameter = ((i + 1) / count);
    const arcLength = random(PI * 0.05, PI * 2);
    const arcAngle = random(-PI * 2, PI * 2);
    const spinSpeed = random(-1, 1);
    const color = [
      random(hue - 20, hue + 20),
      random(40, 75),
      random(40, 75)
    ];
    rings.push({
      color,
      spinSpeed,
      diameter,
      arcLength,
      arcAngle
    });
  }
}

function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
}

function draw () {
  colorMode(HSL);
  background(hue, 80, 80);

  noFill();
  strokeWeight(5);
  strokeCap(ROUND);

  let d = Math.min(width, height);
  d -= d * 0.25;
  
  for (let i = 0; i < rings.length; i++) {
    const {
      diameter,
      arcLength,
      arcAngle,
      color,
      spinSpeed
    } = rings[i];
    stroke(color);
    const spin = millis() / 1000 * spinSpeed;
    arc(
      width / 2,
      height / 2,
      diameter * d,
      diameter * d,
      spin + arcAngle,
      spin + arcAngle + Math.PI * arcLength
    );
  }
}
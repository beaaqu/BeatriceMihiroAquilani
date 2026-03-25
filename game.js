// Catch the Falling Carrots (p5.js)
let horseImg, carrotImg, fieldImg;
let player;
let carrots = [];
let score = 0;
let lives = 3;
let fallSpeed = 3.8;
const maxSpeed = 12;
let gameOver = false;

function preload() {
  horseImg = loadImage("images/horse.png");
  carrotImg = loadImage("images/carrot.png");
  fieldImg = loadImage("images/field.png");
}

function setup() {
  let canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.parent("game-container");
  player = new Horse(width / 2, height - 80);
}

function draw() {
  background(200);
  drawBackground();
  drawScoreboard();

  if (!gameOver) {
    fallSpeed += 0.001;
    fallSpeed = min(fallSpeed, maxSpeed);

    // Spawn carrots
    if (frameCount % 55 === 0) {
      carrots.push(new Carrot(random(width), -50, fallSpeed));
    }

    for (let i = carrots.length - 1; i >= 0; i--) {
      let c = carrots[i];
      c.update();
      c.display();

      if (c.hits(player)) {
        score++;
        fallSpeed += 0.25;
        fallSpeed = min(fallSpeed, maxSpeed);
        carrots.splice(i, 1);
      } else if (c.y > height) {
        lives--;
        carrots.splice(i, 1);
        if (lives <= 0) gameOver = true;
      }
    }

    player.update();
    player.display();
  } else {
    drawGameOver();
  }
}

// ======= Classes =======
class Horse {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.scale = 0.18;
    this.w = horseImg.width * this.scale;
    this.h = horseImg.height * this.scale;
  }

  update() {
    this.x = constrain(mouseX, this.w / 2, width - this.w / 2);
  }

  display() {
    imageMode(CENTER);
    image(horseImg, this.x, this.y, this.w, this.h);
  }
}

class Carrot {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.scale = 0.06;
    this.w = carrotImg.width * this.scale;
    this.h = carrotImg.height * this.scale;
  }

  update() {
    this.y += this.speed;
  }

  display() {
    imageMode(CENTER);
    image(carrotImg, this.x, this.y, this.w, this.h);
  }

  hits(horse) {
    return (
      this.x > horse.x - horse.w / 2 &&
      this.x < horse.x + horse.w / 2 &&
      this.y > horse.y - horse.h / 2 &&
      this.y < horse.y + horse.h / 2
    );
  }
}

// ======= Drawing helper functions =======
function drawBackground() {
  imageMode(CENTER);
  image(fieldImg, width / 2, height / 2, width, height);
}

function drawScoreboard() {
  fill(0, 160);
  rect(0, 0, width, 30);
  fill(255);
  textSize(16);
  text("Score: " + score, 10, 20);
  text("Lives: " + lives, width - 80, 20);
}

function drawGameOver() {
  fill(0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text("GAME OVER", width / 2, height / 2 - 20);
  textSize(18);
  text("Final Score: " + score, width / 2, height / 2 + 20);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}
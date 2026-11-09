
let cream, sky, navy, yellow, pink, blue, white;
let dirtBackground;

let screen = "menu";
let gameTitle = "Vegetable Shinobi";
let barHeight = 70;

let showTutorial = false;
let tutorialStartTime = 0;

let selectedLevel = 1;
let unlockedLevel = 1;
let levelStars = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
let levelButtons = [];
let achievements = {};
let achievementToast = null;
let achievementScroll = 0;
const achievementDefinitions = [
  {id:"mega", title:"Mega Shinobi", detail:"Get a Mega Swipe (5+ veggies)", icon:"⚡"},
  ...Array.from({length:6}, (_,i) => ({id:"level"+(i+1), title:"Level "+(i+1)+" Master", detail:"Earn 3 stars on Level "+(i+1), icon:"⭐"})),
  {id:"allStars", title:"Perfect Garden", detail:"Earn 3 stars on all 6 levels", icon:"🏆"},
  {id:"bombDeath", title:"Bomb Trouble", detail:"Lose all 3 stars to bombs", icon:"💣"},
  {id:"points150", title:"Point Master", detail:"Score 150 points in one level", icon:"🎯"}
];

let playButton, tutorialButton, achievementsButton;
let homeButton, closeButton, backButton, retryButton;

let vegetables = [];
let bombs = [];
let particles = [];
let floatingTexts = [];
let swipeTrail = [];

let score = 0;
let veggieCount = 0;
let goal = 25;
let stars = 3;
let maxStars = 3;

let lastSpawn = 0;
let spawnDelay = 1250;

let levelComplete = false;
let gameOver = false;
let bombFlashTime = -1000;
let screenShake = 0;

let critChance = 0.15;
let dragging = false;
let swipeHits = 0;
let comboAwarded = 0;

let giantChance = 0.18;
let giantHP = 5;

let cameraZoom = 1;
let targetZoom = 1;
let cameraX = 0;
let cameraY = 0;
let zoomTarget = null;
let zoomAmount = 1.65;
let zoomSpeed = 0.07;

let veggieTypes = [
  "carrot", "tomato", "broccoli", "corn", "eggplant"
];

// LOAD ASSETS
function preload() {
  dirtBackground = loadImage("assets/dirt.jpg");
}

// SETUP
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);

  cream = color("#F1FADF");
  sky = color("#2BD9EE");
  navy = color("#17375E");
  yellow = color("#FFD43B");
  pink = color("#F26BAA");
  blue = color("#3D8BFF");
  white = color("#FFFFFF");

  playButton = makeButton(0, 0, 280, 90, "Play", sky, 36);
  tutorialButton = makeButton(0, 0, 280, 75, "Tutorial", yellow, 30);
  achievementsButton = makeButton(0, 0, 280, 75, "Achievements", pink, 27);

  homeButton = makeButton(95, 35, 150, 50, "Home", white, 22);
  closeButton = makeButton(0, 0, 155, 48, "Close", pink, 23);
  backButton = makeButton(0, 0, 180, 60, "Levels", yellow, 25);
  retryButton = makeButton(0, 0, 180, 60, "Retry", pink, 25);

  levelButtons = [
    {x:-340, y:200, type:"carrot", level:1},
    {x:-180, y:90, type:"tomato", level:2},
    {x:0, y:170, type:"broccoli", level:3},
    {x:250, y:55, type:"corn", level:4},
    {x:60, y:-85, type:"eggplant", level:5},
    {x:-260, y:-175, type:"pumpkin", level:6}
  ];

  resetCamera();
  loadLevelProgress();
  loadAchievements();
  syncStarAchievements();
}

// MAIN DRAW
function draw() {
  background(cream);

  if (screen === "menu") drawMenu();
  else if (screen === "levels") drawLevelSelect();
  else if (screen === "game") drawGame();
  else if (screen === "achievements") drawAchievements();

  drawTopBar();

  if (showTutorial) drawTutorialPopup();
  drawAchievementToast();
}

// SAVE AND LOAD LEVEL PROGRESS
function loadLevelProgress() {
  try {
    let saved = JSON.parse(
      localStorage.getItem("vegetableShinobiProgress")
    );

    if (!saved) return;

    for (let i = 1; i <= 6; i++) {
      levelStars[i] = constrain(
        Number(saved.levelStars?.[i]) || 0, 0, 3
      );
    }

    unlockedLevel = constrain(
      Number(saved.unlockedLevel) || 1, 1, 6
    );
  } catch (error) {
    console.warn("Could not load progress:", error);
  }
}

function saveLevelProgress() {
  try {
    localStorage.setItem(
      "vegetableShinobiProgress",
      JSON.stringify({unlockedLevel, levelStars})
    );
  } catch (error) {
    console.warn("Could not save progress:", error);
  }
}

// ACHIEVEMENT STORAGE AND UNLOCKS
function loadAchievements() {
  try {
    achievements = JSON.parse(localStorage.getItem("vegetableShinobiAchievements")) || {};
  } catch (error) {
    achievements = {};
  }
}
function unlockAchievement(id) {
  if (achievements[id]) return;
  const definition = achievementDefinitions.find(a => a.id === id);
  if (!definition) return;
  achievements[id] = true;
  try {
    localStorage.setItem("vegetableShinobiAchievements", JSON.stringify(achievements));
  } catch (error) {
    console.warn("Could not save achievements:", error);
  }
  achievementToast = {title:definition.title, icon:definition.icon, started:millis()};
}
function syncStarAchievements() {
  for (let i = 1; i <= 6; i++) {
    if (levelStars[i] === 3) unlockAchievement("level" + i);
  }
  if ([1,2,3,4,5,6].every(i => levelStars[i] === 3)) {
    unlockAchievement("allStars");
  }
}
function checkPointAchievement() {
  if (score >= 150) unlockAchievement("points150");
}
function drawAchievementToast() {
  if (!achievementToast) return;
  if (millis() - achievementToast.started > 3200) {
    achievementToast = null;
    return;
  }
  push();
  rectMode(CENTER);
  noStroke();
  fill(255, 247, 197);
  stroke(navy);
  strokeWeight(3);
  const w = min(width - 20, 360);
  rect(width/2, barHeight + 45, w, 70, 16);
  noStroke();
  fill(navy);
  textAlign(CENTER,CENTER);
  textStyle(BOLD);
  textSize(17);
  text("ACHIEVEMENT UNLOCKED!", width/2, barHeight+30);
  textSize(19);
  text(achievementToast.icon + " " + achievementToast.title, width/2, barHeight+55);
  pop();
}

// CAMERA
function resetCamera() {
  cameraZoom = 1;
  targetZoom = 1;
  cameraX = width / 2;
  cameraY = height / 2;
  zoomTarget = null;
}

function updateCamera() {
  if (zoomTarget && zoomTarget.sliced) {
    zoomTarget = null;
    targetZoom = 1;
  }

  if (zoomTarget) {
    targetZoom = zoomAmount;
    cameraX = lerp(cameraX, zoomTarget.x, 0.12);
    cameraY = lerp(cameraY, zoomTarget.y, 0.12);
  } else {
    targetZoom = 1;
    cameraX = lerp(cameraX, width / 2, 0.08);
    cameraY = lerp(cameraY, height / 2, 0.08);
  }

  cameraZoom = lerp(cameraZoom, targetZoom, zoomSpeed);
}

function screenToWorld(x, y) {
  return {
    x: (x - width / 2) / cameraZoom + cameraX,
    y: (y - height / 2) / cameraZoom + cameraY
  };
}

// TOP BAR
function drawTopBar() {
  push();
  rectMode(CORNER);
  noStroke();
  fill(blue);
  rect(0, 0, width, barHeight);

  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(30, max(16, width / 22)));
  text(gameTitle, width / 2, barHeight / 2);
  pop();

  drawButton(homeButton);
}

// MAIN MENU
function drawMenu() {
  let cx = width / 2;
  let cy = (height + barHeight) / 2;

  playButton.x = cx;
  playButton.y = cy - 115;

  tutorialButton.x = cx;
  tutorialButton.y = cy;

  achievementsButton.x = cx;
  achievementsButton.y = cy + 105;

  drawButton(playButton);
  drawButton(tutorialButton);
  drawButton(achievementsButton);
}

// LEVEL SELECTION
function getMapScale() {
  return min(width / 1000, (height - barHeight) / 650);
}

function drawLevelSelect() {
  background("#DDF6CF");

  let s = getMapScale();

  push();
  translate(width / 2, barHeight + (height - barHeight) / 2);
  scale(s);

  noStroke();
  fill("#BFE5AC");

  for (let i = 0; i < 30; i++) {
    ellipse(
      sin(i * 12.4) * 470,
      cos(i * 8.7) * 290,
      65, 35
    );
  }

  for (let i = 0; i < 18; i++) {
    drawGardenFlower(
      sin(i * 14.7) * 460,
      cos(i * 9.3) * 280
    );
  }

  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  stroke("#CDA77B");
  strokeWeight(75);
  drawGardenPath();

  stroke("#EBD1A5");
  strokeWeight(58);
  drawGardenPath();

  for (let lvl of levelButtons) {
    drawVegetableLevel(lvl);
  }

  pop();

  push();
  rectMode(CENTER);
  noStroke();
  fill(white);
  rect(width / 2, barHeight + 52, min(370, width - 20), 65, 25);

  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(32, width / 15));
  text("CHOOSE A LEVEL!", width / 2, barHeight + 52);
  pop();
}

function drawGardenPath() {
  beginShape();
  curveVertex(-420, 235);
  curveVertex(-340, 200);
  curveVertex(-180, 90);
  curveVertex(0, 170);
  curveVertex(250, 55);
  curveVertex(60, -85);
  curveVertex(-260, -175);
  curveVertex(-360, -230);
  endShape();
}

function drawVegetableLevel(lvl) {
  push();
  translate(lvl.x, lvl.y);

  let unlocked = lvl.level <= unlockedLevel;
  let s = getMapScale();

  let mx = (mouseX - width / 2) / s;
  let my = (mouseY - (barHeight + (height - barHeight) / 2)) / s;

  if (dist(mx, my, lvl.x, lvl.y) < 55 && unlocked) {
    scale(1.1);
  }

  stroke(navy);
  strokeWeight(4);
  fill(white);
  circle(0, 0, 105);

  noStroke();
  drawLevelVegetable(lvl.type);

  fill(yellow);
  stroke(navy);
  strokeWeight(2);
  circle(35, 35, 36);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(lvl.level, 35, 35);

  if (!unlocked) {
    fill(white);
    stroke(navy);
    strokeWeight(2);
    circle(-35, 35, 35);

    noStroke();
    textSize(21);
    text("🔒", -35, 35);
  }

  drawLevelStars(lvl.level);
  pop();
}

// STARS UNDER EACH LEVEL
function drawLevelStars(level) {
  let earned = levelStars[level] || 0;

  push();

  for (let i = 0; i < 3; i++) {
    let x = (i - 1) * 34;
    let y = 91;

    fill(i < earned ? "#FFD43B" : "#B9BEC6");
    stroke(i < earned ? "#D99A16" : "#9299A3");
    strokeWeight(1.5);

    drawStarShape(x, y, 9, 17, 5);
  }

  pop();
}

// DRAW VEGETABLES
function drawLevelVegetable(type) {
  noStroke();

  if (type === "carrot") {
    fill("#FF943D");
    triangle(-25, -20, 25, -20, 0, 35);
    fill("#43BE64");
    ellipse(0, -32, 20, 30);

  } else if (type === "tomato") {
    fill("#F45B5B");
    circle(0, 0, 70);
    fill("#43BE64");
    drawStarShape(0, -30, 15, 30, 5);

  } else if (type === "broccoli") {
    fill("#8DCB7A");
    rect(-10, 0, 20, 35, 6);
    fill("#53B96C");
    circle(-20, -15, 40);
    circle(0, -30, 45);
    circle(20, -15, 40);

  } else if (type === "corn") {
    fill("#FFD43B");
    ellipse(0, 0, 45, 80);
    fill("#43BE64");
    triangle(-20, 35, -35, -20, 0, 35);
    triangle(20, 35, 35, -20, 0, 35);

  } else if (type === "eggplant") {
    fill("#9564C9");
    ellipse(0, 5, 55, 75);
    fill("#43BE64");
    triangle(-25, -25, 25, -25, 0, -40);

  } else if (type === "pumpkin") {
    fill("#FF9B45");
    ellipse(-15, 0, 45, 65);
    ellipse(15, 0, 45, 65);
    ellipse(0, 0, 45, 70);
    fill("#43BE64");
    rect(-5, -42, 10, 20, 4);
  }

  fill(navy);
  circle(-10, 0, 6);
  circle(10, 0, 6);
}

function drawGardenFlower(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(pink);

  for (let i = 0; i < 5; i++) {
    let a = TWO_PI * i / 5;
    circle(cos(a) * 10, sin(a) * 10, 15);
  }

  fill(yellow);
  circle(0, 0, 13);
  pop();
}

function drawStarShape(x, y, inner, outer, points) {
  beginShape();

  for (let i = 0; i < points * 2; i++) {
    let a = -HALF_PI + i * PI / points;
    let r = i % 2 === 0 ? outer : inner;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }

  endShape(CLOSE);
}


function startLevel(level) {
  selectedLevel = level;

  vegetables = [];
  bombs = [];
  particles = [];
  floatingTexts = [];
  swipeTrail = [];

  score = 0;
  veggieCount = 0;
  stars = 3;

  dragging = false;
  swipeHits = 0;
  comboAwarded = 0;

  lastSpawn = millis() - 1000;
  bombFlashTime = -1000;
  screenShake = 0;

  levelComplete = false;
  gameOver = false;

  resetCamera();

  if (level === 1) {
    goal = 25;
    spawnDelay = 1250;
  } else if (level === 2) {
    goal = 35;
    spawnDelay = 1500;
  } else if (level === 3) {
    goal = 45;
    spawnDelay = 1050;
  } else if (level === 4) {
    goal = 60;
    spawnDelay = 1000;
  } else if (level === 5) {
    goal = 80;
    spawnDelay = 900;
  } else if (level === 6) {
    goal = 100;
    spawnDelay = 800;
  }

  screen = "game";
}

// GAMEPLAY WITH DIRT BACKGROUND
function drawGame() {
  push();
  imageMode(CORNER);
  image(dirtBackground, 0, 0, width, height);
  pop();

  updateCamera();

  // Pause spawning during giant zoom
  if (!levelComplete && !gameOver && !zoomTarget) {
    if (millis() - lastSpawn > spawnDelay) {
      let spawnCount = 1;
      if (selectedLevel === 3) {
        spawnCount = random(1) < 0.35 ? 3 : 2;
      } else if (selectedLevel === 4) {
        spawnCount = random(1) < 0.5 ? 3 : 2;
      } else if (selectedLevel === 5) {
        spawnCount = floor(random(3, 5));
      } else if (selectedLevel === 6) {
        spawnCount = floor(random(3, 6));
      }

      for (let i = 0; i < spawnCount; i++) {
        spawnVegetable();
      }

      let bombChance = selectedLevel === 6 ? 0.55 :
                       selectedLevel === 5 ? 0.48 :
                       selectedLevel === 4 ? 0.43 :
                       selectedLevel === 3 ? 0.40 : 0.25;
      if (random(1) < bombChance) {
        spawnBomb();
      }

      lastSpawn = millis();
    }
  } else if (zoomTarget) {
    lastSpawn = millis();
  }

  push();

  // Camera zoom
  translate(width / 2, height / 2);
  scale(cameraZoom);
  translate(-cameraX, -cameraY);

  if (!levelComplete && !gameOver) {
    updateVegetables();
    updateBombs();
  }

  updateParticles();
  drawSwipeTrail();
  updateFloatingTexts();

  pop();

  // Bomb damage flash
  if (millis() - bombFlashTime < 220) {
    push();
    rectMode(CORNER);
    noStroke();
    fill(255, 70, 70, 90);
    rect(0, barHeight, width, height - barHeight);
    pop();
  }

  drawGameHUD();

  checkPointAchievement();
  if (stars <= 0) {
    gameOver = true;
  } else if (veggieCount >= goal) {
    completeLevel();
  }

  if (levelComplete) drawLevelComplete();
  if (gameOver) drawGameOver();
}

function drawGameHUD() {
  push();

  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(white);

  textSize(27);
  text("VEGGIES: " + veggieCount + " / " + goal,
       width / 2, barHeight + 42);

  textSize(20);
  text("POINTS: " + score, width / 2, barHeight + 73);

  let progressW = min(350, width - 40);

  noStroke();
  rectMode(CENTER);
  fill(white);
  rect(width / 2, barHeight + 106, progressW, 18, 9);

  rectMode(CORNER);
  fill("#49B96C");
  rect(
    width / 2 - progressW / 2,
    barHeight + 97,
    progressW * constrain(veggieCount / goal, 0, 1),
    18, 9
  );

  let starDisplay = "";
  for (let i = 0; i < maxStars; i++) {
    starDisplay += i < stars ? "⭐" : "☆";
  }

  textAlign(RIGHT, CENTER);
  textSize(32);
  fill(white);
  text(starDisplay, width - 25, barHeight + 42);

  pop();
}

// SPAWN VEGETABLES
function spawnVegetable() {
  let currentGiantChance = 0;
  if (selectedLevel === 2 || selectedLevel === 3) {
    currentGiantChance = 0.12;
  } else if (selectedLevel === 4) {
    currentGiantChance = 0.13;
  } else if (selectedLevel === 5) {
    currentGiantChance = 0.14;
  } else if (selectedLevel === 6) {
    currentGiantChance = 0.15;
  }
  let giant = selectedLevel >= 2 && random(1) < currentGiantChance;
  let bounceChance = selectedLevel === 6 ? 0.30 :
                     selectedLevel === 5 ? 0.28 : 0.25;
  let bouncing = !giant && selectedLevel >= 3 && random(1) < bounceChance;

  let x = random(90, max(91, width - 90));
  let y = height + (giant ? 130 : 70);

  let giantLaunchSpeed = sqrt(
    2 * 0.18 * max(150, height * 0.65)
  );

  vegetables.push({
    x: x,
    y: y,

    vx: giant ? random(-0.8, 0.8) : random(-1.5, 1.5),
    vy: giant ? -giantLaunchSpeed : -random(12, 16),
    gravity: giant ? 0.18 : 0.22,

    type: bouncing ? "broccoli" : random(veggieTypes),
    giant: giant,
    bouncing: bouncing,

    hp: giant ? giantHP : (bouncing ? 3 : 1),
    maxHP: giant ? giantHP : (bouncing ? 3 : 1),

    sliced: false,
    cursorInside: false,
    hitCooldown: 0,
    firstHit: false,

    size: giant ? 2.8 : (bouncing ? 1.75 : 1.2)
  });
}

function updateVegetables() {
  for (let i = vegetables.length - 1; i >= 0; i--) {
    let v = vegetables[i];

    v.x += v.vx;
    v.y += v.vy;
    v.vy += v.gravity;

    if (v.bouncing && v.y < barHeight + 155) {
      v.y = barHeight + 155;
      v.vy = max(v.vy, 1);
    }

    if (v.giant && v.y < barHeight + 160) {
      v.y = barHeight + 160;
      v.vy = max(0, v.vy);
    }

    if (v.hitCooldown > 0) {
      v.hitCooldown--;
    }

    if (!v.sliced) {
      drawGameVegetable(v);
    }

    if (v.sliced || (v.y > height + 150 && v.vy > 0)) {
      if (zoomTarget === v) {
        zoomTarget = null;
        targetZoom = 1;
      }

      vegetables.splice(i, 1);
    }
  }
}

function drawGameVegetable(v) {
  push();
  translate(v.x, v.y);
  scale(v.size);
  drawLevelVegetable(v.type);
  pop();

  if (v.giant || v.bouncing) {
    push();
    rectMode(CENTER);
    noStroke();

    let barW = v.giant ? 160 : 110;
    let barY = v.y - (v.giant ? 140 : 100);

    fill(white);
    rect(v.x, barY, barW, 22, 10);

    rectMode(CORNER);
    fill(v.hitCooldown > 0 ? yellow : "#49B96C");

    rect(
      v.x - barW / 2,
      barY - 11,
      barW * constrain(v.hp / v.maxHP, 0, 1),
      22, 10
    );

    fill(navy);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(18);
    text(v.hp + " / " + v.maxHP, v.x, barY);

    pop();
  }
}

// BOMBS
function spawnBomb() {
  bombs.push({
    x: random(90, max(91, width - 90)),
    y: height + 70,
    vx: random(-1.5, 1.5),
    vy: -random(12, 16),
    gravity: 0.22,
    hit: false
  });
}

function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    let b = bombs[i];

    b.x += b.vx;
    b.y += b.vy;
    b.vy += b.gravity;

    if (!b.hit) drawBomb(b.x, b.y);

    if (b.hit || (b.y > height + 100 && b.vy > 0)) {
      bombs.splice(i, 1);
    }
  }
}

function drawBomb(x, y) {
  push();
  translate(x, y);
  noStroke();

  fill("#333333");
  circle(0, 0, 80);

  fill("#777777");
  ellipse(-18, -18, 18, 12);

  stroke("#666666");
  strokeWeight(6);
  line(14, -35, 28, -55);

  noStroke();
  fill(yellow);
  drawStarShape(30, -58, 7, 15, 5);

  fill(white);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text("!", 0, 2);

  pop();
}

// SPARKS
function createSparks(x, y, count, colors, power = 4) {
  for (let i = 0; i < count; i++) {
    let a = random(TWO_PI);
    let speed = random(1, power);

    particles.push({
      x: x,
      y: y,
      vx: cos(a) * speed,
      vy: sin(a) * speed,
      life: random(15, 35),
      maxLife: 35,
      size: random(3, 9),
      color: random(colors)
    });
  }
}

function updateParticles() {
  push();
  noStroke();

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life--;

    let c = color(p.color);
    c.setAlpha(map(p.life, 0, p.maxLife, 0, 255));

    fill(c);
    circle(p.x, p.y, p.size);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  pop();
}

// FLOATING TEXT
function addFloatingText(textValue, x, y, textColor, size = 30) {
  floatingTexts.push({
    text: textValue,
    x: x,
    y: y,
    color: textColor,
    size: size,
    life: 65
  });
}

function updateFloatingTexts() {
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let f = floatingTexts[i];

    f.y -= 1.1;
    f.life--;

    let c = color(f.color);
    c.setAlpha(map(f.life, 0, 65, 0, 255));

    fill(c);
    noStroke();
    textSize(f.size);
    text(f.text, f.x, f.y);

    if (f.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  pop();
}

// SWIPE TRAIL
function drawSwipeTrail() {
  for (let point of swipeTrail) {
    point.life--;
  }

  swipeTrail = swipeTrail.filter(p => p.life > 0);

  if (swipeTrail.length < 2) return;

  push();
  noFill();
  stroke(blue);
  strokeWeight(10);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  beginShape();
  for (let p of swipeTrail) {
    vertex(p.x, p.y);
  }
  endShape();

  stroke(white);
  strokeWeight(3);

  beginShape();
  for (let p of swipeTrail) {
    vertex(p.x, p.y);
  }
  endShape();

  pop();
}

// VEGETABLE HITS
function hitVegetable(v) {
  if (v.sliced) return;

  let critical = random(1) < critChance;
  let damage = critical ? 2 : 1;

  v.hp -= damage;
  v.hitCooldown = v.bouncing ? 12 : 6;

  // Every surviving hit sends the bouncing broccoli upward again.
  if (v.bouncing && v.hp > 0) {
    v.vy = -11;
    v.vx = random(-2.5, 2.5);
    v.cursorInside = true;
    addFloatingText("BOING!", v.x, v.y - 85, "#43BE64", 28);
  }

  // Giant zoom on first hit
  if (v.giant && !v.firstHit) {
    v.firstHit = true;
    v.vy *= 0.35;
    v.gravity = 0.055;

    zoomTarget = v;
    targetZoom = zoomAmount;

    addFloatingText(
      "GIANT HIT!",
      v.x, v.y - 100,
      "#FFD43B", 30
    );
  }

  if (critical) {
    addFloatingText(
      "CRITICAL!",
      v.x, v.y - 80,
      "#FFD43B", 32
    );

    createSparks(
      v.x, v.y, 25,
      ["#FFD43B", "#FFFFFF", "#FF943D"],
      8
    );

    screenShake = max(screenShake, 5);
  } else {
    createSparks(
      v.x, v.y, 12,
      ["#2BD9EE", "#FFFFFF", "#43BE64"],
      5
    );
  }

  if (v.hp <= 0) {
  v.sliced = true;

  // Giant vegetables count as 3
  veggieCount += (v.giant || v.bouncing) ? 3 : 1;

  swipeHits++;

    let points = (v.giant || v.bouncing) ? 3 : 1;
    if (critical) points *= 2;

    score += points;

    addFloatingText(
      "+" + points,
      v.x, v.y + 30,
      critical ? "#FFD43B" : "#17375E",
      27
    );

    createSparks(
      v.x, v.y,
      v.giant ? 35 : 18,
      ["#F26BAA", "#FFD43B", "#2BD9EE", "#43BE64"],
      v.giant ? 10 : 6
    );

    checkCombo();
  } else {
    addFloatingText(
      "-" + damage + " HP",
      v.x, v.y + 40,
      critical ? "#FFD43B" : "#17375E",
      23
    );
  }

  if (veggieCount >= goal) completeLevel();
}

// COMBOS
function checkCombo() {
  let bonus = 0;
  let label = "";
  let effectColor = "#FFD43B";

  if (swipeHits >= 5) {
    unlockAchievement("mega");
    bonus = 8;
    label = "MEGA SWIPE!";
    effectColor = "#9564C9";
  } else if (swipeHits === 4) {
    bonus = 5;
    label = "SUPER SWIPE!";
  } else if (swipeHits === 3) {
    bonus = 2;
    label = "TRIPLE SLICE!";
    effectColor = "#F26BAA";
  } else if (swipeHits === 2) {
    bonus = 1;
    label = "DOUBLE SLICE!";
    effectColor = "#43BE64";
  }

  if (bonus > comboAwarded) {
    score += bonus - comboAwarded;
    comboAwarded = bonus;
  }

  if (label) {
    addFloatingText(
      label,
      width / 2, height / 2 - 90,
      effectColor,
      swipeHits >= 4 ? 42 : 32
    );
  }

  if (swipeHits === 4 || swipeHits === 5) {
    let p = screenToWorld(mouseX, mouseY);

    createSparks(
      p.x, p.y, 45,
      ["#FFD43B", "#F26BAA", "#2BD9EE", "#FFFFFF"],
      11
    );

    screenShake = 9;
  }
}

// MOUSE SWIPING
function mouseDragged() {
  if (
    screen !== "game" ||
    levelComplete ||
    gameOver ||
    showTutorial
  ) return false;

  if (!dragging) {
    dragging = true;
    swipeHits = 0;
    comboAwarded = 0;
  }

  let current = screenToWorld(mouseX, mouseY);
  let previous = screenToWorld(pmouseX, pmouseY);

  swipeTrail.push({
    x: current.x,
    y: current.y,
    life: 12
  });

  createSparks(
    current.x, current.y, 3,
    ["#2BD9EE", "#FFFFFF", "#FFD43B"],
    2.5
  );

  // Bomb collision
  for (let bomb of bombs) {
    if (bomb.hit) continue;

    let d = pointToSegmentDistance(
      bomb.x, bomb.y,
      previous.x, previous.y,
      current.x, current.y
    );

    if (d < 42) {
      bomb.hit = true;
      stars = max(0, stars - 1);
      bombFlashTime = millis();

      createSparks(
        bomb.x, bomb.y, 35,
        ["#FF4D5A", "#FFD43B", "#FF943D"],
        9
      );

      addFloatingText(
        "-1 STAR!",
        bomb.x, bomb.y - 70,
        "#FF4D5A", 32
      );

      screenShake = 12;

      if (stars <= 0) {
        unlockAchievement("bombDeath");
        gameOver = true;
        return false;
      }
    }
  }

  // Vegetable collision
  for (let v of vegetables) {
    if (v.sliced) continue;

    let hitRadius = v.giant ? 100 : (v.bouncing ? 72 : 48);

    let d = pointToSegmentDistance(
      v.x, v.y,
      previous.x, previous.y,
      current.x, current.y
    );

    let currentlyInside =
      dist(current.x, current.y, v.x, v.y) < hitRadius;

    if (v.giant || v.bouncing) {
      if (
        d < hitRadius &&
        !v.cursorInside &&
        v.hitCooldown <= 0
      ) {
        hitVegetable(v);
        v.cursorInside = true;
      }

      if (!currentlyInside) {
        v.cursorInside = false;
      }
    } else if (d < hitRadius) {
      hitVegetable(v);
    }

    if (levelComplete) break;
  }

  return false;
}

function mouseReleased() {
  dragging = false;
  swipeHits = 0;
  comboAwarded = 0;
  swipeTrail = [];

  for (let v of vegetables) {
    v.cursorInside = false;
  }
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let len = dx * dx + dy * dy;

  if (len === 0) return dist(px, py, x1, y1);

  let t = constrain(
    ((px - x1) * dx + (py - y1) * dy) / len,
    0, 1
  );

  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

// LEVEL COMPLETE
function completeLevel() {
  if (levelComplete || gameOver) return;

  levelComplete = true;

  levelStars[selectedLevel] = max(
    levelStars[selectedLevel] || 0,
    stars
  );

  unlockedLevel = max(
    unlockedLevel,
    min(6, selectedLevel + 1)
  );

  saveLevelProgress();
  syncStarAchievements();
  checkPointAchievement();

  createSparks(
    width / 2, height / 2, 80,
    ["#FFD43B", "#F26BAA", "#2BD9EE", "#43BE64"],
    12
  );
}

// RESULT PANELS
function drawResultPanel(title, subtitle, showStars) {
  push();
  rectMode(CENTER);
  fill(white);
  stroke(navy);
  strokeWeight(4);

  rect(
    width / 2, height / 2,
    min(550, width - 30), 340, 25
  );

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  textSize(min(42, width / 13));
  text(title, width / 2, height / 2 - 100);

  textSize(26);
  text(subtitle, width / 2, height / 2 - 35);

  if (showStars) {
    for (let i = 0; i < 3; i++) {
      fill(i < stars ? "#FFD43B" : "#B9BEC6");
      stroke(i < stars ? "#D99A16" : "#9299A3");
      strokeWeight(2);

      drawStarShape(
        width / 2 + (i - 1) * 68,
        height / 2 + 35,
        17, 32, 5
      );
    }
  } else {
    textSize(25);
    text(
      "Veggies: " + veggieCount + "   Points: " + score,
      width / 2,
      height / 2 + 35
    );
  }

  pop();
}

function drawLevelComplete() {
  drawResultPanel("LEVEL COMPLETE!", "GREAT JOB!", true);

  backButton.x = width / 2;
  backButton.y = height / 2 + 115;

  drawButton(backButton);
}

function drawGameOver() {
  drawResultPanel("GAME OVER!", "You lost all 3 stars!", false);

  retryButton.x = width / 2 - 105;
  retryButton.y = height / 2 + 115;

  backButton.x = width / 2 + 105;
  backButton.y = height / 2 + 115;

  drawButton(retryButton);
  drawButton(backButton);
}

// ACHIEVEMENTS
function drawAchievements() {
  background(cream);
  const completed = achievementDefinitions.filter(a => achievements[a.id]).length;
  push();
  fill(navy);
  textAlign(CENTER,CENTER);
  textStyle(BOLD);
  textSize(min(34, width/13));
  text("ACHIEVEMENTS", width/2, barHeight+45);
  textSize(20);
  text(completed + " / " + achievementDefinitions.length + " unlocked", width/2, barHeight+83);
  pop();

  const top = barHeight + 120;
  const rowH = 91;
  const bottom = height - 20;
  const visibleH = max(0, bottom - top);
  const maxScroll = max(0, achievementDefinitions.length * rowH - visibleH);
  achievementScroll = constrain(achievementScroll, 0, maxScroll);
  push();
  // Clip the scrolling list to the content area using p5's drawing context.
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, top, width, visibleH);
  drawingContext.clip();
  for (let i = 0; i < achievementDefinitions.length; i++) {
    const a = achievementDefinitions[i];
    const y = top + i*rowH - achievementScroll + 38;
    if (y < top-50 || y > bottom+50) continue;
    const unlocked = !!achievements[a.id];
    push();
    rectMode(CENTER);
    stroke(unlocked ? "#43BE64" : "#BCC3CA");
    strokeWeight(3);
    fill(unlocked ? "#E6F8DF" : "#E7E9E9");
    const cardW = min(width-24, 620);
    rect(width/2, y, cardW, 76, 15);
    noStroke();
    fill(navy);
    textAlign(LEFT,CENTER);
    textSize(27);
    text(unlocked ? a.icon : "🔒", width/2-cardW/2+15, y);
    textStyle(BOLD);
    textSize(min(20, width/22));
    text(a.title, width/2-cardW/2+65, y-13);
    textStyle(NORMAL);
    textSize(min(15, width/29));
    text(a.detail, width/2-cardW/2+65, y+14);
    textAlign(RIGHT,CENTER);
    textSize(14);
    text(unlocked ? "DONE" : "LOCKED", width/2+cardW/2-13, y-15);
    pop();
  }
  drawingContext.restore();
  pop();
  if (maxScroll > 0) {
    push();
    textAlign(CENTER,CENTER);
    fill(navy);
    textSize(14);
    text("Scroll to see all achievements", width/2, height-12);
    pop();
  }
}

function mouseWheel(event) {
  if (screen === "achievements") {
    achievementScroll += event.delta;
    return false;
  }
}

// TUTORIAL
function drawTutorialPopup() {
  push();
  rectMode(CORNER);
  noStroke();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  pop();

  let popupW = min(850, width - 30);
  let popupH = min(620, height - 90);

  let cx = width / 2;
  let cy = height / 2;
  let s = min(popupW / 850, popupH / 620);

  push();
  translate(cx, cy);
  scale(s);

  rectMode(CENTER);
  stroke(navy);
  strokeWeight(5);
  fill(white);
  rect(0, 0, 850, 620, 30);

  noStroke();
  fill(sky);
  rect(0, -265, 840, 85, 25);

  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("HOW TO PLAY!", 0, -265);

  drawTutorialDemo();
  pop();

  closeButton.x = cx;
  closeButton.y = cy + 267 * s;
  closeButton.w = 155 * s;
  closeButton.h = 48 * s;
  closeButton.textSizeValue = 23 * s;

  drawButton(closeButton);
}

function drawTutorialDemo() {
  let t = ((millis() - tutorialStartTime) / 1000) % 6;

  rectMode(CENTER);
  stroke(navy);
  strokeWeight(3);
  fill(cream);
  rect(0, -20, 760, 365, 22);

  noStroke();
  fill(navy);
  textAlign(RIGHT, CENTER);
  textSize(23);
  textStyle(BOLD);
  text("⭐ ⭐ ⭐", 345, -172);

  stroke("#C8DDBB");
  strokeWeight(3);
  line(-350, 120, 350, 120);
  noStroke();

  if (t < 3) {
    drawDemoVegetable(t);

    fill(navy);
    textAlign(CENTER, CENTER);
    textSize(30);
    text("SLICE THE VEGGIES!", 0, 185);
  } else {
    drawDemoBomb(t - 3);

    fill(navy);
    textAlign(CENTER, CENTER);
    textSize(30);
    text("AVOID THE BOMBS!", 0, 185);
  }

  for (let i = 0; i < 2; i++) {
    fill(floor(t / 3) === i ? pink : "#D5D5D5");
    circle(-15 + i * 30, 225, 13);
  }
}

function drawDemoVegetable(t) {
  let veggieY = 55 - sin((t / 3) * PI) * 130;

  if (t < 1.5) {
    drawDemoCarrot(0, veggieY);
  } else {
    push();
    translate(-35 - (t - 1.5) * 20, veggieY);
    rotate(-0.3);
    drawDemoCarrotHalf();
    pop();

    push();
    translate(35 + (t - 1.5) * 20, veggieY);
    rotate(0.3);
    drawDemoCarrotHalf();
    pop();
  }

  if (t > 0.7 && t < 1.7) {
    let swipe = constrain((t - 0.7) / 0.8, 0, 1);

    stroke(blue);
    strokeWeight(12);
    strokeCap(ROUND);

    line(-140, -30, lerp(-140, 140, swipe), -30);
    noStroke();
  }
}

function drawDemoCarrot(x, y) {
  push();
  translate(x, y);
  noStroke();

  fill("#43BE64");
  ellipse(-12, -45, 20, 42);
  ellipse(0, -52, 20, 45);
  ellipse(12, -45, 20, 42);

  fill("#FF943D");
  triangle(-35, -30, 35, -30, 0, 60);

  fill(navy);
  circle(-12, -10, 7);
  circle(12, -10, 7);

  noFill();
  stroke(navy);
  strokeWeight(3);
  arc(0, 0, 20, 15, 0, PI);

  pop();
}

function drawDemoCarrotHalf() {
  noStroke();
  fill("#FF943D");
  triangle(-22, -25, 22, -25, 0, 35);
}

function drawDemoBomb(t) {
  let bombY = 55 - sin((t / 3) * PI) * 120;

  noStroke();
  fill("#333333");
  circle(0, bombY, 90);

  fill("#777777");
  ellipse(-20, bombY - 20, 20, 12);

  stroke("#666666");
  strokeWeight(7);
  line(15, bombY - 40, 32, bombY - 65);

  noStroke();
  fill(yellow);
  drawStarShape(34, bombY - 68, 8, 17, 5);

  fill("#FF4D5A");
  textAlign(CENTER, CENTER);
  textSize(55);
  textStyle(BOLD);
  text("✕", 110, bombY);

  if (t > 0.6 && t < 2) {
    let swipe = constrain((t - 0.6) / 1.2, 0, 1);

    stroke(blue);
    strokeWeight(10);
    line(-160, 95, lerp(-160, 160, swipe), 95);
    noStroke();
  }
}

// BUTTONS
function makeButton(x, y, w, h, label, buttonColor, textSizeValue) {
  return {x, y, w, h, label, buttonColor, textSizeValue};
}

function drawButton(btn) {
  let hovering = isMouseOver(btn);
  let scaleAmount = hovering ? 1.06 : 1;

  push();
  translate(btn.x, btn.y);
  scale(scaleAmount);

  rectMode(CENTER);
  stroke(navy);
  strokeWeight(3);
  fill(btn.buttonColor);
  rect(0, 0, btn.w, btn.h, 20);

  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(btn.textSizeValue);
  text(btn.label, 0, 0);

  pop();
}

function isMouseOver(btn) {
  return mouseX > btn.x - btn.w / 2 &&
         mouseX < btn.x + btn.w / 2 &&
         mouseY > btn.y - btn.h / 2 &&
         mouseY < btn.y + btn.h / 2;
}

// MOUSE CONTROLS
function mousePressed() {
  if (showTutorial) {
    if (isMouseOver(closeButton)) {
      showTutorial = false;
    }
    return false;
  }

  if (screen === "game" && gameOver) {
    if (isMouseOver(retryButton)) {
      startLevel(selectedLevel);
      return false;
    }

    if (isMouseOver(backButton)) {
      screen = "levels";
      resetCamera();
      return false;
    }
  }

  if (
    screen === "game" &&
    levelComplete &&
    isMouseOver(backButton)
  ) {
    screen = "levels";
    resetCamera();
    return false;
  }

  if (isMouseOver(homeButton)) {
    screen = "menu";
    resetCamera();
    return false;
  }

  if (screen === "game") {
    if (!levelComplete && !gameOver) {
      dragging = true;
      swipeHits = 0;
      comboAwarded = 0;
      swipeTrail = [];
    }
    return false;
  }

  if (screen === "menu") {
    if (isMouseOver(playButton)) {
      screen = "levels";
    } else if (isMouseOver(tutorialButton)) {
      showTutorial = true;
      tutorialStartTime = millis();
    } else if (isMouseOver(achievementsButton)) {
      screen = "achievements";
    }
  } else if (screen === "levels") {
    let s = getMapScale();
    let mx = (mouseX - width / 2) / s;
    let my = (mouseY - (barHeight + (height - barHeight) / 2)) / s;

    for (let lvl of levelButtons) {
      if (dist(mx, my, lvl.x, lvl.y) < 55) {
        if (lvl.level <= unlockedLevel && lvl.level <= 6) {
          startLevel(lvl.level);
        }
        return false;
      }
    }
  }

  return false;
}

// WINDOW RESIZE
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetCamera();
}

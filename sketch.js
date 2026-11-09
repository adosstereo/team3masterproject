
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
let claimedAchievements = {};
const achievementClaimsKey = "vegetableShinobiAchievementClaims";
let achievementToast = null;
let achievementScroll = 0;
let flyingAchievementStars = [];
const starFlightDuration = 620;
const starBadgePulseDuration = 240;
const achievementDefinitions = [
  {id:"mega", title:"Mega Shinobi", detail:"Get a Mega Swipe (5+ veggies)", icon:"⚡"},
  ...Array.from({length:6}, (_,i) => ({id:"level"+(i+1), title:"Level "+(i+1)+" Master", detail:"Earn 3 stars on Level "+(i+1), icon:"⭐"})),
  {id:"allStars", title:"Perfect Garden", detail:"Earn 3 stars on all 6 levels", icon:"🏆"},
  {id:"bombDeath", title:"Bomb Trouble", detail:"Lose all 3 stars to bombs", icon:"💣"},
  {id:"points150", title:"Point Master", detail:"Score 150 points in one level", icon:"🎯"}
];

let playButton, tutorialButton, achievementsButton, settingsButton;
let menuBackButton, menuHomeButton;
let closeButton, backButton, retryButton;

let vegetables = [];
let choppedVegetables = [];
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

// SOUND
const gameSounds = {};
const effectBoosts = {click: 3.5, slash: 2.6, chop: 2.4};
const boostedEffects = new Set();
let effectAudioContext;
let effectOutput;
const audioSettingsKey = "vegetableShinobiAudioSettings";
const audioVolume = {music: 30, effects: 100};
const audioControls = [
  {key: "music", label: "Music"},
  {key: "effects", label: "Sound Effects"}
];
let activeVolumeSlider = null;
let menuMusic;
let levelMusic = null;
let resultSound = null;
let playedSwipeSound = false;

function loadAudioSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(audioSettingsKey));
    for (const {key} of audioControls) {
      if (key === "effects" && saved?.effects === 30 && !saved.effectsDefaultUpdated) continue;
      if (Number.isFinite(saved?.[key])) {
        audioVolume[key] = constrain(Math.round(saved[key]), 0, 100);
      }
    }
  } catch (error) {
    console.warn("Could not load audio settings:", error);
  }
}

function loadGameSounds() {
  menuMusic = new Audio("assets/menu.mp3");
  menuMusic.loop = true;
  menuMusic.volume = audioVolume.music / 100;
  const files = {
    click: "click.mp3",
    slash: "sowrd slash.mp3",
    chop: "vegetable chop.mp3",
    explosion: "explosion.mp3",
    fail: "fail.mp3",
    victory: "victory.mp3"
  };
  for (const [name, file] of Object.entries(files)) {
    const sound = new Audio("assets/" + file);
    sound.volume = audioVolume.effects / 100;
    sound.preload = "auto";
    gameSounds[name] = sound;
  }
}

function boostQuietEffect(name, sound) {
  const boost = effectBoosts[name];
  if (!boost || !window.AudioContext) return;

  try {
    if (!effectAudioContext) {
      effectAudioContext = new AudioContext();
      effectOutput = effectAudioContext.createGain();
      effectOutput.gain.value = audioVolume.effects / 100;
      effectOutput.connect(effectAudioContext.destination);
    }

    if (!boostedEffects.has(name)) {
      // Raise quiet effects and round off peaks before applying the volume slider.
      const shaper = effectAudioContext.createWaveShaper();
      shaper.curve = Float32Array.from({length: 2049}, (_, i) =>
        0.95 * Math.tanh(boost * (i / 1024 - 1))
      );
      shaper.connect(effectOutput);
      effectAudioContext.createMediaElementSource(sound).connect(shaper);
      boostedEffects.add(name);
      sound.volume = 1;
    }
    if (effectAudioContext.state !== "running") {
      effectAudioContext.resume().catch(() => {});
    }
  } catch (error) {
    console.warn("Could not boost sound effect:", error);
  }
}

function playGameSound(name) {
  const sound = gameSounds[name];
  boostQuietEffect(name, sound);
  sound.currentTime = 0;
  sound.play().catch(() => {});
  return sound;
}

function stopLevelAudio() {
  if (levelMusic) {
    levelMusic.pause();
    levelMusic = null;
  }
  if (resultSound) {
    resultSound.pause();
    resultSound = null;
  }
}

function playLevelResult(name) {
  stopLevelAudio();
  resultSound = playGameSound(name);
}

function failLevel() {
  if (gameOver || levelComplete) return;
  gameOver = true;
  playLevelResult("fail");
}

// LOAD ASSETS
function preload() {
  dirtBackground = loadImage("assets/dirt.jpg");
}

// SETUP
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  loadAudioSettings();
  loadGameSounds();

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
  settingsButton = makeButton(0, 0, 280, 75, "Settings", white, 27);

  menuHomeButton = makeButton(53, 35, 84, 42, "Home", white, 17);
  menuBackButton = makeButton(53, 35, 84, 42, "← Back", white, 17);
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
  loadAchievementClaims();
  syncStarAchievements();
}

// MAIN DRAW
function draw() {
  if (screen !== "menu") menuSliceAt = null;
  background(cream);

  if (screen === "menu") drawMenu();
  else if (screen === "levels") drawLevelSelect();
  else if (screen === "game") drawGame();
  else if (screen === "achievements") drawAchievements();
  else if (screen === "settings") drawSettings();

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
function loadAchievementClaims() {
  try {
    claimedAchievements = JSON.parse(localStorage.getItem(achievementClaimsKey)) || {};
  } catch (error) {
    console.warn("Could not load achievement claims:", error);
  }
}

function claimAchievement(id) {
  if (!achievements[id]) return false;
  loadAchievementClaims();
  if (claimedAchievements[id]) return false;

  const updated = {...claimedAchievements, [id]: true};
  try {
    localStorage.setItem(achievementClaimsKey, JSON.stringify(updated));
    claimedAchievements = updated;
    return true;
  } catch (error) {
    console.warn("Could not save achievement claim:", error);
    return false;
  }
}

function getClaimedAchievementStars() {
  return achievementDefinitions.filter(a => claimedAchievements[a.id]).length;
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
  const titleSize = min(30, max(16, width / 22));
  textSize(titleSize);
  textSize(titleSize * min(1, max(30, width - 208) / textWidth(gameTitle)));
  text(gameTitle, width / 2, barHeight / 2);
  pop();

  if (screen === "menu") drawButton(menuHomeButton, false);
  else drawButton(menuBackButton);

  if (screen === "menu" || screen === "achievements") {
    drawAchievementStarCounter();
  }
}

function drawAchievementStarCounter() {
  const now = millis();
  const x = width - 53;
  const y = barHeight / 2;
  let pending = 0;
  let pulse = 0;

  flyingAchievementStars = flyingAchievementStars.filter(
    star => now - star.started < starFlightDuration + starBadgePulseDuration
  );
  for (const star of flyingAchievementStars) {
    const age = now - star.started;
    if (age < starFlightDuration) {
      pending++;
    } else {
      const t = (age - starFlightDuration) / starBadgePulseDuration;
      pulse = max(pulse, sin(PI * t));
    }
  }

  push();
  translate(x, y);
  scale(1 + 0.13 * pulse);
  rectMode(CENTER);
  stroke(navy);
  strokeWeight(3);
  fill(white);
  rect(0, 0, 84, 42, 20);
  fill(yellow);
  drawStarShape(-21, 0, 5, 11, 5);
  noStroke();
  fill(navy);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(22);
  text(max(0, getClaimedAchievementStars() - pending), 12, 0);
  pop();

  for (const star of flyingAchievementStars) {
    const t = (now - star.started) / starFlightDuration;
    if (t >= 1) continue;
    const starX = lerp(star.x, x - 21, t);
    const starY = lerp(star.y, y, t) - sin(PI * t) * 38;
    push();
    translate(starX, starY);
    rotate(TWO_PI * t);
    stroke(navy);
    strokeWeight(2);
    fill(yellow);
    const radius = lerp(17, 10, t);
    drawStarShape(0, 0, radius * 0.48, radius, 5);
    pop();
  }
}

// MAIN MENU
let menuSliceAt = null;
let menuVegetableTargets = [];
const menuTapTimes = {};

function drawMenu() {
  drawMenuGarden();

  const contentH = max(0, height - barHeight);
  const wide = width >= 650;
  const buttonX = wide ? width * 0.68 : width / 2;
  const buttonAreaH = wide ? contentH : contentH * 0.56;
  const buttons = [playButton, tutorialButton, achievementsButton, settingsButton];
  const step = min(100, buttonAreaH / buttons.length);
  const buttonY = height - buttonAreaH / 2;

  const gardenWidth = wide ? buttonX - 152 : width;
  const gardenHeight = wide ? contentH : contentH - buttonAreaH;
  drawMenuVegetables(gardenWidth, gardenHeight);

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.x = buttonX;
    button.y = buttonY + (i - (buttons.length - 1) / 2) * step;
    button.w = min(280, width - 28);
    button.h = step * (i === 0 ? 0.88 : 0.74);
    button.textSizeValue = min(i === 0 ? 36 : 27, button.h * 0.48, button.w / 7);
    drawButton(button);
  }
}

function drawMenuGarden() {
  background("#BFF1FF");
  const contentH = height - barHeight;
  push();
  noStroke();
  fill("#FFE584");
  circle(width * 0.83, barHeight + contentH * 0.19, min(width * 0.19, 126));

  fill("#F8FDFF");
  for (let i = 0; i < 3; i++) {
    const x = width * (0.14 + i * 0.29);
    const y = barHeight + contentH * (0.16 + (i % 2) * 0.13);
    const size = min(width * 0.19, 125);
    ellipse(x, y, size, size * 0.32);
    circle(x - size * 0.15, y - size * 0.15, size * 0.39);
    circle(x + size * 0.12, y - size * 0.11, size * 0.34);
  }

  fill("#B5E394");
  ellipse(width * 0.22, height, width * 1.45, contentH * 0.88);
  fill("#8DD480");
  ellipse(width * 0.82, height + contentH * 0.12, width * 1.6, contentH * 0.92);

  for (let i = 0; i < 9; i++) {
    push();
    translate(width * (i + 0.5) / 9, height - contentH * (0.05 + (i % 3) * 0.055));
    scale(min(0.78, width / 460, contentH / 320));
    drawGardenFlower(0, 0);
    pop();
  }
  pop();
}

function drawMenuVegetables(gardenWidth, gardenHeight) {
  menuVegetableTargets = [];
  if (gardenHeight <= 0) return;
  const size = min(2.45, gardenHeight / 200);
  const now = millis();
  const fallDuration = 820;
  const returnDuration = 540;
  if (menuSliceAt === null || now >= menuSliceAt + fallDuration + returnDuration) {
    menuSliceAt = now + random(4300, 5700);
  }

  const age = now - menuSliceAt;
  const vegetables = [
    {type: "carrot", x: gardenWidth * 0.23, ground: 0.92, offset: 430},
    {type: "broccoli", x: gardenWidth * 0.77, ground: 0.92, offset: 970},
    {type: "tomato", x: gardenWidth * 0.5, ground: 0.76, offset: 0}
  ];

  for (const vegetable of vegetables) {
    const time = age >= 0 && age < fallDuration ? menuSliceAt : now;
    const phase = ((time + vegetable.offset) % 1800) / 1800;
    const hop = sin(PI * phase);
    const squash = max(0, 1 - hop * 7) * 0.13;
    const groundY = barHeight + gardenHeight * vegetable.ground;
    const idleY = groundY - size * (34 + hop * 46);
    const tilt = sin(TWO_PI * phase) * 0.11;
    const offscreenY = height + 95 * size;
    const {type, x} = vegetable;

    if (age < 0 || age >= fallDuration) {
      const rise = age < 0 ? 1 : (age - fallDuration) / returnDuration;
      const reaction = constrain((now - (menuTapTimes[type] ?? -1000)) / 500, 0, 1);
      const bounce = sin(PI * reaction);
      const y = lerp(idleY, offscreenY, (1 - rise) ** 2) - (type === "tomato" ? 30 * size * bounce : 0);
      let reactionTilt = tilt;
      if (type === "carrot") reactionTilt += sin(reaction * TWO_PI * 3) * bounce * 0.3;
      if (type === "broccoli") reactionTilt += TWO_PI * reaction;
      if (age < 0) menuVegetableTargets.push({type, x, y, radius: 41 * size});
      push();
      noStroke();
      fill(23, 55, 94, (52 - hop * 26) * rise);
      ellipse(x, groundY, (74 - hop * 20) * size, (13 - hop * 3) * size);
      pop();
      drawAnimatedVegetable(type, x, y, size, reactionTilt, 0, squash);
    } else {
      const fall = age / fallDuration;
      const y = lerp(idleY, offscreenY, fall ** 2);
      for (const half of [-1, 1]) {
        drawAnimatedVegetable(
          type, x + half * fall * size * 23, y + half * fall * size * 12,
          size, tilt + half * fall * 0.9, half, squash * (1 - fall)
        );
      }

      if (age < 135) {
        push();
        translate(x, idleY);
        rotate(tilt);
        scale(size);
        strokeCap(ROUND);
        stroke(sky);
        strokeWeight(9);
        line(-44, 0, 44, 0);
        stroke(white);
        strokeWeight(4);
        line(-44, 0, 44, 0);
        pop();
      }
    }
  }
}

function drawAnimatedVegetable(type, x, y, size, tilt, half, squash) {
  push();
  translate(x, y);
  rotate(tilt);
  scale(size * (1 + squash), size * (1 - squash));
  if (half) {
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(-60, half < 0 ? -65 : 0, 120, 65);
    drawingContext.clip();
  }

  drawLevelVegetable(type);
  if (half < 0) {
    stroke(navy);
    strokeWeight(2);
    line(-15, -8, -7, -12);
    line(7, -12, 15, -8);
    noStroke();
    fill("#79CEFF");
    ellipse(-13, -3, 5, 7);
    ellipse(13, -3, 5, 7);
  }
  noStroke();
  fill("#FFB2B5");
  ellipse(-17, 7, 8, 5);
  ellipse(17, 7, 8, 5);
  noFill();
  stroke(navy);
  strokeWeight(2.5);
  strokeCap(ROUND);
  if (half) arc(0, 11, 13, 10, PI, TWO_PI);
  else arc(0, 7, 13, 10, 0, PI);

  if (half) drawingContext.restore();
  pop();
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
  menuMusic.pause();
  stopLevelAudio();
  levelMusic = new Audio("assets/level " + level + " music.mp3");
  levelMusic.loop = true;
  levelMusic.volume = audioVolume.music / 100;
  levelMusic.play().catch(() => {});
  playedSwipeSound = false;
  choppedVegetables = [];

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

  drawChoppedVegetables();
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
    failLevel();
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

function drawChoppedVegetables() {
  const now = millis();
  choppedVegetables = choppedVegetables.filter(piece => now - piece.started < 560);
  for (const piece of choppedVegetables) {
    const fall = (now - piece.started) / 560;
    for (const half of [-1, 1]) {
      drawAnimatedVegetable(
        piece.type, piece.x + half * 40 * fall,
        piece.y - 36 * fall + 235 * fall ** 2 + half * 10 * fall,
        piece.size, half * fall, half, 0
      );
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
    playGameSound("chop");
    choppedVegetables.push({type: v.type, x: v.x, y: v.y, size: v.size, started: millis()});

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
function mouseMoved() {
  if (screen !== "game" || levelComplete || gameOver || showTutorial ||
      dragging || mouseY <= barHeight ||
      (mouseX === pmouseX && mouseY === pmouseY)) return;

  swipeHits = 0;
  comboAwarded = 0;
  sliceVegetables(screenToWorld(pmouseX, pmouseY), screenToWorld(mouseX, mouseY));
}

function mouseDragged() {
  if (screen === "settings" && activeVolumeSlider !== null) {
    setVolumeFromSlider(activeVolumeSlider);
    return false;
  }


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

  if (!playedSwipeSound && (mouseX !== pmouseX || mouseY !== pmouseY)) {
    playGameSound("slash");
    playedSwipeSound = true;
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
      playGameSound("explosion");
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
        failLevel();
        return false;
      }
    }
  }

  sliceVegetables(previous, current);
  return false;
}

function sliceVegetables(previous, current) {
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
}

function mouseReleased() {
  activeVolumeSlider = null;
  playedSwipeSound = false;
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
  playLevelResult("victory");

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
function achievementListLayout() {
  const top = barHeight + 120;
  const bottom = height - 24;
  const rowH = 91;
  const visibleH = max(0, bottom - top);
  const maxScroll = max(0, achievementDefinitions.length * rowH - visibleH);
  return {top, bottom, rowH, visibleH, maxScroll, cardW: min(width - 24, 620)};
}

function achievementRewardButton(layout, y, label) {
  const w = min(112, layout.cardW * 0.32);
  return makeButton(width / 2 + layout.cardW / 2 - w / 2 - 12, y, w, 38, label, yellow, 14);
}

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

  const layout = achievementListLayout();
  const {top, bottom, rowH, visibleH, maxScroll, cardW} = layout;
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
    rect(width/2, y, cardW, 76, 15);
    noStroke();
    fill(navy);
    textAlign(LEFT,CENTER);
    const reward = achievementRewardButton(layout, y, "Claim +1 ★");
    const left = width / 2 - cardW / 2 + 14;
    const textX = left + 34;
    const textW = reward.x - reward.w / 2 - textX - 8;
    const claimed = claimedAchievements[a.id];
    textSize(22);
    text(unlocked ? a.icon : "🔒", left, y);
    rectMode(CORNER);
    textStyle(BOLD);
    textSize(min(20, width / 20));
    text(a.title, textX, y - 32, textW, 32);
    textStyle(NORMAL);
    textSize(min(14, width / 25));
    text(a.detail, textX, y, textW, 34);
    if (unlocked && !claimed) {
      drawButton(reward);
    } else {
      textAlign(CENTER, CENTER);
      textSize(14);
      text(claimed ? "Claimed" : "Locked · +1 ★", reward.x, y);
    }
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
    const {maxScroll} = achievementListLayout();
    achievementScroll = constrain(achievementScroll + event.delta, 0, maxScroll);
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

function drawButton(btn, interactive = true) {
  let hovering = interactive && isMouseOver(btn);
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

// AUDIO SETTINGS
function volumeSliderLayout(index) {
  const contentH = max(0, height - barHeight);
  const rowHeight = min(90, contentH * 0.29);
  const sliderWidth = max(1, min(420, width - 76));
  return {
    left: (width - sliderWidth) / 2,
    right: (width + sliderWidth) / 2,
    y: barHeight + contentH * 0.54 + index * rowHeight,
    rowHeight
  };
}

function drawSettings() {
  const contentH = max(0, height - barHeight);
  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  noStroke();
  fill(navy);
  textSize(min(32, contentH * 0.13));
  text("Audio Settings", width / 2, barHeight + contentH * 0.19);

  for (let i = 0; i < audioControls.length; i++) {
    const {key, label} = audioControls[i];
    const {left, right, y, rowHeight} = volumeSliderLayout(i);
    const knob = lerp(left, right, audioVolume[key] / 100);
    const radius = min(12, rowHeight * 0.14);

    textSize(min(21, rowHeight * 0.27));
    text(label + "  " + audioVolume[key] + "%", width / 2, y - rowHeight * 0.33);
    strokeCap(ROUND);
    strokeWeight(radius);
    stroke(navy);
    line(left, y, right, y);
    stroke(i === 0 ? sky : pink);
    line(left, y, knob, y);
    stroke(navy);
    strokeWeight(2);
    fill(white);
    circle(knob, y, radius * 2);
    noStroke();
    fill(navy);
  }
  pop();
}

function setVolumeFromSlider(index) {
  const {key} = audioControls[index];
  const {left, right} = volumeSliderLayout(index);
  const value = Math.round(constrain((mouseX - left) / (right - left), 0, 1) * 100);
  if (value === audioVolume[key]) return;
  audioVolume[key] = value;

  if (key === "music") {
    menuMusic.volume = value / 100;
    if (levelMusic) levelMusic.volume = value / 100;
  } else {
    if (effectOutput) effectOutput.gain.value = value / 100;
    for (const [name, sound] of Object.entries(gameSounds)) {
      if (!boostedEffects.has(name)) sound.volume = value / 100;
    }
  }

  try {
    localStorage.setItem(audioSettingsKey, JSON.stringify({
      ...audioVolume,
      effectsDefaultUpdated: true
    }));
  } catch (error) {
    console.warn("Could not save audio settings:", error);
  }
}

// MOUSE CONTROLS
function mousePressed() {
  handleMousePress();
  if (screen !== "game" && menuMusic.paused) {
    menuMusic.play().catch(() => {});
  }
  return false;
}

function handleMousePress() {
  if (showTutorial) {
    if (isMouseOver(closeButton)) {
      playGameSound("click");
      showTutorial = false;
    }
    return false;
  }

  if (screen === "game" && gameOver) {
    if (isMouseOver(retryButton)) {
      playGameSound("click");
      startLevel(selectedLevel);
      return false;
    }

    if (isMouseOver(backButton)) {
      playGameSound("click");
      stopLevelAudio();
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
    playGameSound("click");
    stopLevelAudio();
    screen = "levels";
    resetCamera();
    return false;
  }

  if (screen !== "menu" && isMouseOver(menuBackButton)) {
    playGameSound("click");
    stopLevelAudio();
    screen = screen === "game" ? "levels" : "menu";
    resetCamera();
    return false;
  }

  if (screen === "game") {
    if (!levelComplete && !gameOver) {
      playedSwipeSound = false;
      dragging = true;
      swipeHits = 0;
      comboAwarded = 0;
      swipeTrail = [];
    }
    return false;
  }

  if (screen === "menu") {
    if (isMouseOver(playButton)) {
      playGameSound("click");
      screen = "levels";
    } else if (isMouseOver(tutorialButton)) {
      playGameSound("click");
      showTutorial = true;
      tutorialStartTime = millis();
    } else if (isMouseOver(achievementsButton)) {
      playGameSound("click");
      achievementScroll = 0;
      screen = "achievements";
      loadAchievementClaims();
    } else if (isMouseOver(settingsButton)) {
      playGameSound("click");
      screen = "settings";
    } else if (mouseY > barHeight) {
      const target = menuVegetableTargets.findLast(vegetable =>
        dist(mouseX, mouseY, vegetable.x, vegetable.y) < vegetable.radius
      );
      if (target) {
        menuTapTimes[target.type] = millis();
        playGameSound("click");
      }
    }
  } else if (screen === "settings") {
    for (let i = 0; i < audioControls.length; i++) {
      const {left, right, y, rowHeight} = volumeSliderLayout(i);
      if (mouseX >= left - 15 && mouseX <= right + 15 &&
          abs(mouseY - y) <= min(22, rowHeight * 0.3)) {
        activeVolumeSlider = i;
        setVolumeFromSlider(i);
        break;
      }
    }
  } else if (screen === "achievements") {
    const layout = achievementListLayout();
    const {top, bottom, rowH, maxScroll} = layout;
    if (mouseY >= top && mouseY < bottom) {
      const scroll = constrain(achievementScroll, 0, maxScroll);
      for (let i = 0; i < achievementDefinitions.length; i++) {
        const {id} = achievementDefinitions[i];
        const y = top + i * rowH - scroll + 38;
        const reward = achievementRewardButton(layout, y, "");
        if (isMouseOver(reward)) {
          if (claimAchievement(id)) {
            playGameSound("click");
            flyingAchievementStars.push({x: reward.x, y: reward.y, started: millis()});
          }
          break;
        }
      }
    }
  } else if (screen === "levels") {
    let s = getMapScale();
    let mx = (mouseX - width / 2) / s;
    let my = (mouseY - (barHeight + (height - barHeight) / 2)) / s;

    for (let lvl of levelButtons) {
      if (dist(mx, my, lvl.x, lvl.y) < 55) {
        if (lvl.level <= unlockedLevel && lvl.level <= 6) {
          playGameSound("click");
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

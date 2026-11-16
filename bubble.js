// bubble game
// uses the same home page functions and 800 x 600 coordinates

let bubbleColors = [
  "#78DDEB", "#F7A2CC", "#FFE189",
  "#B6A0F4", "#A7DF9B", "#91BBFF"
];

let bubbleInk = "#17375E";
let bubbleKey = "fmsBubbleRhythmV2";

let bubbleLevels = [
  { bpm: 88, count: 16, gap: 2, lead: 2.8, radius: 51 },
  { bpm: 96, count: 22, gap: 1.5, lead: 2.6, radius: 49 },
  { bpm: 104, count: 28, gap: 1, lead: 2.5, radius: 46 },
  { bpm: 112, count: 32, gap: 1, lead: 2.4, radius: 44 },
  { bpm: 120, count: 36, gap: 1, lead: 2.3, radius: 43 },
  { bpm: 128, count: 42, gap: 1, lead: 2.2, radius: 42 }
];

let bubbleBadges = [
  {
    id: "first",
    name: "First splash",
    detail: "Pop your first bubble"
  },
  {
    id: "combo",
    name: "In the groove",
    detail: "Reach a 10-pop combo"
  },
  {
    id: "perfect",
    name: "Right on time",
    detail: "Get 10 perfect pops in one round"
  },
  {
    id: "hundred",
    name: "Pop collector",
    detail: "Pop 100 bubbles in total"
  },
  {
    id: "tour",
    name: "Ocean explorer",
    detail: "Finish all six levels"
  },
  {
    id: "stars",
    name: "Superstar",
    detail: "Earn three stars on every level"
  }
];

let bubbleSaved = {
  stars: [0, 0, 0, 0, 0, 0],
  finished: [false, false, false, false, false, false],
  pops: 0,
  badges: {},
  claimed: {},
  music: 0.35,
  effects: 0.65
};

let bubbleSelected = 0;
let bubbleButtons = [];
let bubbleNotes = [];
let bubbleParticles = [];
let bubbleRings = [];
let bubbleWords = [];

let bubbleRunning = false;
let bubblePaused = false;
let bubbleClockStart = 0;
let bubbleFrozen = 0;
let bubbleBeatIndex = 0;

let bubblePoints = 0;
let bubbleHits = 0;
let bubbleMisses = 0;
let bubblePerfect = 0;
let bubbleCombo = 0;
let bubbleBest = 0;
let bubbleEarned = 0;

let bubbleToast = "";
let bubbleToastUntil = 0;
let bubbleLastFrame = 0;
let bubbleTutorialStart = 0;
let bubbleFinishTime = 0;

let bubbleAudio;
let bubbleMusicGain;
let bubbleFxGain;

let bubbleLastScreen = "";
let bubbleMenuPops = {};
let bubbleRewardFlights = [];
let bubbleSettingsOpen = false;

// saves progress in this browser
function bubbleSave() {
  try {
    localStorage.setItem(
      bubbleKey,
      JSON.stringify(bubbleSaved)
    );
  } catch (error) {
    // the game still works if saving is blocked
  }
}

// loads saved progress when the page starts
function setupBubbleGame() {
  try {
    let data = JSON.parse(localStorage.getItem(bubbleKey));

    if (data) {
      for (let i = 0; i < 6; i++) {
        bubbleSaved.stars[i] = Math.max(
          0,
          Math.min(
            3,
            Number(data.stars && data.stars[i]) || 0
          )
        );

        bubbleSaved.finished[i] = Boolean(
          data.finished && data.finished[i]
        );
      }

      bubbleSaved.pops = Math.max(
        0,
        Number(data.pops) || 0
      );

      for (let i = 0; i < bubbleBadges.length; i++) {
        let badge = bubbleBadges[i];

        bubbleSaved.badges[badge.id] = Boolean(
          data.badges && data.badges[badge.id]
        );

        bubbleSaved.claimed[badge.id] = Boolean(
          data.claimed && data.claimed[badge.id]
        );
      }

      let controls = ["music", "effects"];

      for (let i = 0; i < controls.length; i++) {
        let field = controls[i];

        if (Number.isFinite(data[field])) {
          bubbleSaved[field] = Math.max(
            0,
            Math.min(1, data[field])
          );
        }
      }
    }
  } catch (error) {
    // starts fresh if there isn't any saved progress
  }

  bubbleLastFrame = millis();
}

// the browser needs a click before it can play sound
function bubbleUnlockAudio() {
  try {
    if (!bubbleAudio) {
      let Context =
        window.AudioContext || window.webkitAudioContext;

      if (!Context) {
        return;
      }

      bubbleAudio = new Context();

      bubbleMusicGain = bubbleAudio.createGain();
      bubbleFxGain = bubbleAudio.createGain();

      bubbleMusicGain.connect(bubbleAudio.destination);
      bubbleFxGain.connect(bubbleAudio.destination);
    }

    bubbleMusicGain.gain.value = bubbleSaved.music;
    bubbleFxGain.gain.value = bubbleSaved.effects;

    if (bubbleAudio.state === "suspended") {
      bubbleAudio.resume().catch(function () {});
    }
  } catch (error) {
    // you can still play without sound
  }
}

// an oscillator makes a note and gain controls its volume
function bubbleTone(
  frequency,
  at,
  duration,
  volume,
  type = "sine",
  effect = false
) {
  if (!bubbleAudio || bubbleAudio.state !== "running") {
    return;
  }

  let oscillator = bubbleAudio.createOscillator();
  let gain = bubbleAudio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);

  gain.gain.setValueAtTime(0.001, at);

  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.002, volume),
    at + 0.012
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    at + duration
  );

  oscillator.connect(gain);

  if (effect) {
    gain.connect(bubbleFxGain);
  } else {
    gain.connect(bubbleMusicGain);
  }

  oscillator.start(at);
  oscillator.stop(at + duration + 0.02);

  oscillator.onended = function () {
    oscillator.disconnect();
    gain.disconnect();
  };
}

function bubbleSound(kind) {
  if (!bubbleAudio) {
    return;
  }

  let now = bubbleAudio.currentTime;

  if (kind === "win") {
    let tune = [523.25, 659.25, 783.99, 1046.5];

    for (let i = 0; i < tune.length; i++) {
      bubbleTone(
        tune[i],
        now + i * 0.12,
        0.32,
        0.15,
        "sine",
        true
      );
    }
  } else {
    let frequency = 659.25;

    if (kind === "perfect") {
      frequency = 1046.5;
    } else if (kind === "miss") {
      frequency = 196;
    } else if (kind === "claim") {
      frequency = 1318.5;
    }

    bubbleTone(
      frequency,
      now,
      0.13,
      0.12,
      "sine",
      true
    );

    if (kind !== "miss") {
      bubbleTone(
        frequency * 1.5,
        now + 0.045,
        0.12,
        0.07,
        "sine",
        true
      );
    }
  }
}

function bubbleClock() {
  return performance.now() / 1000;
}

function bubbleSongTime() {
  if (bubblePaused) {
    return bubbleFrozen;
  }

  return bubbleClock() - bubbleClockStart;
}

// music and bubbles use the same beat
function bubbleMusic(time) {
  let beat = 60 / bubbleLevels[bubbleSelected].bpm;

  if (bubbleBeatIndex * beat < time - 0.15) {
    bubbleBeatIndex = Math.ceil(time / beat);
  }

  while (bubbleBeatIndex * beat <= time + 0.1) {
    let when = Math.max(
      0,
      bubbleBeatIndex * beat - time
    );

    if (bubbleAudio) {
      when += bubbleAudio.currentTime;
    }

    let melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 783.99, 880, 783.99
    ];

    let melodyIndex =
      (bubbleBeatIndex + bubbleSelected * 2) % 8;

    bubbleTone(
      melody[melodyIndex],
      when,
      beat * 0.65,
      0.12,
      "triangle"
    );

    let bass = 174.61;

    if (bubbleBeatIndex % 4 < 2) {
      bass = 130.81;
    }

    let drum = 72;

    if (bubbleBeatIndex % 2 === 1) {
      drum = 360;
    }

    bubbleTone(bass, when, 0.22, 0.16);
    bubbleTone(drum, when, 0.075, 0.11);

    bubbleBeatIndex++;
  }
}

function bubbleTextAt(
  value,
  x,
  y,
  size = 22,
  col = bubbleInk
) {
  noStroke();
  fill(col);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(size);
  text(value, x, y);
}

function bubbleStar(x, y, size, col = "#FFD43B") {
  push();
  translate(x, y);

  fill(col);
  stroke(bubbleInk);
  strokeWeight(1.5);

  beginShape();

  for (let i = 0; i < 10; i++) {
    let angle = -Math.PI / 2 + i * Math.PI / 5;
    let radius = size;

    if (i % 2 === 1) {
      radius = size * 0.46;
    }

    vertex(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  }

  endShape(CLOSE);
  pop();
}

// draws a button and remembers where it can be clicked
function bubbleButton(
  id,
  label,
  x,
  y,
  w = 210,
  h = 52,
  col = "#FFFFFF",
  disabled = false
) {
  bubbleButtons.push({
    id: id,
    x: x,
    y: y,
    w: w,
    h: h,
    disabled: disabled
  });

  let hover =
    !disabled &&
    Math.abs(pointerX - x) < w / 2 &&
    Math.abs(pointerY - y) < h / 2;

  let buttonScale = 1;

  if (hover) {
    buttonScale = 1.035;
  }

  let buttonColor = col;
  let textColor = bubbleInk;

  if (disabled) {
    buttonColor = "#E0E5EE";
    textColor = "#758399";
  }

  push();
  translate(x, y);
  scale(buttonScale);
  rectMode(CENTER);

  noStroke();
  fill("#CBD5E5");
  rect(0, 5, w, h, 18);

  fill(buttonColor);
  stroke(bubbleInk);
  strokeWeight(2);
  rect(0, 0, w, h, 18);

  bubbleTextAt(
    label,
    0,
    0,
    Math.min(23, w / 8),
    textColor
  );

  pop();
}

function drawBubbleCircle(
  x,
  y,
  radius,
  col,
  face = false
) {
  push();

  noStroke();
  fill(23, 55, 94, 16);

  ellipse(
    x + 3,
    y + radius * 0.9,
    radius * 1.7,
    radius * 0.35
  );

  fill(col);
  stroke(bubbleInk);
  strokeWeight(2.5);
  circle(x, y, radius * 2);

  noFill();
  stroke(255, 255, 255, 190);
  strokeWeight(2);
  circle(x, y, radius * 1.72);

  noStroke();
  fill(255, 255, 255, 220);

  ellipse(
    x - radius * 0.35,
    y - radius * 0.4,
    radius * 0.23,
    radius * 0.4
  );

  circle(
    x + radius * 0.42,
    y + radius * 0.36,
    radius * 0.13
  );

  if (face) {
    fill(bubbleInk);

    ellipse(
      x - radius * 0.22,
      y,
      radius * 0.09,
      radius * 0.15
    );

    ellipse(
      x + radius * 0.22,
      y,
      radius * 0.09,
      radius * 0.15
    );

    noFill();
    stroke(bubbleInk);
    strokeWeight(2.5);

    arc(
      x,
      y + radius * 0.12,
      radius * 0.32,
      radius * 0.25,
      0,
      Math.PI
    );

    noStroke();
    fill("#F69DBD");

    ellipse(
      x - radius * 0.4,
      y + radius * 0.17,
      radius * 0.19,
      radius * 0.1
    );

    ellipse(
      x + radius * 0.4,
      y + radius * 0.17,
      radius * 0.19,
      radius * 0.1
    );
  }

  pop();
}

function bubbleBackgroundScene() {
  let left = 0;
  let fullWidth = 800;

  if (typeof pageX === "number") {
    left = -pageX / pageScale;
  }

  if (typeof pageScale === "number") {
    fullWidth = width / pageScale;
  }

  noStroke();
  fill("#EDF4FF");
  rect(left, 70, fullWidth, 530);

  fill("#E0DFFB");
  ellipse(95, 580, 700, 360);

  fill("#D1F0EF");
  ellipse(690, 640, 900, 410);

  // little bubbles floating upward
  for (let i = 0; i < 22; i++) {
    let x =
      left +
      (i + 0.5) * fullWidth / 22 +
      Math.sin(millis() / 2400 + i) * 12;

    let y =
      590 - ((millis() * 0.017 + i * 67) % 510);

    noFill();
    stroke(255, 255, 255, 190);
    strokeWeight(2);
    circle(x, y, 10 + i % 4 * 9);
  }

  let pulse = 0.5;

  if (bubbleRunning && !bubblePaused) {
    pulse = (
      1 + Math.cos(
        bubbleSongTime() *
        Math.PI * 2 *
        bubbleLevels[bubbleSelected].bpm / 60
      )
    ) / 2;
  }

  noStroke();

  // music bars along the bottom
  for (let i = 0; i < 29; i++) {
    let h =
      8 +
      (Math.sin(millis() / 220 + i * 0.7) + 1) * 8 +
      pulse * 10;

    fill(bubbleColors[i % 6]);
    rect(24 + i * 26, 596 - h, 13, h, 7);
  }
}

function bubbleBurst(x, y, col, count = 20) {
  bubbleRings.push({
    x: x,
    y: y,
    age: 0,
    col: col
  });

  for (let i = 0; i < count; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 50 + Math.random() * 140;

    bubbleParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: 0.5 + Math.random() * 0.4,
      col: col,
      size: 3 + Math.random() * 5
    });
  }
}

function bubbleLabel(value, x, y, col = bubbleInk) {
  bubbleWords.push({
    value: value,
    x: x,
    y: y,
    col: col,
    age: 0
  });
}

function bubbleEffects(dt) {
  for (let i = 0; i < bubbleParticles.length; i++) {
    let particle = bubbleParticles[i];

    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 100 * dt;

    let c = color(particle.col);

    c.setAlpha(
      255 * Math.max(0, 1 - particle.age / particle.life)
    );

    noStroke();
    fill(c);
    circle(particle.x, particle.y, particle.size);
  }

  // going backward lets us safely remove finished particles
  for (let i = bubbleParticles.length - 1; i >= 0; i--) {
    if (bubbleParticles[i].age >= bubbleParticles[i].life) {
      bubbleParticles.splice(i, 1);
    }
  }

  for (let i = 0; i < bubbleRings.length; i++) {
    let ring = bubbleRings[i];
    ring.age += dt;

    let c = color(ring.col);

    c.setAlpha(
      255 * Math.max(0, 1 - ring.age / 0.45)
    );

    noFill();
    stroke(c);
    strokeWeight(3);
    circle(ring.x, ring.y, 25 + ring.age * 240);
  }

  for (let i = bubbleRings.length - 1; i >= 0; i--) {
    if (bubbleRings[i].age >= 0.45) {
      bubbleRings.splice(i, 1);
    }
  }

  for (let i = 0; i < bubbleWords.length; i++) {
    let popup = bubbleWords[i];
    popup.age += dt;

    bubbleTextAt(
      popup.value,
      popup.x,
      popup.y - popup.age * 32,
      23,
      popup.col
    );
  }

  for (let i = bubbleWords.length - 1; i >= 0; i--) {
    if (bubbleWords[i].age >= 0.7) {
      bubbleWords.splice(i, 1);
    }
  }
}

function bubbleUnlock(id) {
  if (bubbleSaved.badges[id]) {
    return;
  }

  bubbleSaved.badges[id] = true;

  for (let i = 0; i < bubbleBadges.length; i++) {
    if (bubbleBadges[i].id === id) {
      bubbleToast = bubbleBadges[i].name;
    }
  }

  bubbleToastUntil = millis() + 2700;
  bubbleSave();
}

function bubbleMenuTargets() {
  return [
    {
      x: 155,
      y: 260 + Math.sin(millis() / 600) * 10,
      r: 55
    },
    {
      x: 300,
      y: 330 + Math.sin(millis() / 750) * 14,
      r: 82
    },
    {
      x: 145,
      y: 430 + Math.sin(millis() / 850) * 9,
      r: 47
    }
  ];
}

function bubbleMenu() {
  let menuBubbles = bubbleMenuTargets();

  for (let i = 0; i < menuBubbles.length; i++) {
    let item = menuBubbles[i];

    if (millis() - (bubbleMenuPops[i] || -9999) > 650) {
      drawBubbleCircle(
        item.x,
        item.y,
        item.r,
        bubbleColors[i],
        true
      );
    }
  }

  for (let i = 0; i < 9; i++) {
    fill(bubbleColors[i % 6]);
    noStroke();

    rect(
      95 + i * 31,
      535 - (15 + Math.sin(millis() / 180 + i) * 10),
      18,
      35,
      8
    );
  }

  fill(255, 255, 255, 210);
  noStroke();
  rect(445, 155, 320, 382, 28);

  bubbleButton(
    "play", "Play",
    605, 215, 260, 76,
    bubbleColors[0]
  );

  bubbleButton(
    "tutorial", "Tutorial",
    605, 310, 260, 63,
    bubbleColors[2]
  );

  bubbleButton(
    "achievements", "Awards",
    605, 395, 260, 63,
    bubbleColors[1]
  );

  bubbleButton(
    "settings", "Sound",
    605, 480, 260, 52
  );

  let count = 0;

  for (let i = 0; i < bubbleBadges.length; i++) {
    if (bubbleSaved.claimed[bubbleBadges[i].id]) {
      count++;
    }
  }

  bubbleStar(697, 115, 15);
  bubbleTextAt(count, 729, 115, 22);
}

function bubbleLevelMap() {
  bubbleTextAt("Levels", 400, 114, 30);

  let coords = [
    [155, 240], [400, 240], [645, 240],
    [645, 425], [400, 425], [155, 425]
  ];

  noFill();
  stroke("#C4D3E8");
  strokeWeight(14);

  beginShape();

  for (let i = 0; i < coords.length; i++) {
    vertex(coords[i][0], coords[i][1]);
  }

  endShape();

  for (let i = 0; i < coords.length; i++) {
    let x = coords[i][0];
    let y = coords[i][1];

    drawBubbleCircle(x, y, 49, bubbleColors[i]);
    bubbleTextAt(i + 1, x, y, 32);

    bubbleButtons.push({
      id: "level" + i,
      x: x,
      y: y,
      w: 105,
      h: 105
    });

    for (let s = 0; s < 3; s++) {
      let starColor = "#CBD3E2";

      if (s < bubbleSaved.stars[i]) {
        starColor = "#FFD43B";
      }

      bubbleStar(
        x + (s - 1) * 25,
        y + 95,
        11,
        starColor
      );
    }
  }

  bubbleButton("menu", "Back", 400, 550, 210, 45);
}

function startBubbleGame(index = bubbleSelected) {
  bubbleSelected = index;
  bubbleUnlockAudio();

  bubbleHits = 0;
  bubbleMisses = 0;
  bubblePoints = 0;
  bubblePerfect = 0;
  bubbleCombo = 0;
  bubbleBest = 0;
  bubbleEarned = 0;

  bubbleParticles = [];
  bubbleRings = [];
  bubbleWords = [];
  bubbleNotes = [];

  bubbleBeatIndex = 0;

  let levelSettings = bubbleLevels[bubbleSelected];
  let beat = 60 / levelSettings.bpm;

  let spots = [
    [140, 285], [400, 410], [660, 285],
    [400, 265], [140, 420], [660, 420]
  ];

  let targetBeat = 4;

  for (let i = 0; i < levelSettings.count; i++) {
    let spot = spots[i % spots.length];

    bubbleNotes.push({
      x: spot[0],
      y: spot[1],
      r: levelSettings.radius,
      at: targetBeat * beat,
      number: i + 1,
      done: false,
      hit: false,
      col: bubbleColors[i % 6]
    });

    // later levels add faster pairs
    if (bubbleSelected >= 4 && i % 6 === 3) {
      targetBeat += 0.5;
    } else {
      targetBeat += levelSettings.gap;
    }
  }

  bubbleClockStart = bubbleClock();
  bubbleFrozen = 0;
  bubblePaused = false;
  bubbleRunning = true;

  screen = "bubblePlay";
}

function bubbleFinish() {
  bubbleRunning = false;

  let rate = bubbleHits / bubbleNotes.length;
  bubbleEarned = 0;

  if (rate >= 0.9) {
    bubbleEarned = 3;
  } else if (rate >= 0.65) {
    bubbleEarned = 2;
  } else if (rate > 0) {
    bubbleEarned = 1;
  }

  bubbleSaved.stars[bubbleSelected] = Math.max(
    bubbleSaved.stars[bubbleSelected],
    bubbleEarned
  );

  if (bubbleHits > 0) {
    bubbleSaved.finished[bubbleSelected] = true;
  }

  let allFinished = true;
  let allStars = true;

  for (let i = 0; i < bubbleLevels.length; i++) {
    if (!bubbleSaved.finished[i]) {
      allFinished = false;
    }

    if (bubbleSaved.stars[i] < 3) {
      allStars = false;
    }
  }

  if (allFinished) {
    bubbleUnlock("tour");
  }

  if (allStars) {
    bubbleUnlock("stars");
  }

  bubbleSave();

  bubbleFinishTime = millis();
  screen = "bubbleFinish";

  bubbleSound("win");

  for (let i = 0; i < 5; i++) {
    bubbleBurst(
      160 + i * 120,
      250,
      bubbleColors[i],
      25
    );
  }
}

function bubbleGame() {
  if (
    typeof showHelp !== "undefined" &&
    showHelp &&
    !bubblePaused
  ) {
    bubblePause();
  }

  let levelSettings = bubbleLevels[bubbleSelected];
  let time = bubbleSongTime();
  let beat = 60 / levelSettings.bpm;

  if (!bubblePaused) {
    bubbleMusic(time);

    for (let i = 0; i < bubbleNotes.length; i++) {
      let noteBubble = bubbleNotes[i];

      if (!noteBubble.done && time > noteBubble.at + 0.38) {
        noteBubble.done = true;

        bubbleMisses++;
        bubbleCombo = 0;

        bubbleLabel(
          "○",
          noteBubble.x,
          noteBubble.y,
          "#7489A6"
        );
      }
    }

    let roundFinished = true;

    for (let i = 0; i < bubbleNotes.length; i++) {
      if (!bubbleNotes[i].done) {
        roundFinished = false;
      }
    }

    if (roundFinished) {
      bubbleFinish();
      return;
    }
  }

  bubbleTextAt(
    "Level " + (bubbleSelected + 1),
    400, 106, 25
  );

  bubbleTextAt(bubblePoints, 130, 110, 21);
  bubbleTextAt("Combo " + bubbleCombo, 670, 110, 21);

  let progress =
    (bubbleHits + bubbleMisses) / bubbleNotes.length;

  noStroke();
  fill("#D4DDED");
  rect(210, 140, 380, 9, 5);

  fill(bubbleColors[bubbleSelected]);
  rect(210, 140, 380 * progress, 9, 5);

  let active = [];

  for (let i = 0; i < bubbleNotes.length; i++) {
    if (
      !bubbleNotes[i].done &&
      time >= bubbleNotes[i].at - levelSettings.lead * beat
    ) {
      active.push(bubbleNotes[i]);
    }
  }

  // connects the bubbles in order
  if (active.length > 1) {
    stroke(255, 255, 255, 220);
    strokeWeight(4);

    for (let i = 1; i < active.length; i++) {
      line(
        active[i - 1].x,
        active[i - 1].y,
        active[i].x,
        active[i].y
      );
    }
  }

  for (let i = active.length - 1; i >= 0; i--) {
    let noteBubble = active[i];

    let remaining = Math.max(
      0,
      (noteBubble.at - time) / (levelSettings.lead * beat)
    );

    let ready = Math.abs(time - noteBubble.at) < 0.19;

    let ringColor = noteBubble.col;
    let ringWidth = 4;
    let bubbleScale = 1;

    if (ready) {
      ringColor = "#FFFFFF";
      ringWidth = 6;
      bubbleScale = 1.045;
    }

    noFill();
    stroke(ringColor);
    strokeWeight(ringWidth);

    circle(
      noteBubble.x,
      noteBubble.y,
      noteBubble.r * 2 + remaining * 65
    );

    drawBubbleCircle(
      noteBubble.x,
      noteBubble.y,
      noteBubble.r * bubbleScale,
      noteBubble.col
    );

    bubbleTextAt(
      noteBubble.number,
      noteBubble.x,
      noteBubble.y,
      30
    );

    if (i === 0) {
      noFill();
      stroke(bubbleInk);
      strokeWeight(2);

      circle(
        noteBubble.x,
        noteBubble.y,
        noteBubble.r * 2 + 8
      );
    }
  }

  if (time < 3 * beat) {
    let countdown = ["Ready", "Steady", "Pop!"];
    let countIndex = Math.min(2, Math.floor(time / beat));

    bubbleTextAt(countdown[countIndex], 400, 330, 48);
  }

  bubbleTextAt(
    bubbleHits + " / " + bubbleNotes.length,
    400, 525, 21
  );

  let pauseLabel = "Pause";

  if (bubblePaused) {
    pauseLabel = "Resume";
  }

  bubbleButton(
    "pause", pauseLabel,
    690, 548, 145, 42
  );

  if (bubblePaused) {
    fill(237, 244, 255, 240);
    noStroke();
    rect(190, 230, 420, 215, 25);

    bubbleTextAt("Paused", 400, 279, 32);

    bubbleButton(
      "pause", "Resume",
      400, 345, 230, 55,
      bubbleColors[0]
    );

    bubbleButton(
      "levels", "Levels",
      400, 410, 200, 40
    );
  }
}

function bubblePause() {
  bubbleFrozen = bubbleSongTime();
  bubblePaused = true;

  if (bubbleMusicGain) {
    bubbleMusicGain.gain.value = 0;
  }
}

function bubbleResume() {
  bubbleClockStart = bubbleClock() - bubbleFrozen;
  bubblePaused = false;

  if (bubbleMusicGain) {
    bubbleMusicGain.gain.value = bubbleSaved.music;
  }
}

function checkBubbleTap() {
  if (!bubbleRunning || bubblePaused) {
    return;
  }

  let time = bubbleSongTime();
  let levelSettings = bubbleLevels[bubbleSelected];
  let beat = 60 / levelSettings.bpm;
  let noteBubble = null;

  // only the next numbered bubble can be popped
  for (let i = 0; i < bubbleNotes.length; i++) {
    if (
      !bubbleNotes[i].done &&
      time >= bubbleNotes[i].at - levelSettings.lead * beat
    ) {
      noteBubble = bubbleNotes[i];
      break;
    }
  }

  if (!noteBubble) {
    return;
  }

  let distance = Math.hypot(
    pointerX - noteBubble.x,
    pointerY - noteBubble.y
  );

  if (distance > noteBubble.r + 12) {
    return;
  }

  if (time > noteBubble.at + 0.38) {
    return;
  }

  let accurate = Math.abs(time - noteBubble.at) <= 0.19;

  noteBubble.done = true;
  noteBubble.hit = true;

  bubbleHits++;
  bubbleCombo++;
  bubbleSaved.pops++;

  bubbleBest = Math.max(bubbleBest, bubbleCombo);

  if (accurate) {
    bubblePerfect++;
  }

  let popPoints = 60;
  let particleCount = 18;
  let popMessage = "Pop!";
  let popSound = "pop";

  if (bubbleCombo % 5 === 0) {
    popMessage = bubbleCombo + " combo!";
  }

  if (accurate) {
    popPoints = 100;
    particleCount = 30;
    popMessage = "Perfect!";
    popSound = "perfect";
  }

  bubblePoints +=
    popPoints + Math.min(bubbleCombo - 1, 20) * 5;

  bubbleBurst(
    noteBubble.x,
    noteBubble.y,
    noteBubble.col,
    particleCount
  );

  bubbleLabel(
    popMessage,
    noteBubble.x,
    noteBubble.y - 20
  );

  bubbleSound(popSound);

  if (bubbleHits === 1) {
    bubbleUnlock("first");
  }

  if (bubbleCombo >= 10) {
    bubbleUnlock("combo");
  }

  if (bubblePerfect >= 10) {
    bubbleUnlock("perfect");
  }

  if (bubbleSaved.pops >= 100) {
    bubbleUnlock("hundred");
  }

  bubbleSave();
}

function bubbleTutorial() {
  bubbleTextAt("Tap in order", 400, 120, 34);

  let phase =
    ((millis() - bubbleTutorialStart) % 3000) / 3000;

  if (phase < 0.75) {
    noFill();
    stroke(bubbleColors[1]);
    strokeWeight(5);

    circle(
      400,
      320,
      120 + (1 - phase / 0.75) * 100
    );

    drawBubbleCircle(400, 320, 60, bubbleColors[0]);
    bubbleTextAt("1", 400, 320, 32);

    fill(bubbleInk);
    noStroke();

    circle(
      400 + Math.sin(phase * 2) * 90,
      420 - phase * 100,
      12
    );
  } else {
    noFill();
    stroke(bubbleColors[1]);
    strokeWeight(5);

    circle(
      400,
      320,
      120 + (phase - 0.75) * 260
    );

    bubbleTextAt("Perfect!", 400, 320, 32);
  }

  bubbleTextAt("Match the ring", 400, 445, 23);
  bubbleTextAt("Early taps count", 400, 480, 18);

  bubbleButton("menu", "Back", 400, 546, 220, 48);
}

function bubbleAchievements() {
  bubbleTextAt("Awards", 400, 117, 31);

  for (let i = 0; i < bubbleBadges.length; i++) {
    let item = bubbleBadges[i];
    let x = 210;

    if (i % 2 === 1) {
      x = 590;
    }

    let y = 213 + Math.floor(i / 2) * 115;
    let cardColor = "#FFFFFF";

    if (bubbleSaved.badges[item.id]) {
      cardColor = "#E0F4E4";
    }

    noStroke();
    fill(cardColor);
    rect(x - 170, y - 44, 340, 100, 18);

    bubbleTextAt(item.name, x, y - 20, 21);
    bubbleTextAt(item.detail, x, y + 6, 14);

    if (
      bubbleSaved.badges[item.id] &&
      !bubbleSaved.claimed[item.id]
    ) {
      bubbleButton(
        "claim:" + item.id,
        "Claim",
        x, y + 34,
        150, 30,
        bubbleColors[2]
      );
    } else {
      let status = "Locked";

      if (bubbleSaved.claimed[item.id]) {
        status = "Earned";
      }

      bubbleTextAt(
        status,
        x, y + 34,
        14, "#6A7E99"
      );
    }
  }

  bubbleButton("menu", "Back", 400, 555, 210, 43);
}

function bubbleSettings() {
  bubbleTextAt("Sound", 400, 140, 32);

  let controls = ["music", "effects"];

  for (let i = 0; i < controls.length; i++) {
    let field = controls[i];
    let y = 270 + i * 125;
    let title = "Pop sounds";

    if (field === "music") {
      title = "Music";
    }

    bubbleTextAt(title, 400, y - 43, 25);

    bubbleTextAt(
      Math.round(bubbleSaved[field] * 100) + "%",
      400, y, 27
    );

    bubbleButton(field + "-", "−", 260, y, 65, 50);
    bubbleButton(field + "+", "+", 540, y, 65, 50);
  }

  bubbleButton("menu", "Back", 400, 545, 220, 48);
}

function bubbleResult() {
  let title = "Try again";

  if (bubbleEarned > 0) {
    title = "Nice!";
  }

  bubbleTextAt(title, 400, 137, 38);

  bubbleTextAt(
    "Level " + (bubbleSelected + 1),
    400, 183, 23
  );

  for (let i = 0; i < 3; i++) {
    let elapsed =
      (millis() - bubbleFinishTime - i * 160) / 500;

    let size = 30;

    if (elapsed > 0) {
      size =
        38 + Math.sin(Math.min(1, elapsed) * Math.PI) * 10;
    }

    let starColor = "#CAD4E4";

    if (i < bubbleEarned) {
      starColor = "#FFD43B";
    }

    bubbleStar(
      400 + (i - 1) * 105,
      282,
      size,
      starColor
    );
  }

  bubbleTextAt(
    bubbleHits + " / " + bubbleNotes.length +
    " popped  ·  " + bubblePoints + " points",
    400, 370, 25
  );

  bubbleTextAt(
    bubblePerfect + " perfect  ·  Best combo " + bubbleBest,
    400, 413, 21
  );

  bubbleTextAt(
    "★★★ 90%   ·   ★★ 65%",
    400, 450, 17
  );

  bubbleButton(
    "retry", "Again",
    190, 520, 180, 57,
    bubbleColors[1]
  );

  bubbleButton(
    "levels", "Levels",
    400, 520, 180, 57
  );

  let nextAction = "menu";
  let nextLabel = "Menu";

  if (bubbleSelected < 5) {
    nextAction = "next";
    nextLabel = "Next";
  }

  bubbleButton(
    nextAction, nextLabel,
    610, 520, 180, 57,
    bubbleColors[0]
  );
}

// picks which screen to draw
function drawBubbleScreens() {
  let now = millis();

  let dt = Math.min(
    0.05,
    Math.max(0, (now - bubbleLastFrame) / 1000)
  );

  bubbleLastFrame = now;
  bubbleButtons = [];

  if (
    bubbleLastScreen === "bubblePlay" &&
    screen !== "bubblePlay"
  ) {
    bubbleRunning = false;

    if (bubbleMusicGain) {
      bubbleMusicGain.gain.value = 0;
    }
  }

  bubbleLastScreen = screen;

  push();
  rectMode(CORNER);
  ellipseMode(CENTER);

  bubbleBackgroundScene();

  if (screen === "bubbleMenu") {
    if (bubbleSettingsOpen) {
      bubbleSettings();
    } else {
      bubbleMenu();
    }
  } else if (screen === "bubbleLevels") {
    bubbleLevelMap();
  } else if (screen === "bubblePlay") {
    bubbleGame();
  } else if (screen === "bubbleTutorial") {
    bubbleTutorial();
  } else if (screen === "bubbleAchievements") {
    bubbleAchievements();
  } else if (screen === "bubbleSettings") {
    bubbleSettings();
  } else if (screen === "bubbleFinish") {
    bubbleResult();
  }

  bubbleEffects(dt);

  // claimed stars fly toward the counter
  for (let i = 0; i < bubbleRewardFlights.length; i++) {
    let effect = bubbleRewardFlights[i];
    let time = Math.min(1, (now - effect.at) / 650);

    bubbleStar(
      effect.x + (720 - effect.x) * time,
      effect.y + (110 - effect.y) * time -
        Math.sin(time * Math.PI) * 70,
      17 - time * 6
    );
  }

  for (let i = bubbleRewardFlights.length - 1; i >= 0; i--) {
    if (now - bubbleRewardFlights[i].at >= 650) {
      bubbleRewardFlights.splice(i, 1);
    }
  }

  if (now < bubbleToastUntil) {
    fill("#FFF2BB");
    stroke(bubbleInk);
    strokeWeight(2);
    rect(230, 77, 340, 42, 15);

    bubbleTextAt(bubbleToast, 400, 98, 18);
  }

  pop();

  drawTopBar("Bubble Rhythm", true);
}

function bubbleGameClick() {
  if (typeof showHelp !== "undefined" && showHelp) {
    return;
  }

  bubbleUnlockAudio();

  let item = null;

  // checks the front buttons first
  for (let i = bubbleButtons.length - 1; i >= 0; i--) {
    let test = bubbleButtons[i];

    if (
      !test.disabled &&
      Math.abs(pointerX - test.x) <= test.w / 2 &&
      Math.abs(pointerY - test.y) <= test.h / 2
    ) {
      item = test;
      break;
    }
  }

  if (item) {
    bubbleSound("click");
    let id = item.id;

    if (id === "play" || id === "levels") {
      bubbleRunning = false;
      screen = "bubbleLevels";
    } else if (id === "menu") {
      bubbleRunning = false;
      bubbleSettingsOpen = false;
      screen = "bubbleMenu";
    } else if (id === "tutorial") {
      bubbleTutorialStart = millis();
      screen = "bubbleTutorial";
    } else if (id === "achievements") {
      screen = "bubbleAchievements";
    } else if (id === "settings") {
      bubbleSettingsOpen = true;
      screen = "bubbleMenu";
    } else if (id.startsWith("level")) {
      startBubbleGame(Number(id.slice(5)));
    } else if (id === "retry") {
      startBubbleGame();
    } else if (id === "next") {
      startBubbleGame(Math.min(5, bubbleSelected + 1));
    } else if (id === "pause") {
      if (bubblePaused) {
        bubbleResume();
      } else {
        bubblePause();
      }
    } else if (id.startsWith("claim:")) {
      let badge = id.slice(6);

      if (
        bubbleSaved.badges[badge] &&
        !bubbleSaved.claimed[badge]
      ) {
        bubbleSaved.claimed[badge] = true;
        bubbleSave();
        bubbleSound("claim");

        bubbleRewardFlights.push({
          x: item.x,
          y: item.y,
          at: millis()
        });

        bubbleBurst(item.x, item.y, "#FFD43B");
      }
    } else {
      let field = "effects";

      if (id.startsWith("music")) {
        field = "music";
      }

      let change = -0.1;

      if (id.endsWith("+")) {
        change = 0.1;
      }

      bubbleSaved[field] += change;

      bubbleSaved[field] = Math.max(
        0,
        Math.min(1, bubbleSaved[field])
      );

      bubbleSaved[field] =
        Math.round(bubbleSaved[field] * 100) / 100;

      bubbleUnlockAudio();
      bubbleSave();
    }

    return;
  }

  if (screen === "bubblePlay") {
    checkBubbleTap();
  }

  if (screen === "bubbleMenu" && !bubbleSettingsOpen) {
    let menuBubbles = bubbleMenuTargets();

    for (let i = 0; i < menuBubbles.length; i++) {
      let menuBubble = menuBubbles[i];

      let distance = Math.hypot(
        pointerX - menuBubble.x,
        pointerY - menuBubble.y
      );

      if (
        distance < menuBubble.r &&
        millis() - (bubbleMenuPops[i] || -9999) > 650
      ) {
        bubbleMenuPops[i] = millis();

        bubbleBurst(
          menuBubble.x,
          menuBubble.y,
          bubbleColors[i]
        );

        bubbleSound("pop");
      }
    }
  }
}

// pauses if you switch tabs
document.addEventListener("visibilitychange", function () {
  if (document.hidden && bubbleRunning && !bubblePaused) {
    bubblePause();
  }
});
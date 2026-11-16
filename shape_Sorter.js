const W = 800, H = 600;
const C = { bg: '#dff6ff', blue: '#6dd5ed', yel: '#f9dc5c', grn: '#a0e04f', pnk: '#ec5fa0', ink: '#1d2a3a' };
let scene = 'home', st = 'watch', btns = [], stars = 0, help = false, g = {}, aud, deco = [];

const HELP = {
  home: 'Tap GAMES to play. SHOP is coming soon.',
  games: 'Tap the card to start.',
  sorter: 'Drag each shape onto its matching hole.',
  shop: 'Stars you earn will be spent here.',
  bye: 'Tap Home to come back.'
};

function setup() {
  createCanvas(W, H);
  textFont('Arial Rounded MT Bold, Arial, sans-serif');
  textAlign(CENTER, CENTER);
  for (let i = 0; i < 14; i++) {
    deco.push({
      x: random(W), y: random(H), s: random(0.4, 1),
      e: random(['🍎', '🍌', '🔶', '🫧', '⭐', '🧸', '🍓']),
      p: random(TWO_PI)
    });
  }
}

function beep(f, d = 0.15) {
  try {
    aud = aud || new (window.AudioContext || webkitAudioContext)();
    const o = aud.createOscillator(), v = aud.createGain();
    o.frequency.value = f;
    o.connect(v);
    v.connect(aud.destination);
    v.gain.setValueAtTime(0.12, aud.currentTime);
    v.gain.exponentialRampToValueAtTime(0.001, aud.currentTime + d);
    o.start();
    o.stop(aud.currentTime + d);
  } catch (e) {}
}

function btn(x, y, w, h, label, col, fn, ts = 24) {
  const over = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  stroke(C.ink);
  strokeWeight(3);
  fill(over ? lerpColor(color(col), color('#ffffff'), 0.4) : col);
  rect(x, y, w, h, h / 2.5);
  noStroke();
  fill(C.ink);
  textSize(ts);
  text(label, x + w / 2, y + h / 2 + 2);
  btns.push({ x, y, w, h, fn });
}

function go(s) {
  scene = s;
  st = 'watch';
  g = {};
  help = false;
}

function play() {
  st = 'play';
  g = initGame();
}

function finish() {
  if (st === 'done') return;
  st = 'done';
  stars++;
  beep(660, 0.2);
  setTimeout(() => beep(880, 0.3), 160);
}

function burst(x, y, n = 12) {
  g.p = g.p || [];
  for (let i = 0; i < n; i++) g.p.push({ x, y, vx: random(-4, 4), vy: random(-5, 2), l: 30 });
}

function drawParticles() {
  (g.p || []).forEach(q => {
    q.x += q.vx;
    q.y += q.vy;
    q.vy += 0.25;
    q.l--;
    fill(C.yel);
    stroke(C.ink);
    strokeWeight(1.5);
    circle(q.x, q.y, 8);
  });
  g.p = (g.p || []).filter(q => q.l > 0);
}

function star(x, y, R, r, n = 5) {
  beginShape();
  for (let i = 0; i < n * 2; i++) {
    const a = -HALF_PI + i * PI / n, d = i % 2 ? r : R;
    vertex(x + cos(a) * d, y + sin(a) * d);
  }
  endShape(CLOSE);
}

function shp(k, x, y, s) {
  if (k === 'c') circle(x, y, s * 1.6);
  else if (k === 's') rect(x - s * 0.7, y - s * 0.7, s * 1.4, s * 1.4, 6);
  else if (k === 't') triangle(x, y - s * 0.85, x - s * 0.85, y + s * 0.65, x + s * 0.85, y + s * 0.65);
  else star(x, y, s, s * 0.45);
}

function frame(title) {
  background(C.bg);
  noStroke();
  deco.forEach(d => {
    textSize(50 * d.s);
    fill(0, 40);
    text(d.e, d.x + sin(frameCount * 0.02 + d.p) * 8, d.y + cos(frameCount * 0.015 + d.p) * 8);
  });
  if (scene !== 'home') {
    btn(12, 12, 96, 40, 'Home', '#fff', () => go('home'), 20);
    btn(W - 56, 12, 44, 44, '?', C.yel, () => help = !help, 24);
  }
  if (title) {
    fill(C.ink);
    noStroke();
    textSize(34);
    text(title, W / 2, 40);
  }
}

function draw() {
  btns = [];
  if (scene === 'home') {
    frame();
    fill(C.ink);
    noStroke();
    textSize(56);
    text('Placeholder Name', W / 2, 130 + sin(frameCount * 0.05) * 5);
    btn(W / 2 - 110, 240, 220, 90, 'GAMES', C.blue, () => go('games'), 36);
    btn(20, H - 70, 110, 48, 'EXIT', '#fff', () => go('bye'), 22);
    btn(W - 130, H - 70, 110, 48, 'SHOP', C.yel, () => go('shop'), 22);
    btn(W - 56, 12, 44, 44, '?', C.yel, () => help = !help, 24);
  } else if (scene === 'bye') {
    frame('See you soon!');
  } else if (scene === 'shop') {
    frame('Shop');
    fill(C.ink);
    textSize(30);
    text('⭐ ' + stars + ' stars', W / 2, 260);
    textSize(22);
    text('Coming soon!', W / 2, 320);
  } else if (scene === 'games') {
    frame('Games');
    btn(260, 200, 280, 190, '', C.yel, () => go('sorter'));
    fill(C.ink);
    noStroke();
    textSize(72);
    text('🔷', 400, 280);
    textSize(24);
    text('Shape Sorter', 400, 350);
    textSize(20);
    text('⭐ ' + stars, W - 60, H - 24);
  } else {
    frame('Shape Sorter');
    if (st === 'watch') watchScreen();
    else if (st === 'play') playScreen();
    else doneScreen();
  }
  if (help) {
    fill(0, 150);
    noStroke();
    rect(0, 0, W, H);
    fill('#fff');
    stroke(C.ink);
    strokeWeight(3);
    rect(120, 200, 560, 200, 24);
    noStroke();
    fill(C.ink);
    textSize(26);
    text(HELP[scene], 140, 220, 520, 160);
    textSize(16);
    text('(tap anywhere to close)', W / 2, 375);
  }
}

function mousePressed() {
  if (help) {
    help = false;
    return false;
  }
  for (let i = btns.length - 1; i >= 0; i--) {
    const b = btns[i];
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      beep(520, 0.08);
      b.fn();
      return false;
    }
  }
  if (st === 'play' && g.press) g.press();
  return false;
}

function mouseReleased() {
  if (st === 'play' && g.release) g.release();
  return false;
}

function touchStarted() {
  return mousePressed();
}

function touchEnded() {
  return mouseReleased();
}

function watchScreen() {
  const T = (millis() / 2200) % 1;
  const e = T < 0.5 ? 2 * T * T : 1 - pow(-2 * T + 2, 2) / 2;
  fill('#fff');
  stroke(C.ink);
  strokeWeight(3);
  rect(150, 90, 500, 330, 24);
  fill(255);
  stroke(C.ink);
  strokeWeight(4);
  circle(520, 250, 90);
  fill(C.pnk);
  circle(lerp(280, 520, e), 250, 90);
  noStroke();
  fill(C.ink);
  textSize(26);
  text('Watch the circle move into its hole.', W / 2, 470);
  btn(W / 2 - 80, 505, 160, 56, 'Play', C.grn, play, 28);
}

function doneScreen() {
  fill('#fff');
  stroke(C.ink);
  strokeWeight(4);
  rect(200, 70, 400, 460, 24);
  noStroke();
  fill(C.ink);
  textSize(54);
  text('Great job!', W / 2, 140);
  fill(C.yel);
  stroke(C.ink);
  strokeWeight(4);
  push();
  translate(W / 2, 300);
  rotate(sin(frameCount * 0.08) * 0.15);
  star(0, 0, 90 + sin(frameCount * 0.1) * 6, 40);
  pop();
  noStroke();
  fill(C.ink);
  textSize(26);
  text('Round complete', W / 2, 430);
  btn(230, 465, 160, 50, 'Again', C.grn, play, 24);
  btn(410, 465, 160, 50, 'Games', C.pnk, () => go('games'), 24);
}

function initGame() {
  const K = ['c', 's', 't', 'st'];
  const col = { c: C.pnk, s: C.blue, t: C.yel, st: C.grn };
  const hs = shuffle(K.slice());
  const ps = shuffle(K.slice());
  const o = {
    m: 0,
    hole: {},
    d: null,
    pc: ps.map((k, i) => ({ k, x: 130 + i * 180, y: 480, hx: 130 + i * 180, hy: 480, done: false, col: col[k] })),
    press() {
      for (let i = o.pc.length - 1; i >= 0; i--) {
        const p = o.pc[i];
        if (!p.done && dist(mouseX, mouseY, p.x, p.y) < 50) {
          o.d = p;
          return;
        }
      }
    },
    release() {
      const p = o.d;
      if (!p) return;
      o.d = null;
      const h = o.hole[p.k];
      if (dist(p.x, p.y, h.x, h.y) < 60) {
        p.x = h.x;
        p.y = h.y;
        p.done = true;
        o.m++;
        beep(700, 0.15);
        burst(h.x, h.y);
        if (o.m === 4) setTimeout(finish, 700);
      } else {
        p.x = p.hx;
        p.y = p.hy;
        beep(200, 0.2);
      }
    }
  };
  hs.forEach((k, i) => o.hole[k] = { x: 130 + i * 180, y: 210 });
  return o;
}

function playScreen() {
  fill('#fff');
  stroke(C.ink);
  strokeWeight(3);
  rect(60, 130, 680, 130, 20);
  rect(60, 410, 680, 130, 20);
  noStroke();
  fill(C.ink);
  textSize(22);
  text('Match all four shapes.', W / 2, 80);
  for (const k in g.hole) {
    const h = g.hole[k];
    fill(255);
    stroke(C.ink);
    strokeWeight(3);
    shp(k, h.x, h.y, 45);
  }
  if (g.d) {
    g.d.x = mouseX;
    g.d.y = mouseY;
  }
  g.pc.forEach(p => {
    fill(p.col);
    stroke(C.ink);
    strokeWeight(3);
    shp(p.k, p.x, p.y, 45);
  });
  noStroke();
  fill(C.ink);
  textSize(24);
  text(g.m + ' / 4 matched', W / 2, 570);
  drawParticles();
}

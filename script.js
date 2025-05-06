const lanes = document.querySelectorAll('.lane');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const highscoreSpan = document.getElementById('highscore');
const startBtn = document.getElementById('start-btn');
const bgMusic = document.getElementById('bg-music');
const snake_1 = document.getElementById('snake_1');
const snake_2 = document.getElementById('snake_2');
const snake_3 = document.getElementById('snake_3');
const snake_4 = document.getElementById('snake_4');

let score = 0;
let lives = 5;
let baseSpeed = 2;
let beatInterval = 600;
let highScore = localStorage.getItem('bananaHighScore') || 0;
let step = 0;
let gameRunning = false;

const twinklePattern = ["a", "a", "s", "s", "d", "d", "s", null, "f", "f", "d", "d", "a", "a", "s", null];

const sounds = {
  a: document.getElementById('sound-a'),
  s: document.getElementById('sound-s'),
  d: document.getElementById('sound-d'),
  f: document.getElementById('sound-f')
};

function createNote(key) {
  if (!key) return;

  const lane = Array.from(lanes).find(l => l.dataset.key === key);
  const note = document.createElement('div');
  note.classList.add('note');
  lane.appendChild(note);

  let posY = -20;
  const interval = setInterval(() => {
    posY += baseSpeed;
    note.style.top = `${posY}px`;

    if (posY >= 460) {
      clearInterval(interval);
      if (lane.contains(note)) lane.removeChild(note);
      lives--;
      updateStats();
      if (lives <= 0) {
        endGame();
      }
    }
  }, 16);

  note.dataset.key = key;
  note.dataset.intervalId = interval;
}

function updateStats() {
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  highscoreSpan.textContent = highScore;
}

document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;

  const key = e.key.toLowerCase();
  const lane = Array.from(lanes).find(l => l.dataset.key === key);
  if (!lane) return;

  // 🐍 蛇的動畫反應（只在按下 s 鍵時）
  if (key === 'a') {
    snake_1.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      snake_1.style.transform = 'translateY(0)';
    }, 150);
  }

  if (key === 's') {
    snake_2.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      snake_2.style.transform = 'translateY(0)';
    }, 150);
  }

  if (key === 'd') {
    snake_3.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      snake_3.style.transform = 'translateY(0)';
    }, 150);
  }

  if (key === 'f') {
    snake_4.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      snake_4.style.transform = 'translateY(0)';
    }, 150);
  }

  const notes = lane.querySelectorAll('.note');
  for (const note of notes) {
    const top = parseInt(note.style.top);
    if (top >= 400 && top <= 500) {
      clearInterval(note.dataset.intervalId);
      lane.removeChild(note);
      score += 100;

      if (sounds[key]) {
        sounds[key].currentTime = 0;
        sounds[key].play();
      }

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('bananaHighScore', highScore);
      }

      updateStats();
      adjustSpeed();
      return;
    }
  }
});

function adjustSpeed() {
  baseSpeed += 0.1;
  if (bgMusic) {
    bgMusic.playbackRate += 0.01;
  }
}

function endGame() {
  const playerName = prompt("Game Over!\nYour Score: " + score + "\n請輸入你的名字：");
  if (!playerName) return;

  const now = new Date();
  const timestamp = now.toLocaleString();

  const leaderboard = JSON.parse(localStorage.getItem('bananaLeaderboard') || '[]');

  leaderboard.push({
    name: playerName,
    score: score,
    time: timestamp
  });

  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('bananaLeaderboard', JSON.stringify(leaderboard.slice(0, 5)));

  alert("分數已儲存！");
  location.reload();
}

function gameLoop() {
  if (!gameRunning) return;
  createNote(twinklePattern[step % twinklePattern.length]);
  step++;
  setTimeout(gameLoop, beatInterval);
}

function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('bananaLeaderboard') || '[]');
  const list = document.getElementById('leaderboard');
  leaderboard.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.score} 分 (${item.time})`;
    list.appendChild(li);
  });
}

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  gameRunning = true;
  updateStats();
  bgMusic.play();
  gameLoop();
});

loadLeaderboard();

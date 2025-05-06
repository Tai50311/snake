// --- Firebase 初始化 ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- 遊戲邏輯 ---
const lanes = document.querySelectorAll('.lane');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const highscoreSpan = document.getElementById('highscore');
const bgMusic = document.getElementById('bg-music');

let score = 0;
let lives = 5;
let baseSpeed = 2;
let beatInterval = 600;
let highScore = localStorage.getItem('bananaHighScore') || 0;

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
  const key = e.key.toLowerCase();
  const lane = Array.from(lanes).find(l => l.dataset.key === key);
  if (!lane) return;

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
  document.getElementById('nameInput').style.display = 'block';
}

function submitScore() {
  const name = document.getElementById('playerName').value.trim();
  if (!name) return alert("Please enter your name!");

  const record = {
    name,
    score,
    time: new Date().toLocaleString()
  };

  db.ref('leaderboard').push(record);
  alert("Score submitted!");
  location.reload();
}

function loadLeaderboard() {
  const board = document.getElementById('leaderboard');
  db.ref('leaderboard')
    .orderByChild('score')
    .limitToLast(10)
    .on('value', snapshot => {
      board.innerHTML = '';
      const scores = [];
      snapshot.forEach(child => scores.unshift(child.val()));
      scores.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score} (${entry.time})`;
        board.appendChild(li);
      });
    });
}

let step = 0;
function gameLoop() {
  createNote(twinklePattern[step % twinklePattern.length]);
  step++;
  setTimeout(gameLoop, beatInterval);
}

// Start
updateStats();
bgMusic.play();
gameLoop();
loadLeaderboard();

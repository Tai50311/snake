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

// Twinkle rhythm pattern
const twinklePattern = ["a", "a", "s", "s", "d", "d", "s", null, "f", "f", "d", "d", "a", "a", "s", null];

// 🎵 Map note sounds
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
    if (top >= 400 && top <= 500) { // 🎯 easier catch window
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
      adjustSpeed();  // 🚀 Accelerate more after every catch
      return;
    }
  }
});

function adjustSpeed() {
    // 🚀 Increase fall speed much faster
    baseSpeed += 0.1;  // instead of 0.03 before
  
    // 🚀 Increase background music playback speed faster
    if (bgMusic) {
      bgMusic.playbackRate += 0.01;  // instead of 0.002 before
    }
  }
  

function endGame() {
  alert("Game Over!\nYour Score: " + score);
  location.reload();
}

let step = 0;
function gameLoop() {
  createNote(twinklePattern[step % twinklePattern.length]);
  step++;

  // Instead of fixed beatInterval, adjust dynamically if you want (optional)
  setTimeout(gameLoop, beatInterval);
}

// 🚀 Start everything
updateStats();
bgMusic.play();
gameLoop();

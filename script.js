/* 💌 MEKTUP */
const letterBtn     = document.getElementById('letterBtn');
const letterContent = document.getElementById('letterContent');
const envelopeEl    = document.getElementById('envelope');
let letterOpen = false;

letterBtn.addEventListener('click', () => {
  if (!letterOpen) {
    letterContent.style.display = 'block';
    envelopeEl.style.display    = 'none';
    letterBtn.textContent        = 'Kapat ✕';
    letterOpen = true;
  } else {
    letterContent.style.display = 'none';
    envelopeEl.style.display    = 'block';
    letterBtn.textContent        = 'Mektubu Aç 💌';
    letterOpen = false;
  }
});

const trigger    = document.getElementById("funnyTrigger");
const bubble     = document.getElementById("speechBubble");
const bubbleText = document.getElementById("bubbleText");
const loveText   = document.getElementById("loveText");

const canvas = document.getElementById("heartCanvas");
const ctx    = canvas.getContext("2d");

let isOpen          = false;
let currentIndex    = 0;
let intervalId      = null;
let autoCloseTimeout = null;
let hearts          = [];
let animationId     = null;

const funnyTexts = [
  "O gün ciddiyim deyip 5 saniye sonra gülmeye başlamıştın 🤡",
  "Ben romantik bir şey anlatırken senin pat diye acıktığını söylemen…",
  "Navigasyon yokken 'ben yolu biliyorum' deyip kaybolmamız 😅",
  "Sessiz olalım deyip en yüksek sesi SEN çıkarmıştın",
  "Buna gülme deyip 10 dakika kahkaha attığımız an 😂",
  "Ve evet… her hâlinle seni çok seviyorum ❤️"
];

function startTextRotation() {
  bubbleText.textContent = funnyTexts[currentIndex];
  intervalId = setInterval(() => {
    currentIndex++;
    if (currentIndex < funnyTexts.length) {
      bubbleText.textContent = funnyTexts[currentIndex];
    } else {
      clearInterval(intervalId);
      autoCloseTimeout = setTimeout(() => {
        resetBubble();
        startHeartExplosion();
      }, 3000);
    }
  }, 3000);
}

function resetBubble() {
  clearInterval(intervalId);
  clearTimeout(autoCloseTimeout);
  intervalId       = null;
  autoCloseTimeout = null;
  currentIndex     = 0;
  bubble.style.display = "none";
  isOpen = false;
}

/* ❤️ CANVAS */
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createHeart() {
  return {
    x:      canvas.width / 2,
    y:      canvas.height / 2,
    size:   Math.random() * 18 + 12,
    speedX: (Math.random() - 0.5) * 8,
    speedY: (Math.random() - 0.5) * 8,
    alpha:  1
  };
}

function drawHeart(x, y, size, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = "#ff2f68";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - size, y - size, x - size * 2, y + size / 2, x, y + size * 2);
  ctx.bezierCurveTo(x + size * 2, y + size / 2, x + size, y - size, x, y);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach((heart, i) => {
    heart.x     += heart.speedX;
    heart.y     += heart.speedY;
    heart.alpha -= 0.01;
    drawHeart(heart.x, heart.y, heart.size, heart.alpha);
    if (heart.alpha <= 0) hearts.splice(i, 1);
  });
  if (hearts.length > 0) {
    animationId = requestAnimationFrame(animateHearts);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showLoveText();
  }
}

function startHeartExplosion() {
  hearts = [];
  loveText.classList.remove("show");
  for (let i = 0; i < 40; i++) hearts.push(createHeart());
  animateHearts();
}

function showLoveText() {
  setTimeout(() => {
    loveText.classList.add("show");
    setTimeout(() => {
      loveText.classList.remove("show");
      loveText.classList.add("hide");
      setTimeout(() => loveText.classList.remove("hide"), 2000);
    }, 5000);
  }, 300);
}

trigger.addEventListener("click", () => {
  if (!isOpen) {
    bubble.style.display = "block";
    isOpen = true;
    startTextRotation();
  } else {
    resetBubble();
  }
});

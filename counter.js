/* ⏱️ BİRLİKTELİK SAYACI (yukarı sayar) */
const startDate = new Date('2025-10-26T00:00:00');

function updateCounter() {
  const diff         = Date.now() - startDate;
  const totalSeconds = Math.floor(diff / 1000);

  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById('days').textContent    = String(days).padStart(3, '0');
  document.getElementById('hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

/* 💍 DÜĞÜN GERİ SAYIMI (aşağı sayar) */
const weddingDate = new Date('2026-08-22T00:00:00');

function updateWeddingCounter() {
  const diff = weddingDate - Date.now();

  if (diff <= 0) {
    ['w-days', 'w-hours', 'w-minutes', 'w-seconds'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    document.querySelector('.wedding-title').textContent = 'Evlendik! 🎊';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);

  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById('w-days').textContent    = String(days).padStart(3, '0');
  document.getElementById('w-hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('w-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('w-seconds').textContent = String(seconds).padStart(2, '0');
}

updateCounter();
updateWeddingCounter();
setInterval(() => { updateCounter(); updateWeddingCounter(); }, 1000);

/* ============================================================
   FİREBASE REST API + EventSource (SDK gerektirmez)
   ============================================================ */
const DB = 'https://evlilik-c4250-default-rtdb.firebaseio.com/liste_data.json';

/* ============================================================
   VERİ: Varsayılan kategoriler
   ============================================================ */
const DEFAULT_CATEGORIES = [
  {
    id: 'mutfak',
    icon: '🍳',
    title: 'Mutfak',
    items: [
      'Buzdolabı',
      'Çamaşır makinesi',
      'Bulaşık makinesi',
      'Fırın / Ocak',
      'Mikrodalga fırın',
      'Tencere & tava seti',
      'Bıçak seti',
      'Tabak & kase seti',
      'Bardak seti',
      'Çatal kaşık takımı',
      'Kahve makinesi',
      'Su ısıtıcı (kettle)',
      'Çöp kutusu',
    ]
  },
  {
    id: 'yatak',
    icon: '🛏️',
    title: 'Yatak Odası',
    items: [
      'Karyola / Baza',
      'Yatak / Sünger',
      'Yorgan',
      'Nevresim takımı',
      'Yastık',
      'Şifonyer / Gardırop',
      'Komodin',
      'Ayna',
      'Abajur / Gece lambası',
    ]
  },
  {
    id: 'oturma',
    icon: '🛋️',
    title: 'Oturma Odası',
    items: [
      'Koltuk takımı',
      'Televizyon',
      'TV ünitesi',
      'Orta sehpa',
      'Halı',
      'Perde',
      'Yastık & kırlent',
    ]
  },
  {
    id: 'banyo',
    icon: '🚿',
    title: 'Banyo',
    items: [
      'Havlu seti',
      'Banyo paspası',
      'Duş başlığı',
      'Sabunluk seti',
      'Tuvalet fırçası',
      'Ayna',
    ]
  },
  {
    id: 'genel',
    icon: '🏠',
    title: 'Genel',
    items: [
      'Elektrikli süpürge',
      'Ütü & ütü masası',
      'Klima',
      'Vantilatör',
      'Paspas & fırça seti',
      'Çamaşır askısı',
    ]
  }
];

/* ============================================================
   STATE
   ============================================================ */
let state       = {};   // { "mutfak__Buzdolabı": true, ... }
let customItems = [];   // [{ id, category, text }, ...]
let deletedKeys = [];   // ["mutfak__Buzdolabı", ...]

/* ============================================================
   EventSource — Anlık dinleme
   ============================================================ */
let source = null;

function connect() {
  if (source) source.close();

  source = new EventSource(DB);

  source.addEventListener('put', (e) => {
    try {
      const payload = JSON.parse(e.data);
      if (payload.data !== null && payload.data !== undefined) {
        const parsed  = JSON.parse(payload.data);
        state         = parsed.state       || {};
        customItems   = parsed.customItems || [];
        deletedKeys   = parsed.deletedKeys || [];
      } else {
        state = {}; customItems = []; deletedKeys = [];
      }
    } catch (_) {
      state = {}; customItems = []; deletedKeys = [];
    }
    render();
  });

  source.addEventListener('patch', (e) => {
    // Firebase bazen patch gönderir; tam veriyi yeniden çek
    fetchOnce();
  });

  source.onopen = () => {
    setDot(true);
  };

  source.onerror = () => {
    setDot(false);
    // Bağlantı kesilirse EventSource zaten otomatik yeniden dener
  };
}

function fetchOnce() {
  fetch(DB)
    .then(r => r.json())
    .then(raw => {
      if (raw) {
        try {
          const parsed  = JSON.parse(raw);
          state         = parsed.state       || {};
          customItems   = parsed.customItems || [];
          deletedKeys   = parsed.deletedKeys || [];
        } catch (_) {
          state = {}; customItems = []; deletedKeys = [];
        }
      }
      render();
    })
    .catch(() => render());
}

function setDot(connected) {
  const dot = document.getElementById('syncDot');
  if (!dot) return;
  dot.className = 'sync-dot ' + (connected ? 'connected' : 'disconnected');
  dot.title     = connected ? 'Bağlı — anlık senkronize' : 'Bağlantı kesildi';
}

connect();

/* ============================================================
   KAYDETME
   ============================================================ */
async function saveAll() {
  try {
    await fetch(DB, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(JSON.stringify({ state, customItems, deletedKeys }))
    });
  } catch (err) {
    console.error('Kayıt hatası:', err);
  }
}

/* ============================================================
   KATEGORİ HESAPLAMA
   ============================================================ */
function getFullCategories() {
  const defaultTitlesLower = DEFAULT_CATEGORIES.map(c => c.title.toLowerCase());

  const extraNames = [...new Set(
    customItems
      .filter(ci => !defaultTitlesLower.includes(ci.category.toLowerCase()))
      .map(ci => ci.category)
  )];

  return [
    ...DEFAULT_CATEGORIES,
    ...extraNames.map(name => ({
      id:    'extra__' + name.toLowerCase().replace(/\s+/g, '_'),
      icon:  '📦',
      title: name,
      items: []
    }))
  ];
}

function customItemsOfCat(catTitle) {
  return customItems.filter(ci => ci.category.toLowerCase() === catTitle.toLowerCase());
}

function activeDefaultItems(cat) {
  return cat.items.filter(item => !deletedKeys.includes(`${cat.id}__${item}`));
}

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  const container = document.getElementById('categories');
  container.innerHTML = '';

  getFullCategories().forEach(cat => {
    const catCustom  = customItemsOfCat(cat.title);
    const catDefault = activeDefaultItems(cat);

    if (catDefault.length === 0 && catCustom.length === 0) return;

    const total   = catDefault.length + catCustom.length;
    const checked = catDefault.filter(item => state[`${cat.id}__${item}`]).length
                  + catCustom.filter(ci   => state[`custom__${ci.id}`]).length;

    const defaultRows = catDefault.map(item => {
      const key = `${cat.id}__${item}`;
      return rowHtml(key, item, state[key], cat.id, null);
    }).join('');

    const customRows = catCustom.map(ci => {
      const key = `custom__${ci.id}`;
      return rowHtml(key, ci.text, state[key], cat.id, ci.id);
    }).join('');

    const section = document.createElement('div');
    section.className = 'cat-section';
    section.innerHTML = `
      <div class="cat-header">
        <h2>${cat.icon} ${cat.title}</h2>
        <span class="cat-count" id="count_${cat.id}">${checked} / ${total}</span>
      </div>
      <ul class="item-list">
        ${defaultRows}
        ${customRows}
      </ul>`;

    container.appendChild(section);
  });

  attachEvents();
  updateProgress();
  updateDatalist();
}

function rowHtml(key, text, checked, catId, customId) {
  const doneClass   = checked ? 'done' : '';
  const checkedAttr = checked ? 'checked' : '';
  const customAttr  = customId ? `data-custom-id="${customId}"` : '';

  return `
    <li class="item ${doneClass}">
      <label>
        <input type="checkbox" ${checkedAttr}
               data-key="${key}" data-cat="${catId}">
        <span class="checkmark"></span>
        <span class="item-text">${text}</span>
      </label>
      <button class="delete-btn" data-key="${key}" ${customAttr} title="Sil">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </li>`;
}

/* ============================================================
   EVENTS
   ============================================================ */
function attachEvents() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      state[cb.dataset.key] = cb.checked;
      cb.closest('li').classList.toggle('done', cb.checked);
      updateCatCount(cb.dataset.cat);
      updateProgress();
      saveAll();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key      = btn.dataset.key;
      const customId = btn.dataset.customId;

      delete state[key];

      if (customId) {
        customItems = customItems.filter(ci => ci.id !== customId);
      } else {
        if (!deletedKeys.includes(key)) deletedKeys.push(key);
      }

      saveAll();
    });
  });
}

/* ============================================================
   GÜNCELLEME YARDIMCILARI
   ============================================================ */
function updateCatCount(catId) {
  const cat = getFullCategories().find(c => c.id === catId);
  if (!cat) return;
  const catCustom  = customItemsOfCat(cat.title);
  const catDefault = activeDefaultItems(cat);
  const total   = catDefault.length + catCustom.length;
  const checked = catDefault.filter(item => state[`${cat.id}__${item}`]).length
                + catCustom.filter(ci   => state[`custom__${ci.id}`]).length;
  const el = document.getElementById(`count_${catId}`);
  if (el) el.textContent = `${checked} / ${total}`;
}

function updateProgress() {
  let total = 0, done = 0;
  getFullCategories().forEach(cat => {
    activeDefaultItems(cat).forEach(item => {
      total++;
      if (state[`${cat.id}__${item}`]) done++;
    });
    customItemsOfCat(cat.title).forEach(ci => {
      total++;
      if (state[`custom__${ci.id}`]) done++;
    });
  });
  const pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressText').textContent = `${done} / ${total} tamamlandı`;
}

function updateDatalist() {
  const dl = document.getElementById('catSuggestions');
  dl.innerHTML = getFullCategories()
    .map(c => `<option value="${c.title}">`)
    .join('');
}

/* ============================================================
   YENİ ÜRÜN EKLEME
   ============================================================ */
function addItem() {
  const itemInput = document.getElementById('itemInput');
  const catInput  = document.getElementById('catInput');

  const text     = itemInput.value.trim();
  const category = catInput.value.trim();
  if (!text || !category) return;

  customItems.push({ id: Date.now().toString(), category, text });
  itemInput.value = '';
  saveAll();
}

document.getElementById('addBtn').addEventListener('click', addItem);
document.getElementById('itemInput').addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });
document.getElementById('catInput').addEventListener('keydown',  e => { if (e.key === 'Enter') addItem(); });

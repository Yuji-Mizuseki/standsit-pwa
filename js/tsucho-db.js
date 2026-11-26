// 貯筋通帳の保存（IndexedDB）。端末の中だけに保存し、外へは送らない。
(function () {
  const DB_NAME = 'chokin-tsucho';
  const STORE = 'entries';
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const st = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
          st.createIndex('date', 'date');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbp;
  }

  function localDate(d) {
    const z = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }

  async function add(entry) {
    const db = await open();
    const now = new Date();
    const row = Object.assign({ ts: now.getTime(), date: localDate(now) }, entry);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).add(row);
      req.onsuccess = () => { row.id = req.result; };   // 付いた番号を返す（あとで put するときに同じ行を書き換えるため）
      tx.oncomplete = () => resolve(row);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function all() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result.sort((a, b) => a.ts - b.ts));
      req.onerror = () => reject(req.error);
    });
  }

  // 1行まるごと書き換える（コラーゲンの日に写真を足すときに使う）
  async function put(row) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(row);
      tx.oncomplete = () => resolve(row);
      tx.onerror = () => reject(tx.error);
    });
  }

  // 写真を縮めて JPEG の Blob にする（長い辺 900px）。端末の中だけに保存する
  function shrinkPhoto(file, max) {
    max = max || 900;
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve(b) : reject(new Error('画像を変換できませんでした')), 'image/jpeg', 0.82);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像を読めませんでした')); };
      img.src = url;
    });
  }

  async function remove(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // 通帳の行を作る：預け入れ（運動）と、3日休むごとの引き出しを日付順に並べ、残高を付ける
  function ledger(entries, K, today) {
    today = today || new Date();
    const rows = [];
    entries = entries.filter(e => e.kind !== 'collagen');   // コラーゲンのハンコは運動の残高に混ぜない
    if (!entries.length) return { rows, balance: 0 };
    const byDate = {};
    entries.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
    const first = new Date(entries[0].date + 'T00:00:00');
    const end = new Date(localDate(today) + 'T00:00:00');
    let balance = 0, idle = 0;
    for (let d = new Date(first); d <= end; d.setDate(d.getDate() + 1)) {
      const key = localDate(d);
      const list = byDate[key];
      if (list && list.length) {
        idle = 0;
        list.forEach(e => {
          balance += e.stamps;
          rows.push({ type: 'in', date: key, entry: e, n: e.stamps, balance });
        });
      } else if (key !== localDate(today)) {   // 今日はまだ終わっていないので数えない
        idle++;
        // 持っているハンコより多くは消さない（マイナスにしない）
        const out = Math.min(K.WITHDRAW_STAMPS, balance);
        if (idle % K.WITHDRAW_DAYS === 0 && out > 0) {
          balance -= out;
          rows.push({ type: 'out', date: key, n: -out, balance });
        }
      }
    }
    return { rows, balance };
  }

  window.TSUCHO = { add, all, put, remove, ledger, localDate, shrinkPhoto };
})();

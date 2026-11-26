// 貯筋運動の画面部品：オリジナルのアイコン（SVG）と、動きの見本アニメ（棒人間）
(function () {
  const C = { line: '#1c2b45', accent: '#003884', accent2: '#3f7bd0', soft: '#e4eefb', mid: '#8b9ab3', seal: '#d9381e', vit: '#ffa000', vit2: '#ef6c00' };

  // ===== オリジナルアイコン（線画・アプリの配色） =====
  const ICONS = {
    // 座位：いすと座る人
    sit: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="20" cy="9" r="4" fill="currentColor" stroke="none"/>
      <path d="M20 27h9v12" stroke="#d3d7de"/><path d="M20 15v12h12v12"/><path d="M8 24v16M8 30h16M24 30v10" stroke="${C.mid}"/></svg>`,
    // 立位：立つ人といすの背
    stand: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="8" r="4" fill="currentColor" stroke="none"/>
      <path d="M18 14v14M18 28l-4 12M18 28l4 12M18 19l12 5"/><path d="M34 18v22M34 30h8M42 30v10" stroke="${C.mid}"/></svg>`,
    // 貯筋通帳：通帳と筋肉の山
    book: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="6" width="30" height="36" rx="4"/>
      <path d="M9 14h30" stroke="${C.vit}"/><path d="M15 34l6-8 5 5 7-10" stroke="${C.vit}"/></svg>`,
    // 計測：カメラの目と関節の点
    camera: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="13" width="36" height="26" rx="6"/><path d="M17 13l3-5h8l3 5"/>
      <circle cx="24" cy="26" r="7"/><circle cx="24" cy="26" r="2" fill="${C.vit}" stroke="none"/></svg>`,
    // ハンコ：朱の丸印に力こぶ（オリジナル）
    stamp: `<svg viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="24" r="18" stroke="${C.seal}" stroke-width="3.5"/>
      <circle cx="24" cy="24" r="13.5" stroke="${C.seal}" stroke-width="1.5" opacity=".6"/>
      <path d="M15 30c1-6 4-11 8-12 2 0 3 2 2 4-1 1-3 1-3 3 2 1 6 0 9-1 2 0 3 2 2 4-3 2-12 3-18 2z" fill="${C.seal}"/></svg>`,
    // ふつうのはやさ：リズム（拍の点）
    rhythm: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 30c5-12 9-12 12 0s7 12 12 0 7-12 12 0" stroke="currentColor" opacity=".55"/>
      <circle cx="12" cy="22" r="3" fill="${C.vit}" stroke="none"/><circle cx="24" cy="30" r="3" fill="${C.vit}" stroke="none"/><circle cx="36" cy="22" r="3" fill="${C.vit}" stroke="none"/></svg>`,
    // コラーゲン：グラスとしずく（オリジナル）
    // 粉末コラーゲン：さじに盛った粉と、こぼれる粒（オリジナル）
    collagen: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M27 31l15 9"/>
      <path d="M6 28c0 6 6 9 12 9s13-3 13-8z" fill="#fff"/>
      <path d="M8 28c1-6 6-10 11-10s10 4 11 10z" fill="#fff" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="14" cy="11" r="1.8" fill="${C.vit}" stroke="none"/><circle cx="21" cy="8" r="1.8" fill="${C.vit}" stroke="none"/>
      <circle cx="27" cy="12" r="1.8" fill="${C.vit}" stroke="none"/></svg>`,
    // 料理の写真：お皿とカメラの枠（オリジナル）
    dish: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 14V8h6M36 8h6v6M42 34v6h-6M12 40H6v-6"/><ellipse cx="24" cy="27" rx="13" ry="7"/><path d="M15 25c2-5 6-7 9-7s7 2 9 7"/></svg>`,
    // ハンコ1つ分（通帳のマス用）：押してある／まだ
    seal: on => on
      ? `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="${C.seal}" stroke-width="3" transform="rotate(-8 20 20)"/>
          <path d="M12 25c1-5 3-9 7-10 2 0 2 2 1 3-1 1-2 1-2 3 2 1 5 0 7-1 2 0 2 2 1 3-2 2-9 3-14 2z" fill="${C.seal}"/></svg>`
      : `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="${C.mid}" stroke-width="1.5" stroke-dasharray="3 3" opacity=".6"/></svg>`,
    // ゆっくり：砂時計
    slow: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 7h20M14 41h20M16 7c0 10 16 10 16 17S16 31 16 41M32 7c0 10-16 10-16 17s16 7 16 17"/>
      <path d="M19 38c2-4 8-4 10 0z" fill="${C.vit}" stroke="none"/></svg>`,
    // やさしい／ふつう／しっかり：段の高さ
    level: n => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
      ${[0, 1, 2].map(i => `<rect x="${8 + i * 12}" y="${32 - i * 9}" width="9" height="${10 + i * 9}" rx="2"
        fill="${i < n ? C.vit : 'none'}" stroke="${i < n ? C.vit : 'currentColor'}" opacity="${i < n ? 1 : .45}"/>`).join('')}</svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
    flip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 10v4h4l5 4V6L8 10z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`,
  };

  // ===== 動きの見本アニメ =====
  // 4秒で 休み→動く→休み（上げ2秒・下げ2秒＝ゆっくりのお手本）
  function figure(exId, opts) {
    opts = opts || {};
    const K = window.KYOKIN;
    const media = K.MEDIA[exId];
    if (media && !opts.forceSvg) {
      return media.type === 'video'
        ? `<video src="${media.src}" autoplay loop muted playsinline class="ky-media"></video>`
        : `<img src="${media.src}" alt="" class="ky-media">`;
    }
    const pose = K.POSES[exId];
    if (!pose) return '';
    const dur = (opts.dur || 4) + 's';
    const ease = 'keySplines="0.45 0 0.55 1;0.45 0 0.55 1" calcMode="spline" keyTimes="0;0.5;1"';
    const pt = p => p.join(',');
    const anim = (attr, a, b) => `<animate attributeName="${attr}" values="${a};${b};${a}" dur="${dur}" repeatCount="indefinite" ${ease}/>`;
    const A = pose.A, B = pose.B;

    let scene = '';
    if (pose.scene === 'chair') scene = `<path d="M22 68h30M24 68v36M50 68v36M22 68V40" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>`;
    if (pose.scene === 'hold')  scene = `<path d="M76 46v58M76 74h20M94 74v30" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>`;
    if (pose.scene === 'floor') scene = `<rect x="4" y="99" width="110" height="5" rx="2" fill="rgba(255,255,255,.2)"/>`;
    const floor = `<path d="M6 104h108" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;

    let body;
    if (pose.scene === 'front') {
      const leg = (a, b) => `<polyline fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" points="${a.map(pt).join(' ')}">
        ${anim('points', a.map(pt).join(' '), b.map(pt).join(' '))}</polyline>`;
      body = `
        <path d="M76 46v58M66 70h20" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>
        <line x1="${A.sh[0]}" y1="${A.sh[1]}" x2="${A.hip[0]}" y2="${A.hip[1]}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        <path d="M40 30l-6 18M60 30l12 16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <path d="M44 58h12" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        ${leg(A.legL, B.legL)}
        <polyline fill="none" stroke="${C.vit}" stroke-width="5" stroke-linecap="round" points="${A.legR.map(pt).join(' ')}">
          ${anim('points', A.legR.map(pt).join(' '), B.legR.map(pt).join(' '))}</polyline>
        <circle cx="${A.head[0]}" cy="${A.head[1]}" r="8" fill="#fff"/>`;
    } else {
      const chain = q => [q.sh, q.hip, q.knee, q.ankle, q.toe].map(pt).join(' ');
      const arm = q => [q.sh, q.hand].map(pt).join(' ');
      // 奥の脚（横から見て体の向こう側）：少しずらして薄く描く。片足ずつの種目では休みの姿勢のまま
      const exDef = K.EXERCISES.find(e => e.id === exId);
      const B2 = exDef && exDef.perLeg ? A : B;
      const far = q => [q.hip, [q.knee[0] - 5, q.knee[1] - 2], [q.ankle[0] - 5, q.ankle[1]], [q.toe[0] - 5, q.toe[1]]].map(pt).join(' ');
      body = `
        <polyline fill="none" stroke="#d3d7de" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" points="${far(A)}">
          ${anim('points', far(A), far(B2))}</polyline>
        <polyline fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${arm(A)}">
          ${anim('points', arm(A), arm(B))}</polyline>
        <polyline fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" points="${chain(A)}">
          ${anim('points', chain(A), chain(B))}</polyline>
        <circle r="8" fill="#fff" cx="${A.head[0]}" cy="${A.head[1]}">
          ${anim('cx', A.head[0], B.head[0])}${anim('cy', A.head[1], B.head[1])}</circle>`;
      // 動いている関節に印（どこを見て数えるか）
      const ex = K.EXERCISES.find(e => e.id === exId);
      const focus = { 'sit-toe': 'ankle', 'sit-heel': 'ankle', 'std-tiptoe': 'ankle', 'sit-knee': 'knee',
        'sit-thigh': 'hip', 'std-thigh': 'hip', 'std-chair': 'knee', 'sit-situp': 'hip', 'std-situp': 'hip' }[exId];
      if (ex && focus) {
        body += `<circle r="5" fill="none" stroke="${C.vit2}" stroke-width="2.5" cx="${A[focus][0]}" cy="${A[focus][1]}">
          ${anim('cx', A[focus][0], B[focus][0])}${anim('cy', A[focus][1], B[focus][1])}</circle>`;
      }
    }
    return `<svg viewBox="0 0 120 112" class="ky-fig" role="img" aria-label="動きの見本">${scene}${floor}${body}</svg>`;
  }

  window.KYOKIN_UI = { ICONS, figure, C };
})();

// 貯筋運動の種目定義（健康・体力づくり事業財団「貯筋運動プロジェクト」の座位・立位プログラム）
// 出典：https://www.health-net.or.jp/learn/tyokin/movie/ ・沢井史穂「筋肉は使えば増える！－貯筋運動のすすめ－」・福永哲夫「貯筋のススメ」(2024)
//
// 判定のしくみ（モーションキャプチャ＝MediaPipe Pose）
//   1. 種目ごとに「見る角度」を1つ決める（例：膝伸ばし＝股関節-膝-足首の角度）
//   2. 計測開始の直前に、休みの姿勢の角度を「基準」として測る（キャリブレーション）
//   3. 基準からの変化量で 動き始め → 上がりきり → もどり を判定し、1回と数える
//   4. 1回ごとに「かかった秒数」と「動きの大きさ（上がりきった量）」を記録して採点する
//
// 数字（しきい値）はまだ実機で詰めていない初期値。Redmi Note 11 で試して調整する。

(function () {
  const L = {
    nose: 0,
    lShoulder: 11, rShoulder: 12,
    lHip: 23, rHip: 24,
    lKnee: 25, rKnee: 26,
    lAnkle: 27, rAnkle: 28,
    lHeel: 29, rHeel: 30,
    lFoot: 31, rFoot: 32,
  };

  function angle(a, b, c) {
    const r = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let d = Math.abs(r * 180 / Math.PI);
    if (d > 180) d = 360 - d;
    return d;
  }
  // 体幹（肩の中点→腰の中点）が鉛直から何度傾いているか
  function torsoFromVertical(lm) {
    const sx = (lm[11].x + lm[12].x) / 2, sy = (lm[11].y + lm[12].y) / 2;
    const hx = (lm[23].x + lm[24].x) / 2, hy = (lm[23].y + lm[24].y) / 2;
    return Math.abs(Math.atan2(sx - hx, hy - sy) * 180 / Math.PI);
  }
  // 左右それぞれで計算し、見えている側（visibility が高い側）を優先する
  function bothSides(lm, fnL, fnR, idsL, idsR, pick) {
    const vis = ids => Math.min(...ids.map(i => (lm[i].visibility ?? 1)));
    const vl = vis(idsL), vr = vis(idsR);
    const a = fnL(), b = fnR();
    if (vl < 0.35 && vr < 0.35) return null;
    if (vl < 0.35) return { v: b, side: 'R' };
    if (vr < 0.35) return { v: a, side: 'L' };
    // near：カメラ側（よく見えている方）の脚だけを見る。片足ずつの種目で、隠れた脚の揺れを数えないため
    if (pick === 'near') return vl >= vr ? { v: a, side: 'L' } : { v: b, side: 'R' };
    return pick === 'max' ? (a >= b ? { v: a, side: 'L' } : { v: b, side: 'R' })
                          : (a <= b ? { v: a, side: 'L' } : { v: b, side: 'R' });
  }

  const knee = (lm, s) => s === 'L' ? angle(lm[L.lHip], lm[L.lKnee], lm[L.lAnkle]) : angle(lm[L.rHip], lm[L.rKnee], lm[L.rAnkle]);
  const hip  = (lm, s) => s === 'L' ? angle(lm[L.lShoulder], lm[L.lHip], lm[L.lKnee]) : angle(lm[L.rShoulder], lm[L.rHip], lm[L.rKnee]);
  const ankle = (lm, s) => s === 'L' ? angle(lm[L.lKnee], lm[L.lAnkle], lm[L.lFoot]) : angle(lm[L.rKnee], lm[L.rAnkle], lm[L.rFoot]);
  // 脚の開き（左右の大腿のなす角）：正面カメラ用
  function legSpread(lm) {
    const mx = (lm[23].x + lm[24].x) / 2, my = (lm[23].y + lm[24].y) / 2;
    const mid = { x: mx, y: my };
    return angle(lm[L.lAnkle], mid, lm[L.rAnkle]);
  }

  const LEG_L = [L.lHip, L.lKnee, L.lAnkle], LEG_R = [L.rHip, L.rKnee, L.rAnkle];
  const HIP_L = [L.lShoulder, L.lHip, L.lKnee], HIP_R = [L.rShoulder, L.rHip, L.rKnee];
  const ANK_L = [L.lKnee, L.lAnkle, L.lFoot], ANK_R = [L.rKnee, L.rAnkle, L.rFoot];
  const TORSO = [L.lShoulder, L.rShoulder, L.lHip, L.rHip];

  // must: 福永哲夫「貯筋のススメ」(2024) 図５で紹介されている4つ（いす・キック・アップ・おなか）＝必須運動。値は図の呼び名
  // dir: +1＝動くと角度が増える / -1＝減る
  // start: 動き始めとみなす変化量（度） / top: 上がりきったとみなす変化量（度）
  // good: 「しっかり動けた」とみなす変化量（度）＝フォーム採点の満点ライン
  // perLeg: 片足ずつの種目（通帳は両足で1セット）
  const EXERCISES = [
    // ===== 座位プログラム =====
    {
      id: 'sit-toe', program: 'sit', name: 'つま先上げ', muscle: 'すねの筋肉', camera: '横',
      how: 'いすに座り、かかとを床につけたまま、つま先をゆっくり上げて下ろします。',
      joints: ANK_L.concat(ANK_R),
      measure: lm => bothSides(lm, () => ankle(lm, 'L'), () => ankle(lm, 'R'), ANK_L, ANK_R, 'min'),
      dir: -1, start: 4, top: 10, good: 18, perLeg: false,
    },
    {
      id: 'sit-heel', program: 'sit', name: 'かかと上げ', muscle: 'ふくらはぎ', camera: '横',
      how: 'いすに座り、つま先を床につけたまま、かかとをゆっくり上げて下ろします。',
      joints: ANK_L.concat(ANK_R),
      measure: lm => bothSides(lm, () => ankle(lm, 'L'), () => ankle(lm, 'R'), ANK_L, ANK_R, 'max'),
      dir: +1, start: 4, top: 10, good: 20, perLeg: false,
    },
    {
      id: 'sit-knee', must: 'キック', program: 'sit', name: '膝伸ばし', muscle: '太ももの前（大腿四頭筋）', camera: '横',
      how: 'いすに座り、片方の膝をゆっくり伸ばして、ゆっくり戻します。右足を1セット分やってから、向きを変えて左足を1セット分。',
      joints: LEG_L.concat(LEG_R),
      measure: lm => bothSides(lm, () => knee(lm, 'L'), () => knee(lm, 'R'), LEG_L, LEG_R, 'near'),
      dir: +1, start: 12, top: 35, good: 60, perLeg: true,
    },
    {
      id: 'sit-thigh', must: 'アップ', program: 'sit', name: 'もも上げ（座位）', muscle: '太ももの付け根（腸腰筋）', camera: '横',
      how: 'いすに座り、片方の太ももをゆっくり持ち上げて下ろします。右足を1セット分やってから、向きを変えて左足を1セット分。',
      joints: HIP_L.concat(HIP_R),
      measure: lm => bothSides(lm, () => hip(lm, 'L'), () => hip(lm, 'R'), HIP_L, HIP_R, 'near'),
      dir: -1, start: 6, top: 14, good: 25, perLeg: true,
    },
    {
      id: 'sit-situp', must: 'おなか', program: 'sit', name: '上体起こし（座位）', muscle: 'おなか（腹筋）', camera: '横',
      how: 'いすに浅く座り、おなかに力を入れたまま上体を後ろへ倒し、ゆっくり起こします。',
      joints: TORSO,
      measure: lm => {
        const v = Math.min(...TORSO.map(i => lm[i].visibility ?? 1));
        return v < 0.35 ? null : { v: torsoFromVertical(lm), side: '-' };
      },
      dir: +1, start: 5, top: 10, good: 20, perLeg: false,
    },
    // ===== 立位プログラム =====
    {
      id: 'std-chair', must: 'いす', program: 'stand', name: 'いす座り立ち', muscle: '脚とおしり（大腿四頭筋）', camera: '横',
      how: 'いすに座った姿勢から、ゆっくり立ち上がり、ゆっくり座ります。',
      joints: LEG_L.concat(LEG_R),
      measure: lm => bothSides(lm, () => knee(lm, 'L'), () => knee(lm, 'R'), LEG_L, LEG_R, 'max'),
      dir: +1, start: 12, top: 45, good: 65, perLeg: false,
    },
    {
      id: 'std-thigh', must: 'アップ', program: 'stand', name: 'もも上げ（立位）', muscle: '太ももの付け根（腸腰筋）', camera: '横',
      how: 'いすの背につかまって立ち、片方の太ももをゆっくり上げて下ろします。右足を1セット分やってから、向きを変えて左足を1セット分。',
      joints: HIP_L.concat(HIP_R),
      measure: lm => bothSides(lm, () => hip(lm, 'L'), () => hip(lm, 'R'), HIP_L, HIP_R, 'near'),
      dir: -1, start: 10, top: 30, good: 55, perLeg: true,
    },
    {
      id: 'std-side', program: 'stand', name: '横への脚上げ', muscle: 'おしりの横（中殿筋）', camera: '正面',
      how: 'いすの背につかまって立ち、片脚をゆっくり横へ上げて下ろします。右足を1セット分やってから、左足を1セット分。※この種目だけカメラは正面に置きます。',
      joints: [L.lHip, L.rHip, L.lAnkle, L.rAnkle],
      measure: lm => {
        const v = Math.min(...[L.lHip, L.rHip, L.lAnkle, L.rAnkle].map(i => lm[i].visibility ?? 1));
        return v < 0.35 ? null : { v: legSpread(lm), side: '-' };
      },
      dir: +1, start: 5, top: 14, good: 25, perLeg: true,
    },
    {
      id: 'std-tiptoe', program: 'stand', name: '背伸び', muscle: 'ふくらはぎ', camera: '横',
      how: 'いすの背につかまって立ち、かかとをゆっくり上げて背伸びし、ゆっくり下ろします。',
      joints: ANK_L.concat(ANK_R),
      measure: lm => bothSides(lm, () => ankle(lm, 'L'), () => ankle(lm, 'R'), ANK_L, ANK_R, 'max'),
      dir: +1, start: 4, top: 10, good: 20, perLeg: false,
    },
    {
      id: 'std-situp', must: 'おなか', program: 'stand', name: '床からの上体起こし', muscle: 'おなか（腹筋）', camera: '横',
      how: '床にあおむけで膝を立て、おへそをのぞき込むように上体をゆっくり起こして戻します。',
      joints: TORSO,
      measure: lm => {
        const v = Math.min(...TORSO.map(i => lm[i].visibility ?? 1));
        // あおむけ＝体幹がほぼ水平（鉛直から約90度）。起こすと鉛直に近づく＝角度が減る
        return v < 0.35 ? null : { v: torsoFromVertical(lm), side: '-' };
      },
      dir: -1, start: 6, top: 15, good: 30, perLeg: false,
    },
  ];

  // 歌「貯筋のテーマ」1番＝16回（スローペースだと8回）＝1セット（沢井史穂資料）
  const PACE = {
    normal: { label: 'ふつう', repsPerSet: 16, slowSec: null },
    slow:   { label: 'ゆっくり', repsPerSet: 8, slowSec: 3 },  // 1回3秒以上で「ゆっくりできた」
  };
  // 難易度：高齢者から若い人まで。range＝求める動きの大きさの倍率、sets＝1日の目標セット数
  //   slowSec＝「ゆっくり」で1回にかけてほしい秒数（しっかりは 1動作4秒）
  const LEVELS = {
    easy:   { label: 'やさしい', sub: '高齢の方・はじめての方', range: 0.7,  sets: 1, slowSec: 3 },
    normal: { label: 'ふつう',   sub: '公式の目標（1日2セット）', range: 1.0,  sets: 2, slowSec: 3 },
    hard:   { label: 'しっかり', sub: '体力に自信のある方・若い方', range: 1.25, sets: 3, slowSec: 4 },
  };
  const SETS_TARGET = 2;          // 各種目1日2セットが初期目標（＝ふつう）
  // 貯筋通帳はハンコで数える（公式は「1セット100円・3日休むと500円引き出し・月1万円」。同じ比率でハンコに置きかえ）
  const STAMP_PER_SET = 1;        // 1種目1セットでハンコ1つ
  const WITHDRAW_STAMPS = 5;      // 1種目もやらない日が3日続いたらハンコ5つ消える（公式の500円＝5セット分）
  const WITHDRAW_DAYS = 3;
  const MONTH_GOAL_STAMPS = 100;  // 1か月100こが目標（公式の月1万円）

  // 生成したイラスト・アニメ（Gemini / GPT / Higgsfield など）を置いたら、ここに登録すると自作の図と差し替わる
  //   例：'sit-knee': { type: 'video', src: '/standsit-pwa/img/kyokin/sit-knee.mp4' }
  //       'sit-toe':  { type: 'image', src: '/standsit-pwa/img/kyokin/sit-toe.webp' }
  //   置いたファイルは sw.js の PRECACHE_URLS にも足す
  const MEDIA = {};

  // 動きの見本（自作の棒人間アニメ）：休みの姿勢 A と 動いた姿勢 B を行き来する
  //   座標は 120×120 の枠。横向き（右を向く）。front:true は正面から見た図
  const S = { head: [40, 22], sh: [40, 34], hip: [40, 66], knee: [68, 66], ankle: [68, 96], toe: [78, 96], hand: [58, 62] };
  const T = { head: [50, 14], sh: [50, 26], hip: [50, 58], knee: [50, 80], ankle: [50, 102], toe: [60, 102], hand: [72, 50] };
  const P = (base, over) => Object.assign({}, base, over);
  const POSES = {
    'sit-toe':   { scene: 'chair', A: S, B: P(S, { toe: [75, 87] }) },
    'sit-heel':  { scene: 'chair', A: S, B: P(S, { knee: [68, 60], ankle: [69, 89] }) },
    'sit-knee':  { scene: 'chair', A: S, B: P(S, { ankle: [96, 70], toe: [99, 61] }) },
    'sit-thigh': { scene: 'chair', A: S, B: P(S, { knee: [64, 48], ankle: [67, 78], toe: [77, 78] }) },
    'sit-situp': { scene: 'chair', A: P(S, { hand: [50, 52] }), B: P(S, { head: [24, 30], sh: [30, 40], hand: [42, 55] }) },
    'std-chair': { scene: 'chair',
      A: P(S, { hand: [54, 46] }),
      B: { head: [56, 10], sh: [56, 22], hip: [58, 55], knee: [64, 77], ankle: [68, 96], toe: [78, 96], hand: [64, 36] } },
    'std-thigh': { scene: 'hold', A: T, B: P(T, { knee: [70, 60], ankle: [67, 82], toe: [77, 82] }) },
    'std-tiptoe':{ scene: 'hold', A: T, B: { head: [50, 7], sh: [50, 19], hip: [50, 51], knee: [50, 73], ankle: [53, 95], toe: [60, 102], hand: [72, 44] } },
    'std-situp': { scene: 'floor',
      A: { head: [14, 91], sh: [24, 94], hip: [54, 95], knee: [70, 76], ankle: [84, 99], toe: [92, 99], hand: [42, 93] },
      B: { head: [30, 72], sh: [35, 81], hip: [54, 95], knee: [70, 76], ankle: [84, 99], toe: [92, 99], hand: [56, 80] } },
    'std-side':  { scene: 'front',
      A: { head: [50, 14], sh: [50, 26], hip: [50, 58], legL: [[44, 58], [44, 102]], legR: [[56, 58], [56, 102]] },
      B: { head: [50, 14], sh: [50, 26], hip: [50, 58], legL: [[44, 58], [44, 102]], legR: [[56, 58], [78, 96]] } },
  };

  window.KYOKIN = { EXERCISES, PACE, LEVELS, SETS_TARGET, STAMP_PER_SET, WITHDRAW_STAMPS, WITHDRAW_DAYS, MONTH_GOAL_STAMPS, MEDIA, POSES };
})();

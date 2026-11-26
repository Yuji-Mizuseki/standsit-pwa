# 貯筋運動の見本イラスト・アニメ 生成用の指示文

アプリでは今、自作の棒人間アニメ（`js/kyokin-ui.js`）を出している。
生成した絵や動画ができたら `img/kyokin/<種目ID>.webp`（静止画）か `.mp4`（動画）に置き、
`js/kyokin-exercises.js` の `MEDIA` に登録し、`sw.js` の `PRECACHE_URLS` にも足すと差し替わる。

## 共通の指定（毎回先頭に付ける）

> Flat vector illustration, warm and friendly, for a health app for Japanese seniors.
> Soft cream background (#fff8f5), accent coral (#e8613a, #f4956e), dark brown outlines (#3a2820).
> One Japanese woman in her 60s with short gray hair, wearing a simple coral T-shirt and beige pants.
> Side view facing right (unless noted), full body visible, plain background, no text, no logos.
> Original character design — do not imitate any existing mascot or brand.

- 静止画は「休みの姿勢」と「動いた姿勢」の2枚を同じ構図・同じ人物で作る（A/B）
- 動画（Higgsfield など）は A→B→A を4秒・ゆっくり・ループできる動きで。正方形 1:1、512px 以上
- 体の向きはカメラを置く向きと同じにする（横向き。横への脚上げだけ正面）

## 種目ごと

| ID | 種目 | 休みの姿勢（A） | 動いた姿勢（B） |
|---|---|---|---|
| sit-toe | つま先上げ（座位） | 木のいすに座り、両足裏を床につける | かかとを床につけたまま、つま先を上げる |
| sit-heel | かかと上げ（座位） | 木のいすに座り、両足裏を床につける | つま先を床につけたまま、かかとを上げる |
| sit-knee | 膝伸ばし（座位） | 木のいすに座り、膝を90度 | 片方の膝をまっすぐ前に伸ばし、脚が床と平行 |
| sit-thigh | もも上げ（座位） | 木のいすに座る | 片方の太ももを座面から持ち上げる（膝は曲げたまま） |
| sit-situp | 上体起こし（座位） | いすに浅く座り、両手をおなかに当てる | おなかに力を入れたまま上体を後ろへ倒す（背もたれには付けない） |
| std-chair | いす座り立ち | 木のいすに座り、腕を胸の前で組む | いすの前でまっすぐ立つ |
| std-thigh | もも上げ（立位） | いすの背に片手をかけて立つ | 片方の太ももを腰の高さまで上げる |
| std-side | 横への脚上げ（**正面**） | いすの背に片手をかけて正面を向いて立つ | 片脚をまっすぐ横へ上げる |
| std-tiptoe | 背伸び | いすの背に手をかけて立つ | かかとを上げてつま先立ちになる |
| std-situp | 床からの上体起こし | マットにあおむけ、膝を立てる | おへそをのぞき込むように頭と肩を起こす |

＋「よい姿勢」（座位・立位）：背すじを伸ばし、あごを引いた姿勢の1枚ずつ。説明用。

## 注意
- 種目と動きの正本は 健康・体力づくり事業財団「貯筋運動プロジェクト」の動画
  （https://www.health-net.or.jp/learn/tyokin/movie/）。生成後、動画と見比べて動きが違わないか確かめる
- 公式の動画・イラストをそのまま写す・取り込む指示はしない（オリジナルで描く）

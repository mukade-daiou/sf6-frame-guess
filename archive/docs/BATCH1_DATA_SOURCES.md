# 出典と整合性の調査記録（2026-11-05）

## 優先1：Capcom公式
- マリーザ: https://www.streetfighter.com/6/ja-jp/character/marisa/frame
- 本調査環境で直接取得を試みたが403。数値のバルク取得は未達。
- 公式表をJina Reader経由で取得する第三者実装:
  https://github.com/HSRAsterismer/Street-Fighter/blob/main/scripts/sync-capcom-frame-data.js
- 当該第三者実装の保存JSONはリュウ等の `frameSource.fetchedAt` が2026-04-07。入力情報のパーサも `L`/`M`/`H` を失うケースがあり、そのまま本番に適用しない。
- Capcom公式データの転載・再配布条件は未確認。未確認のライセンスを記載しない。

## 優先2：SuperCombo Wiki由来（今回のステージング）
- 原典: https://wiki.supercombo.gg/w/Street_Fighter_6
- 正規化済み公開プロジェクト: https://github.com/RyoSogawa/sf6-sensei
- 対象コミット: `a0b4105fb368c308699ec0757ee6e4182e5a9d1c`（2026-11-02）
- JSON: `packages/data/src/generated/*.json`（確認時は32キャラクター）
- 一覧の生成日: 2026-11-01
- マリーザ・リュウの個別収集日: 2026-08-19
- 明記されたデータライセンス: CC BY-SA 4.0
  https://github.com/RyoSogawa/sf6-sensei/blob/main/NOTICE
  https://creativecommons.org/licenses/by-sa/4.0/
- データの構造化・日本語名の追加等の変更あり。日本語固有名が未収録の技もある。
- 2026-10-13のゲーム変更に対応済みかは、キャラ・技単位で未確認。

## クロスチェック候補
- https://frame-search.com/history
  2026-09-08にVer.2.0401.010全技の更新履歴あり（10月更新には未対応の可能性）。
- https://www.streetfighter.com/6/buckler/battle_change/20261013
  2026-10-13の変更リスト。既存技のバランス数値変更ではない不具合修正も含まれる。

## 本番移行判定
- 取得データの対象パッチを特定
- 全キャラ/全技の収録範囲を公式と突合
- 通常状態以外のバリエーションを除外
- ヒット時有利とダウン後有利、着地硬直、複数ヒットを区別
- 一意でない入力を処理
- 数値の公式再確認（差分がある技は必ず）
- 取得元の帰属とデータ再配布条件をアプリUIにも明記
- ローカルの `npm run validate:data` / `npm test` / `npm run build` 成功

今のステージングは上の完了を主張しない。

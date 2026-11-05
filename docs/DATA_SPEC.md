# データ仕様 v1.0.0

実行可能な定義は `src/lib/frame-data/schema.ts`（Zod）です。
完成した機械可読JSON Schemaは [character.schema.json](character.schema.json) と [metadata.schema.json](metadata.schema.json) です。
JSON Schemaに加えて、下記の意味的検証をローダーとZodの追加制約で行います。
更新時は `npx tsx scripts/validate-data.ts --write-schema` で再生成してください。

## 配置・取り込み

`data/metadata.json` は `schemaVersion: "1.0.0"`、`kind: "production"`、`gameVersion`、`label` を持ちます。
`data/characters/*.json` は1ファイル1キャラです。Fixtureは `src/data/fixtures/` に隔離しています。
全ファイルをビルド時に自動検出するため、アプリ側にIDやコマンド候補を追記する必要はありません。
URLでJSONを取得しないので、Pagesのリポジトリ配下でも絶対パスに依存しません。

Characterはid、nameJa、nameEn、gameVersion、source、coverage、movesを持ちます。
coverageはnormalとspecialそれぞれにstatus（complete/partial/unrecorded）とverification（verified/unverified）を指定します。
completeは対象範囲全体の不存在まで判断できる収録完了を意味します。未取得の技を不存在とするためにcompleteを使ってはいけません。

Moveはid、name、category（normal/special）、input、variant、frames、notes（文字列配列）、sourceを持ちます。
variantは基本版なら `{ "kind": "base", "condition": null }`、特殊条件版なら `{ "kind": "conditional", "condition": "条件の説明" }` です。
派生、強化、構え専用版をbaseと分類しないでください。技名や条件文はプレイ中には表示しません。

## 入力・比較キー

通常技例：`{ "type": "normal", "direction": "5", "button": "P", "strength": "L" }`

必殺技例：`{ "type": "special", "motion": "214", "button": "K", "strength": "OD" }`

通常技のdirectionは5/2、buttonはP/K、strengthはL/M/Hです。
必殺技のmotionは数字と角括弧による明示的なテンキー表記、strengthはL/M/H/OD/noneです。
コマンド候補を固定列挙しないので、検証済みの新しいテンキー入力をJSONに追加できます。
特殊な入力形式が表現できない場合はスキーマを明示的に拡張し、推測で既存コマンドに置換しません。

内部キーは `normal:5:P:L`、`special:214:K:OD` のように種別・方向/モーション・ボタン・強度を区切ります。
表示は5LP、214KK、[4]6MP、360P。ODはPP/KK、noneは強度記号なしです。
必殺技motionの外側空白を除去する以外、入力の同一視・別名展開は行いません。
通常技のOD、方向5/2以外、カテゴリとinput.typeの不一致は拒否します。

## フレーム値

framesはstartup、total、hit、blockを持ちます。各値は次の状態を区別します。

```json
{ "status": "confirmed", "display": "0", "numeric": 0 }
```

```json
{
  "status": "conditional",
  "display": "+4",
  "numeric": 4,
  "condition": "先端ヒット"
}
```

```json
{ "status": "not_applicable", "display": "-" }
```

```json
{ "status": "unknown", "display": null }
```

displayは全状態でnullを許します。confirmedでも表示未取得なら質問には使用しません。
numericは有限の数値で、displayが符号付き数値文字列として同じ値を表す場合のみ指定できます。
Dや10-12を数値化しません。unknownの表示に0を代入しません。
条件付き値は条件を保持し、自動で通常状態に適用しません。

totalは上記に加えてprovenance（source/verified_calculation/null）とcalculation（文字列/null）が必須です。
confirmedなtotalにはprovenanceが必須で、verified_calculationには計算式・検証根拠をcalculationに記録します。
全体Fは空振り時の動作全体です。原典の記載または技個別に検証した計算だけを使い、アプリでは計算しません。
飛び道具、着地、追加硬直、派生などを一律に計算する処理はありません。

## Sourceと検証

sourceはurl、retrievedAt（UTC ISO日時）、gameVersion、kind（official/community）、attribution、license、verificationを持ちます。
Fixtureのverifiedは架空データとしての整合性検証を意味し、SF6公式確認を意味しません。
実データには取得元の利用条件・必要な帰属を記録し、未確認のライセンスを推測で記入しないでください。

metadata・Character・Character.source・全Move.sourceのgameVersionは完全一致が必須です。
不正レコード、パッチ混在、重複キャラID、同一キャラの重複技IDはエラーとして対象から除外します。
同一基本入力の複数技は検出・報告し、実行時にはambiguousとして維持します。CLI検証は失敗します。
キャラの収録完了と、各表示モードの値の充足は別々に判定します。

## 実データ統合手順

1. 同一パッチのデータを収集し、JSON Schemaと付属Fixtureを形式の参考に1キャラ1JSONを作成します。
2. 対象状態・技範囲・全入力の収録を確認し、出典と検証状態、coverageを正しく記入します。
3. metadataのgameVersionと各出典のバージョンをそろえます。本番のkindはproductionです。
4. `npm run validate:data`、`npm test`、`npm run build` を実行します。
5. 2体以上が抽選対象になったことを確認し、Fixtureのチェックを外してプレイします。

データ収集・更新スクリプトは含めません。`scripts/create-fixtures.ts` は架空データを再生成するだけです。

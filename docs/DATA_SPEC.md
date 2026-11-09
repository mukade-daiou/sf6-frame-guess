# データ仕様 v1.0.0

現行の範囲採用対象は、同一入力・代表条件で飛び道具の到達時間または移動距離により変動する発生Fに限る。持続接触によるヒット・ガード硬直差は元の単一代表値を維持する。`distanceRanges.contactTimingRollback`に旧採用範囲、復元値、原典対応、撤回理由と候補分類変更を保存し、旧`decisions`や段階別調査記録は履歴として保持する。範囲値の型自体は引き続き符号付き値も検証するが、その型の存在は採用許可を意味しない。以降の段階別調査記述は各時点の履歴である。

第3段階のstage3は正式採用状態と独立した調査記録。itemsに原因グループ・取得資料ID・公開データの対応候補・必要証拠・measurement（実施有無と設計条件）を持つ。measurement.performed=falseは実測結果ではない。sourceIdsは本文未取得の候補を含み得るためsources.status/assessmentと合わせて読む。調査記録が存在するだけではFrameValueや候補classificationを変更しない。

第2段階の調査はheld-range-review.jsonのstage2.itemsへ、第1段階からの変更前状態・優先順位・取得資料・結論・次の証拠を保存する。候補reevaluation.stage2にも適用し、既存items300件とD46件を維持する。distanceRanges.decisionsの追加任意属性additionalEvidenceは保存HTMLのpath/url/requiredTextを持ち、公開資料の必要記載を生成時に照合する。ゲームのFrameValue構造は変更しない。

調査台帳の候補に任意の`reevaluation`を追加した。group（A〜D）は調査優先分類であり正式classificationとは独立する。previousClassification/previousReason、currentValues（技IDと再評価前値）、evidenceQuote、checkedSources、nextEvidenceを保存する。これはゲーム用FrameValueやMoveの採用状態を変更する属性ではない。

距離範囲の追補：`conditional.range`のmin/max/evidenceを維持し、符号付き表示も数値と照合する。片側表記は`conditional.openRange: { reference, unspecified: "trailing", evidence }`で原典の基準値と末尾未指定を記録する。数学的上下限は主張しない。range/openRange/numericは併用不可。根拠のないconditionalは引き続き表示不可。

第17段階のフィールド補完はdata/adoption-decisions.jsonのframeResearch.fieldDecisionsを参照する。変更前のunknown全体と変更後のFrameValue、元レコードID、原典表記、採用理由、調査台帳IDを保存する。台帳はstaging/stage17/frame-ledger.jsonで、原典の行番号・行全体・取得日時・検証状態を保持する。既存Move.sourceやrawを上書きせず、フィールド単位の補完元をこの対応表で追跡する。生成時は原典行・入力・変更前後の一致を検査し、無関係な確定値の置換を拒否する。

個別の固定代表条件はMove.representativeConditionにcondition/rawRef/cargoRefを持つ。第16段階で採用したジェイミー・Focus Forceに限り、元のconditional/held理由を注記と監査のbeforeレコードへ保持してbase/acceptedへ変更する。Focus Force Lv.1は2026-11-09ユーザー指定の合算代表値を採用し、通常L/M/Hのconfirmed.display/numericは23、ODは20。原典13+10/10+10は保存済みCargoとsourceNotation注記に残し、conditionalSpecials.startupDecisionsから再生成する。他の複合・条件値へ一般化しない。

基本必殺技の共通値展開はstrengthExpansion `{sourceMoveId, basis}`を持つ追加レコードとして保存する。元のstrength noneレコードは変更しない。採用済み基本版に限ってL/M/Hへフレーム・出典を複製し、明示強度レコードがある強度は生成しない。ODは入力候補とデータレコードを区別し、共通値からOD性能を生成しない。採用ルールの正本はADOPTION_RULES、再生成の有効化はadoption-decisionsのcommonSpecialStrengths.enabled。

共通タブからの質問はspecial入力のincludeSuperArts=trueで表現し、キーはcommand:motion:button:strength。保存済みSA入力のレベルは維持し、共通質問の検索時にのみレベルを指定せず基本必殺技/SAを照合する。原典や288採用レコードの複製・更新は行わない。

第15段階CではSAの項目別代表値をsuperArts.frameDecisionsから適用する。saEvidence.frameDecisionsに判断ID・対象項目・採用元原典行・参照・元表記・採用表示・理由を保持し、frameOrigins=user_representativeで原典の直接採用と区別する。基本行のsourceNotationは上書きしない。発動系の未展開テンプレートも欠損として扱い、activation_missing_ruleとして由来を記録する。

## 第15段階B：スーパーアーツ

技カテゴリ/input.typeは`super_art`も使用する。SA inputは`saLevel: 1|2|3`、motion、button P/K、strength L/M/H、adoptionBasisを持つ。キーは`super_art:level:motion:button:strength`。**SAは弱・中・強を独立した質問として扱う。ゲーム用フレーム値を共有していても、質問キーは統合しない。**

地上・通常状態・非ホールドの基本96枠を288レコードへ展開する。明示的強度値を優先し、原典P/K共通値は今回のユーザー指定による代表値として各強度へ採用する。実性能の同一性の確認とは区別する。saEvidenceに原典行、採用根拠、Cargo表記、項目別のsource/activation_missing_rule/unresolved、後続攻撃発生情報を保持する。CA・空中・ホールド・特殊状態・派生・強化・ストック消費版は取り込まない。

coverage.super_artは既存normal/specialと独立し、未設定/partialでは未収録入力を技なしにしない。SA coverageは抽選資格を減らさない。非攻撃発動5種だけ、発生以外の未記載項目を表示規則で`-`にできる。元から明示的な`-`はsourceとして区別し、存在する全体Fは保持する。攻撃系の欠損には適用しない。発動1Fと後続弾発生を分離し、発生欄は原典表の1Fを使用する。

720は専用2回転トークンで360と別。溜めSAは原典どおり`[4]646`を保持する。SAのODはない。以下の従来normal/special専用説明はそのカテゴリの規則として維持する。

実行可能な定義は `src/lib/frame-data/schema.ts`（Zod）です。
完成した機械可読JSON Schemaは [character.schema.json](character.schema.json) と [metadata.schema.json](metadata.schema.json) です。
JSON Schemaに加えて、下記の意味的検証をローダーとZodの追加制約で行います。
更新時は `npx tsx scripts/validate-data.ts --write-schema` で再生成してください。

## 配置・取り込み

`data/metadata.json` は `schemaVersion: "1.0.0"`、`kind: "production"`、`gameVersion`、`label` を持ちます。
第10段階の初期データはdatasetId `initial-2026-11-06`、updatePolicy `manual`を持ちます。datasetIdは採用データの識別子であり、gameVersionの代用ではありません。未確認のゲーム版はUNVERIFIEDのまま保持します。
`data/characters/*.json` は1ファイル1キャラです。Fixtureは `src/data/fixtures/` に隔離しています。
全ファイルをビルド時に自動検出するため、アプリ側にIDやコマンド候補を追記する必要はありません。
URLでJSONを取得しないので、Pagesのリポジトリ配下でも絶対パスに依存しません。

Characterはid、nameJa、nameEn、gameVersion、source、coverage、movesを持ちます。
coverageはnormalとspecialそれぞれにstatus（complete/partial/unrecorded）とverification（verified/unverified）を指定します。
completeは採用の基準とした原典一覧の対象範囲を収録したことを意味します。verificationは独立した信頼性の記録で、complete/unverifiedも許します。未取得のカテゴリをcompleteにしてはいけません。技なしは採用データセット内での不存在に限定します。

第10段階でCharacterとMoveへ任意のadoptionを追加しました。`{ "status": "accepted", "basis": "採用の根拠" }`またはstatus heldを指定します。Characterがaccepted、両coverageがcomplete、各技がacceptedまたは明示的heldなら採用対象にできます。heldは出題を保留し、通常状態が不明のvariantもunknownとします。衝突はambiguousで、値がunknownなら必要項目のモードに応じて質問を消費しません。

追加指定により`status: "excluded"`も使用します。仕様上対象外と判断したMoveを値・出典ごと保持し、質問候補・技の検索・強度なしの保留判定から除外します。excludedは未確定のheldとは異なります。Characterがacceptedで収録範囲がcompleteなら、明示的excludedを含んでも抽選できます。`adoption-decisions.json`のexcludedMoveIdsと根拠を正本として再生成します。

source.verificationがunverifiedでも明示的に採用できます。これをverifiedへ書き換える必要はありません。adoptionのない既存Fixture等は従来のverified条件を使い、過去のステージングを自動で採用しません。ODはLP+MP/LK+MKを基本とし、原典上で別性能の入力と明確に分かるものを個別に選別します。

Moveはid、name、category（normal/special/super_art）、input、variant、frames、notes（文字列配列）、sourceを持ちます。
variantは基本版なら `{ "kind": "base", "condition": null }`、特殊条件版なら `{ "kind": "conditional", "condition": "条件の説明" }` です。
派生、強化、構え専用版をbaseと分類しないでください。技名や条件文はプレイ中には表示しません。

## 入力・比較キー

通常技例：`{ "type": "normal", "direction": "5", "button": "P", "strength": "L" }`

必殺技例：`{ "type": "special", "motion": "214", "button": "K", "strength": "OD" }`

通常技のdirectionは5/2、buttonはP/K、strengthはL/M/Hです。
必殺技のmotionは数字と角括弧による明示的なテンキー表記、strengthはL/M/H/OD/noneです。
溜めの[4]6と[2]8は質問UIから利用できます。レバーの46／28という方向列だけを、この既存の入力キーへ明示的に対応付けます。溜め時間は測定しません。元レコードやフレーム値は変更しません。
`motion: "360"`は1回転を示す専用トークンです。方向3・6・0の列ではありません。時計回り・反時計回りは同じinputKeyを使い、同一技の重複質問を防ぎます。720は別の2回転トークンで、どちらもUI入力と候補クリックに対応します。画面は回転SVG、読み上げは「1回転＋弱P」等と元表記を使用します。
コマンド候補を固定列挙しないので、検証済みの新しいテンキー入力をJSONに追加できます。
特殊な入力形式が表現できない場合はスキーマを明示的に拡張し、推測で既存コマンドに置換しません。

第6段階でモーションなしの同時押しを追加しました。例：
`{ "type": "special", "motion": "none", "button": "K", "strength": "none", "buttonCombination": "LK+MK" }`。
`motion: "none"`ではボタンに対応する`LP+MP`または`LK+MK`と`strength: "none"`を必須とします。モーションありの入力にbuttonCombinationは指定できません。この組み合わせ制約はZodの追加検証で適用します。
キーは`special:buttons:LK+MK`、表示は`KK (LK+MK)`です。奮迅脚をODへ統合しません。既存入力のキーは変わりません。

内部キーは `normal:5:P:L`、`special:214:K:OD` のように種別・方向/モーション・ボタン・強度を区切ります。
表示は5LP、214KK、[4]6MP、360P。ODはPP/KK、noneは強度記号なしです。
必殺技motionの外側空白を除去する以外、入力の同一視・別名展開は行いません。
通常技のOD、方向5/2以外、カテゴリとinput.typeの不一致は拒否します。

## フレーム値

### 括弧付き原典表記の採用方針（2026-11-06ユーザー指定）

`9(19)`のように括弧の外に数値がある場合、今後は原則として括弧外の値をゲーム用の代表値として採用します。原典が別の通常値を明示するなど明確な矛盾がある場合は個別に扱います。括弧から範囲を作ったり、存在しない数値を補完したりはしません。Dの扱いは従来どおりです。

元表記と採用判断をnotes・adoption-decisionsへ保存します。ゲーム用数値の採用は、原典の条件解釈・現行パッチ・公式検証とは別です。frameのconfirmedはゲームで使う値を確定した意味でも使用し、source.verificationをverifiedへ変更しません。今回のケンOD龍尾脚は明示的に9Fを採用します。

これは今後の手動取り込み・判断に使う方針で、自動取得や既存全データの一括置換は行いません。初期データの更新には明示的な指示と新しいdatasetIdを引き続き必要とします。

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
第7段階の標準条件は、通常状態・原則立ちの相手・画面中央・通常ヒット/ガード・非ホールド・派生なしです。全体Fは空振り時を使用します。立ちガードが成立しない下段はしゃがみガードを使用し、非攻撃の構え・移動技では攻撃発生を適用対象外とします。技別の例外と元表記は監査JSONに記録します。

第14段階後の追加指定で、距離依存の技は遠距離の値を標準とします。同じボタンでも距離で性能が変わらない技はその性能を維持します。遠距離と明示した原典値がない場合、近距離値から計算・推測しません。

原典注記から標準条件の値を選択できる場合は、その根拠と元表記を保持して正規化します。条件が残る場合、同じ指標の上下限が確定したときだけconditionalにrangeを付けて`20~30`のように表示します。例（架空の形式例）:

```json
{
  "status": "conditional",
  "display": "20~30",
  "condition": "標準条件内での同一指標の変動条件",
  "range": {
    "min": 20,
    "max": 30,
    "evidence": ["https://example.invalid/range-evidence"]
  }
}
```

rangeには有限のmin/max、順序、表示との一致、根拠URLを要求し、単一のnumericと併存させません。括弧内外が同じ指標の端点であるという根拠なしに範囲を生成しません。rangeのないconditional、unknown、表示未取得は「不明」で、質問を消費しません。確定範囲は1回消費します。ダウンはDで、ダウン後有利Fを通常硬直差の範囲として扱いません。通常モードは4項目、発生のみは発生について判定します。

totalは上記に加えてprovenance（source/verified_calculation/null）とcalculation（文字列/null）が必須です。
confirmedなtotalにはprovenanceが必須で、verified_calculationには計算式・検証根拠をcalculationに記録します。
全体Fは空振り時の動作全体です。原典の記載または技個別に検証した計算だけを使い、アプリでは計算しません。
飛び道具、着地、追加硬直、派生などを一律に計算する処理はありません。

## Sourceと検証

sourceはurl、retrievedAt（UTC ISO日時）、gameVersion、kind（official/community）、attribution、license、verificationを持ちます。
Fixtureのverifiedは架空データとしての整合性検証を意味し、SF6公式確認を意味しません。
実データには取得元の利用条件・必要な帰属を記録し、未確認のライセンスを推測で記入しないでください。

開発環境には過去のステージングを参照する試遊モードもあります。通常ゲームは本番data内のadoption付きJSONを使用し、開発モードは不要です。ステージングのJSONを直接本番ビルドへ混入させず、採用時に別ファイルへ出力します。[第10段階報告](../archive/docs/FRAME_DATA_STAGE10_REPORT.md)を参照してください。

metadata・Character・Character.source・全Move.sourceのgameVersionは完全一致が必須です。
不正レコード、パッチ混在、重複キャラID、同一キャラの重複技IDはエラーとして対象から除外します。
同一基本入力の複数技は検出・報告し、実行時にはambiguousとして維持します。CLI検証は失敗します。
キャラの収録完了と、各表示モードの値の充足は別々に判定します。

## 実データ統合手順

1. 原典の技一覧、通常状態、入力と明らかな矛盾を確認し、採用判断を明示します。対象パッチが未確認でも採用可能です。
2. 対象範囲・出典・ライセンス・verificationを保持し、adoptionとcoverageを記入します。不明値や保留技を推測で補完しません。
3. metadataのgameVersionと各出典のバージョンを整合させます。未確認はUNVERIFIEDで、架空のパッチ番号を付けません。本番のkindはproductionです。
4. `npm run validate:data`、`npm test`、`npm run build` を実行します。
5. 2体以上が抽選対象になったことを確認し、Fixtureのチェックを外してプレイします。

初期フレームデータの確定後は、ユーザーが明示的に更新を指示するまで固定します。自動取得・自動更新・起動時の外部照合は実装しません。調査用取得スクリプトは明示的な調査・更新依頼がある場合だけ実行し、保存済み証拠からの変換とネットワーク取得を区別します。第13段階で32体へ統合しました。元候補860技と既存ケン・マリーザの採用値は維持し、保留判断には[ADOPTION_RULES.md](ADOPTION_RULES.md)を適用します。

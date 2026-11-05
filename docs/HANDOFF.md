# SF6 Frame Guess 引き継ぎ

作成日: 2026-11-05。作業元: `/home/mukade/codex/sf6-frame-guess/`。
保存先: `mukade-daiou/sf6-frame-guess`（Private）。引き継ぎ用保存であり、GitHub Pagesへの公開は行わない。

## 現在の進捗

Vite + React + TypeScriptのゲーム本体は実装済み。通常／発生のみの2モード、5回の質問、履歴、最終回答、結果、再プレイを架空Fixtureで確認済み。
DESIGN.mdはユーザー提供資料。pplxSansの代替はsystem-ui。バックエンドなし。
本番 `data/characters/` は空、`data/metadata.json` は未収録状態。架空Fixtureは `src/data/fixtures/` に隔離している。

| 段階    | 保存場所                        | 状態                                                       |
| ------- | ------------------------------- | ---------------------------------------------------------- |
| 第2段階 | staging/sf6-frame-data/         | 32体・831候補、固定上流JSON・原典・監査を保存              |
| 第3段階 | staging/sf6-frame-data-quality/ | 32体・856候補、判断・原典API取得結果・差分・検証結果を保存 |

第3段階では未解決46キーのうち39キーを採用し7キーを保留。通常技欠落2キーを復元。既存候補からDL0性能未確定の必殺14技を除外。
元の欠損133フィールドは102を適用対象外に修正、2は除外技に属し、29は不明のまま。
原典に明示されたKDと入力・注記・発生・数値部分が一致する230技のヒット表示をDに修正し、numericを除去した。
全キャラのgameVersionはUNVERIFIED、coverageはpartial/unverified、sourceもunverified。本番統合可能なキャラは0体。

詳しい根拠は以下をこの順で読む。

1. `docs/DATA_SPEC.md` と `src/lib/frame-data/schema.ts`（形式の正本）
2. `docs/FRAME_DATA_COLLECTION_REPORT.md` と `docs/FRAME_DATA_COLLECTION_TABLES.md`
3. `docs/FRAME_DATA_QUALITY_REPORT.md` と `docs/FRAME_DATA_QUALITY_COLLISIONS.md`
4. `staging/sf6-frame-data-quality/quality-report.json`
5. `staging/sf6-frame-data-quality/review-decisions.json` と `evidence/`

## 別PCでの再開手順

GitHubのPrivateリポジトリにアクセスできるアカウントで認証し、Git・Node.js 24・npmを用意する。
既存の鍵・トークンはこのリポジトリに含まれない。移行先で通常の方法により認証する。

```sh
gh repo clone mukade-daiou/sf6-frame-guess
cd sf6-frame-guess
npm ci
npm run typecheck
npm test
node --test tests/collect-supercombo.test.mjs tests/quality-converter.test.mjs
npm run validate:data
npm run build
npm run dev
```

通常起動では本番未収録と表示する。ゲームを試すには「テスト用の架空Fixtureを使う」を選択する。
移動後のパスは自由。アプリとスクリプトはプロジェクトルートから実行する。
一般的な環境ではnpm標準キャッシュが使える。キャッシュが読み取り専用の場合だけ、書き込み可能なパスを `npm ci --cache <path>` に指定する。

今回の保存時の確認項目は、型検査、アプリVitest17件、変換器node:test14件、Zod32体、ローダー、静的ビルド。
`npm run format:check` は以前コピーした収集スクリプトなどの整形差分を含みうるため、動作確認の代用にしない。

保存データからの再変換は次のとおり。ネット接続不要だが、quality側の生成物を再出力するので、作業前に差分を確認する。

```sh
npx tsx scripts/build-quality.ts
```

通常の引き継ぎ確認では再収集・再seedは不要。
`scripts/seed-quality-reviews.mjs` は保存済み判断の初期生成用で、既存ファイルを上書きしない。
`scripts/collect-quality-evidence.mjs` はライブ原典を再取得するため、保存済み証拠を保持する場所を決めてから実行する。
`scripts/review-source-semantics.mjs` は保存原典との照合でレビュー判断を追加する。手動判断は原典レコードのfingerprintに結び付き、原典が変わるとStale reviewsで停止する。
`scripts/audit-staging.ts` は第2段階の監査再生成用。引き継ぎ確認のために不用意に実行して既存レポートを書き換えない。

## 第4段階への作業指示

目的は残るデータ品質・パッチ整合性の確認。本番統合をまだ行わず、第2・第3段階の成果物を保持して別の作業用出力へ進める。
ゲームUI・Fixture・本番dataは原則変更しない。commit・push・公開などの次の外部操作は、その時点のユーザー指示に従う。

1. 保留7キーを調査する。cviper 214K/214KKのLv.1と非ホールド条件、dee_jay 22PPのSuperゲージ条件、jamie 236LP/MP/HP/PPのDL0性能。原典と公式／別表の入力・技名・状態・パッチを対応付ける。
2. 残る29フィールドを調査する。JPのKD ~、リュウのWall Bounce +49(65)、ザンギエフの(6~22)+10などを単純数値へ置換しない。原典照合が未確定の23項目を含め、原因とURLを記録する。
3. ジェイミーのDL共有通常技、構え移行と構え中技、マノンのメダル、リリーの風纏い、ストック、設置物など、状態ごとの使用可否とフレームの意味を確認する。
4. 特殊入力の取りこぼしを確認する。360+P、HOLD OK、ODの複数ボタン指定などは、証拠のある明示的規則でのみ正規化する。
5. 全体Fの意味を監査する。34(40)などの複合表記が上流で単純数値になった例、飛び道具、空振り追加硬直、着地、ヒット時派生を確認する。一律計算は禁止。
6. パッチを確定する。上流の取得日は8/19・10/16・11/1で混在。取得日をゲームバージョンと同一視しない。2026/10/13・10/16の公式修正内容への対応を調べる。
7. 230件のD修正と102件の適用対象外修正についても、原典との対応を保持したまま確認を進める。原典の意味が一致していてもキャラ全体をverifiedにしない。
8. 技単位の判断・未解決原因・照合元URL・バージョン・変更前後の値を機械可読に保存し、既存テストに回帰ケースを追加する。Zod・ローダー・型検査・関連テストを実行する。

公式ページは以前403、sf6-labは503だった。SuperCombo公開APIからは取得できた。
frame-searchは閲覧キャッシュではVer.2.0401.010、ライブ取得ではVer.2.0500.001と異なっていた。比較時にページの表示バージョン・取得時刻・キャッシュを区別する。
ライブ更新履歴では10/17に再取得が記録されているが、公式10/16修正の反映完了をそれだけで認定しない。

## 保存・除外・ライセンス

ソース、DESIGN.md、仕様書、調査報告、scripts、tests、設定、package-lock.json、本番の未収録メタデータ、Fixtureを保存。
両stagingディレクトリを丸ごと保存する。raw/やevidence/は取得時点の原典であり、再取得可能でも同じ内容が戻る保証がないため除外しない。
レビュー判断と差分を含むJSONも必須成果物。
node_modules/、dist/、coverage/、*.local、.env*をGit管理から除外する。ローカルの既存ファイルは削除しない。

データのCC BY-SA 4.0、原典リンク、変更内容はルートNOTICE、両staging/NOTICE、LICENSES/CC-BY-SA-4.0.txtおよびデータ内に保存する。
上流NOTICEのMIT記述をこのリポジトリ全体のソースコードへの許諾と解釈しない。

## 公開を防ぐWorkflow設定

`.github/workflows/deploy.yml` はpush・PRで検証とビルドを行う。
deployジョブは `workflow_dispatch` で `deploy: true` を明示した時のみ。既定はfalse。
今回の初回pushではデプロイしない。次回も公開指示がない限り手動deployを実行しない。

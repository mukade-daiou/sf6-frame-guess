# Focus Force発生値修正とファイル整理

2026-11-09実施。開始HEADは`1ec74b47703591438588ace22f2d344ccd8507d0`、mainはorigin/mainより2コミット先行し、未コミット・未追跡変更はなかった。既存の未pushコミットを保持し、worktree・ブランチは作成していない。

## Focus Force

| 質問入力        | 変更前 | 採用後 | 全体 | ヒット | ガード |
| --------------- | ------ | ------ | ---- | ------ | ------ |
| 214LK / MK / HK | 13+10  | 23     | 70   | D      | -16    |
| 214KK（OD）     | 10+10  | 20     | 67   | D      | -16    |

ユーザー指定による限定的なゲーム用代表値であり、他の複合表記へ一般化しない。採用判断は`data/adoption-decisions.json`の`conditionalSpecials.startupDecisions`に原典表記・numeric・理由を保持する。既存の生成処理がCargo表記を照合して適用し、displayとnumericを一致させる。共通通常版からL/M/Hへ展開し、ODは専用原典から採用する。

原典raw/Cargo・調査evidence・sourceNotation注記の13+10/10+10は保持した。source.verification、gameVersion、全体・ヒット・ガードは変更していない。旧採用理由にある「加算せず表示」は履歴として残し、後続判断の理由を追記した。第16段階のレポートも当時の値を残して追補した。

datasetIdは`conditional-specials-2026-11-07-r2`から`focus-startup-2026-11-09-r1`へ変更。`build-snapshot.ts --write --update`で再生成し、data:checkで一致を確認した。1298件の件数・順序・IDを維持し、固定基準1ec74b4との比較で、4質問入力と通常版の生成元noneの計5レコードだけが発生値・採用理由を変更したことを検査する。生成元の原典表記は保持している。他の1293件はレコード全体が一致し、他の複合発生・SA288件・coverageも不変。

## ファイル監査と整理

Git管理ファイルを対象に、package.json・CI・import・CLIの読書き・採用判断JSONの参照・Markdownリンク・履歴を確認した。開始時631ファイル。node_modules、dist、.git、既存のGit対象外verification、用途不明のユーザーデータは削除していない。

| ディレクトリ                | 整理前 | 整理後 | 判断                                       |
| --------------------------- | -----: | -----: | ------------------------------------------ |
| src                         |     46 |     46 | 実行コード・機能テスト・架空Fixtureを維持  |
| data                        |     36 |     36 | 固定スナップショット・採用判断・帰属を維持 |
| scripts                     |     24 |     22 | 旧UI専用の手順2件をarchiveへ移動           |
| tests                       |      6 |      7 | 全件比較のFocus Force回帰テストを追加      |
| docs                        |     19 |     14 | 過去資料6件を移し、本レポート1件を追加     |
| staging                     |    117 |    117 | 生成入力・原典対応・監査証跡を維持         |
| archive                     |    369 |    377 | 過去レポート・旧整理台帳・旧UI手順を保存   |
| .github / LICENSES / ルート |     14 |     14 | CI・ライセンス・設定を維持                 |
| 合計                        |    631 |    633 | 減らすこと自体を目的にしない               |

以下6件を`docs/`から同名の`archive/docs/`へ移動した。削除だけを行ったファイルはない。

- `PROJECT_CLEANUP_REPORT.md`：第11段階の整理記録
- `UI_STAGE12_REPORT.md`：第12段階のUI検証
- `CHARACTER_INTEGRATION_REPORT.md`：第13段階の統合記録
- `ROTATION_AND_COVERAGE_AUDIT.md`：第14段階の収録監査
- `cleanup-inventory.json`：第11段階の棚卸し
- `cleanup-moves.json`：第11段階の移動台帳

加えて旧SAレベル選択UI専用の`verify-super-arts.mjs`と`verify-sa-review.mjs`をscriptsからarchive/scriptsへ移動した。原典行・SA288入力等の現行回帰テストは移動せず維持する。移動は合計8件。

当時の件数・判定・JSON内の履歴識別パスは保存し、移動したMarkdownの現行資料リンクだけを修正した。archive/READMEに索引を追加し、report-adoption.tsの報告出力先も移動先へ変更した。READMEの884件・旧SAレベル選択の説明を現在の1298件・共通タブへ更新。GAME_SPECとDATA_SPECの古いSA入力・720・Focus Force表示、DATA_WORKFLOWの古い「現在値」も整理した。過去のSA・共通強度・第16段階のレポートは現在の採用根拠なのでdocsに残す。

同一内容の候補JSONは、現行の候補32体860件と過去段階の再現入力で役割が異なる。NOTICEの重複は各資料群の帰属を保つため必要。過去のMarisaスナップショット・review-policyも再現テストの固定入力として残した。サイズや重複だけを根拠に削除していない。

staging/sa-researchは生成入力と第15段階Aの再現資料が混在しているが、行参照・調査証跡を保つため維持した。stagingの監査JSONはテストや原典対応に使われる。既存のブラウザー画像は過去の検証証拠として残し、今回の再生成可能な画像・結果はGit対象外の`staging/verification/focus-startup/`へ出力した。独立した不要ファイルと断定できるものはなかった。

scriptsのprepare-_・repair-_・apply-adoption-policyは入力変更用、report-adoptionは第13段階の報告用、create-fixturesは架空データ保守用として用途を明記した。過去の生成器と29件のアーカイブ再現テストは維持し、似た処理を削除・統合していない。現行の回帰検査も過去コミット参照・1196件保護・SA288入力・共通強度・第16段階の検査を維持している。

現行ブラウザー手順には、旧タブ名、履歴の古い順序、再プレイ後の開始画面、Hard再プレイ時のNormal固定期待が残っていた。実際に再現した失敗に基づき、共通タブ・新しい履歴が先頭・直接再プレイ・モード維持を検査するよう更新した。検査をskipせず、現行の動作を明示的に確認している。verify-chargeのタイトル期待も新名称へ変更した。

回転確認では、720も候補にある共通タブで360反時計回りを入力すると矢印だけ時計回りになる既存不具合を検出した。MoveSelectorが回転方向の表示更新を2周完了時まで待っていたため、1周成立時から更新する最小修正を加えた。認識条件・質問キー・フレーム値は変更しない。

## 検証

- 型チェック、Vitest 124件、現行データ回帰7件、アーカイブ再現29件が成功。
- Zod検証、32キャラcoverage、SA監査、共通強度監査、第16段階監査、data:plan、data:check、フォーマット検査、ビルドが成功。
- Markdown相対リンク・TS/JS importの参照検査が成功。採用判断・生成入力・raw/Cargoの参照は生成と専用監査でも照合した。
- ブラウザー1280px・320pxで、Focus ForceのL/M/Hが23F、ODが20F、その他3項目の維持、独立した質問消費、Normal/Hard切替を確認。画像も確認した。併せてジェイミーDL2/DL3とMaracasの技なしを確認した。
- 1280/768/390/320pxで、Normal/Hard、5問、途中回答、正誤、結果、再プレイ、マウス・タッチ・キーボード操作のブラウザー確認が成功。溜め入力も4画面幅で通常/OD・候補・履歴・回答・再プレイを確認した。機能テストでは720やSA288入力も維持している。
- 360回転も4画面幅で左右回転・候補クリック・通常/OD・履歴・回答・再プレイが成功し、反時計回りの表示修正を元の失敗箇所で確認した。結果と画像はstaging/verificationのbrowser/charge/rotationに保存する。
- ビルドの500kB超チャンク警告は従来から残る。公開設定・GitHub Actions・デプロイ条件は変更していない。

追加依頼のゲーム名は、画面見出し・HTML title・READMEを「SF6フレーム探偵」へ揃えた。過去レポートの名称は履歴として維持する。

修正必須の未解決事項はない。ファイル数削減のためだけの原典削除や過去コードの統合は見送った。Focus Force修正・ファイル整理・名称変更をローカルcommitし、push・デプロイは行わない。commit SHAと最終Git状態は作業完了時の報告を参照。

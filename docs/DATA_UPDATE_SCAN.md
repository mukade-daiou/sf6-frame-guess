# 公式原典の更新チェック

第1段階は`9f3a96d`で確定しmainへ統合した。第2段階では原典取込、正規化、差分分類、レポート生成を追加した。本番更新、採用変更、apply、自動PR、定期実行は含まない。

## CLIと入力

基準と今回原典を別ディレクトリに置き、それぞれinventory.jsonで比較範囲を宣言する。

```json
{ "complete": true, "characters": [{ "id": "ryu", "file": "ryu.json" }] }
```

```sh
npm run data:update:scan -- --baseline tests/fixtures/source-scan --incoming tests/fixtures/source-scan
npm run data:update:report -- --run staging/verification/update-scans/RUN_ID
```

実データには既存のstaging/official-verification/sourcesの保存JSONを別ディレクトリへコピーし、inventoryを添える。fileの代わりにurlを指定すると公式HTTPSへの取得を試行する。タイムアウト30秒、リダイレクト拒否。今回の実サイト取得は403で失敗し、自動取得の成功は確認できていない。失敗応答も保存する。

対応形式は既存公式照合のCLASSIC保存JSON。rowsにはname、section、commandImages、startup、active、recovery、hit、block、notesが必要となる。HTML抽出器やログイン回避は実装しておらず、HTML・不正JSONも解析失敗となる。取得できない場合はこのJSON形式を手動保存して取り込む。版不明はnullとし、取得日からゲームバージョンを推測しない。

completeは全対象キャラの取得が完了した場合だけtrueにする。両側が完全な場合だけキャラの追加・削除を確定候補にする。不完全な範囲では成功した共通キャラだけ比較し、source_errorを必ず残す。成功は終了コード0、取得・解析・範囲の問題は1、引数不足は2。

## 実行成果物

既定の出力はstaging/verification/update-scans/日時-UUID。ワークスペース内のCLI出力もこの配下に限定する。

| ファイル        | 内容                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| manifest.json   | 取得元、取得日時、原典とinventoryのSHA-256、版と根拠、取得状態、検証コンテキストのハッシュ |
| raw/            | 元のバイト列、取得失敗の応答本文、入力inventory                                            |
| normalized.json | 両側の正規化結果と範囲の完全性                                                             |
| context.json    | 分類に用いたproductionと採用判断                                                           |
| diff.json       | 変更前後、フィールド差分、状態、対応本番技ID、保存済みの判断理由                           |
| report.md       | manifestとdiffから再生成できる確認用レポート                                               |

同じ入力・採用判断ならdiff.jsonは同じとなる。実行日時とIDは毎回変わり、過去結果を上書きしない。変更なしの場合も比較元のハッシュを残す。レポート生成は本番データや既存原典を変更しない。

## 再利用と分類

本番の正本は引き続きdata/characters、metadata、adoption-decisions。build-snapshot.tsはstaging/adoption-inputsと保存原典に判断を適用する従来の生成入口であり、scanから呼び出さない。archiveと過去の精査結果も保持する。

既存公式照合compare.mjsのcommands、candidates、totalを再利用した。原典値はrawを保持し、numeric、range、conditional、special、unknown、not_applicableに区別する。KD/HKDを数値化しない。空振り全体Fの導出は根拠付きの別フィールドとし、原典recoveryを上書きしない。ODの解釈も既存コマンド処理を継承し、採用入力は生成しない。

officialId、技名と入力、一意な技名、一意な入力の順に対応付ける。行番号・配列順は識別に使わない。同名・同入力の多重候補はunmatched。IDがなく技名と入力が同時に変わる場合は追跡を確定できない。対応付けた技の比較には薄い変換層を介してsnapshot-diffを再利用する。

状態はunchanged、candidate、needs_review、unmatched、source_error。candidateは採用可能という判断ではない。既存の補正・保留・除外の記録を参照し、該当変更をneeds_reviewとする。理由はretainedDecisionsとheldに保持する。複数の本番技に対応する場合もunmatchedに残す。

## 検証と次段階

### 第3段階：承認した既存技の更新

```sh
# 雛形を表示（既定はdry-run）。--writeで新しい承認ファイルを保存する
npm run data:update:review -- RUN_DIR approval.json
npm run data:update:review -- RUN_DIR approval.json --write
# 編集した承認内容を検証する
npm run data:update:review -- RUN_DIR approval.json
# 一時領域で生成・再照合する。本番は変更しない
npm run data:update:apply -- RUN_DIR approval.json
# 明示的な書き込み
npm run data:update:apply -- RUN_DIR approval.json --write
```

承認ファイルのdatasetIdには新しい識別子を記入する。decisionsのeventはdiff.jsonの配列位置。必要な項目だけapprovedをtrueにし、moveId、field、現在のFrameValue全体をbefore、新しいFrameValue全体をafter、承認理由をreasonに記入する。フィールドを複数更新する場合は項目を分ける。sourceHashは変更しない。曖昧な対応は本番の既存moveIdを指定し、mappingReasonで対応の根拠を説明する。新キャラ・新技の登録、削除、inputや採用範囲の変更はできない。

原典のハッシュ、正規化結果、採用判断と現行データのコンテキスト、beforeを再照合する。未承認項目は適用しない。既存の手動補正に同じ技IDが現れる場合は保守的に競合として拒否する。別フィールドだけの補正であっても、この段階では自動上書きしない。

保存原典・inventory・分類時のコンテキストからcompareSourcesとclassifyで差分を再計算し、diff.json全体との一致を要求する。再適用時も同じ検証を行う。承認対象はmove_changedだけで、新規技の追加イベントを手動対応の理由で既存技更新へ転用することはできない。

afterには既存のFrameValue形式を使う。全体Fは既存の空振り全体判定に一致するnumericとdisplayを要求する。原典の「全体N」の直接記載はprovenance: source、calculation: nullとする。計算による導出はprovenance: verified_calculation、既存計算のevidenceと一致するcalculationを要求する。導出できない全体Fは適用しない。未知値・適用外・条件付き値もschemaと原典表記を照合し、独自の推測変換はしない。

承認結果はadoption-decisionsのreviewedUpdatesに保存し、原典をstaging/adoption-inputs/reviewed-updatesへハッシュ名で保持する。既存補正の後にこの判断を適用するため、build-snapshotで再生成できる。書き込み前に一時作業領域で既存生成器を2回実行し、承認したフィールド以外に差分がないことと再生成一致を確認する。検証失敗時は本番へ書き込まない。適用時には現行スナップショット保護用の承認差分も更新する。復旧はGitの差分を確認して行い、独自の永続バックアップは作らない。

同じ承認を再実行した場合は、原典・適用済みデータ・採用判断の一致を確認してalreadyAppliedを返す。別の更新後に古い承認を再利用することはできない。履歴テストでは承認済み更新をbeforeへ投影し、当時の精査結果を維持する。現行データのテストはafterを検証する。

履歴投影は最新afterから更新を逆順に検証する。検証済みの投影結果は同じプロセス内のオブジェクトとして識別し、再利用時にも対象フィールドと判断の一致を確認する。旧値を読み込んだだけの入力や、JSON・structuredClone経由で検証履歴を失ったコピーは投影済みとは扱わない。

今回の承認・適用検証は一時Fixtureでのみ実行し、実際の本番フレーム値は変更していない。突然のプロセス停止やOS障害に対する複数ファイルの原子的な保存は保証しない。検証失敗は保存前に検出し、通常の書き込み例外では元の内容へ戻す。手動編集や別の更新処理と同時に適用しない。

第1段階のtest:update（dailyを含む）とtest:historyは確定前に成功した。第2段階では変更なし、フレーム・入力・技名・条件の変更、技・キャラ追加削除、並び替え、曖昧な対応、不明値・特殊表記、手動補正との競合、失敗・部分範囲、冪等性、出力隔離を保存Fixtureで検査する。外部通信は通常テストに含めない。

第1段階はVitest165件、Node65件22.44秒、archive29件。第2段階のNode72件は23.05秒、追加Fixture検証は約0.1秒。既存テストは削除していない。本番と既存原典のGit差分も最終確認する。

mainへのpushで自動デプロイしないよう、既存workflowの公開を明示的な手動実行に限定した。push時の検証・ビルドは継続する。対象外の未追跡ファイルは変更・コミットしない。

第3段階の検証ではVitest166件、Node72件、archive29件が成功した。Node全体は作業前22.60秒、作業後22.56秒。Vitestは第2段階の記録1.10秒に対して10.20秒となり、一時領域での生成・書き込み・再生成・履歴検証を通す1件の統合テストが主な増加分となった。型検査、data:check、buildも成功した。既存テストは削除していない。

### 第4段階：公式原典からの追加

同じreview/applyコマンドでmove_addedとcharacter_addedの雛形も生成する。雛形はapproved: false。新技はkind: add_moveとし、proposal.rowsの当該sourceRowに対応するmovesから承認するものだけをmoves配列へコピーする。新キャラはkind: add_characterとし、原典全行の分類を含むproposalを確認して承認する。いずれもreasonと新しいdatasetIdが必要となる。生成されたID・入力・フレーム値・分類を任意に書き換えた候補は拒否する。

通常状態の入力が原典から確定する行だけを採用候補とする。地上通常技は立ち・しゃがみの弱中強P/K、必殺技は既存のコマンド解釈と収録対象入力を使う。強度共通の入力と通常SAはL/M/Hへ展開し、ODは弱＋中の同種ボタンを確認する。派生・ホールド等は対象外、条件や入力が確定しない行は保留する。フレーム表記を安全に変換できない場合はunknownとして原典を保持する。

新キャラの候補はstaging/adoption-inputs/official、公式原典はreviewed-updatesのハッシュ名ファイルに保存する。adoption-decisions.charactersにofficialSourceを持つ項目を追加し、build-snapshotで毎回原典との一致とcoverageを検査する。この経路はraw/Cargoや旧SA inventoryを参照しない。公式SAの根拠にはsaEvidence.officialRefを使い、架空のraw/Cargo参照を作らない。

通常技12入力、基本必殺技の各強度とOD、SA1/2/3の各L/M/Hが揃い、保留入力がない候補だけを出題可能にする。足りない候補はheld/partialとして保存できる。ODがないことや特殊な代表条件を別途認定する経路はこの段階では設けず、保守的にpartialとする。同一入力の複数行は条件付きの保留候補として保持し、completeにしない。既存キャラへの追加では技IDまたは質問入力の衝突を拒否する。不明なフレーム値はcoverageと分け、既存どおり質問を消費しない。

保存Fixtureの新技1件・新キャラ1体について、承認、隔離領域への適用、再生成一致、再適用、出題可能性、不明値、既存データの不変性を確認する。同じ統合テストで追加後の履歴50件も実行する。履歴検証のロスターは当時のものに限定し、追加技は承認内容との一致を検証してから除く。現行スナップショットの保護検査は追加を含む全件を検証する。実際の本番登録は行っていない。

既存補正との競合解決、削除、異なるゲームバージョンへの移行は未対応。読み取れない入力・条件は保留のまま扱う。公式HTML抽出が必要なら、アクセス可能な実ページを根拠に別アダプターを追加する。

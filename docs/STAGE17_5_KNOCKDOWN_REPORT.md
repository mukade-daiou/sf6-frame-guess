# 第17.5段階：KD/HKD訂正

開始HEADはf199046、mainはorigin/mainより2コミット先行、作業ツリーはクリーン。第17段階台帳のknownValueConflictsを対象とした。

17元レコード（アレックス4、アルジュン3、ブランカ4、本田4、JP2）すべてについて、台帳の技名・入力と保存raw/Cargoの行全体が一致することを確認した。HKD/KDに続く数値を通常ヒット硬直差として表示していたため、既存ルールに従ってDへ訂正した。通常共通値の生成先6件を含め23レコードが変更対象。未修正の対象はない。

各ID・旧値・原典表記はdata/adoption-decisions.jsonのknockdownCorrections.decisionsに保存。元の有利値、取得日時、技名・条件はstaging/stage17/frame-ledger.jsonのsourcesとknownValueConflictsに残す。原典は変更しない。

unknown補完とは別の訂正関数を追加し、明示した元ID・入力・旧値・原典行・KD/HKD表記の一致を検査してDだけを適用する。第17段階のunknown保護は維持する。生成後は元commitの全1298件と比較し、この23件のhit以外が完全一致することを専用テストで確認する。過去の保護commitは変更せず、明示されたフィールド訂正のみ比較に反映する。

datasetIdはknockdown-corrections-2026-11-09-r1。32キャラ・1298件・SA288入力・未確定8件8項目・採用状態・coverage・出典・既存代表条件を維持する。

型チェック、単体129件、データ回帰9件、アーカイブ29件、各coverage/SA/強度/条件付き監査、第17段階監査、再生成、スキーマ、format、ビルド、参照検査が成功した。ブラウザー1280/390pxでは代表のPower BombのD表示と、Normal/Hard、質問消費・重複・回答・再プレイを確認した。commit、push後CIのURLは完了報告に記録する。Pages手動デプロイは実行しない。

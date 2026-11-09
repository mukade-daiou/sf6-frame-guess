import { lazy, Suspense, useEffect, useState } from "react";
import App from "./App";
const MovesPage = lazy(() => import("../features/moves/MovesPage"));
export default function HashApp() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const changed = () => setHash(window.location.hash);
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  const moves = hash === "#/moves";
  useEffect(() => {
    document.title = moves
      ? "技データ一覧 | SF6フレーム探偵"
      : "SF6フレーム探偵";
    if (!moves) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    return () => meta.remove();
  }, [moves]);
  return moves ? (
    <Suspense fallback={<main>読み込み中…</main>}>
      <MovesPage />
    </Suspense>
  ) : (
    <App />
  );
}

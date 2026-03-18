import { useEffect, useState, useCallback } from "react";

interface GalleryPiece {
  id?: string;
  title?: string;
  meta?: string;
  filename?: string;
  image?: string;
}

function fromFilename(filename: string): { title: string; meta: string } | null {
  const base = String(filename).replace(/\.png$/i, "").trim();
  const parts = base.split("_");
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  const hasTimestamp = /^\d+$/.test(last);
  const middle = hasTimestamp ? parts.slice(1, -1) : parts.slice(1);
  const paramParts: string[] = [];
  const sketchParts: string[] = [];
  for (const p of middle) {
    if (p.includes("=")) paramParts.push(p);
    else sketchParts.push(p);
  }
  const sketchId = sketchParts.join("_");
  const params: Record<string, string | number> = {};
  paramParts.forEach((pair) => {
    const eq = pair.indexOf("=");
    if (eq > 0) {
      const k = pair.slice(0, eq);
      const v = pair.slice(eq + 1);
      params[k] = /^-?\d/.test(v) ? parseFloat(v) : v;
    }
  });
  const title = sketchId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const meta =
    Object.keys(params).length === 0
      ? "—"
      : Object.entries(params)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · ");
  return { title, meta };
}

export default function Gallery() {
  const [pieces, setPieces] = useState<GalleryPiece[]>([]);
  const [filtered, setFiltered] = useState<GalleryPiece[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalPiece, setModalPiece] = useState<GalleryPiece | null>(null);

  const closeModal = useCallback(() => setModalPiece(null), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeModal]);

  useEffect(() => {
    if (modalPiece) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalPiece]);

  useEffect(() => {
    document.body.classList.add("gallery-page");
    return () => document.body.classList.remove("gallery-page");
  }, []);

  useEffect(() => {
    fetch("/gallery-data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gallery");
        return res.json();
      })
      .then(setPieces)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    const next = q
      ? pieces.filter((p) => {
          const filename = p.filename ?? (p.image ? p.image.split("/").pop() ?? "" : "");
          let title = p.title ?? "";
          let meta = p.meta ?? "";
          if (filename) {
            const ficha = fromFilename(filename);
            if (ficha) {
              if (!title) title = ficha.title;
              if (!meta) meta = ficha.meta;
            }
          }
          return (
            title.toLowerCase().includes(q) ||
            meta.toLowerCase().includes(q) ||
            filename.toLowerCase().includes(q)
          );
        })
      : pieces;
    setFiltered(next);
  }, [search, pieces]);

  useEffect(() => {
    const el = document.getElementById("piece-count");
    if (el) el.textContent = error ? "—" : pieces.length === 0 ? "loading" : `${filtered.length} pieces`;
  }, [filtered.length, pieces.length, error]);

  return (
    <div className="gallery-main">
      <div className="gallery-search-wrap">
        <input
          type="text"
          className="gallery-search"
          placeholder=""
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <span className="gallery-search-icon" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
      </div>
      <div className="gallery-grid">
        {error && <p className="gallery-error">{error}</p>}
        {!error && pieces.length === 0 && (
          <div className="gallery-loading">loading</div>
        )}
        {!error &&
          filtered.map((p) => {
            let title = p.title;
            let meta = p.meta;
            const filename = p.filename || (p.image ? p.image.split("/").pop() || null : null);
            if (filename && (title == null || meta == null)) {
              const ficha = fromFilename(filename);
              if (ficha) {
                if (title == null) title = ficha.title;
                if (meta == null) meta = ficha.meta;
              }
            }
            const imgSrc =
              p.image || (p.filename ? "/assets/images/gallery/" + p.filename : null);
            return (
              <article key={p.id || filename || ""} className="gallery-piece" data-id={p.id || ""}>
                <button
                  type="button"
                  className="gallery-piece-image"
                  onClick={() => imgSrc && setModalPiece(p)}
                  aria-label={imgSrc ? `Ver ${title || "pieza"}` : undefined}
                  disabled={!imgSrc}
                >
                  {imgSrc && (
                    <img src={imgSrc} alt={title || ""} loading="lazy" />
                  )}
                </button>
                <div className="gallery-piece-info">
                  <h2 className="gallery-piece-title">{title || "untitled"}</h2>
                  <p className="gallery-piece-meta">{meta || "—"}</p>
                </div>
              </article>
            );
          })}
      </div>

      {modalPiece && (() => {
        const filename = modalPiece.filename || (modalPiece.image ? modalPiece.image.split("/").pop() || null : null);
        let modalTitle = modalPiece.title;
        let modalMeta = modalPiece.meta;
        if (filename && (modalTitle == null || modalMeta == null)) {
          const ficha = fromFilename(filename);
          if (ficha) {
            if (modalTitle == null) modalTitle = ficha.title;
            if (modalMeta == null) modalMeta = ficha.meta;
          }
        }
        const modalImgSrc = modalPiece.image || (modalPiece.filename ? "/assets/images/gallery/" + modalPiece.filename : null);
        return (
          <div
            className="gallery-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle || "Pieza"}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <button
              type="button"
              className="gallery-modal-close"
              aria-label="Cerrar"
              onClick={closeModal}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="gallery-modal-content">
              {modalImgSrc && (
                <img src={modalImgSrc} alt={modalTitle || ""} className="gallery-modal-image" />
              )}
              <div className="gallery-modal-info">
                <h2 className="gallery-modal-title">{modalTitle || "untitled"}</h2>
                <p className="gallery-modal-meta">{modalMeta || "—"}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

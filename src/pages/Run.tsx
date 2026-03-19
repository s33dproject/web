import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

interface Variant {
  id: string;
  dataUrl: string;
}

interface SketchParam {
  key: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value: number | string;
  type?: string;
  placeholder?: string;
}

export default function Run() {
  const { type, name } = useParams<{ type: string; name: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const captureFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [modalVariant, setModalVariant] = useState<Variant | null>(null);
  const [sketchParams, setSketchParams] = useState<SketchParam[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, number | string>>({});
  const paramValuesRef = useRef<Record<string, number | string>>({});
  const [sketchList, setSketchList] = useState<{ type: string; id: string }[]>([]);

  const isValidType = type === "2019-seeds" || type === "original" || type === "2026";

  useEffect(() => {
    paramValuesRef.current = paramValues;
  }, [paramValues]);
  const sketchName = name ? decodeURIComponent(name) : "";

  // Clear variants when switching to a different sketch
  useEffect(() => {
    setVariants([]);
    setModalVariant(null);
  }, [type, sketchName]);

  useEffect(() => {
    document.documentElement.classList.add("run-page-html");
    document.body.classList.add("run-page");
    return () => {
      document.documentElement.classList.remove("run-page-html");
      document.body.classList.remove("run-page");
    };
  }, []);

  // Force iframe to match container size (fixes 70x70 collapse)
  useEffect(() => {
    const container = containerRef.current;
    const iframe = iframeRef.current;
    if (!container || !iframe) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width * 0.9, 360);
      const h = Math.max(rect.height * 0.9, 360);
      iframe.style.width = w + "px";
      iframe.style.height = h + "px";
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [loading]);

  // Fetch sketches metadata for params and build list for prev/next
  useEffect(() => {
    if (!isValidType || !sketchName) return;
    fetch("/api/sketches")
      .then((r) => r.json())
      .then((data) => {
        const seeds2019 = (data["2019-seeds"] || []).map((s: { id: string }) => ({
          type: "2019-seeds",
          id: s.id,
        }));
        const originals = (data.originals || []).map((s: { id: string }) => ({
          type: "original",
          id: s.id,
        }));
        const seeds2026 = (data["2026"] || []).map((s: { id: string }) => ({
          type: "2026",
          id: s.id,
        }));
        const list = [...seeds2026, ...seeds2019, ...originals];
        setSketchList(list);

        const sketch = list.find(
          (s: { id: string; type: string }) => s.id === sketchName && s.type === type
        );
        const meta = (data["2019-seeds"] || [])
          .concat(data.originals || [])
          .concat(data["2026"] || [])
          .find(
          (s: { id: string; type?: string }) =>
            s.id === sketchName && (s.type ?? "2019-seeds") === type
        );
        const params = meta?.params || [];
        setSketchParams(params);
        const initial: Record<string, number | string> = {};
        params.forEach((p: SketchParam) => {
          initial[p.key] = p.value ?? (p.min ?? 0);
        });
        setParamValues(initial);
      })
      .catch(() => {});
  }, [type, sketchName, isValidType]);

  // Post params to iframe when they change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || Object.keys(paramValues).length === 0) return;
    try {
      iframe.contentWindow.postMessage(
        { type: "s33d-params", params: paramValues },
        "*"
      );
    } catch {
      // Cross-origin, ignore
    }
  }, [paramValues]);

  useEffect(() => {
    if (!isValidType || !sketchName) {
      window.location.href = "/sketches";
      return;
    }

    setLoading(true);
    setError(null);

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = null;
    }

    let cancelled = false;
    let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    async function start() {
      let fetchTimeout: ReturnType<typeof setTimeout> | null = setTimeout(
        () => controller.abort(),
        60000
      );
      try {
        const res = await fetch(`/api/run/${type}/${encodeURIComponent(sketchName)}`, {
          method: "POST",
          signal: controller.signal,
        });
        if (fetchTimeout) {
          clearTimeout(fetchTimeout);
          fetchTimeout = null;
        }
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Error starting");

        const iframeEl = iframeRef.current;
        if (iframeEl && !cancelled) {
          const onLoad = () => {
            if (cancelled) return;
            if (loadTimeoutId) {
              clearTimeout(loadTimeoutId);
              loadTimeoutId = null;
            }
            setLoading(false);
            setError(null);
            const params = paramValuesRef.current;
            if (Object.keys(params).length > 0) {
              try {
                iframeEl.contentWindow?.postMessage(
                  { type: "s33d-params", params },
                  "*"
                );
              } catch {
                /* ignore */
              }
            }
          };

          loadTimeoutId = setTimeout(() => {
            loadTimeoutId = null;
            if (cancelled) return;
            setLoading(false);
            setError("Sketch took too long to load. Try again or check the terminal for errors.");
          }, 25000);

          iframeEl.onload = onLoad;
          iframeEl.src = `/sketch/?t=${Date.now()}`;
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (fetchTimeout) {
          clearTimeout(fetchTimeout);
        }
        if (cancelled) return;
        if (loadTimeoutId) {
          clearTimeout(loadTimeoutId);
        }
        const msg =
          (err as Error).name === "AbortError"
            ? "Server took too long. Is canvas-sketch installed?"
            : (err as Error).message;
        setError(msg + "\n\nGo to the main list and click Run.");
        setLoading(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      controller.abort();
      if (loadTimeoutId) clearTimeout(loadTimeoutId);
    };
  }, [type, sketchName, isValidType]);

  const handleRegenerate = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setLoading(true);
    setError(null);
    const loadTimeout = setTimeout(() => {
      setLoading(false);
      setError("Regenerate timed out. Try again.");
    }, 25000);
    iframe.onload = () => {
      clearTimeout(loadTimeout);
      setLoading(false);
      const params = paramValuesRef.current;
      if (Object.keys(params).length > 0) {
        try {
          iframe.contentWindow?.postMessage(
            { type: "s33d-params", params },
            "*"
          );
        } catch {
          /* ignore */
        }
      }
    };
    iframe.src = "/sketch/?t=" + Date.now();
  }, []);

  const handleAddVariant = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    if (captureFallbackRef.current) clearTimeout(captureFallbackRef.current);
    captureFallbackRef.current = null;
    // Prefer postMessage: sketch uses exportFrame for high-res capture
    iframe.contentWindow.postMessage({ type: "s33d-capture" }, "*");
    // Fallback: direct capture if no response in 1.5s (sketches without setupParamsListener)
    captureFallbackRef.current = setTimeout(() => {
      captureFallbackRef.current = null;
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          const canvas = doc.querySelector("canvas");
          if (canvas) {
            const dataUrl = canvas.toDataURL("image/png");
            setVariants((prev) => [
              ...prev,
              { id: "v-" + Date.now(), dataUrl },
            ]);
          }
        }
      } catch {
        /* cross-origin */
      }
    }, 1500);
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "s33d-capture-result" && e.data.dataUrl) {
        if (captureFallbackRef.current) {
          clearTimeout(captureFallbackRef.current);
          captureFallbackRef.current = null;
        }
        setVariants((prev) => [
          ...prev,
          { id: "v-" + Date.now(), dataUrl: e.data.dataUrl },
        ]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const formatName = (id: string) =>
    decodeURIComponent(id)
      .split(/[-_/]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const updateParam = (key: string, value: number | string) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = useCallback(() => {
    const initial: Record<string, number | string> = {};
    sketchParams.forEach((p) => {
      initial[p.key] = p.value ?? (p.min ?? 0);
    });
    setParamValues(initial);
    handleRegenerate();
  }, [sketchParams, handleRegenerate]);

  const handleDownloadVariant = useCallback((v: Variant) => {
    const a = document.createElement("a");
    a.href = v.dataUrl;
    a.download = `variant-${v.id}.png`;
    a.click();
  }, []);

  const handleRemoveVariant = useCallback((id: string) => {
    setVariants((prev) => prev.filter((x) => x.id !== id));
    setModalVariant((v) => (v?.id === id ? null : v));
  }, []);

  const closeVariantModal = useCallback(() => setModalVariant(null), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVariantModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeVariantModal]);

  useEffect(() => {
    if (modalVariant) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalVariant]);

  if (!isValidType || !sketchName) {
    return null;
  }

  const currentIndex = sketchList.findIndex(
    (s) => s.id === sketchName && s.type === type
  );
  const prevSketch = currentIndex > 0 ? sketchList[currentIndex - 1] : null;
  const nextSketch =
    currentIndex >= 0 && currentIndex < sketchList.length - 1
      ? sketchList[currentIndex + 1]
      : null;

  return (
    <>
      <div className="variant-controls">
        <div className="run-nav-section">
          <div className="run-nav-pagination">
            {prevSketch ? (
              <Link
                to={`/run/${prevSketch.type}/${encodeURIComponent(prevSketch.id)}`}
                className="run-nav-btn"
                title={`Previous: ${formatName(prevSketch.id)}`}
                aria-label="Previous sketch"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
            ) : (
              <span className="run-nav-btn run-nav-btn-disabled" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            )}
            <div className="run-nav-info" aria-live="polite">
              <span className="run-nav-prev-name">
                {prevSketch ? formatName(prevSketch.id) : "—"}
              </span>
              <span className="run-nav-sep" aria-hidden="true">·</span>
              <span className="run-nav-counter">
                {currentIndex >= 0 ? `${currentIndex + 1} / ${sketchList.length}` : "—"}
              </span>
              <span className="run-nav-sep" aria-hidden="true">·</span>
              <span className="run-nav-next-name">
                {nextSketch ? formatName(nextSketch.id) : "—"}
              </span>
            </div>
            {nextSketch ? (
              <Link
                to={`/run/${nextSketch.type}/${encodeURIComponent(nextSketch.id)}`}
                className="run-nav-btn"
                title={`Next: ${formatName(nextSketch.id)}`}
                aria-label="Next sketch"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : (
              <span className="run-nav-btn run-nav-btn-disabled" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            )}
          </div>
        </div>
        <div className="run-controls-section">
          <Link to="/sketches" className="run-back" title="Back to sketches" aria-label="Back to sketches">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="params-controls">
            {sketchParams.map((p) => (
              <div key={p.key} className="param-group">
                <label htmlFor={`param-${p.key}`}>{p.label}</label>
                {p.type === "text" ? (
                  <input
                    id={`param-${p.key}`}
                    type="text"
                    value={String(paramValues[p.key] ?? p.value)}
                    onChange={(e) => updateParam(p.key, e.target.value)}
                    placeholder={p.placeholder}
                  />
                ) : (
                  <input
                    id={`param-${p.key}`}
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={Number(paramValues[p.key] ?? p.value)}
                    onChange={(e) =>
                      updateParam(
                        p.key,
                        p.step && p.step < 1
                          ? parseFloat(e.target.value)
                          : parseFloat(e.target.value)
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <div className="variant-controls-actions">
            {sketchParams.length > 0 && (
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={handleRegenerate}>
              Regenerate
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddVariant}
              disabled={loading || !!error}
            >
              Add variant
            </button>
          </div>
        </div>
      </div>
      <main className="run-main">
        <div
          ref={containerRef}
          className="sketch-container"
          style={{ minHeight: "54vh", height: "54vh" }}
        >
          {loading && (
            <div className="sketch-loading" role="status" aria-live="polite">
              <span className="sketch-loading-spinner" aria-hidden="true" />
              <span className="sketch-loading-text console-loading">loading sketch</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Sketch"
            className="sketch-iframe"
            style={{ display: loading ? "none" : "block" }}
          />
          {error && (
            <div className="sketch-error" style={{ display: "flex" }}>
              {error}
            </div>
          )}
        </div>
        <div className="gallery-panel">
          <h2 className="gallery-panel-title">variants</h2>
          {variants.length === 0 ? (
            <p className="gallery-hint">Add variant to capture outputs here</p>
          ) : null}
          <ul className="gallery-list" aria-label="Variantes añadidas">
            {variants.map((v) => (
              <li key={v.id} className="gallery-variant-item">
                <div className="gallery-variant-thumb-wrap">
                  <img src={v.dataUrl} alt="Variant" />
                </div>
                <div className="gallery-variant-actions">
                  <button
                    type="button"
                    className="gallery-variant-btn"
                    onClick={() => setModalVariant(v)}
                    title="View fullscreen"
                    aria-label="View variant fullscreen"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="gallery-variant-btn"
                    onClick={() => handleDownloadVariant(v)}
                    title="Download"
                    aria-label="Download variant"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="gallery-variant-btn"
                    onClick={() => handleRemoveVariant(v.id)}
                    title="Remove"
                    aria-label="Remove variant"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {modalVariant && (
        <div
          className="gallery-modal-overlay variant-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Variant fullscreen"
          onClick={(e) => e.target === e.currentTarget && closeVariantModal()}
        >
          <button
            type="button"
            className="variant-modal-close"
            aria-label="Close"
            onClick={closeVariantModal}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="gallery-modal-content variant-modal-content">
            <img
              src={modalVariant.dataUrl}
              alt="Variant"
              className="gallery-modal-image"
            />
            <div className="variant-modal-actions">
              <button
                type="button"
                className="gallery-variant-btn"
                onClick={() => handleDownloadVariant(modalVariant)}
                title="Download"
                aria-label="Download variant"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                type="button"
                className="gallery-variant-btn"
                onClick={() => {
                  handleRemoveVariant(modalVariant.id);
                  closeVariantModal();
                }}
                title="Remove"
                aria-label="Remove variant"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Sketch {
  id: string;
  name: string;
  type: string;
  tech?: string[];
}

type TypeFilter = "all" | "2026" | "2019-seeds" | "original";

export default function Sketches() {
  const navigate = useNavigate();
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [filtered, setFiltered] = useState<Sketch[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("sketches-page");
    return () => document.body.classList.remove("sketches-page");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load(retries = 2) {
      try {
        const res = await fetch("/api/sketches");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          const msg = (data as { error?: string }).error || "Error loading sketches";
          throw new Error(msg);
        }
        const seeds2019 = (data["2019-seeds"] || data.experimental || []).map((s: Sketch) => ({
          ...s,
          type: "2019-seeds",
        }));
        const originals = (data.originals || []).map((s: Sketch) => ({
          ...s,
          type: "original",
        }));
        const seeds2026 = (data["2026"] || []).map((s: Sketch) => ({
          ...s,
          type: "2026",
        }));
        // 2026 primero, luego 2019, luego originals
        const all = [...seeds2026, ...seeds2019, ...originals];
        setSketches(all);
        setFiltered(all);
      } catch (err) {
        if (cancelled) return;
        const isNetwork =
          (err as Error).message?.toLowerCase().includes("fetch") ||
          (err as Error).message?.toLowerCase().includes("network") ||
          (err as Error).message?.toLowerCase().includes("failed");
        if (isNetwork && retries > 0) {
          await new Promise((r) => setTimeout(r, 1500));
          return load(retries - 1);
        }
        const msg = isNetwork
          ? "No se pudo conectar al servidor. Ejecuta: npm run dev (necesita API + Vite)"
          : (err as Error).message;
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    let base = sketches;
    if (typeFilter !== "all") {
      base = sketches.filter((s) => s.type === typeFilter);
    }
    const next = q
      ? base.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            (s.tech || []).some((t) => t.toLowerCase().includes(q))
        )
      : base;
    setFiltered(next);
  }, [search, sketches, typeFilter]);

  useEffect(() => {
    const el = document.getElementById("sketch-count");
    if (el) el.textContent = `${filtered.length} sketches`;
  }, [filtered.length]);

  async function runSketch(type: string, id: string) {
    try {
      const res = await fetch(`/api/run/${type}/${encodeURIComponent(id)}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error starting");
      navigate(data.url);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const getTypeTag = (type: string) =>
    type === "original" ? "original" : type === "2026" ? "2026" : "2019";

  return (
    <div className="sketches-main">
      {loading && <div className="loading console-loading">initializing</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <>
          <div className="sketch-filter-tabs">
            <button
              type="button"
              className={`sketch-filter-tab ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              todo
            </button>
            <button
              type="button"
              className={`sketch-filter-tab ${typeFilter === "2026" ? "active" : ""}`}
              onClick={() => setTypeFilter("2026")}
            >
              2026
            </button>
            <button
              type="button"
              className={`sketch-filter-tab ${typeFilter === "2019-seeds" ? "active" : ""}`}
              onClick={() => setTypeFilter("2019-seeds")}
            >
              2019
            </button>
            <button
              type="button"
              className={`sketch-filter-tab ${typeFilter === "original" ? "active" : ""}`}
              onClick={() => setTypeFilter("original")}
            >
              originals
            </button>
          </div>
          <div className="sketch-search-wrap">
            <input
              type="text"
              className="sketch-search"
              placeholder=""
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
            <span className="sketch-search-icon" aria-hidden="true">
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
          <div className="sketch-list">
            {filtered.map((s) => {
              const displayName = s.id.includes("/")
                ? s.id.split("/").pop() + ".js"
                : s.name;
              const typeTag = getTypeTag(s.type);
              return (
                <div
                  key={`${s.type}-${s.id}`}
                  className="sketch-row"
                  data-id={s.id}
                  data-type={s.type}
                >
                  <span className="sketch-type-tag">{typeTag}</span>
                  <span className="sketch-filename">{displayName}</span>
                  <span className="sketch-tech">
                    {(s.tech || ["canvas-sketch"]).join(" · ")}
                  </span>
                  <button
                    type="button"
                    className="sketch-run-btn"
                    aria-label={`Run ${displayName}`}
                    onClick={() => runSketch(s.type, s.id)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

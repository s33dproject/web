import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ROUTES = [
  { path: "/v0id", label: "v0id" },
  { path: "/manifest", label: "manifest" },
  ...(import.meta.env.DEV ? [{ path: "/sketches", label: "sketches" }] : []),
  { path: "/gallery", label: "gallery" },
  { path: "/#m3mory", label: "m3mory" },
];

const MENU_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CLOSE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("nav-menu-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("nav-menu-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("nav-menu-open");
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="nav-menu-trigger">
      <button
        type="button"
        className="nav-menu-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? CLOSE_ICON : MENU_ICON}
      </button>
      {open && (
        <div
          className="nav-menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="nav-menu-panel">
            <button
              type="button"
              className="nav-menu-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              {CLOSE_ICON}
            </button>
            <div className="nav-menu-columns">
              <div className="nav-menu-col">
                <span className="nav-menu-title">s33d/</span>
                <nav className="nav-menu-tree">
                  {ROUTES.map((r, i) =>
                    r.path.startsWith("/#") ? (
                      <Link
                        key={r.path}
                        to={r.path}
                        className="nav-menu-item"
                        onClick={() => setOpen(false)}
                      >
                        <span className="nav-menu-branch">
                          {i === ROUTES.length - 1 ? "└──" : "├──"}
                        </span>
                        <span className="nav-menu-label">{r.label}</span>
                      </Link>
                    ) : (
                      <Link
                        key={r.path}
                        to={r.path}
                        className="nav-menu-item"
                        onClick={() => setOpen(false)}
                      >
                        <span className="nav-menu-branch">
                          {i === ROUTES.length - 1 ? "└──" : "├──"}
                        </span>
                        <span className="nav-menu-label">{r.label}</span>
                      </Link>
                    )
                  )}
                </nav>
              </div>
              <div className="nav-menu-col">
                <p className="nav-menu-manifest-text">
                  Deterministic inputs.
                  <br />
                  Unstable outputs.
                  <br />
                  <br />
                  Run it.
                  <br />
                  Break it.
                  <br />
                  Watch it repeat differently.
                </p>
              </div>
              <div className="nav-menu-col" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

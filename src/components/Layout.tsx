import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function formatSketchName(id: string) {
  return decodeURIComponent(id)
    .split(/[-_/]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function Layout() {
  const { pathname } = useLocation();
  const { name } = useParams();

  let variant: "landing" | "gallery" | "void" | "sketches" | "run" | "manifest" = "landing";
  let centerContent: React.ReactNode = undefined;

  const sep = <span className="header-sep" aria-hidden="true"> · </span>;
  if (pathname.startsWith("/run") && name) {
    variant = "run";
    centerContent = (
      <div className="header-center-content">
        <Link to="/" className="brand">s33d</Link>
        <h1 className="header-title">{formatSketchName(name)}</h1>
        {sep}
        <span className="header-subtitle">running</span>
      </div>
    );
  } else if (pathname === "/gallery") {
    variant = "gallery";
    centerContent = (
      <div className="header-center-content">
        <Link to="/" className="brand">s33d</Link>
        <h1 className="header-title">gallery</h1>
        {sep}
        <span id="piece-count" className="header-subtitle">loading</span>
      </div>
    );
  } else if (pathname === "/manifest") {
    variant = "manifest";
    centerContent = (
      <div className="header-center-content">
        <Link to="/" className="brand">s33d</Link>
        <h1 className="header-title">manifest</h1>
        {sep}
        <span className="header-subtitle">principles</span>
      </div>
    );
  } else if (pathname === "/v0id") {
    variant = "void";
    centerContent = (
      <div className="header-center-content">
        <Link to="/" className="brand">s33d</Link>
        <h1 className="header-title">void</h1>
        {sep}
        <span className="header-subtitle">noise</span>
      </div>
    );
  } else if (pathname === "/sketches") {
    variant = "sketches";
    centerContent = (
      <div className="header-center-content">
        <Link to="/" className="brand">s33d</Link>
        <h1 className="header-title">sketches</h1>
        {sep}
        <span id="sketch-count" className="header-subtitle">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <Header variant={variant} centerContent={centerContent} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

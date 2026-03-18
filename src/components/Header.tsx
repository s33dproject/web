import { Link } from "react-router-dom";
import NavMenu from "./NavMenu";

interface HeaderProps {
  variant?: "landing" | "gallery" | "void" | "sketches" | "run" | "manifest";
  centerContent?: React.ReactNode;
}

export default function Header({ variant = "landing", centerContent }: HeaderProps) {
  const headerClass = variant === "landing" ? "landing-header" : `${variant}-header`;
  return (
    <header className={`${headerClass} site-header-centered`}>
      <span className="nav-spacer" />
      {centerContent ?? (
        <Link to="/" className="brand">
          s33d
        </Link>
      )}
      <NavMenu />
    </header>
  );
}

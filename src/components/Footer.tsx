import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h3>connect</h3>
          <div className="footer-social">
            <a href="#" title="Instagram" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" title="Twitter" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </a>
            <a href="#" title="GitHub" aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-section">
          <h3>location</h3>
          <p className="footer-location">lat —0.0000 · lon 0.0000</p>
          <p className="footer-placeholder">// coordinates placeholder</p>
        </div>
        <div className="footer-section">
          <h3>sitemap</h3>
          <ul>
            <li><Link to="/v0id">v0id</Link></li>
            <li><Link to="/manifest">manifest</Link></li>
            {import.meta.env.DEV && (
              <li><Link to="/sketches">sketches</Link></li>
            )}
            <li><Link to="/gallery">gallery</Link></li>
            <li><Link to="/#m3mory">m3mory</Link></li>
          </ul>
        </div>
        <div className="footer-section footer-cryptic">
          <h3>trace</h3>
          <span className="footer-log" data-level="warning">[warning] perception mismatch</span>
          <span className="footer-log" data-level="info">[info] output already existed</span>
          <span className="footer-log" data-level="error">[error] user expects randomness</span>
        </div>
        <div className="footer-section">
          <h3>state</h3>
          <p className="footer-cryptic">latent · unfold · drift · seed</p>
        </div>
        <p className="footer-tagline">compile → mutate → repeat · the system dreams in loops</p>
      </div>
    </footer>
  );
}

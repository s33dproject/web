import { useEffect } from "react";
import LandingTextEscape from "../components/LandingTextEscape";

export default function Manifest() {
  useEffect(() => {
    document.body.classList.add("manifest-page");
    return () => document.body.classList.remove("manifest-page");
  }, []);

  return (
    <div className="manifest-main">
      <div className="landing-columns">
        <div className="landing-col">
          <p className="landing-text">
            <LandingTextEscape>
              {`01 — nothing is generated
02 — everything is revealed

03 — the seed is not a beginning
04 — it is a constraint

05 — repetition is a lie
06 — variation is inevitable

07 — control is an interface
08 — instability is the core

09 — the system does not improvise
10 — it unfolds what was already encoded

11 — perception introduces noise
12 — noise becomes meaning`}
            </LandingTextEscape>
          </p>
          <p className="manifest-comments">
            // S33D is not visual
            <br />
            // S33D is procedural perception
          </p>
        </div>
      </div>
    </div>
  );
}

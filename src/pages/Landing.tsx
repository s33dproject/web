import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import LandingBgDynamic from "../components/LandingBgDynamic";
import LandingTextEscape from "../components/LandingTextEscape";

export default function Landing() {
  const aboutRef = useRef<HTMLElement>(null);
  const { hash } = useLocation();

  useEffect(() => {
    document.body.classList.add("landing");
    return () => document.body.classList.remove("landing");
  }, []);

  useEffect(() => {
    if (hash !== "#m3mory") return;
    const el = aboutRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hash]);

  return (
    <div className="landing-main">
      <section className="hero">
        <LandingBgDynamic />
        <h1 className="hero-title">
          <LandingTextEscape>the system dreams<br />in loops</LandingTextEscape>
        </h1>
        <p className="hero-subtitle">compile → mutate → repeat</p>
      </section>

      <section ref={aboutRef} id="m3mory" className="about-section">
        <div className="landing-columns">
          <div className="landing-col">
            <p className="landing-text">
              <LandingTextEscape>
                {`S33D is a generative system.

It does not create.
It unfolds.
            
Every image, form, and variation exists in a latent state,
waiting for a seed to be invoked.
            
Deterministic.
Unstable.
Repeatable.
Never identical `}
                <span className="blink-cursor">_</span>
                {`

`}
                <span className="landing-comment">// run → observe → drift</span>
              </LandingTextEscape>
            </p>
          </div>
          <div className="landing-col">
            <p className="landing-text">
              <LandingTextEscape>
                {`S33D explores the paradox of controlled emergence.

A seed defines everything.
And yet, nothing feels fixed.
            
Each execution is bound to a numeric origin,
but perception fractures the outcome:
patterns appear, dissolve, reconfigure.
            
This is not randomness.
This is structure under pressure.
            
S33D operates in the space between:
code and accident
precision and hallucination
instruction and interpretation
            
Every output is a trace.
Every trace is reproducible.
Every reproduction is different `}
                <span className="blink-cursor">_</span>
                {`

`}
                <span className="landing-comment">// the system remembers differently each time</span>
              </LandingTextEscape>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";

import { THEMES, useTheme } from "../ThemeProvider";
import { Icon } from "./primitives";

export default function TweaksPanel() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="sb-tweaks-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme tweaks"
      >
        <Icon name="palette" size={12} />
        <span>tweaks</span>
      </button>

      {open && (
        <aside className="sb-tweaks" role="dialog" aria-label="Tweaks">
          <div className="sb-tweaks__head">
            <span className="sb-tweaks__title">tweaks</span>
            <button
              type="button"
              className="sb-iconbtn"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <Icon name="x" />
            </button>
          </div>
          <div className="sb-tweaks__body">
            <section className="sb-tweaks__section">
              <span className="sb-tweaks__label">theme</span>
              <div className="sb-tweaks__opts">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`sb-tweaks__opt${theme === t.value ? " is-active" : ""}`}
                    onClick={() => setTheme(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>
      )}
    </>
  );
}

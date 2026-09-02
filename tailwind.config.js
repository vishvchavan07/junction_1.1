/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ======================================================
        // JUNCTION PREMIUM DESIGN TOKEN SYSTEM
        // Warm Parchment + Precision Graphite + Muted Railway Status
        // ======================================================

        // ── Primary Backgrounds ──
        "rail-bg":                "#F2EADF",   // Warm parchment (primary)
        "background":             "#F2EADF",

        // ── Surfaces ──
        "rail-surface":           "#F0ECE4",   // Surface hover
        "rail-surface-card":      "#FBF9F4",   // Surface
        "rail-surface-inset":     "#EDE5D8",   // Inset / recessed
        "rail-surface-elevated":  "#F8F5EF",   // Soft ivory (secondary bg)
        "surface":                "#FBF9F4",
        "surface-dim":            "#F0ECE4",
        "surface-bright":         "#F8F5EF",
        "surface-container-lowest": "#F2EADF",
        "surface-container-low":  "#EDE5D8",
        "surface-container":      "#E4D9CC",
        "surface-container-high": "#D9CCBC",
        "surface-container-highest": "#D5CEC1",

        // ── Technical Lines & Borders ──
        "rail-line":              "#1D1F1E",   // Deep graphite (primary ink)
        "rail-line-muted":        "#D5CEC1",   // Divider
        "rail-line-subtle":       "#E8E2D8",   // Subtle border
        "border":                 "#1D1F1E",
        "border-muted":           "#D5CEC1",
        "outline":                "#1D1F1E",
        "outline-variant":        "#D5CEC1",

        // ── Typography / Ink ──
        "rail-text":              "#1D1F1E",   // Deep graphite
        "rail-text-secondary":    "#4B4A46",   // Secondary ink
        "rail-text-muted":        "#77736C",   // Muted text
        "on-surface":             "#1D1F1E",
        "on-surface-variant":     "#4B4A46",
        "inverse-surface":        "#1D1F1E",
        "inverse-on-surface":     "#F2EADF",

        // ── Active Graphite ──
        "active-graphite":        "#242725",

        // ── Restrained Railway Status Colors ──
        "rail-red":               "#C84B43",   // Industrial red
        "rail-red-tint":          "#F9EEEE",
        "rail-red-border":        "#DCA09C",

        "rail-yellow":            "#D49A32",   // Railway amber
        "rail-yellow-tint":       "#FBF5E6",
        "rail-yellow-border":     "#E0BF7A",

        "rail-green":             "#4D8B68",   // Clear/proceed green
        "rail-green-tint":        "#EDF5F0",
        "rail-green-border":      "#96C4AE",

        "rail-warning":           "#D49A32",
        "rail-active":            "#4D8B68",

        // ── Industrial Rust Accent (use sparingly) ──
        "rail-accent":            "#A9674B",   // Industrial rust
        "rail-accent-tint":       "#F5EDE8",
        "rail-accent-muted":      "#C4957E",

        // ── Primary / Secondary Tokens ──
        "primary":                "#1D1F1E",
        "on-primary":             "#F2EADF",
        "primary-container":      "#EDE5D8",
        "on-primary-container":   "#1D1F1E",

        "secondary":              "#A9674B",
        "on-secondary":           "#FFFFFF",
        "secondary-container":    "#F5EDE8",
        "on-secondary-container": "#1D1F1E",

        "error":                  "#C84B43",
        "on-error":               "#FFFFFF",
        "error-container":        "#F9EEEE",
        "on-error-container":     "#7D2320",

        // ── Railway Signal Mapping ──
        "signal": {
          green:  "#4D8B68",
          amber:  "#D49A32",
          yellow: "#D49A32",
          red:    "#C84B43",
          blue:   "#1E3A5F",
          purple: "#6B21A8",
        },

        // ── Backward compatibility mapping ──
        "railway": {
          paper:       "#F2EADF",
          parchment:   "#EDE5D8",
          aged:        "#D5CEC1",
          ink:         "#1D1F1E",
          "ink-soft":  "#4B4A46",
          rail:        "#1D1F1E",
          crimson:     "#C84B43",
          navy:        "#1E3A5F",
          amber:       "#D49A32",
          gold:        "#D49A32",
          rust:        "#A9674B",
          sky:         "#E0F2FE",
          grass:       "#EDF5F0",
          track:       "#2A2D2B",
          cream:       "#FBF9F4",
          "header-bg": "#F8F5EF",
          "accent-bar":"#1D1F1E",
        },

        "navy": {
          950: "#090d16",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
        },
      },

      fontFamily: {
        // Space Grotesk — brand / display / major titles / key numbers
        "display":      ["Space Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "headline":     ["Space Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "brand":        ["Space Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        // Inter — all operational UI, body, data, labels, buttons
        "sans":         ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        "ui":           ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        // JetBrains Mono — codes, IDs, technical notation only
        "mono":         ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
        "data-compact": ["JetBrains Mono", "monospace"],
        "data-primary": ["JetBrains Mono", "monospace"],
        "serif":        ["Inter", "sans-serif"],
      },

      fontSize: {
        // Typographic scale
        "display-2xl": ["48px", { lineHeight: "1.1",  letterSpacing: "-0.03em" }],
        "display-xl":  ["40px", { lineHeight: "1.1",  letterSpacing: "-0.025em" }],
        "display-lg":  ["36px", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "page-title":  ["28px", { lineHeight: "1.2",  letterSpacing: "-0.02em" }],
        "section-xl":  ["22px", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        "section-lg":  ["18px", { lineHeight: "1.3",  letterSpacing: "-0.01em" }],
        "body-lg":     ["16px", { lineHeight: "1.6",  letterSpacing: "0" }],
        "body":        ["14px", { lineHeight: "1.5",  letterSpacing: "0" }],
        "body-sm":     ["13px", { lineHeight: "1.5",  letterSpacing: "0" }],
        "secondary":   ["12px", { lineHeight: "1.4",  letterSpacing: "0" }],
        "label":       ["11px", { lineHeight: "1.3",  letterSpacing: "0.02em" }],
        "micro":       ["10px", { lineHeight: "1.2",  letterSpacing: "0.04em" }],
        "nano":        ["9px",  { lineHeight: "1.2",  letterSpacing: "0.05em" }],
      },

      spacing: {
        "unit":           "4px",
        "gutter":         "16px",
        "margin-edge":    "24px",
        "stack-loose":    "24px",
        "stack-compact":  "8px",
      },

      borderWidth: {
        DEFAULT: "1px",
        "0": "0px",
        "0.5": "0.5px",
        "1": "1px",
        "1.5": "1.5px",
        "2": "2px",
      },

      borderRadius: {
        DEFAULT: "2px",
        none:    "0px",
        sm:      "2px",
        md:      "4px",
        lg:      "6px",
        xl:      "8px",
      },

      boxShadow: {
        "pen-flat":   "0px 1px 0px 0px #D5CEC1",
        "pen-subtle": "0px 1px 3px 0px rgba(29,31,30,0.06), 0px 1px 2px -1px rgba(29,31,30,0.04)",
        "pen-lift":   "0px 2px 8px 0px rgba(29,31,30,0.08), 0px 1px 3px -1px rgba(29,31,30,0.05)",
        "pen-focus":  "0 0 0 2px #F2EADF, 0 0 0 3.5px #1D1F1E",
        none: "none",
      },

      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar":       "radar 4s linear infinite",
        "train-move":  "trainMove 20s linear infinite",
        "slide-in":    "slideIn 0.2s ease-out",
        "fade-in":     "fadeIn 0.3s ease-out",
        "reveal-up":   "revealUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      },

      keyframes: {
        radar: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        slideIn: {
          "0%":   { transform: "translateX(-6px)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        revealUp: {
          "0%":   { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

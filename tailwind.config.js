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
        // JUNCTION BLUE PROFESSIONAL RAILWAY OPERATIONS THEME
        // Deep Navy + Dark Steel Blue + Ice White + Authentic Signals
        // ======================================================

        // ── Primary Backgrounds ──
        "rail-bg":                "#071A2B",   // Deep Navy (primary)
        "background":             "#071A2B",

        // ── Surfaces ──
        "rail-surface":           "#0D263D",   // Main Surface (Dark Steel Blue)
        "rail-surface-card":      "#0D263D",   // Main Card Surface
        "rail-surface-inset":     "#051422",   // Inset / recessed deep navy
        "rail-surface-elevated":  "#123551",   // Secondary Surface (Railway Blue)
        "surface":                "#0D263D",
        "surface-dim":            "#071A2B",
        "surface-bright":         "#123551",
        "surface-container-lowest": "#051422",
        "surface-container-low":  "#071A2B",
        "surface-container":      "#0D263D",
        "surface-container-high": "#123551",
        "surface-container-highest": "#194164",

        // ── Technical Lines & Borders ──
        "rail-line":              "#29455D",   // Steel Blue Border
        "rail-line-muted":        "#1E384F",   // Subtle Divider
        "rail-line-subtle":       "#142B3E",   // Hairline
        "border":                 "#29455D",
        "border-muted":           "#1E384F",
        "outline":                "#3B82C4",
        "outline-variant":        "#29455D",

        // ── Typography / Ink ──
        "rail-text":              "#F7FAFC",   // Primary Text (Ice White)
        "rail-text-secondary":    "#A9BBCB",   // Secondary Text (Soft Steel Blue)
        "rail-text-muted":        "#71879A",   // Muted Text (Muted Blue-Gray)
        "on-surface":             "#F7FAFC",
        "on-surface-variant":     "#A9BBCB",
        "inverse-surface":        "#F4F7FA",
        "inverse-on-surface":     "#071A2B",

        // ── Blue Accent System ──
        "rail-accent-blue":       "#3B82C4",   // Operations Blue
        "rail-accent-light":      "#79B8E6",   // Light Sky Blue
        "rail-accent-glow":       "rgba(59, 130, 196, 0.15)",

        // ── Controlled Railway Signal Colors ──
        "rail-red":               "#D45555",   // Signal Red
        "rail-red-tint":          "rgba(212, 85, 85, 0.12)",
        "rail-red-border":        "rgba(212, 85, 85, 0.4)",

        "rail-yellow":            "#D7A63A",   // Signal Yellow / Caution
        "rail-yellow-tint":       "rgba(215, 166, 58, 0.12)",
        "rail-yellow-border":     "rgba(215, 166, 58, 0.4)",

        "rail-green":             "#46A06A",   // Signal Green / Proceed
        "rail-green-tint":        "rgba(70, 160, 106, 0.12)",
        "rail-green-border":      "rgba(70, 160, 106, 0.4)",

        "rail-warning":           "#D7A63A",
        "rail-active":            "#46A06A",

        // ── Indian Railway Warm Accent (used sparingly) ──
        "rail-accent":            "#C96A45",   // Warm Indian Railway Accent
        "rail-accent-tint":       "rgba(201, 106, 69, 0.12)",
        "rail-accent-muted":      "#A35332",

        // ── Primary / Secondary Tokens ──
        "primary":                "#3B82C4",
        "on-primary":             "#F7FAFC",
        "primary-container":      "#123551",
        "on-primary-container":   "#79B8E6",

        "secondary":              "#123551",
        "on-secondary":           "#F7FAFC",
        "secondary-container":    "#0D263D",
        "on-secondary-container": "#A9BBCB",

        "error":                  "#D45555",
        "on-error":               "#FFFFFF",
        "error-container":        "rgba(212, 85, 85, 0.12)",
        "on-error-container":     "#FCA5A5",

        // ── Railway Signal Mapping ──
        "signal": {
          green:  "#46A06A",
          amber:  "#D7A63A",
          yellow: "#D7A63A",
          red:    "#D45555",
          blue:   "#3B82C4",
          purple: "#9333EA",
        },

        // ── Canvas Drafting Colors ──
        "drafting": {
          bg:         "#EBF1F6",
          grid:       "#D2DEE9",
          ink:        "#1B3246",
          rail:       "#0D263D",
          mast:       "#1B3246",
          wire:       "#29455D",
        },

        // ── Backward compatibility mapping ──
        "railway": {
          paper:       "#071A2B",
          parchment:   "#0D263D",
          aged:        "#29455D",
          ink:         "#F7FAFC",
          "ink-soft":  "#A9BBCB",
          rail:        "#29455D",
          crimson:     "#D45555",
          navy:        "#071A2B",
          amber:       "#D7A63A",
          gold:        "#D7A63A",
          rust:        "#C96A45",
          sky:         "#79B8E6",
          grass:       "#46A06A",
          track:       "#0D263D",
          cream:       "#F4F7FA",
          "header-bg": "#071A2B",
          "accent-bar":"#3B82C4",
        },

        "navy": {
          950: "#040D16",
          900: "#071A2B",
          800: "#0D263D",
          700: "#123551",
          600: "#194164",
          500: "#29455D",
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
        "page-title":  ["26px", { lineHeight: "1.2",  letterSpacing: "-0.02em" }],
        "section-xl":  ["20px", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        "section-lg":  ["17px", { lineHeight: "1.3",  letterSpacing: "-0.01em" }],
        "body-lg":     ["15px", { lineHeight: "1.6",  letterSpacing: "0" }],
        "body":        ["13.5px", { lineHeight: "1.5",  letterSpacing: "0" }],
        "body-sm":     ["12.5px", { lineHeight: "1.5",  letterSpacing: "0" }],
        "secondary":   ["11.5px", { lineHeight: "1.4",  letterSpacing: "0" }],
        "label":       ["10.5px", { lineHeight: "1.3",  letterSpacing: "0.02em" }],
        "micro":       ["9.5px",  { lineHeight: "1.2",  letterSpacing: "0.04em" }],
        "nano":        ["8.5px",  { lineHeight: "1.2",  letterSpacing: "0.05em" }],
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
        DEFAULT: "4px",
        none:    "0px",
        sm:      "3px",
        md:      "4px",
        lg:      "6px",
        xl:      "8px",
      },

      boxShadow: {
        "panel":      "0px 2px 8px 0px rgba(4, 13, 22, 0.4)",
        "panel-lift": "0px 4px 16px 0px rgba(4, 13, 22, 0.6)",
        "subtle":     "0px 1px 3px 0px rgba(4, 13, 22, 0.3)",
        "glow-blue":  "0 0 12px rgba(59, 130, 196, 0.25)",
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

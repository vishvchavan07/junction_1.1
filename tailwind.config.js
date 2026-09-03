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
        // JUNCTION WHITE PROFESSIONAL RAILWAY OPERATIONS THEME
        // Pure White + Crisp Slate + Deep Charcoal Ink + Authentic Signals
        // ======================================================

        // ── Primary Backgrounds ──
        "rail-bg":                "#F8FAFC",   // Crisp Slate-50 Background
        "background":             "#F8FAFC",

        // ── Surfaces ──
        "rail-surface":           "#FFFFFF",   // Pure White Main Surface
        "rail-surface-card":      "#FFFFFF",   // White Card
        "rail-surface-inset":     "#F1F5F9",   // Slate-100 Inset / Recessed
        "rail-surface-elevated":  "#FFFFFF",   // Elevated White
        "surface":                "#FFFFFF",
        "surface-dim":            "#F8FAFC",
        "surface-bright":         "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low":  "#F8FAFC",
        "surface-container":      "#F1F5F9",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#CBD5E1",

        // ── Technical Lines & Borders ──
        "rail-line":              "#E2E8F0",   // Crisp Slate Border (Slate-200)
        "rail-line-muted":        "#CBD5E1",   // Divider (Slate-300)
        "rail-line-subtle":       "#F1F5F9",   // Hairline
        "border":                 "#E2E8F0",
        "border-muted":           "#CBD5E1",
        "outline":                "#2563EB",
        "outline-variant":        "#E2E8F0",

        // ── Typography / Ink ──
        "rail-text":              "#0F172A",   // Primary Ink (Slate-900)
        "rail-text-secondary":    "#475569",   // Secondary Ink (Slate-600)
        "rail-text-muted":        "#94A3B8",   // Muted Ink (Slate-400)
        "on-surface":             "#0F172A",
        "on-surface-variant":     "#475569",
        "inverse-surface":        "#0F172A",
        "inverse-on-surface":     "#FFFFFF",

        // ── Professional Blue Accent ──
        "rail-accent-blue":       "#2563EB",   // Professional Royal Blue
        "rail-accent-light":      "#3B82F6",
        "rail-accent-glow":       "rgba(37, 99, 235, 0.12)",

        // ── Controlled Railway Signal Colors ──
        "rail-red":               "#DC2626",   // Signal Red
        "rail-red-tint":          "#FEF2F2",
        "rail-red-border":        "#FECACA",

        "rail-yellow":            "#D97706",   // Signal Amber / Caution
        "rail-yellow-tint":       "#FFFBEB",
        "rail-yellow-border":     "#FDE68A",

        "rail-green":             "#16A34A",   // Signal Green / Proceed
        "rail-green-tint":        "#F0FDF4",
        "rail-green-border":      "#BBF7D0",

        "rail-warning":           "#D97706",
        "rail-active":            "#16A34A",

        // ── Indian Railway Warm Accent ──
        "rail-accent":            "#C2410C",   // Rust / Orange Accent
        "rail-accent-tint":       "#FFF7ED",
        "rail-accent-muted":      "#EA580C",

        // ── Primary / Secondary Tokens ──
        "primary":                "#0F172A",
        "on-primary":             "#FFFFFF",
        "primary-container":      "#F1F5F9",
        "on-primary-container":   "#0F172A",

        "secondary":              "#2563EB",
        "on-secondary":           "#FFFFFF",
        "secondary-container":    "#EFF6FF",
        "on-secondary-container": "#1E40AF",

        "error":                  "#DC2626",
        "on-error":               "#FFFFFF",
        "error-container":        "#FEF2F2",
        "on-error-container":     "#991B1B",

        // ── Railway Signal Mapping ──
        "signal": {
          green:  "#16A34A",
          amber:  "#D97706",
          yellow: "#D97706",
          red:    "#DC2626",
          blue:   "#2563EB",
          purple: "#7C3AED",
        },

        // ── Canvas Drafting Colors ──
        "drafting": {
          bg:         "#FFFFFF",
          grid:       "#F1F5F9",
          ink:        "#0F172A",
          rail:       "#0F172A",
          mast:       "#1E293B",
          wire:       "#334155",
        },

        // ── Backward compatibility mapping ──
        "railway": {
          paper:       "#F8FAFC",
          parchment:   "#FFFFFF",
          aged:        "#E2E8F0",
          ink:         "#0F172A",
          "ink-soft":  "#475569",
          rail:        "#0F172A",
          crimson:     "#DC2626",
          navy:        "#0F172A",
          amber:       "#D97706",
          gold:        "#D97706",
          rust:        "#C2410C",
          sky:         "#3B82F6",
          grass:       "#16A34A",
          track:       "#0F172A",
          cream:       "#FFFFFF",
          "header-bg": "#FFFFFF",
          "accent-bar":"#0F172A",
        },

        "navy": {
          950: "#020617",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
        },
      },

      fontFamily: {
        "display":      ["Space Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "headline":     ["Space Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "brand":        ["Space Grotesk", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "sans":         ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        "ui":           ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        "mono":         ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
        "data-compact": ["JetBrains Mono", "monospace"],
        "data-primary": ["JetBrains Mono", "monospace"],
        "serif":        ["Inter", "sans-serif"],
      },

      fontSize: {
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
        "panel":      "0px 1px 3px 0px rgba(15, 23, 42, 0.06), 0px 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "panel-lift": "0px 4px 16px 0px rgba(15, 23, 42, 0.08), 0px 2px 6px -1px rgba(15, 23, 42, 0.04)",
        "subtle":     "0px 1px 2px 0px rgba(15, 23, 42, 0.05)",
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

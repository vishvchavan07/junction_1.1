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
        // JUNCTION DESIGN TOKEN SYSTEM (PRECISION LINE-ART & WARM BEIGE)
        // ======================================================

        // Core Canvas Background
        "rail-bg":                "#F7F4EE",
        "background":             "#F7F4EE",

        // Surfaces
        "rail-surface":           "#F0EBE1",
        "rail-surface-card":      "#FFFFFF",
        "rail-surface-inset":     "#EDE7DC",
        "rail-surface-elevated":  "#FAF7F2",
        "surface":                "#FAF7F2",
        "surface-dim":            "#F0EBE1",
        "surface-bright":         "#FFFFFF",
        "surface-container-lowest": "#F7F4EE",
        "surface-container-low":  "#F0EBE1",
        "surface-container":      "#E8E1D5",
        "surface-container-high": "#DFD7C8",
        "surface-container-highest": "#D5CCBB",

        // Technical Pen Lines & Borders
        "rail-line":              "#1A1815",
        "rail-line-muted":        "#D8D1C5",
        "rail-line-subtle":       "#EAE4D9",
        "border":                 "#1A1815",
        "border-muted":           "#D8D1C5",
        "outline":                "#1A1815",
        "outline-variant":        "#D8D1C5",

        // Typography / Ink
        "rail-text":              "#1A1815",
        "rail-text-secondary":    "#615A4F",
        "rail-text-muted":        "#8A8275",
        "on-surface":             "#1A1815",
        "on-surface-variant":     "#615A4F",
        "inverse-surface":        "#1A1815",
        "inverse-on-surface":     "#F7F4EE",

        // Restrained Railway Status Colors
        "rail-red":               "#B91C1C",
        "rail-red-tint":          "#FEF2F2",
        "rail-red-border":        "#F87171",

        "rail-yellow":            "#B45309",
        "rail-yellow-tint":       "#FFFBEB",
        "rail-yellow-border":     "#FBBF24",

        "rail-green":             "#15803D",
        "rail-green-tint":        "#F0FDF4",
        "rail-green-border":      "#4ADE80",

        "rail-warning":           "#B45309",
        "rail-active":            "#15803D",

        // Restrained Muted Warm Accent
        "rail-accent":            "#785D3F",
        "rail-accent-tint":       "#F7F3EE",
        "rail-accent-muted":      "#A38A6D",

        // Primary / Secondary Action Tokens
        "primary":                "#1A1815",
        "on-primary":             "#F7F4EE",
        "primary-container":      "#F0EBE1",
        "on-primary-container":   "#1A1815",

        "secondary":              "#785D3F",
        "on-secondary":           "#FFFFFF",
        "secondary-container":    "#EDE7DC",
        "on-secondary-container": "#1A1815",

        "error":                  "#B91C1C",
        "on-error":               "#FFFFFF",
        "error-container":        "#FEF2F2",
        "on-error-container":     "#7F1D1D",

        // Railway Signal Mapping
        "signal": {
          green:  "#15803D",
          amber:  "#B45309",
          yellow: "#B45309",
          red:    "#B91C1C",
          blue:   "#1E3A5F",
          purple: "#6B21A8",
        },

        // Backward compatibility mapping for existing components
        "railway": {
          paper:      "#F7F4EE",
          parchment:  "#EDE7DC",
          aged:       "#D8D1C5",
          ink:        "#1A1815",
          "ink-soft": "#615A4F",
          rail:       "#1A1815",
          crimson:    "#B91C1C",
          navy:       "#1E3A5F",
          amber:      "#B45309",
          gold:       "#B45309",
          rust:       "#785D3F",
          sky:        "#E0F2FE",
          grass:      "#F0FDF4",
          track:      "#2D2A26",
          cream:      "#FFFFFF",
          "header-bg":"#F7F4EE",
          "accent-bar":"#1A1815",
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
        "sans":         ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        "ui":           ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        "display":      ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "headline":     ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "mono":         ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
        "data-compact": ["JetBrains Mono", "monospace"],
        "data-primary": ["JetBrains Mono", "monospace"],
        "serif":        ["Inter", "sans-serif"], // replaced serif with modern sans
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
        DEFAULT: "0px",
        none:    "0px",
        sm:      "1px",
        md:      "2px",
        lg:      "4px",
      },

      boxShadow: {
        "pen-flat": "1px 1px 0px 0px #1A1815",
        "pen-subtle": "1px 1px 0px 0px #D8D1C5",
        "pen-focus": "0 0 0 2px #F7F4EE, 0 0 0 3.5px #1A1815",
        none: "none",
      },

      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar":       "radar 4s linear infinite",
        "train-move":  "trainMove 20s linear infinite",
        "slide-in":    "slideIn 0.2s ease-out",
        "fade-in":     "fadeIn 0.25s ease-out",
      },

      keyframes: {
        radar: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        slideIn: {
          "0%":   { transform: "translateX(-4px)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

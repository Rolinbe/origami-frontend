import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.03)",
        lift: "0 12px 32px -12px rgb(15 23 42 / 0.16)",
        "lift-lg": "0 24px 48px -16px rgb(15 23 42 / 0.22)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(8px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-scale": {
          from: {
            opacity: "0",
            transform: "scale(0.94)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.28)" },
          "50%": { boxShadow: "0 0 0 8px hsl(var(--primary) / 0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.14)" },
          "100%": { transform: "scale(1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "80%, 100%": { transform: "scale(2.1)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "card-hover": "card-hover 0.3s ease-in-out forwards",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-scale": "fade-in-scale 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        float: "float 3.5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.4s ease-out infinite",
        shimmer: "shimmer 2.2s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        pop: "pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spin-slow": "spin-slow 8s linear infinite",
        "ping-slow": "ping-slow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
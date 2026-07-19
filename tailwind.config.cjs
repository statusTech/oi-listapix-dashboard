/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'oklch(from var(--background) l c h / <alpha-value>)',
  			foreground: 'oklch(from var(--foreground) l c h / <alpha-value>)',
  			card: {
  				DEFAULT: 'oklch(from var(--card) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--card-foreground) l c h / <alpha-value>)'
  			},
  			popover: {
  				DEFAULT: 'oklch(from var(--popover) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--popover-foreground) l c h / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'oklch(from var(--primary) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--primary-foreground) l c h / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'oklch(from var(--secondary) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--secondary-foreground) l c h / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'oklch(from var(--muted) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--muted-foreground) l c h / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'oklch(from var(--accent) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--accent-foreground) l c h / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'oklch(from var(--destructive) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--destructive-foreground) l c h / <alpha-value>)'
  			},
  			border: 'oklch(from var(--border) l c h / <alpha-value>)',
  			input: 'oklch(from var(--input) l c h / <alpha-value>)',
  			ring: 'oklch(from var(--ring) l c h / <alpha-value>)',
  			chart: {
  				'1': 'oklch(from var(--chart-1) l c h / <alpha-value>)',
  				'2': 'oklch(from var(--chart-2) l c h / <alpha-value>)',
  				'3': 'oklch(from var(--chart-3) l c h / <alpha-value>)',
  				'4': 'oklch(from var(--chart-4) l c h / <alpha-value>)',
  				'5': 'oklch(from var(--chart-5) l c h / <alpha-value>)'
  			},
  			sidebar: {
  				DEFAULT: 'oklch(from var(--sidebar) l c h / <alpha-value>)',
  				foreground: 'oklch(from var(--sidebar-foreground) l c h / <alpha-value>)',
  				primary: 'oklch(from var(--sidebar-primary) l c h / <alpha-value>)',
  				'primary-foreground': 'oklch(from var(--sidebar-primary-foreground) l c h / <alpha-value>)',
  				accent: 'oklch(from var(--sidebar-accent) l c h / <alpha-value>)',
  				'accent-foreground': 'oklch(from var(--sidebar-accent-foreground) l c h / <alpha-value>)',
  				border: 'oklch(from var(--sidebar-border) l c h / <alpha-value>)',
  				ring: 'oklch(from var(--sidebar-ring) l c h / <alpha-value>)'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

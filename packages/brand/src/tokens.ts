export const brand = {
  name: "الوسيلة الذكية",
  tagline: "الوسيلة التفاعلية الأولى في اليمن",
  colors: {
    teal: { 700: "#007F78", 600: "#009688", 500: "#00B5A9", 400: "#29C8C0", 100: "#D7F4F1", 50: "#EEFAF9" },
    ink: { 950: "#0B282D", 900: "#123C43", 800: "#1D5158" },
    mint: "#E6F7F6",
    surface: "#F2F4F7",
    charcoal: "#1F2937",
    white: "#FFFFFF",
  },
  typography: {
    arabic: ['Cairo', 'Tajawal', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
    latin: ['Inter', 'system-ui', 'sans-serif'],
  },
  assets: {
    mark: "./assets/logo/logo-mark.svg",
    primary: "./assets/logo/logo-primary.svg",
    horizontal: "./assets/logo/logo-horizontal.svg",
    inverse: "./assets/logo/logo-horizontal-white.svg",
    monochrome: "./assets/logo/logo-mark-monochrome.svg",
    favicon: "./assets/app-icons/favicon.svg",
    pwa192: "./assets/app-icons/icon-192.png",
    pwa512: "./assets/app-icons/icon-512.png",
    maskable512: "./assets/app-icons/icon-maskable-512.png",
  },
} as const;

export type Brand = typeof brand;

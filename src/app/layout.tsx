import type { Metadata, Viewport } from "next";
import { Lexend, Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lexend",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hızlı Okuma Web | Bilimsel RSVP & ORP Hızlı Okuma Uygulaması",
  description: "Spritz ORP odaklama algoritması, dinamik noktalama gecikmesi, biyonik okuma ve göz egzersizleriyle dakikada 1000+ kelimeye ulaşın. Modern, ücretsiz ve açık kaynak hızlı okuma platformu.",
  keywords: ["hızlı okuma", "speed reading", "rsvp", "spritz", "orp", "bionic reading", "schulte tablosu", "göz egzersizleri", "dikkat geliştirme", "türkçe hızlı okuma"],
  authors: [{ name: "Resul Aykan", url: "https://github.com/resulaykan" }],
  creator: "Resul Aykan",
  openGraph: {
    title: "Hızlı Okuma Web | Bilimsel RSVP & ORP Hızlı Okuma Uygulaması",
    description: "Spritz ORP odaklama algoritması, biyonik okuma ve göz egzersizleriyle dakikada 1000+ kelimeye ulaşın.",
    type: "website",
    locale: "tr_TR",
    siteName: "Hızlı Okuma Web",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hızlı Okuma Web",
    description: "Bilimsel RSVP & ORP Hızlı Okuma Uygulaması",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="tr" 
      className={`${lexend.variable} ${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="antialiased font-lexend selection:bg-indigo-500/20 selection:text-indigo-400">
        {children}
      </body>
    </html>
  );
}
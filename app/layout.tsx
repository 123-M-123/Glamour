import type { Metadata } from "next"
import Script from "next/script"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import ConditionalHeader from "./components/ConditionalHeader"
import "./globals.css"
import BackButton from "./components/BackButton"

export const metadata: Metadata = {
  title: "Glamour Urquiza | Indumentaria y Accesorios",
  description: "Nombre Largo ej=> Glamour Urquiza (aca tiene que ir algo como de esta cantidad de texto que llame a la acción y genere ventas o visitas)   ",
  metadataBase: new URL("https://glamour-urquiza.vercel.app"),

  openGraph: {
    title: "Glamour Urquiza | Indumentaria y Accesorios",
    description: "Nombre Largo ej=> Glamour Urquiza (aca tiene que ir algo como de esta cantidad de texto que llame a la acción y genere ventas o visitas)",
    url: "https://glamour-urquiza.vercel.app",
    siteName: "Glamour | Urquiza",
    images: [
      {
        url: "/og/image-2.jpg",
        width: 1200,
        height: 630,
        type: "image-2/jpg",
        alt: "Glamour Urquiza | Indumentaria y Accesorios",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Glamour Urquiza | Indumentaria y Accesorios",
    description: "Nombre Largo ej=> Glamour Urquiza (aca tiene que ir algo como de esta cantidad de texto que llame a la acción y genere ventas o visitas)",
    images: ["/og/image-2.jpg"],
  },

  icons: {
    icon: "/favicon.png",
    apple: "/icon-192.png",
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Glamour",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" translate="no">
      <head>
        <meta name="theme-color" content="Ff0000" />

        <meta name="google-site-verification" content="c43EWcKPaKQuTZ0w9M0U0iLPzJEgoEQmVTxKVhzfn8I" />

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N88KRR1LFX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N88KRR1LFX');
          `}
        </Script>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <ConditionalHeader />
        <main>{children}</main>

        {/* 👇 BOTÓN VOLVER GLOBAL */}
        <BackButton />

        <Analytics />
      </body>
    </html>
  )
}
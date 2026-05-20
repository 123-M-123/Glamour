import type { Metadata } from "next"
import Script from "next/script"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import ConditionalHeader from "./components/ConditionalHeader"
import "./globals.css"
import BackButton from "./components/BackButton"
import Footer from './components/Footer'
import WhatsappGlobal from './components/WhatsappGlobal'

export const metadata: Metadata = {
  title: "Glamour | Indumentaria y Accesorios",
  description: "Resaltá tu esencia. Un espacio pensado para mujeres auténticas que buscan vestirse con estilo, comodidad y actitud  ",
  metadataBase: new URL("https://glamour-urquiza.vercel.app"),

  openGraph: {
    title: "Glamour | Indumentaria y Accesorios",
    description: "Resaltá tu esencia. Un espacio pensado para mujeres auténticas que buscan vestirse con estilo, comodidad y actitud",
    url: "https://glamour-urquiza.vercel.app",
    siteName: "Glamour",
    images: [
      {
        url: "/og/image-3.jpg",
        width: 1200,
        height: 630,
        type: "image-3/jpg",
        alt: "Glamour | Indumentaria y Accesorios",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Glamour | Indumentaria y Accesorios",
    description: "Resaltá tu esencia. Un espacio pensado para mujeres auténticas que buscan vestirse con estilo, comodidad y actitud",
    images: ["/og/image-3.jpg"],
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
    startupImage: "/icon-512.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" translate="no">
      <head>
        <meta name="theme-color" content="Ff0000" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />

        <meta name="google-site-verification" content="c43EWcKPaKQuTZ0w9M0U0iLPzJEgoEQmVTxKVhzfn8I" />

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R6EVQFS3YQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R6EVQFS3YQ');
          `}
        </Script>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <ConditionalHeader />
        <main>{children}</main>

        {/* 👇 BOTÓN VOLVER GLOBAL */}
        <BackButton />

        <Analytics />
         <Footer />
        <WhatsappGlobal />
      </body>
    </html>
  )
}
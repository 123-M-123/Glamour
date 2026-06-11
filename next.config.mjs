import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Agregamos dominios permitidos por seguridad de Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Este es el servidor real de fotos de Google
      },
    ],
  },

  async headers() {
    return [
        {
        source: "/og/image.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      // 🚩 REGLA 2: Habilitar el Visor (LiveMonitor) para TODO el sitio
      {
        source: "/:path*",
        headers: [
          {
            key: 'Content-Security-Policy',
            // Esto permite que Marcos te vea desde el panel central
            value: "frame-ancestors 'self' https://tienda-de-tiendas.vercel.app http://localhost:3000",
          },
        ],
      },
    ];
  },
}

export default pwaConfig(nextConfig)
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/Home',
        destination: '/home',
        permanent: true,
      },
      {
        source: '/Dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/CreateVenture',
        destination: '/create-venture',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
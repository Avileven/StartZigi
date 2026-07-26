

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
      // startzig.vercel.app -> www.startzig.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "startzig.vercel.app" }],
        destination: "https://www.startzig.com/:path*",
        permanent: true,
      },

      // startzig.com -> www.startzig.com (אם יש לך גם בלי www)
      {
        source: "/:path*",
        has: [{ type: "host", value: "startzig.com" }],
        destination: "https://www.startzig.com/:path*",
        permanent: true,
      },
    ];
  },

  // /plan is an alias for the existing /businessplan folder — the folder
  // itself is untouched, this just lets the URL bar show /plan. Any
  // existing links to /businessplan keep working exactly as before.
  async rewrites() {
    return [
      {
        source: "/plan",
        destination: "/businessplan",
      },
    ];
  },
};

module.exports = nextConfig;



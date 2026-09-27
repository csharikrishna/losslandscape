/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  async redirects() {
    return [
      { source: "/explore", destination: "/?mode=explore", permanent: false },
      { source: "/architecture", destination: "/?mode=architecture", permanent: false },
    ];
  },
};

export default nextConfig;

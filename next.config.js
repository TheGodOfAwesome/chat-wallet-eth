/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/users/:path*',
        destination: 'https://chat-wallet-webhook.onrender.com/api/users/:path*',
      },
    ]
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        // crypto: require.resolve("crypto-browserify"),
      };
    }
    return config;
  },
};

module.exports = nextConfig;

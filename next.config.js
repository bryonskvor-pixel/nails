/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve the existing index.html at root without touching it
  // Vercel handles this automatically when index.html is in /public
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.us1.bfl.ai' },
      { protocol: 'https', hostname: 'cdn.bfl.ai' },
      { protocol: 'https', hostname: 'storage.bfl.ai' },
    ],
  },
};

module.exports = nextConfig;

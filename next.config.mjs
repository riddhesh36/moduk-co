/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first, WebP fallback — cuts another ~25% off the JPEG/PNG originals
    // that next/image serves (about-img.jpg, moduk-gift-box.png, product shots).
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'emmtwdqbwlssvnxssomj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Files under /public are served with `Cache-Control: public, max-age=0` by
  // default, so a repeat visitor re-validates all 115 hero frames on every load.
  // These assets are content-stable, so give them a real cache life.
  async headers() {
    return [
      {
        // The frame sequence never changes in place — a re-export lands under
        // new filenames — so it can be cached hard.
        source: '/animation-frames/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Photography and icons can be replaced in place, so keep a day of
        // freshness and let the CDN serve stale while it refetches.
        source: '/:dir(images|favicons)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default nextConfig;

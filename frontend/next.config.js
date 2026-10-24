/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  // Allows CI/verification builds to compile without clobbering the live
  // .next directory that the production server is serving from.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: process.env.NEXT_TSCONFIG_PATH || 'tsconfig.json',
  },
  /**
   * Cloudflare / origin WAF на tvijo.com отдаёт 400 на некоторые Next chunks.
   * Раньше триггерились числовые chunk ids (`6155-...js`), а после `named`
   * стали триггериться path-like имена (`app/%5Blocale%5D/page-...js`,
   * `_app-pages-browser_src_...`). Для production client отдаём короткие
   * hash-only JS и CSS filenames без route/path fragments.
   *
   * Root cause fix: `npm run cf:waf-skip` adds a Cloudflare WAF skip rule for
   * /_next/static/* so managed WAF rules never inspect build assets.
   * The filename renaming below is a belt-and-suspenders fallback.
   */
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        chunkIds: 'deterministic',
      };
      config.output = {
        ...config.output,
        filename: 'static/chunks/c-[contenthash].js',
        chunkFilename: 'static/chunks/c-[contenthash].js',
      };
      // Also rename CSS files to c-[contenthash].css — WAF was returning 400
      // on default-named CSS chunks (e.g. b119f6f9efa36221.css).
      config.plugins = config.plugins.map((plugin) => {
        if (plugin.constructor.name === 'MiniCssExtractPlugin') {
          plugin.options.filename = 'static/css/c-[contenthash].css';
          plugin.options.chunkFilename = 'static/css/c-[contenthash].css';
        }
        return plugin;
      });
    }
    return config;
  },
  async headers() {
    // Hashed build assets are immutable — cache them hard at the browser/CDN so a
    // rebuild only invalidates the (short-lived) HTML document, never the chunks.
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Partner ecosystem page lives at the apex, non-localized (mutual
      // backlink target for bibamoney.com/partnership).
      {
        source: '/:locale(en|ru|hi|ko|ja|zh|de|es|pt|nl|uk)/partners',
        destination: '/partners',
        permanent: true,
      },
      // The mind-map surface was retired 2026-09-29 (article mind maps could not
      // render for most articles and the gallery was thin). Old inbound links and
      // cached search results land on the Knowledge Base instead of a 404.
      {
        source: '/:locale(en|ru|hi|ko|ja|zh|de|es|pt|nl|uk)/kb/mindmap',
        destination: '/:locale/kb',
        permanent: true,
      },
      {
        source: '/:locale(en|ru|hi|ko|ja|zh|de|es|pt|nl|uk)/kb/mindmaps',
        destination: '/:locale/kb',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Same backend as API: Django Whitenoise (/static), media, and /api.
    // Apex domain serves Next; relative /static/* must be forwarded or admin CSS 404s.
    const defaultBackend =
      process.env.NODE_ENV === 'production'
        ? 'https://api.tvijo.com'
        : 'http://localhost:8000';
    const apiDest = (process.env.DJANGO_BACKEND_URL || defaultBackend).replace(/\/$/, '');
    return [
      { source: '/api/:path*/', destination: `${apiDest}/api/:path*/` },
      { source: '/api/:path*', destination: `${apiDest}/api/:path*` },
      { source: '/static/:path*', destination: `${apiDest}/static/:path*` },
      { source: '/media/:path*', destination: `${apiDest}/media/:path*` },
    ];
  },
};

module.exports = nextConfig;

const isDev = process.env.NODE_ENV !== "production";

let supabaseOrigin = "";
let supabaseWs = "";
try {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  supabaseOrigin = url.origin;
  supabaseWs = `wss://${url.host}`;
} catch {
  // NEXT_PUBLIC_SUPABASE_URL not set at config time — connect-src falls back to 'self' only.
}

// Content-Security-Policy. Next.js injects inline bootstrap scripts, so `script-src` needs
// 'unsafe-inline' unless you adopt per-request nonces (a middleware-based upgrade path).
// Everything else is locked to the origins this app actually uses.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs}${isDev ? " ws://localhost:*" : ""}`.trim(),
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Authenticated pages must never be cached by shared proxies.
      {
        source: "/(dashboard|admin)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

module.exports = nextConfig;

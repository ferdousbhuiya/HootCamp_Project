/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native/binary-heavy modules out of webpack's bundle graph.
  // They are resolved by Node at runtime via dynamic import.
  webpack: (config) => {
    config.externals = [
      ...(config.externals || []),
      'canvas',
      'pdfjs-dist/legacy/build/pdf.js',
      'tesseract.js',
    ];
    return config;
  },
};

export default nextConfig;

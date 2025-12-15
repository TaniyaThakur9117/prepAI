// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     serverActions: true,
//   },
//   reactStrictMode: true,
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Increased body size limit
    },
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Configure API routes body & response size
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
    responseLimit: "50mb",
  },
};

module.exports = nextConfig;

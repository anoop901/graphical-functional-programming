/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/graphical-functional-programming",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/graphical-functional-programming",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

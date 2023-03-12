const withPWA = require("next-pwa")({ dest: "public" });
const { withSuperjson } = require("next-superjson");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  generateEtags: false,
};

const configWithPwa = withPWA(nextConfig);
module.exports = withSuperjson()(configWithPwa);

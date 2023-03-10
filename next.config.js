const withPWA = require("next-pwa")({ dest: "public" });
const { withSuperjson } = require("next-superjson");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

const configWithPwa = withPWA(nextConfig);
module.exports = withSuperjson()(configWithPwa);

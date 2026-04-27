import { withSerwist } from "@serwist/turbopack";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: "/ipod",
  turbopack: {},
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  compiler: {
    styledComponents: true,
  },
};

export default withSerwist(analyzer(nextConfig));

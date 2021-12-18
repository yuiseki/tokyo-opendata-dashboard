/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  basePath: "/tokyo-opendata-dashboard",

  webpack(config) {
    config.resolve.alias["mapbox-gl"] = "maplibre-gl";
    return config;
  },
};

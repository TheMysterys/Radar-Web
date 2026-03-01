import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
};

module.exports = {
	env: {
		API_URL: process.env.API_URL,
	},
  // Caching images for 1 day
  async headers() {
    return [
      {
        source: "/:all*(png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
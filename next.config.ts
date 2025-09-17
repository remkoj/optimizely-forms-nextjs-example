import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite the expected URL to the API endpoint in this application
  rewrites: async () => {
    return { 
      afterFiles: [
        {
          source: '/_forms/v1/forms/:path*',
          destination: '/api/forms/:path*'
        }
      ]
    }
  }
};

export default nextConfig;

import type { NextConfig } from "next";
import config from "@/lib/config";

const checkConfiguration = async () => {
  if (!config.isValid) {
    console.error("Invalid configuration. Exiting...");
    process.exit(1);
  }

  // try {
  //   await api.get("/status", { withCredentials: true });
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // } catch (e) {
  //   console.error("Failed to reach Backend API.");
  //   console.error(e);
  //   process.exit(1);
  // }
};

checkConfiguration();

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    console.log("Rewriting API requests to backend...");
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_BACKEND_API_URL + "/api/:path*", // Proxy to Backend API
      },
    ];
  }
};

export default nextConfig;

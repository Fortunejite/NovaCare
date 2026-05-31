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
};

export default nextConfig;

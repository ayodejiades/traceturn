import type { NextConfig } from "next";

// Routes from the starter template that no longer exist. Each lands on the page that
// now does its job, so old links and the recorded demo path keep working.
const RETIRED: Array<[string, string]> = [
  ["/demo", "/proof"],
  ["/onboarding", "/"],
  ["/login", "/dashboard"],
  ["/lab", "/verify"],
  ["/dashboard/create", "/dashboard"],
  ["/dashboard/items", "/proof"],
  ["/dashboard/operator", "/proof"],
  ["/dashboard/sponsors", "/proof#sources"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return RETIRED.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
};

export default nextConfig;

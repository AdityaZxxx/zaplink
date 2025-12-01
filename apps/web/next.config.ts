import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ql0mzp860t.ufs.sh",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;

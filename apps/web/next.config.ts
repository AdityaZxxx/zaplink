import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	experimental: {
		// TypeScript 7 is the native port and ships only the tsc binary; the
		// JavaScript compiler API at typescript/lib/typescript.js that Next
		// type-checks through is gone. Without this Next throws
		// "TypeScript API not found" during build. This makes Next shell out to
		// tsc instead, which is also the faster path.
		useTypeScriptCli: true,
	},
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

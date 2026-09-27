import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	/*
	 * The dev server rejects a request whose Host is neither localhost nor
	 * 127.0.0.1, so reaching it from a phone on the LAN needs the private
	 * ranges allowed. Development only; production is unaffected.
	 */
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
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

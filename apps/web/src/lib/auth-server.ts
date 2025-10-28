import { auth } from "@zaplink/auth";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export const getSession = async (request?: NextRequest) => {
	return auth.api.getSession({
		headers: request ? request.headers : await headers(),
	});
};

import { z } from "zod";

export const emailRule = z.email("Invalid email address");

export const passwordRule = z
	.string()
	.min(8, "Password must be at least 8 characters");

export const signInSchema = z.object({
	email: emailRule,
	password: passwordRule,
});

export const signUpSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: emailRule,
	password: passwordRule,
});

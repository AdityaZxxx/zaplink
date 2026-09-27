import { z } from "zod";

/*
 * Every message names the fix, not the rule that was broken: the reader is
 * looking at a field, not a spec.
 */
export const emailRule = z.email(
	"Enter an email address, such as you@example.com",
);

export const passwordRule = z
	.string()
	.min(8, "Use a password with at least 8 characters");

export const signInSchema = z.object({
	email: emailRule,
	password: passwordRule,
});

export const signUpSchema = z.object({
	name: z.string().min(2, "Enter a name with at least 2 characters"),
	email: emailRule,
	password: passwordRule,
});

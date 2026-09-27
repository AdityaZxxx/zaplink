"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "../schema";
import { AuthField } from "./AuthField";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		validators: { onSubmit: signUpSchema },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						router.push("/onboarding");
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-2 text-center font-bold text-3xl">Join Zaplink</h1>
			<p className="mb-6 text-center text-muted-foreground text-sm">
				Sign up to create your personalized link page in seconds. Your brand,
				your identity.
			</p>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="name">
					{(field) => (
						<AuthField field={field} label="Name" autoComplete="name" />
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<AuthField
							field={field}
							label="Email"
							type="email"
							autoComplete="email"
						/>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<AuthField
							field={field}
							label="Password"
							type="password"
							autoComplete="new-password"
						/>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Submitting..." : "Sign Up"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignIn}
					className="text-indigo-600 hover:text-indigo-800"
				>
					Already have an account? Sign In
				</Button>
			</div>
		</div>
	);
}

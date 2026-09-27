"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { callbackPath } from "../callbackPath";
import { signInSchema } from "../schema";
import { AuthField } from "./AuthField";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: { onSubmit: signInSchema },
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push(callbackPath(callbackUrl));
						toast.success("Signed in");
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
			<h1 className="mb-2 text-center text-title">Sign in</h1>
			<p className="mb-6 text-center text-body text-muted-foreground">
				Use the email and password you signed up with.
			</p>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
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
							autoComplete="current-password"
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
							{state.isSubmitting ? "Signing in" : "Sign in"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Button variant="link" onClick={onSwitchToSignUp}>
					Need an account? Sign up
				</Button>
			</div>
		</div>
	);
}

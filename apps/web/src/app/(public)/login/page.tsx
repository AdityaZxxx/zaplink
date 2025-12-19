"use client";

import { Suspense, useState } from "react";
import Loader from "@/components/shared/Loader";
import SignInForm from "@/features/auth/components/SignInForm";
import SignUpForm from "@/features/auth/components/SignUpForm";

function LoginContent() {
	const [showSignIn, setShowSignIn] = useState(true);

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<Loader />}>
			<LoginContent />
		</Suspense>
	);
}

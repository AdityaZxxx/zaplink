"use client";

import { useState } from "react";
import SignInForm from "@/features/auth/components/SignInForm";
import SignUpForm from "@/features/auth/components/SignUpForm";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(true);

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}

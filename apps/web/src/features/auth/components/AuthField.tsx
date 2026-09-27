"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface AuthFieldProps {
	field: AnyFieldApi;
	label: string;
	type?: React.HTMLInputTypeAttribute;
	autoComplete?: string;
}

/*
 * aria-invalid is set here rather than by Field, so the control announces the
 * error instead of only colouring itself.
 */
export function AuthField({
	field,
	label,
	type = "text",
	autoComplete,
}: AuthFieldProps) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const id = field.name;

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Input
				id={id}
				name={field.name}
				type={type}
				autoComplete={autoComplete}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
				aria-invalid={isInvalid}
				aria-describedby={isInvalid ? `${id}-error` : undefined}
			/>
			{isInvalid && (
				<FieldError id={`${id}-error`} errors={field.state.meta.errors} />
			)}
		</Field>
	);
}

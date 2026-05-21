"use client";

import { useActionState } from "react";

import { loginAction, type AuthFormState } from "@/lib/auth/actions";

const initial: AuthFormState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      <Field
        label="邮箱或用户名"
        name="identifier"
        autoComplete="username"
        placeholder="you@example.com 或 username"
        errors={state.fieldErrors?.identifier}
        required
      />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="输入你的密码"
        errors={state.fieldErrors?.password}
        required
      />

      {state.message && !state.ok && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  errors?: string[];
}) {
  const invalid = (errors?.length ?? 0) > 0;
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className="block h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"
      />
      {errors?.map((msg) => (
        <p key={msg} className="text-xs text-destructive">
          {msg}
        </p>
      ))}
    </div>
  );
}

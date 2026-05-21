"use client";

import { useActionState } from "react";

import { registerAction, type AuthFormState } from "@/lib/auth/actions";

const initial: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action} className="space-y-4">
      <Field
        label="用户名"
        name="username"
        autoComplete="username"
        placeholder="3-24 位字母 / 数字 / _ -"
        errors={state.fieldErrors?.username}
        required
      />
      <Field
        label="昵称"
        name="name"
        autoComplete="nickname"
        placeholder="社区里展示的名字"
        errors={state.fieldErrors?.name}
        required
      />
      <Field
        label="邮箱"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        errors={state.fieldErrors?.email}
        required
      />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="至少 8 位，含字母与数字"
        errors={state.fieldErrors?.password}
        required
      />
      <Field
        label="确认密码"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="再输入一次"
        errors={state.fieldErrors?.confirmPassword}
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
        {pending ? "注册中…" : "创建账号"}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        注册即表示你同意社区行为准则。密码使用 bcrypt 加盐哈希后存储，平台不会明文保存。
      </p>
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

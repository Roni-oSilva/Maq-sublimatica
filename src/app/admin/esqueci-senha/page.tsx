import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Esqueci minha senha — Administração", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Esqueci minha senha" subtitle="Informe o e-mail do administrador e enviaremos um link para criar uma nova senha.">
      <ForgotForm />
    </AuthShell>
  );
}

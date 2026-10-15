import { changePasswordAction } from "@/app/admin/actions";
import { PasswordForm } from "@/components/admin/password-form";
import { PageTitle, Panel } from "@/components/admin/shared";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <>
      <PageTitle title="Minha conta" subtitle={`Conectado como ${user.email}`} />
      <Panel className="max-w-md">
        <h2 className="text-lg">Alterar senha</h2>
        <p className="text-sm text-ink-muted">Informe a senha atual e escolha uma nova. Se não lembra da atual, saia e use “Esqueci minha senha”.</p>
        <PasswordForm action={changePasswordAction} withCurrent submitLabel="Alterar senha" />
      </Panel>
    </>
  );
}

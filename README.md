# Maq Sublimática — loja virtual com pedidos via WhatsApp

Loja profissional (Next.js 15 + TypeScript + Tailwind + Supabase) em que **todo produto, arte e serviço leva o cliente ao WhatsApp** com uma mensagem montada a partir dos dados reais do banco. Inclui painel administrativo em `/admin` com dashboard (Recharts), pedidos, orçamentos e configurações.

## Funcionalidades

- **Site público:** Início, Loja (busca, categorias, ordenação), página própria por produto (`/loja/slug`), Artes Prontas, Serviços, Personalizar (orçamento livre), Sobre, Políticas.
- **WhatsApp:** links `https://wa.me/55DDDNUMERO?text=...`. Preço sob consulta nunca vira valor inventado. O número é configurável e validado (painel → Configurações).
- **Pedidos × cliques × vendas:** ao clicar em “Pedir pelo WhatsApp”, o pedido é registrado com status **Novo** (preço/total calculados **no banco**, nunca pelo navegador) e o protocolo (`PED-2026-000001`) vai na mensagem. Cliques gerais no WhatsApp são contados à parte e **não são vendas**. O status (Novo → Em atendimento → Aguardando pagamento → Confirmado → Concluído/Cancelado) é atualizado **manualmente** pelo administrador; o sistema não lê as conversas do WhatsApp.
- **Personalizar:** formulário com validação; registra o orçamento (`ORC-2026-000001`) e abre o WhatsApp com a mensagem estruturada. Anexos: o cliente é orientado a enviá-los direto na conversa (não há upload público).
- **Admin:** login Supabase Auth (e-mail/senha) + tabela `admins`; dashboard com 12 meses (meses sem dados = 0); CRUD de produtos (imagens, estoque, destaque, sob consulta), categorias, artes, serviços, banners (destaque ou promoção) e clientes (barra rolante “Nossos clientes”); pedidos/orçamentos com filtros (tipo, status, período); configurações da loja.
- **Segurança:** RLS em todas as tabelas; visitantes só leem conteúdo ativo; pedidos/orçamentos só por funções RPC; autorização no servidor em toda Server Action; validação com Zod; upload com checagem de tipo real (bytes) e limite de 4 MB; nenhuma chave `service_role`.
- **Não implementado (de propósito):** checkout/pagamento online e carrinho (fechamento é pelo WhatsApp).

## Controle total pelo painel (sem mexer em código)

- **Admin → Textos e imagens:** todos os textos, links de botões, imagens, mensagens fixas do WhatsApp e as **cores** do site, organizados por seção (cabeçalho/rodapé, início, Loja, Artes, Serviços, Personalizar, Sobre/Políticas, mensagens do WhatsApp, imagens gerais, cores). Campo em branco = volta ao texto padrão; há “Restaurar padrões” por seção. O catálogo de campos está em `src/lib/content.ts` — para tornar um novo texto editável, basta adicionar uma linha lá.
- **Produtos, Artes, Serviços, Categorias, Banners, Clientes, Configurações:** conteúdo e imagens de cada área (upload de imagens incluso).

## 1. Configurar o Supabase

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, execute **na ordem** os arquivos de `supabase/migrations/`:
   `20260101000000_schema.sql` → `…0100_rls.sql` → `…0200_functions.sql` → `…0300_storage.sql` → `…0400_clients_banners.sql` → `…0500_initial_content.sql` → `…0600_site_content.sql`
   (a última carrega o conteúdo do site anterior: endereço, telefone, horário, formas de pagamento, 2 banners promocionais e a lista de clientes — tudo editável no painel)
   (ou, com a Supabase CLI: `supabase link --project-ref SEU_REF && supabase db push`).
3. *(Opcional)* execute `supabase/seed.sql` para dados de exemplo.
4. **Authentication → Users → Add user**: crie o administrador (e-mail + senha). Em **Authentication → Providers → Email**, desative “Allow new users to sign up” (o painel não tem cadastro público).
5. Autorize esse usuário como administrador (SQL Editor):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'seu@email.com';
   ```
6. Copie **Project URL** e a chave **anon** (Settings → API).

## 2. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

Acesse `/admin`, entre e vá em **Configurações** para informar o número do WhatsApp (ex.: `5511999999999`). Enquanto o número não estiver configurado, os botões de pedido aparecem desativados e o dashboard exibe um aviso.

Outros comandos: `npm run build`, `npm start`, `npm run typecheck`, `npm test`.

## 3. Publicar na Vercel

1. Envie o repositório ao GitHub e importe-o na Vercel (framework: Next.js, sem configuração extra).
2. Em **Environment Variables**, defina `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` (URL final, ex.: `https://maqsublimatica.com.br`).
3. Faça o deploy. Em Supabase → Authentication → URL Configuration, informe a URL do site.
4. Após publicar: confira `/sitemap.xml`, `/robots.txt`, faça login em `/admin` e um pedido de teste.

## Testes

`npm test` executa:
- **Banco (PGlite):** aplica as migrações reais em um Postgres em memória (com stubs de `auth`/`storage`) e verifica RLS, constraints, `register_order`/`register_quote`, cálculo de total no servidor, série mensal com zeros e bloqueio de não-admins.
- **Unidade:** mensagens e links do WhatsApp (codificação, sob consulta, protocolo), validação do número, schemas Zod, upload de imagens, formatação.

## Notas operacionais

- Os gráficos usam `admin_monthly_stats` (tabelas reais). “Confirmados/Concluídos” refletem o **status atual** dos pedidos criados em cada mês.
- Registrar pedidos é público (necessário para o fluxo). Para evitar spam em produção, considere ativar CAPTCHA/rate limit no Supabase ou na Vercel.
- Imagens enviadas vão ao bucket público `media` (4 MB; JPG/PNG/WebP/AVIF). Em Server Actions na Vercel o corpo é limitado a ~4,5 MB.
- Fuso horário dos relatórios: `America/Sao_Paulo`.

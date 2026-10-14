/**
 * Catálogo de TUDO que o administrador pode editar no site (Admin → Textos e imagens).
 * Cada campo tem uma chave, um tipo e o valor padrão. Valores salvos em `site_content`
 * sobrescrevem o padrão; apagar o valor no painel restaura o padrão.
 */
export type FieldType = "text" | "textarea" | "image" | "link" | "color";

export type ContentField = { key: string; label: string; type: FieldType; default: string; hint?: string; max?: number };
export type ContentGroup = {
  id: string;
  title: string;
  description: string;
  /** Página do site onde esses textos aparecem (para o link “ver no site”). */
  path: string;
  /** Descrição curta do local, exibida como referência em cada caixa de texto. */
  where: string;
  fields: ContentField[];
};

const t = (key: string, label: string, def: string, hint?: string, max = 200): ContentField => ({ key, label, type: "text", default: def, hint, max });
const ta = (key: string, label: string, def: string, hint?: string, max = 1500): ContentField => ({ key, label, type: "textarea", default: def, hint, max });
const img = (key: string, label: string, hint?: string): ContentField => ({ key, label, type: "image", default: "", hint });
const link = (key: string, label: string, def: string, hint = "Caminho do site (ex.: /loja) ou link completo (https://…)."): ContentField => ({ key, label, type: "link", default: def, hint, max: 300 });
const col = (key: string, label: string, def: string, hint?: string): ContentField => ({ key, label, type: "color", default: def, hint });

const pageIntro = (p: string, name: string, eyebrow: string, title: string, subtitle: string): ContentField[] => [
  t(`${p}_eyebrow`, `${name}: rótulo pequeno`, eyebrow),
  t(`${p}_title`, `${name}: título`, title, "A última palavra aparece em destaque (itálico). Pode usar {loja} para o nome da loja.", 120),
  ta(`${p}_subtitle`, `${name}: subtítulo`, subtitle, undefined, 400),
  img(`${p}_header_image`, `${name}: imagem de fundo do topo`, "Opcional. Aparece escurecida atrás do título."),
];

const benefit = (n: number, title: string, text: string): ContentField[] => [
  t(`benefit${n}_title`, `Diferencial ${n}: título`, title),
  t(`benefit${n}_text`, `Diferencial ${n}: texto`, text, undefined, 200),
];

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "cabecalho-rodape",
    path: "/",
    where: "Menu e rodapé (todas as páginas)",
    title: "Cabeçalho e rodapé",
    description: "Menu de navegação e textos do rodapé. Endereço, telefone, redes e pagamentos ficam em Configurações.",
    fields: [
      t("nav_home", "Menu: Início", "Início", undefined, 30),
      t("nav_shop", "Menu: Loja", "Loja", undefined, 30),
      t("nav_artworks", "Menu: Artes Prontas", "Artes Prontas", undefined, 30),
      t("nav_services", "Menu: Serviços", "Serviços", undefined, 30),
      t("nav_custom", "Menu: Personalizar", "Personalizar", undefined, 30),
      t("nav_about", "Menu: Sobre", "Sobre", undefined, 30),
      t("header_whatsapp_label", "Botão do WhatsApp no topo", "WhatsApp", undefined, 30),
      ta("footer_about", "Rodapé: apresentação", "Equipamentos, insumos, artes e serviços de sublimação e personalização. Pedidos e orçamentos pelo WhatsApp."),
      t("footer_whatsapp_label", "Rodapé: botão do WhatsApp", "Falar no WhatsApp"),
      t("footer_nav_title", "Rodapé: título “Navegação”", "Navegação", undefined, 40),
      t("footer_contact_title", "Rodapé: título “Contato”", "Contato", undefined, 40),
      t("footer_social_title", "Rodapé: título “Redes e políticas”", "Redes e políticas", undefined, 40),
      t("footer_policies_label", "Rodapé: link das políticas", "Políticas da loja", undefined, 40),
      t("footer_quote_label", "Rodapé: link de orçamento", "Solicitar orçamento", undefined, 40),
      t("footer_payments_title", "Rodapé: título das formas de pagamento", "Formas de pagamento aceitas", undefined, 60),
      t("footer_payments_note", "Rodapé: aviso abaixo dos pagamentos", "Pagamento e frete combinados com a nossa equipe no atendimento."),
      t("footer_copyright", "Rodapé: direitos reservados", "Todos os direitos reservados.", "Aparece depois de “© ano nome da loja”."),
    ],
  },
  {
    id: "inicio-topo",
    path: "/",
    where: "Página inicial · topo",
    title: "Início: topo (hero)",
    description: "A primeira dobra da página inicial. Um banner “Destaque” cadastrado em Banners tem prioridade sobre o título.",
    fields: [
      t("hero_eyebrow", "Etiqueta (pílula verde-limão)", "Sublimação e presentes personalizados"),
      t("hero_line1", "Título: linha 1 (laranja)", "Transforme", undefined, 40),
      t("hero_line2", "Título: linha 2", "sua ideia", undefined, 40),
      t("hero_script", "Título: palavra manuscrita", "em", "Palavra curta em letra manuscrita, ao lado da linha 2.", 12),
      t("hero_line3", "Título: linha 3", "produto", undefined, 40),
      ta("hero_subtitle", "Texto de apoio", "Canecas, camisetas, quadros, brindes e impressos com a sua arte ou a sua marca. Escolha, peça pelo WhatsApp e receba atendimento direto da nossa equipe.", undefined, 400),
      t("hero_cta_label", "Botão principal: texto", "Ver produtos", undefined, 40),
      link("hero_cta_href", "Botão principal: link", "/loja"),
      t("hero_cta2_label", "Botão secundário: texto", "Quero personalizar", undefined, 40),
      link("hero_cta2_href", "Botão secundário: link", "/personalizar"),
      img("hero_image", "Imagem do topo", "Opcional. Substitui os blocos coloridos à direita do título."),
      t("hero_notch_cta", "Botão escuro do canto superior direito", "Fale conosco", "Abre o WhatsApp com a mensagem padrão.", 30),
      t("hero_tile_strip", "Bloco verde-limão: texto", "Do seu jeito", undefined, 30),
      t("hero_tile_script", "Bloco laranja: frase manuscrita", "feito pra você", undefined, 30),
    ],
  },
  {
    id: "inicio-secoes",
    path: "/",
    where: "Página inicial · seções",
    title: "Início: seções e diferenciais",
    description: "Títulos de cada seção da página inicial e os quatro diferenciais abaixo do topo.",
    fields: [
      ...benefit(1, "Retirada disponível", "Peça e retire seu pedido direto na loja."),
      ...benefit(2, "Preços baixos sem perder qualidade", "Bom preço e acabamento caprichado em cada produto."),
      ...benefit(3, "Horário de atendimento", "Segunda a sábado, das 8h às 18h."),
      ...benefit(4, "Atendimento direto", "Tire dúvidas e feche seu pedido pelo WhatsApp."),
      t("cat_eyebrow", "Categorias: rótulo", "Explore", undefined, 40),
      t("cat_title", "Categorias: título", "Categorias em destaque", undefined, 80),
      t("cat_link", "Categorias: link “ver tudo”", "Ver toda a loja", undefined, 40),
      t("popular_eyebrow", "Mais procurados: rótulo", "Em alta", undefined, 40),
      t("popular_title", "Mais procurados: título", "Produtos mais procurados", undefined, 80),
      t("newest_eyebrow", "Recém-cadastrados: rótulo", "Novidades", undefined, 40),
      t("newest_title", "Recém-cadastrados: título", "Recém-cadastrados", undefined, 80),
      t("artworks_eyebrow", "Artes prontas: rótulo", "Criatividade", undefined, 40),
      t("artworks_title", "Artes prontas: título", "Artes prontas", undefined, 80),
      t("services_eyebrow", "Serviços: rótulo", "Personalização", undefined, 40),
      t("services_title", "Serviços: título", "Nossos serviços", undefined, 80),
      t("clients_eyebrow", "Clientes: rótulo", "Quem confia", undefined, 40),
      t("clients_title", "Clientes: título", "Nossos clientes", undefined, 80),
      t("see_all", "Link “Ver todos”", "Ver todos", undefined, 30),
      t("home_empty_title", "Catálogo vazio: título", "Catálogo em preparação", undefined, 80),
      t("home_empty_text", "Catálogo vazio: texto", "Em breve novos produtos, artes e serviços. Enquanto isso, fale com a gente pelo WhatsApp.", undefined, 300),
    ],
  },
  {
    id: "inicio-chamada",
    path: "/",
    where: "Página inicial · bloco laranja final",
    title: "Início: chamada final",
    description: "O bloco laranja no fim da página inicial.",
    fields: [
      t("cta_title", "Título", "Não encontrou o que procura?", "A última palavra aparece em itálico.", 100),
      ta("cta_text", "Texto", "Conte para nós o que você quer produzir ou personalizar e receba um orçamento pelo WhatsApp.", undefined, 300),
      t("cta_btn1_label", "Botão 1: texto", "Solicitar orçamento", undefined, 40),
      link("cta_btn1_href", "Botão 1: link", "/personalizar"),
      t("cta_btn2_label", "Botão 2 (WhatsApp): texto", "Falar no WhatsApp", undefined, 40),
    ],
  },
  {
    id: "loja",
    path: "/loja",
    where: "Página Loja",
    title: "Página Loja",
    description: "Catálogo de produtos e página de cada produto.",
    fields: [
      ...pageIntro("shop", "Loja", "Loja", "Catálogo de produtos", "Escolha o produto e finalize o pedido pelo WhatsApp — disponibilidade, pagamento e frete são confirmados na conversa."),
      t("shop_search_label", "Busca: rótulo", "Buscar por nome", undefined, 40),
      t("shop_search_placeholder", "Busca: exemplo no campo", "Ex.: caneca personalizada", undefined, 60),
      t("shop_sort_label", "Ordenação: rótulo", "Ordenar por", undefined, 40),
      t("shop_apply", "Botão aplicar filtros", "Aplicar", undefined, 30),
      t("shop_all", "Filtro “todas as categorias”", "Todos", undefined, 30),
      t("shop_empty_title", "Sem produtos: título", "Nenhum produto cadastrado ainda", undefined, 80),
      t("shop_empty_text", "Sem produtos: texto", "Em breve novos produtos. Fale conosco ou peça um orçamento personalizado.", undefined, 300),
      t("product_order_label", "Botão de pedido (produto com preço)", "Pedir pelo WhatsApp", undefined, 40),
      t("product_quote_label", "Botão de pedido (produto sob consulta)", "Solicitar valor", undefined, 40),
      t("product_details_label", "Botão “ver detalhes”", "Ver detalhes", undefined, 30),
      t("product_desc_title", "Página do produto: título da descrição", "Descrição", undefined, 40),
      t("product_specs_title", "Página do produto: título das especificações", "Especificações técnicas", undefined, 60),
      t("product_related_title", "Página do produto: título dos relacionados", "Produtos relacionados", undefined, 60),
      ta("product_note", "Página do produto: aviso abaixo do botão", "O WhatsApp abrirá com a mensagem pronta. Você confirma o envio por lá; disponibilidade, pagamento e frete são combinados na conversa.", undefined, 300),
    ],
  },
  {
    id: "artes",
    path: "/artes-prontas",
    where: "Página Artes Prontas",
    title: "Página Artes Prontas",
    description: "Galeria de artes.",
    fields: [
      ...pageIntro("artworks_page", "Artes", "Artes prontas", "Artes disponíveis para personalização ou aquisição", "Encontrou uma arte? Informe o código pelo WhatsApp e combine formato de arquivo e personalização."),
      t("artwork_order_label", "Botão de interesse", "Tenho interesse", undefined, 40),
      t("artworks_empty_title", "Sem artes: título", "Nenhuma arte disponível no momento", undefined, 80),
      t("artworks_empty_text", "Sem artes: texto", "Precisa de uma arte exclusiva? Peça um orçamento.", undefined, 300),
    ],
  },
  {
    id: "servicos",
    path: "/servicos",
    where: "Página Serviços",
    title: "Página Serviços",
    description: "Lista de serviços.",
    fields: [
      ...pageIntro("services_page", "Serviços", "Serviços", "Personalização e produção sob medida", "Solicite atendimento direto pelo WhatsApp com o serviço já identificado na mensagem."),
      t("service_order_label", "Botão de atendimento", "Solicitar atendimento", undefined, 40),
      t("services_empty_title", "Sem serviços: título", "Serviços em breve", undefined, 80),
      t("services_empty_text", "Sem serviços: texto", "Enquanto isso, descreva o que você precisa e receba um orçamento.", undefined, 300),
    ],
  },
  {
    id: "personalizar",
    path: "/personalizar",
    where: "Página Personalizar",
    title: "Página Personalizar",
    description: "Formulário de orçamento.",
    fields: [
      ...pageIntro("custom", "Personalizar", "Personalizar", "Conte o que você quer criar", "Escreva com suas palavras. Registramos a solicitação e abrimos o WhatsApp com tudo organizado para você enviar."),
      t("custom_label_name", "Campo: nome", "Seu nome", undefined, 60),
      t("custom_label_phone", "Campo: telefone", "WhatsApp / telefone", undefined, 60),
      t("custom_label_type", "Campo: produto ou serviço", "Produto ou serviço desejado", undefined, 80),
      t("custom_label_quantity", "Campo: quantidade", "Quantidade aproximada", undefined, 60),
      t("custom_label_deadline", "Campo: prazo", "Prazo desejado", undefined, 60),
      t("custom_label_description", "Campo: descrição", "Descreva o que deseja", undefined, 80),
      t("custom_label_details", "Campo: detalhes", "Cores, tamanhos, materiais e outros detalhes", undefined, 100),
      t("custom_label_reference", "Campo: referência", "Link de referência ou inspiração", undefined, 80),
      t("custom_submit", "Botão de envio", "Solicitar orçamento pelo WhatsApp", undefined, 60),
      ta("custom_attach_note", "Aviso sobre anexos", "Quer enviar imagens ou arquivos? Anexe-os direto na conversa do WhatsApp depois de enviar esta solicitação.", undefined, 300),
      t("custom_success_title", "Confirmação: título", "Solicitação registrada!", undefined, 80),
      ta("custom_success_text", "Confirmação: texto", "Abrimos o WhatsApp com a sua mensagem. Confirme o envio dentro do WhatsApp para falar com a nossa equipe.", undefined, 300),
    ],
  },
  {
    id: "sobre-politicas",
    path: "/sobre",
    where: "Páginas Sobre e Políticas",
    title: "Sobre e Políticas",
    description: "O texto principal de “Sobre” e das “Políticas” continua em Configurações. Aqui ficam títulos e imagem.",
    fields: [
      ...pageIntro("about", "Sobre", "Sobre", "Conheça a {loja}", ""),
      img("about_image", "Sobre: imagem ao lado do texto", "Opcional (equipe, fachada, produtos…)."),
      t("about_cta_label", "Sobre: botão de contato", "Falar no WhatsApp", undefined, 40),
      t("policies_eyebrow", "Políticas: rótulo", "Políticas", undefined, 40),
      t("policies_title", "Políticas: título", "Políticas da loja", undefined, 80),
    ],
  },
  {
    id: "whatsapp",
    path: "/loja",
    where: "Mensagem enviada ao WhatsApp",
    title: "Mensagens do WhatsApp",
    description: "Frases fixas das mensagens enviadas ao WhatsApp (os dados do produto, preço e especificações são sempre inseridos automaticamente). Use {loja} e, no serviço, {servico}.",
    fields: [
      t("msg_product_intro", "Produto: abertura", "Olá! Tenho interesse neste produto da {loja}.", undefined, 200),
      t("msg_product_closing", "Produto: fechamento", "Gostaria de confirmar a disponibilidade, as condições de pagamento e o valor do frete.", undefined, 300),
      t("msg_artwork_intro", "Arte: abertura", "Olá! Tenho interesse na seguinte arte da {loja}.", undefined, 200),
      t("msg_artwork_closing", "Arte: fechamento", "Gostaria de saber mais sobre a disponibilidade, os formatos de arquivo e as possibilidades de personalização.", undefined, 300),
      t("msg_service_intro", "Serviço: abertura", "Olá! Gostaria de solicitar atendimento para o serviço \"{servico}\" da {loja}.", undefined, 200),
      t("msg_service_closing", "Serviço: fechamento", "Gostaria de receber informações sobre valores, prazo de produção e condições de pagamento.", undefined, 300),
      t("msg_quote_intro", "Orçamento: abertura", "Olá! Gostaria de solicitar um orçamento personalizado com a {loja}.", undefined, 200),
      t("msg_quote_closing", "Orçamento: fechamento", "Gostaria de receber informações sobre preço, prazo de produção e condições de pagamento.", undefined, 300),
    ],
  },
  {
    id: "imagens-gerais",
    path: "/",
    where: "Vários lugares do site",
    title: "Imagens gerais",
    description: "Imagens usadas em vários lugares do site. O logotipo está em Configurações.",
    fields: [
      img("placeholder_image", "Imagem padrão para itens sem foto", "Aparece em produtos, artes e serviços que ainda não têm imagem."),
      img("og_image", "Imagem de compartilhamento", "Aparece quando o site é compartilhado no WhatsApp, Facebook etc. (ideal: 1200×630)."),
    ],
  },
  {
    id: "cores",
    path: "/",
    where: "Todo o site",
    title: "Cores do site",
    description: "Troque a paleta inteira. Atenção ao contraste: o texto sobre a cor principal é sempre a cor “escura”.",
    fields: [
      col("color_brand", "Cor principal (botões, destaques)", "#F25623"),
      col("color_brand_text", "Cor principal para textos sobre fundo claro", "#bf3a0a", "Use uma versão mais escura da cor principal para manter a leitura."),
      col("color_ink", "Cor escura (fundos pretos e textos)", "#171717"),
      col("color_lime", "Cor de apoio (verde-limão)", "#cde82a"),
      col("color_cream", "Cor creme (textos sobre fundo escuro)", "#f1f3dc"),
      col("color_paper", "Cor de fundo das páginas", "#f8f6f1"),
    ],
  },
];

export const ALL_FIELDS: ContentField[] = CONTENT_GROUPS.flatMap((g) => g.fields);
export const FIELD_BY_KEY: Record<string, ContentField> = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f]));
export const DEFAULT_CONTENT: Record<string, string> = Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.default]));

export type SiteContent = Record<string, string>;

/** Aplica os valores salvos (ignorando chaves desconhecidas) sobre os padrões. */
export function mergeContent(rows: { key: string; value: string }[] | null | undefined): SiteContent {
  const out: SiteContent = { ...DEFAULT_CONTENT };
  for (const r of rows ?? []) if (r.key in FIELD_BY_KEY && r.value !== "") out[r.key] = r.value;
  return out;
}

/** Substitui {chaves} em um texto editável. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

export function validateField(field: ContentField, raw: string): string | null {
  const v = raw.trim();
  if (v === "") return null;
  if (field.max && v.length > field.max) return `Use no máximo ${field.max} caracteres.`;
  if (field.type === "link" && !/^(\/[^\s]*|https?:\/\/[^\s]+|#[^\s]*)$/.test(v)) return "Informe um caminho (/loja) ou um link completo (https://…).";
  if (field.type === "image" && !/^https:\/\/[^\s]+$/.test(v)) return "URL de imagem inválida.";
  if (field.type === "color" && !/^#[0-9a-fA-F]{6}$/.test(v)) return "Use uma cor no formato #RRGGBB.";
  return null;
}

// ---------- Cores (CSS variables) ----------
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const trip = ([r, g, b]: [number, number, number]) => `${r} ${g} ${b}`;
const mix = (a: [number, number, number], b: [number, number, number], p: number): [number, number, number] =>
  [0, 1, 2].map((i) => Math.round(a[i] * (1 - p) + b[i] * p)) as [number, number, number];

/** Variáveis CSS (canais RGB) derivadas das cores editáveis. */
export function themeVars(c: SiteContent): Record<string, string> {
  const pick = (k: string) => (/^#[0-9a-fA-F]{6}$/.test(c[k]) ? c[k] : DEFAULT_CONTENT[k]);
  const brand = hexToRgb(pick("color_brand"));
  const ink = hexToRgb(pick("color_ink"));
  return {
    "--c-brand": trip(brand),
    "--c-brand-dark": trip(mix(brand, [0, 0, 0], 0.18)),
    "--c-brand-light": trip(mix(brand, [255, 255, 255], 0.88)),
    "--c-brand-text": trip(hexToRgb(pick("color_brand_text"))),
    "--c-ink": trip(ink),
    "--c-ink-soft": trip(mix(ink, [255, 255, 255], 0.14)),
    "--c-lime": trip(hexToRgb(pick("color_lime"))),
    "--c-cream": trip(hexToRgb(pick("color_cream"))),
    "--c-paper": trip(hexToRgb(pick("color_paper"))),
  };
}

export type CategoryKind = "product" | "artwork" | "service";

export type Category = {
  id: string;
  kind: CategoryKind;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  display_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: string | null;
  price: number | null;
  price_on_request: boolean;
  category_id: string | null;
  image_url: string | null;
  active: boolean;
  featured: boolean;
  available: boolean;
  track_stock: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type ProductImage = { id: string; product_id: string; image_url: string; display_order: number };

export type Artwork = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  price: number | null;
  price_on_request: boolean;
  active: boolean;
  created_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  specifications: string | null;
  lead_time: string | null;
  category_id: string | null;
  image_url: string | null;
  price: number | null;
  price_on_request: boolean;
  active: boolean;
  created_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  display_order: number;
  active: boolean;
  placement: "hero" | "promo";
};

export type Client = { id: string; name: string; logo_url: string | null; display_order: number; active: boolean };

export type SocialLinks = { instagram?: string; facebook?: string; tiktok?: string; youtube?: string };
export type ContactInfo = { email?: string; phone?: string; address?: string; hours?: string };

export type StoreSettings = {
  store_name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  default_whatsapp_message: string;
  social_links: SocialLinks;
  contact_information: ContactInfo;
  about_text: string | null;
  policies_text: string | null;
  payment_methods: string | null;
};

export const ORDER_STATUSES = ["new", "in_progress", "awaiting_payment", "confirmed", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Novo",
  in_progress: "Em atendimento",
  awaiting_payment: "Aguardando pagamento",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export type OrderItem = {
  kind: "product" | "artwork" | "service";
  id: string;
  name: string;
  ref: string | null;
  quantity: number;
  unit_price: number | null;
  price_on_request: boolean;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItem[];
  total_amount: number | null;
  has_unpriced_items: boolean;
  status: OrderStatus;
  source: "product" | "artwork" | "service" | "manual";
  admin_notes: string | null;
  created_at: string;
};

export type Quote = {
  id: string;
  protocol_number: string;
  customer_name: string;
  customer_phone: string | null;
  product_type: string;
  quantity: string | null;
  desired_deadline: string | null;
  description: string;
  details: string | null;
  reference_url: string | null;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
};

export type MonthlyStat = {
  month: string;
  registered: number;
  confirmed: number;
  completed: number;
  quotes: number;
  clicks: number;
};

export type DashboardCounters = {
  total_orders: number;
  new_orders: number;
  total_quotes: number;
  new_quotes: number;
  active_products: number;
  low_stock: number;
  total_clicks: number;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: "Maq Sublimática",
  whatsapp_number: null,
  logo_url: null,
  default_whatsapp_message: "Olá! Gostaria de mais informações sobre os produtos da Maq Sublimática.",
  social_links: {},
  contact_information: {},
  about_text: null,
  policies_text: null,
  payment_methods: null,
};

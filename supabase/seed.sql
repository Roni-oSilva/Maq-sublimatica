-- OPCIONAL: dados de exemplo para conhecer o sistema. Apague pelo painel antes de publicar.
insert into public.categories (kind, name, slug, display_order) values
  ('product', 'Papelaria', 'papelaria', 1),
  ('product', 'Quadros', 'quadros', 2),
  ('product', 'Gráfica', 'grafica', 3),
  ('product', 'Canecas', 'canecas', 4),
  ('product', 'Vestuário', 'vestuario', 5),
  ('product', 'Embalagens', 'embalagens', 6),
  ('product', 'Festas', 'festas', 7),
  ('product', 'Chaveiros', 'chaveiros', 8),
  ('product', 'Decoração', 'decoracao', 9),
  ('product', 'Infantil', 'infantil', 10),
  ('product', 'Equipamentos para Sublimação', 'equipamentos-para-sublimacao', 11),
  ('product', 'Insumos e Papéis', 'insumos-e-papeis', 12),
  ('artwork', 'Datas Comemorativas', 'datas-comemorativas', 1),
  ('service', 'Personalização de produtos', 'personalizacao-de-produtos', 1),
  ('service', 'Criação de artes', 'criacao-de-artes', 2)
on conflict do nothing;

insert into public.products (name, slug, description, specifications, price, price_on_request, category_id, featured)
select 'Prensa Térmica 38x38 (EXEMPLO)', 'prensa-termica-38x38-exemplo',
       'Produto de exemplo — edite ou exclua no painel.', E'Área de prensagem: 38x38 cm', 850.00, false, c.id, true
  from public.categories c where c.slug = 'equipamentos-para-sublimacao' and c.kind = 'product'
on conflict do nothing;

insert into public.services (name, description, lead_time, price_on_request, category_id)
select 'Criação de arte personalizada (EXEMPLO)', 'Serviço de exemplo — edite ou exclua no painel.', 'Sob consulta', true, c.id
  from public.categories c where c.slug = 'criacao-de-artes' and c.kind = 'service';

-- Conteúdo inicial vindo do site anterior. Tudo é editável em Admin (Configurações, Banners, Clientes).

update public.store_settings
   set contact_information = jsonb_build_object(
         'phone',   '(91) 98108-6722',
         'address', 'Rua Vitória, 157B - Resende 2, Ulianópolis - PA, 68632-000',
         'hours',   'Segunda a sábado, das 8h às 18h'),
       payment_methods = E'Visa\nMastercard\nAmerican Express\nBoleto\nPayPal\nMercado Pago\nPagSeguro'
 where id = 1;

insert into public.banners (title, subtitle, cta_label, cta_href, display_order, placement)
select * from (values
  ('Presentes para todas as épocas do ano!', 'Presenteie quem você ama.', 'Ver presentes', '/loja', 1, 'promo'),
  ('Personalizados com seus personagens favoritos.', 'Infinitas possibilidades.', 'Quero personalizar', '/personalizar', 2, 'promo')
) as v(title, subtitle, cta_label, cta_href, display_order, placement)
where not exists (select 1 from public.banners);

insert into public.clients (name, display_order)
select * from (values
  ('Ipiranga', 1), ('Symplá', 2), ('Rede Inova Drogarias', 3), ('Pagrisa', 4), ('Solar Maxx', 5)
) as v(name, display_order)
where not exists (select 1 from public.clients);

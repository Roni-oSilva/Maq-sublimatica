-- Logotipos dos clientes iniciais (arquivos em /public/clients). Editáveis em Admin → Clientes.
update public.clients set logo_url = '/clients/ipiranga.png'              where name = 'Ipiranga'             and logo_url is null;
update public.clients set logo_url = '/clients/sympla.png'                where name = 'Symplá'               and logo_url is null;
update public.clients set logo_url = '/clients/rede-inova-drogarias.png'  where name = 'Rede Inova Drogarias' and logo_url is null;
update public.clients set logo_url = '/clients/pagrisa.png'               where name = 'Pagrisa'              and logo_url is null;
update public.clients set logo_url = '/clients/solar-maxx.png'            where name = 'Solar Maxx'           and logo_url is null;

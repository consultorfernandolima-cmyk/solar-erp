-- Licença full do tenant SOLAR ERP para todos os módulos e recursos
-- atualmente cadastrados no catálogo. Não cria nem habilita recursos futuros
-- que ainda não existam no catálogo (ex.: Faturamento, que permanece planejado).

insert into public.organizacao_modulos (organizacao_id,modulo_id,status,observacao)
select o.id,m.id,'ATIVO',
       'Licença full da organização para todos os módulos e recursos atualmente disponíveis.'
from public.organizacoes o
join public.modulos_sistema m
  on m.status='ATIVO'
 and m.ativo=true
where o.nome='SOLAR ERP'
  and o.ativo
on conflict (organizacao_id,modulo_id) do update
set status='ATIVO',
    observacao=excluded.observacao,
    updated_at=now();

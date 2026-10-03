-- Recursos licenciáveis do módulo Serviços.
-- Propostas e Contratos são submódulos/licenças opcionais de Serviços.
-- O tenant SOLAR ERP recebe Propostas somente para homologação do recurso.

insert into public.modulos_sistema (codigo,nome,descricao,icone,tipo,modulo_pai_id,status,ordem,ativo)
select 'PROPOSTAS','Propostas','Recurso avançado de propostas para clientes com licença correspondente','ClipboardList','SUBMODULO',m.id,'ATIVO',22,true
from public.modulos_sistema m
where m.codigo='SERVICOS'
on conflict (codigo) do update set nome=excluded.nome,descricao=excluded.descricao,modulo_pai_id=excluded.modulo_pai_id,tipo=excluded.tipo,status='ATIVO',ordem=22,ativo=true,updated_at=now();

insert into public.modulos_sistema (codigo,nome,descricao,icone,tipo,modulo_pai_id,status,ordem,ativo)
select 'CONTRATOS','Contratos','Recurso avançado de contratos para clientes com licença correspondente','FileSignature','SUBMODULO',m.id,'ATIVO',23,true
from public.modulos_sistema m
where m.codigo='SERVICOS'
on conflict (codigo) do update set nome=excluded.nome,descricao=excluded.descricao,modulo_pai_id=excluded.modulo_pai_id,tipo=excluded.tipo,status='ATIVO',ordem=23,ativo=true,updated_at=now();

insert into public.organizacao_modulos (organizacao_id,modulo_id,status,observacao)
select o.id,m.id,'ATIVO','Licença de homologação para validação do recurso Propostas'
from public.organizacoes o
join public.modulos_sistema m on m.codigo='PROPOSTAS'
where o.nome='SOLAR ERP' and o.ativo
on conflict (organizacao_id,modulo_id) do update
set status='ATIVO',observacao=excluded.observacao,updated_at=now();
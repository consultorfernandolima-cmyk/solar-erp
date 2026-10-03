-- Faturamento RLS hardening
-- UPDATE must revalidate organization/company and the commercial origin after changes.
drop policy if exists faturamentos_update on public.faturamentos;
create policy faturamentos_update on public.faturamentos for update to authenticated using (
 app_private.has_permission('faturamento.editar') and exists(select 1 from public.empresas e where e.id=faturamentos.empresa_id and e.organizacao_id=faturamentos.organizacao_id and e.ativo and (exists(select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin and p.organizacao_id=faturamentos.organizacao_id) or exists(select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=faturamentos.empresa_id)))
) with check (
 app_private.has_permission('faturamento.editar')
 and exists(select 1 from public.empresas e where e.id=faturamentos.empresa_id and e.organizacao_id=faturamentos.organizacao_id and e.ativo and (exists(select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin and p.organizacao_id=faturamentos.organizacao_id) or exists(select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=faturamentos.empresa_id)))
 and exists(select 1 from public.parceiros c join public.parceiro_papeis pp on pp.parceiro_id=c.id and pp.papel='CLIENTE' where c.id=faturamentos.cliente_id and c.organizacao_id=faturamentos.organizacao_id and c.ativo)
 and ((contrato_id is null) or exists(select 1 from public.contratos c where c.id=faturamentos.contrato_id and c.organizacao_id=faturamentos.organizacao_id and c.empresa_id=faturamentos.empresa_id and c.cliente_id=faturamentos.cliente_id and c.status in ('ASSINADO','ATIVO')))
 and ((ordem_servico_id is null) or exists(select 1 from public.ordens_servico o where o.id=faturamentos.ordem_servico_id and o.organizacao_id=faturamentos.organizacao_id and o.empresa_id=faturamentos.empresa_id and o.cliente_id=faturamentos.cliente_id and o.cliente_aprovou=true))
 and ((proposta_id is null) or exists(select 1 from public.propostas p where p.id=faturamentos.proposta_id and p.organizacao_id=faturamentos.organizacao_id and p.empresa_id=faturamentos.empresa_id and p.cliente_id=faturamentos.cliente_id and p.status='APROVADA'))
);

drop policy if exists faturamento_parcelas_update on public.faturamento_parcelas;
create policy faturamento_parcelas_update on public.faturamento_parcelas for update to authenticated using (
 app_private.has_permission('faturamento.editar') and exists(select 1 from public.faturamentos f join public.empresas e on e.id=f.empresa_id and e.organizacao_id=f.organizacao_id and e.ativo where f.id=faturamento_parcelas.faturamento_id and (exists(select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin and p.organizacao_id=f.organizacao_id) or exists(select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=f.empresa_id)))
) with check (
 app_private.has_permission('faturamento.editar') and exists(select 1 from public.faturamentos f join public.empresas e on e.id=f.empresa_id and e.organizacao_id=f.organizacao_id and e.ativo where f.id=faturamento_parcelas.faturamento_id and (exists(select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin and p.organizacao_id=f.organizacao_id) or exists(select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=f.empresa_id)))
);
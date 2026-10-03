-- Hardening RLS / Propostas
-- Políticas de propostas e itens devem aceitar somente sessões autenticadas.
-- As expressões de autorização existentes permanecem inalteradas.

alter policy propostas_select on public.propostas to authenticated;
alter policy propostas_insert on public.propostas to authenticated;
alter policy propostas_update on public.propostas to authenticated;
alter policy propostas_delete on public.propostas to authenticated;

alter policy proposta_itens_select on public.proposta_itens to authenticated;
alter policy proposta_itens_insert on public.proposta_itens to authenticated;
alter policy proposta_itens_update on public.proposta_itens to authenticated;
alter policy proposta_itens_delete on public.proposta_itens to authenticated;

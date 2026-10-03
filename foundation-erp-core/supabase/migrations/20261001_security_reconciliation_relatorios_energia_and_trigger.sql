-- Security reconciliation for legacy energy reports and approval trigger.
-- relatorios_energia is not referenced by the current frontend and has no rows.
-- Keep the legacy table intact, but remove API access until its tenant/permission model is defined.
revoke all on table public.relatorios_energia from anon, authenticated;
drop policy if exists "Permitir acesso total aos relatorios" on public.relatorios_energia;
alter table public.relatorios_energia enable row level security;

-- The trigger function only updates NEW.updated_at. It does not need public/anon execution.
revoke all on function public.touch_avisos_aprovacao_updated_at() from anon, authenticated;
grant execute on function public.touch_avisos_aprovacao_updated_at() to authenticated;
alter function public.touch_avisos_aprovacao_updated_at() set search_path = public;

alter table public.ordens_servico
  add column if not exists cliente_aprovou boolean not null default false,
  add column if not exists data_aprovacao_cliente date,
  add column if not exists observacao_aprovacao_cliente text;
alter table public.ordens_servico drop constraint if exists ordens_servico_aprovacao_cliente_ck;
alter table public.ordens_servico add constraint ordens_servico_aprovacao_cliente_ck check ((cliente_aprovou = false and data_aprovacao_cliente is null) or (cliente_aprovou = true and data_aprovacao_cliente is not null));
create index if not exists ordens_servico_aprovacao_cliente_idx on public.ordens_servico(organizacao_id, cliente_aprovou, data_aprovacao_cliente);
comment on column public.ordens_servico.cliente_aprovou is 'Indica aprovação do atendimento/OS pelo cliente. Não dispara faturamento nesta etapa.';
comment on column public.ordens_servico.data_aprovacao_cliente is 'Data registrada da aprovação do cliente.';
comment on column public.ordens_servico.observacao_aprovacao_cliente is 'Observação/evidência textual da aprovação, quando aplicável.';
create index if not exists faturamentos_contrato_id_idx
  on public.faturamentos (contrato_id)
  where contrato_id is not null;

create index if not exists faturamentos_ordem_servico_id_idx
  on public.faturamentos (ordem_servico_id)
  where ordem_servico_id is not null;

create index if not exists faturamentos_proposta_id_idx
  on public.faturamentos (proposta_id)
  where proposta_id is not null;

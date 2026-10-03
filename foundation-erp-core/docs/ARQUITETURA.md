# SOLAR ERP — Fundação técnica

## Diretriz do projeto

O SOLAR ERP será construído como uma base SaaS multiempresa, com núcleo reutilizável e módulos comerciais/operacionais ativados por licença. O SIGCF serve como referência de padrões, segurança, organização de módulos e experiência de uso, mas o SOLAR mantém banco e regras próprias.

A identidade visual aprovada permanece como referência do produto: **navy escuro + amarelo solar + verde/mint**, superfícies claras, cards arredondados, navegação limpa e linguagem corporativa.

## Modelo funcional aprovado

O produto inicial não terá três sistemas independentes. O núcleo é compartilhado e o cliente pode contratar combinações simples:

1. **Comércio** — venda de produtos, pedidos, estoque e rotinas comerciais.
2. **Serviços** — prestação de serviços, ordens de serviço, execução, técnicos e contratos.
3. **Gestão de Usinas (UFV)** — especialização dentro de Serviços para implantação, manutenção, limpeza, monitoramento, garantias e acompanhamento de usinas.

**Misto** não é um módulo técnico. É a combinação de **Comércio + Serviços**, podendo o cliente também contratar a especialização **Gestão de Usinas**.

Parceiros, produtos/serviços, clientes e ordens de serviço permanecem estruturas compartilhadas. A interface mostra os campos específicos de UFV somente quando o contexto da operação for de uma usina.

## Licenciamento e módulos

A cadeia de acesso do SaaS é:

**Organização → módulos contratados → usuários → grupos/permissões.**

O catálogo global é mantido em public.modulos_sistema e o acesso de cada organização em public.organizacao_modulos.

Catálogo inicial:
- CORE — núcleo do ERP.
- COMERCIO — módulo comercial.
- SERVICOS — módulo operacional.
- UFV — submódulo/especialização de Serviços.

O frontend consulta as habilitações da organização e monta a navegação conforme os módulos ativos. A autorização também ocorre no banco por meio de RLS e das funções internas app_private.has_module_access e app_private.has_permission.

## Camadas

1. **Core ERP** — organização/tenant, empresas/filiais, usuários, grupos e permissões, parceiros, unidades, produtos/serviços, configurações e auditoria.
2. **Comércio** — clientes, fornecedores, propostas, pedidos, estoque e rotinas comerciais.
3. **Serviços** — clientes, serviços, ordens de serviço, técnicos, execução e contratos.
4. **Gestão de Usinas** — usinas, sistemas, equipamentos, instalação, manutenção, limpeza, garantias e monitoramento, sempre relacionada ao contexto de Serviços.
5. **Recursos avançados licenciáveis** — Propostas e Contratos fazem parte da evolução do módulo Serviços/Ordens de Serviço e não devem aparecer para o cliente inicial sem a licença correspondente. O mesmo recurso poderá ser habilitado posteriormente por upgrade, sem duplicar cadastros ou estruturas compartilhadas.
6. **Faturamento** — será tratado como capacidade financeira licenciável e deverá reutilizar, quando tecnicamente compatível, o conhecimento e os padrões já existentes no SIGCF, sem copiar dados ou criar dependência estrutural entre os dois sistemas.

## Segurança e autenticação

- Supabase Auth é a autoridade de autenticação.
- O navegador usa somente VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
- Nenhuma service_role/secret key é enviada ao frontend.
- A sessão é persistida e renovada pelo cliente Supabase.
- Após autenticação, o frontend carrega o registro correspondente em public.perfis.
- Rotas do ERP ficam atrás de ProtectedRoute e exigem sessão + perfil ativo.
- A autorização de dados continua no PostgreSQL/RLS; a proteção de rota do frontend não substitui RLS.
- A verificação de módulo também ocorre no banco, não somente no menu do frontend.

## Banco

O Core está no projeto Supabase evuhgrkcjapzuhzhqqyh e possui RLS nas tabelas expostas. A autorização é organizada por organização, módulos contratados e grupos de permissões. app_private concentra funções internas de apoio.

As migrações registradas incluem erp_core_foundation, erp_core_hardening, erp_core_admin_permissions, erp_core_permission_policies, erp_module_catalog e erp_module_permissions. O objeto legado relatorios_energia foi preservado e não foi incorporado ao Core.

O primeiro tenant de homologação é SOLAR ERP, com o usuário inicial Administrador e módulos Core, Comércio, Serviços e Gestão de Usinas habilitados para validação. Nenhuma razão social/CNPJ fictícia foi criada.

## Frontend atual

O frontend continua em React + Vite + Tailwind. A fundação acrescentou:

- cliente Supabase em src/lib/supabase.js;
- AuthProvider para sessão e perfil;
- ProtectedRoute para proteção das rotas;
- ModuleProvider para carregar módulos habilitados da organização;
- ModuleGuard para proteger rotas por módulo;
- navegação modular no Sidebar;
- tela de login com a identidade visual do SOLAR;
- Header conectado ao usuário autenticado, ação de saída e seletor de empresa atual;
- EmpresaProvider em src/context/EmpresaProvider.jsx para carregar as empresas disponíveis ao usuário, manter a empresa atual e persistir a seleção por organização/usuário;
- dependência @supabase/supabase-js com lockfile versionado.

Dashboard usa o catálogo de módulos/licenciamento real para apresentar a visão geral da organização, sem exibir KPIs mock como se fossem dados operacionais. Clientes possui CRUD real sobre public.parceiros + public.parceiro_papeis. Produtos e serviços possui CRUD real sobre public.produtos_servicos, reutilizando unidades, grupos e famílias existentes. Usinas e Ordens de Serviço possuem persistência real, contexto de empresa e RLS. Propostas possui persistência real e composição de itens com produtos/serviços do catálogo, mas ainda depende de teste funcional autenticado antes de liberação comercial.


### Empresas e filiais

O Core possui cadastro compartilhado de empresas em public.empresas, vinculando cada registro à organização e distinguindo MATRIZ de FILIAL por tipo e empresa_matriz_id. O frontend administrativo está em src/modules/empresas/EmpresasPage.jsx e é acessível pela navegação administrativa para usuários is_admin.

A leitura de empresas permanece limitada à organização do usuário. As mutações exigem permissões CORE específicas (core.empresas.criar, core.empresas.editar e core.empresas.excluir). A tabela public.usuario_empresas mantém o vínculo usuário/empresa e suas mutações exigem core.usuarios.editar, com validação de mesma organização. A migration 20260929_company_access.sql registra essas regras; ela deve ser aplicada ao banco antes de usar o cadastro em ambiente integrado.

O contexto de empresa atual é carregado por EmpresaProvider. Administradores visualizam as empresas ativas da própria organização; usuários comuns visualizam somente as empresas vinculadas em public.usuario_empresas. A seleção fica no Header e é persistida no navegador por organização + usuário. Quando existe somente uma empresa disponível, ela é selecionada automaticamente; com várias empresas, o sistema exige seleção explícita. O contexto ainda não altera automaticamente os filtros dos módulos de negócio: essa integração será feita em cada CRUD para evitar pressupostos silenciosos sobre empresa.

## Sequência de implantação

1. Core de banco e RLS — concluído.
2. Cliente Supabase, autenticação e proteção de rotas — concluído.
3. Bootstrap controlado do primeiro tenant/administrador — concluído.
4. Catálogo de módulos, licenciamento por organização e proteção por módulo — concluído.
5. Contexto de organização/empresa atual — concluído como infraestrutura e integrado aos módulos operacionais implementados.
6. CRUD real de Parceiros — Clientes utiliza public.parceiros + public.parceiro_papeis com persistência real e RLS.
7. CRUD real de Produtos/Serviços — primeira tela implementada usando public.produtos_servicos, unidades_medida, grupos_produto e familias_produto; teste funcional pendente.
8. Serviços — Ordens de Serviço agora possui persistência real, empresa, cliente compartilhado, usina opcional, técnico, status, datas e RLS.
9. Gestão de Usinas — persistência real implementada em public.usinas, com contexto de empresa e RLS.
10. Permissões administrativas e auditoria operacional.
11. Comércio/Propostas e demais fluxos de negócio — em implementação incremental.
12. Contratos como recurso licenciável associado a Serviços/Ordens de Serviço.
13. Faturamento/Financeiro como capacidade licenciável, avaliando reaproveitamento funcional do SIGCF.
14. Inteligência e automação.

Nenhum módulo de negócio será considerado pronto antes de ter persistência, validação, RLS/autorização e teste funcional correspondente.


## Associação de usuários a empresas

A administração de acesso por empresa utiliza a tabela `public.usuario_empresas`, mantendo a separação entre identidade do usuário (`perfis`) e empresas/filiais (`empresas`).

- Tela administrativa: `src/modules/empresas/UsuariosEmpresasPage.jsx`
- Rota: `/usuarios-empresas`
- Acesso à tela: somente administradores.
- O administrador seleciona um usuário ativo e marca uma ou mais empresas/filiais ativas.
- Ao salvar, os vínculos são sincronizados em `usuario_empresas`.
- A lista de empresas é limitada à organização atual.
- O `EmpresaProvider` continua sendo a fonte do contexto da empresa atual no cabeçalho.
- O vínculo do usuário restringe quais empresas aparecem no seletor para usuários comuns.
- O vínculo de empresa não deve ser usado para filtrar cadastros compartilhados do Core, como Clientes e Produtos/Serviços.
- Módulos operacionais que pertençam a uma empresa/filial deverão gravar `empresa_id` explicitamente quando forem implementados.

A migration `20260929_company_access.sql` contém o endurecimento de RLS para exigir `core.usuarios.editar` nas alterações de `usuario_empresas` e validar que usuário e empresa pertencem à mesma organização. Essa migration permanece versionada e não é aplicada automaticamente pela implementação da tela.


### Gestão de Usinas — primeira persistência operacional

A Gestão de Usinas deixou a condição de mock inicial e passou a possuir persistência real em `public.usinas`. Cada usina pertence obrigatoriamente a uma organização e a uma empresa/filial, podendo referenciar um cliente compartilhado de `public.parceiros`.

- Tabela: `public.usinas`
- Contexto obrigatório: Empresa Atual do `EmpresaProvider`
- Cadastro/edição: `src/modules/usinas/UsinaCadastroPage.jsx`
- Consulta: `src/modules/usinas/UsinasPage.jsx`
- Permissões: `ufv.usinas.visualizar/criar/editar/excluir`
- RLS: organização + empresa vinculada ao usuário; administradores da organização possuem acesso às empresas da própria organização.
- Clientes continuam compartilhados no Core; a usina apenas referencia `cliente_id`.
- As políticas RLS usam `(select auth.uid())` para evitar reavaliação por linha.

O cadastro atual registra nome, cliente, endereço, potência, quantidade de painéis, marcas, número de série do inversor, data de instalação, periodicidade de limpeza, status e observações. A lista é filtrada pela empresa atual e permite edição e exclusão conforme as permissões do banco.

A migration de estrutura é `20260930_erp_ufv_usinas.sql`, seguida pelo ajuste de performance `20260930_erp_ufv_usinas_rls_performance.sql`.


### Ordens de Serviço — primeira persistência operacional

Ordens de Serviço utiliza uma única estrutura compartilhada em `public.ordens_servico`, sem separar OS específicas de UFV. A ordem pertence a uma organização e a uma empresa/filial, referencia um cliente compartilhado do Core e pode, opcionalmente, apontar para uma usina da mesma empresa.

- Tabela: `public.ordens_servico`
- Consulta: `src/modules/ordens-servico/OrdensServicoPage.jsx`
- Cadastro/edição: `src/modules/ordens-servico/OrdemServicoCadastroPage.jsx`
- Rotas: `/ordens-servico` e `/ordens-servico/cadastro`
- Permissões: `servicos.ordens_servico.visualizar/criar/editar/excluir`
- Campos principais: número, cliente, usina opcional, tipo, descrição, prioridade, status, abertura, agendamento, conclusão, técnico e observações.
- RLS: organização + empresa vinculada ao usuário, com validação de cliente, usina e técnico dentro da mesma organização.
- A empresa atual do `EmpresaProvider` determina o contexto de consulta e gravação.
- A migration é `20260930_erp_servicos_ordens.sql`.


### Propostas comerciais — persistência e composição

O módulo Comércio persiste propostas em `public.propostas`, vinculadas à organização, empresa/filial e cliente compartilhado do Core. A composição fica em `public.proposta_itens`, permitindo múltiplos produtos/serviços, quantidade, valor unitário, desconto e total calculado.

- Tela: `src/modules/propostas/PropostasPage.jsx`
- Permissões: `comercio.propostas.visualizar/criar/editar/excluir`
- Contexto: empresa atual do `EmpresaProvider`
- RLS: organização + empresa vinculada ao usuário; cliente e produto/serviço devem pertencer à mesma organização.
- A edição substitui os itens de forma controlada, preservando o cabeçalho da proposta.
- Migration versionada: `20260930_erp_comercio_propostas.sql`.
- Ainda é necessário teste funcional autenticado antes de considerar o fluxo pronto para operação comercial.

### Licenciamento de Propostas e Contratos

Propostas e Contratos não são recursos obrigatórios do primeiro nível do produto. A arquitetura deve permitir que uma organização comece apenas com os recursos contratados inicialmente e, posteriormente, faça **upgrade de licença** para habilitar Propostas e Contratos.

A regra é de licenciamento por organização/módulo/recurso, não por cópia de tabelas. O mesmo cadastro de cliente, produto/serviço, empresa e ordem de serviço continua sendo compartilhado.

No módulo Serviços, a evolução planejada é:

**Cliente → Ordem de Serviço → Proposta/Contrato (se licenciado) → execução → faturamento.**

A navegação e os guards do frontend devem esconder ou bloquear Propostas e Contratos quando o recurso não estiver habilitado. A autorização definitiva continuará no PostgreSQL/RLS e nas permissões internas. Administradores não recebem bypass de licença: administração amplia permissões, mas não ativa recursos que a organização não contratou.

### Faturamento e reaproveitamento do SIGCF

O SOLAR ERP deverá possuir uma capacidade de Faturamento para contratos e demais operações que gerem cobrança. Antes de criar uma estrutura paralela, será feita uma análise do SIGCF para identificar regras, campos e rotinas que possam ser reaproveitados conceitualmente ou migrados de forma controlada.

O objetivo é aproveitar conhecimento funcional existente sem acoplar o SOLAR diretamente ao banco do SIGCF. A integração futura deverá ocorrer por API, serviço ou rotina de migração definida, preservando a autonomia dos dois produtos.
\n\n### Contratos — primeira estrutura licenciável\n\nContratos possui persistência própria em \`public.contratos\`, vinculada à organização, empresa/filial e cliente compartilhado. Pode registrar, quando existirem, uma proposta aprovada, uma ordem de serviço e uma usina relacionadas. O fluxo contratual contempla rascunho, negociação, assinatura, vigência, suspensão, encerramento e cancelamento.\n\n- Tela: \`src/modules/contratos/ContratosPage.jsx\`\n- Rota: \`/contratos\`\n- Permissões: \`servicos.contratos.visualizar/criar/editar/excluir\`\n- Recurso: submódulo/licença \`CONTRATOS\` de Serviços.\n- RLS: organização + empresa vinculada ao usuário; proposta de origem, OS e usina são validadas para a mesma organização/empresa/cliente; proposta de origem deve estar APROVADA.\n- Dados preparados para faturamento futuro: vigência, assinatura, periodicidade, dia de vencimento, renovação e valor.\n- Não existe emissão fiscal nesta etapa e nenhum DANFE, DANFCE ou NFS-e é gerado agora.\n\n### Espaço futuro para faturamento e documentos fiscais\n\nA arquitetura fica preparada, mas deliberadamente sem implementar emissão fiscal neste estágio. Quando o cliente contratar a capacidade correspondente, o SOLAR poderá criar uma camada de Faturamento que receba eventos de negócio, por exemplo: pedido/orçamento aprovado, ordem de serviço aprovada pelo cliente ou contrato assinado/ativo. Essa camada poderá, conforme o cenário fiscal do cliente e integrações homologadas, disponibilizar emissão, impressão e envio por e-mail de DANFE, DANFCE e NFS-e.\n\nEsse espaço é uma **capacidade futura/licenciável**, não uma regra automática de emissão. A decisão sobre quando emitir, qual documento utilizar e quais integrações fiscais serão necessárias dependerá do tipo de operação, município/UF, regime e fornecedor fiscal adotado pelo cliente.\n

### Aprovação do cliente em Ordem de Serviço

A OS agora possui um registro explícito e separado do status operacional para indicar aprovação do cliente: `cliente_aprovou`, `data_aprovacao_cliente` e `observacao_aprovacao_cliente`. Isso evita transformar aprovação comercial em status operacional e cria o ponto de controle necessário para uma futura regra de faturamento. A aprovação atualmente é apenas informativa/auditável e **não gera cobrança ou documento fiscal automaticamente**.

### Faturamento e documentos fiscais — espaço arquitetural

O SOLAR ERP deverá manter um ponto de extensão para uma futura camada licenciável de Faturamento. Eventos candidatos: pedido/orçamento aprovado, OS aprovada pelo cliente e contrato assinado/ativo. A emissão fiscal ficará desacoplada do cadastro comercial/serviço, permitindo no futuro integrar provedores e regras diferentes para NF-e/DANFE, NFC-e/DANFCE e NFS-e. Impressão e envio por e-mail serão capacidades posteriores da mesma camada. Nenhuma dessas emissões é realizada nesta etapa.


## Licença full do tenant SOLAR ERP

A organização SOLAR ERP possui licença full para todos os módulos e recursos atualmente cadastrados no catálogo. A ativação foi aplicada no banco para CORE, COMERCIO, SERVICOS, UFV, PROPOSTAS e CONTRATOS.

A licença full não cria nem habilita recursos futuros que ainda não existam no catálogo. Faturamento permanece como capacidade futura/licenciável até sua implementação.

Migration versionada: `supabase/migrations/20260930_erp_full_license.sql`.

## Análise do SIGCF para o futuro Faturamento

Foi realizada inspeção técnica do repositório `fmirandalima/controle-financeiro-compras` e do banco Supabase do SIGCF. O SIGCF 1.3.0 é principalmente um sistema de controle financeiro operacional, compras, conciliação e patrimônio; não há atualmente um módulo fiscal completo de contas a receber/faturamento que deva ser copiado para o SOLAR.

Objetos relevantes identificados no SIGCF incluem `transacoes`, `compras_ml`, `requisicoes`, `cotacoes`, `ordens_compra` e estruturas de auditoria. `transacoes` é uma boa referência para rastreabilidade financeira, conciliação, vínculo com empresa, NF, compra, comprovantes e status de conferência. `compras_ml` é referência para o vínculo entre operação de compra, cartão, Conta Simples, NF e divergências.

O que pode ser reaproveitado conceitualmente no SOLAR:
- rastreabilidade entre documento de origem e movimentação financeira;
- empresa como contexto das operações;
- estados de conferência e auditoria;
- vínculo explícito entre documento, valor e evento operacional;
- permissões por ação;
- histórico e evidências de integração;
- separação entre dado operacional e confirmação financeira;
- padrões de importação/conciliação quando houver integração financeira.

O que não deve ser reutilizado diretamente: o banco do SIGCF, a tabela `transacoes` ou `compras_ml` como modelo de contas a receber do SOLAR. O futuro Faturamento deverá ter modelo próprio para cobrança, parcelas/recebíveis, vencimento, competência, valor, descontos/acréscimos, situação, recebimento, conciliação, origem comercial/serviço, auditoria e idempotência.

A integração entre SOLAR e SIGCF, se necessária, deverá ocorrer por API, serviço ou rotina de migração definida, sem dependência estrutural entre os bancos.

## Espaço futuro para Faturamento e documentos fiscais

A arquitetura fica preparada, mas deliberadamente sem implementar emissão fiscal ou cobrança automática nesta etapa. O fluxo futuro previsto é:

**evento comercial/operacional → cobrança → recebimento → emissão fiscal → impressão/envio**

Eventos candidatos incluem pedido/orçamento aprovado, Ordem de Serviço aprovada pelo cliente e contrato assinado/ativo. Para contratos recorrentes, também poderão existir eventos periódicos de competência.

Quando a capacidade for implementada e licenciada, a camada fiscal poderá ser preparada para NF-e/DANFE, NFC-e/DANFE NFC-e e NFS-e, conforme a operação e as integrações homologadas. Impressão e envio por e-mail serão capacidades posteriores da mesma camada.

Nenhuma emissão fiscal ou cobrança automática é realizada atualmente.


### Faturamento — primeira implementação operacional

O módulo Faturamento foi implementado como capacidade licenciável e independente da emissão fiscal. O objetivo é transformar eventos comerciais/operacionais autorizados em cobrança, parcelas e recebimentos, sem acoplar o SOLAR ao banco do SIGCF.

- Módulo: FATURAMENTO
- Rota: /faturamento
- Tela: src/modules/faturamento/FaturamentoPage.jsx
- Tabelas: public.faturamentos e public.faturamento_parcelas
- Permissões: faturamento.visualizar/criar/editar/excluir
- Migration: supabase/migrations/20260930_erp_faturamento.sql
- Contexto: organização + empresa atual.

A criação de cobrança exige uma origem válida: contrato com status ASSINADO/ATIVO, Ordem de Serviço com aprovação explícita do cliente ou proposta APROVADA. O banco repete essa validação no RLS, portanto o frontend não é a única barreira.

A tela permite informar competência, emissão, valor bruto, desconto, acréscimos, quantidade de parcelas e primeiro vencimento. As parcelas são persistidas individualmente. O recebimento de uma parcela registra data, forma e valor recebido; o cabeçalho passa automaticamente por ABERTO, PARCIAL e PAGO conforme as parcelas.

Faturamentos em RASCUNHO podem ser editados/excluídos. Após abertura, o histórico financeiro não é apagado pela operação normal. O contexto de empresa permanece obrigatório para evitar mistura entre filiais.

A implementação atual não emite NF-e/DANFE, NFC-e/DANFCE ou NFS-e e não integra automaticamente um provedor fiscal. Esses recursos continuam desacoplados para uma etapa fiscal posterior.

O tenant SOLAR ERP recebeu habilitação do módulo FATURAMENTO por sua licença full. Administradores continuam sujeitos ao módulo/licença; a autorização de ações é verificada por app_private.has_permission e RLS.


## RBAC administrativo e ambiente de testes

O controle de acesso possui uma camada explícita para organização, grupos, usuários e permissões.

- Tela: `src/modules/rbac/RbacPage.jsx`
- Rota: `/controle-acesso`
- Acesso no menu: administradores e usuários Master.
- A tela permite consultar usuários, atribuir/remover grupos e atribuir/remover permissões dos grupos.
- Os grupos possuem `escopo=ORGANIZACAO` ou `escopo=EMPRESA`.
- Grupos-base da organização SOLAR ERP: Master e Demonstração (organização); Administradores, Vendedor, Supervisor, Operacional, Financeiro, Somente Consulta e Demonstração (empresa).
- O perfil possui `is_admin` para administrador do cliente e `is_master` para a camada superior de administração.
- O frontend não substitui RLS: as operações de `grupos_permissao`, `grupo_permissoes` e `usuario_grupos` continuam protegidas no PostgreSQL.
- O Master atualmente mantém o escopo de organização do próprio tenant; não foi criado bypass global entre organizações.

### Preparação dos primeiros testes

O primeiro conjunto de testes foi preparado no banco, mas os usuários de teste do Supabase Auth precisam ser criados em **Authentication → Users** antes de receberem perfis no SOLAR. Não são criados usuários Auth diretamente por SQL.

Conjunto inicial planejado: `teste.master`, `teste.admin`, `teste.consulta` e `teste.inativo`. Depois da criação no Auth, os perfis e vínculos de grupos serão associados de forma controlada para executar a matriz de testes de login, inatividade, RBAC, empresa e permissões.


## Controle de acesso por organização e empresa — versão vigente

O modelo de autorização vigente separa quatro dimensões: **licença, empresa, perfil e permissão**.

- **Master** administra a organização, empresas/filiais, licenças e módulos, mas não recebe acesso operacional automaticamente.
- **Administrador da empresa** é definido no vínculo `usuario_empresas.is_administrador=true` e possui acesso operacional total somente naquela empresa, respeitando os módulos licenciados.
- **Perfil da empresa** é armazenado em `grupos_permissao` com `escopo='EMPRESA'` e `empresa_id`, sendo associado ao usuário por `usuario_empresas.grupo_id`.
- **Permissão** define a ação efetiva (`visualizar`, `criar`, `editar`, `excluir`).
- **Licença** define capacidade e módulos disponíveis; não concede permissão ao usuário.
- Um Master pode operar uma empresa somente após receber vínculo explícito em `usuario_empresas`.
- Clientes e Produtos/Serviços continuam no CORE como dados mestres compartilhados da organização; as operações que dependem de empresa são protegidas pelo vínculo empresarial e pelo RLS.

### Objetos principais

`perfis → usuario_empresas → empresas → grupos_permissao → grupo_permissoes → permissoes`

Funções de autorização:
- `app_private.is_master()`
- `app_private.has_company_access(uuid)`
- `app_private.is_company_admin(uuid)`
- `app_private.has_company_permission(uuid,text)`
- `app_private.has_module_access(text)`
- `app_private.has_permission(text)`
- `app_private.has_license_capacity(uuid,text)`

### Regra de segurança

A interface pode ocultar menus e rotas, mas a autorização definitiva permanece no PostgreSQL/RLS. A implementação usa funções `SECURITY DEFINER` internas com `search_path=''`, conforme as práticas de segurança do Supabase.

### Rastreabilidade

A configuração de acesso está documentada também em `docs/arquitetura/controle-acesso.md` e na migração `supabase/migrations/20261002_rbac_company_access_v3.sql`.


## Validação de isolamento e sequência de implantação — versão vigente

A implementação de controle de acesso permanece em `foundation/erp-core` durante a homologação. A sequência de validação é:

1. Master administra organização, empresas, filiais e licenças, sem receber acesso operacional automaticamente.
2. Administrador de empresa recebe acesso operacional somente pela vinculação explícita em `usuario_empresas`.
3. Perfis de empresa são vinculados à própria empresa por `grupos_permissao.empresa_id`.
4. Operações de Serviços, UFV e Faturamento são protegidas por `has_company_permission()` e pelas políticas RLS correspondentes.
5. A licença limita módulos e capacidade de empresas/filiais; ela não concede permissões de usuário.
6. A promoção para `main` somente ocorre após a validação integrada de frontend, RLS, licenciamento e isolamento entre empresas.

A migração consolidada `20261002_rbac_company_access_v3.sql` deve manter a criação de `organizacao_licencas` antes das funções e políticas que dependem dessa tabela.

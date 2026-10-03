# Validação RBAC e isolamento por empresa — 2026-10-02

## Estado da homologação

- Branch: `foundation/erp-core`
- Produção: `main` permanece intacta.
- Vercel: projeto `solar-erp`, deployments desta sequência em Preview.
- Supabase: projeto `fmirandalima's Project` (`evuhgrkcjapzuhzhqqyh`).

## Sequência executada

1. **Reprodutibilidade da migration RBAC**
   - Corrigido o fechamento de dollar-quoting da função `app_private.has_company_permission`.
   - Movida a criação de `organizacao_licencas` para antes de suas alterações/policies no arquivo consolidado.
   - Commit: `80268f7`.

2. **Hardening de segurança e performance**
   - `relatorios_energia`: RLS permanece ativo e agora possui policies restritivas ao usuário Master, pois a tabela legada não possui chave de organização/empresa.
   - Criados índices para as três FKs apontadas pelo advisor.
   - Policies de `avisos_aprovacao` passaram a usar `(select auth.uid())` para evitar reavaliação por linha.
   - Migration aplicada no Supabase: `20261002202958_security_performance_hardening_v1`.
   - Commit: `b5a2ffa`.

3. **Revalidação dos advisors**
   - O alerta de RLS sem policy em `relatorios_energia` desapareceu.
   - Os três alertas de FKs sem índice desapareceram.
   - O alerta de `auth_rls_initplan` de `avisos_aprovacao` desapareceu.
   - Permanece somente o aviso de configuração do Auth para proteção contra senhas vazadas; isso é uma configuração do Auth, não uma falha do código RBAC.

4. **Correção de acesso organizacional do Master**
   - Confirmado diretamente no Supabase que `consultorfernandolima@gmail.com` está com `is_master=true` e `is_admin=false`.
   - O nome cadastrado `Administrador` é apenas o nome do usuário; não representa o nível RBAC.
   - `EmpresaProvider` passou a tratar `is_master=true` como acesso organizacional a todas as empresas da organização.
   - `ModuleProvider` passou a considerar Master como acesso operacional organizacional, sem exigir registro em `usuario_empresas`.
   - `UsuariosEmpresasPage` passou a identificar Master explicitamente e não permite editar vínculos `usuario_empresas` do Master.
   - Commits: `2a75e64`, `7f2af8f`, `d8f578c`.

5. **Homologação Vercel**
   - O deployment mais recente da branch está **READY**:
     - Deployment: `dpl_BVYSLhuiH46EqAY3AFtxU2rBkBuC`
     - Commit: `d8f578c91e6d1bb739dec007a1c8c0d31f982f14`
     - Preview: `solar-fo2g1dfst-fernando-lima1.vercel.app`
   - Os três ajustes de frontend foram publicados em Preview.
   - `main` continua sem alterações.

6. **Preparação da validação automatizada de RBAC**
   - Adicionado `supabase/tests/rbac_company_access.test.sql`.
   - O teste verifica RLS nas tabelas centrais de empresa/RBAC, presença das policies principais e o `search_path` fixado da função `app_private.has_company_permission`.
   - Commit: `66ae8a02061d1e94f17bd90945a452bf06d0a2ee`.
   - A validação estrutural equivalente foi executada diretamente no Supabase e retornou:
     - RLS ativo em `empresas`, `usuario_empresas`, `grupos_permissao`, `grupo_permissoes` e `organizacao_licencas`;
     - 4 policies em `empresas`;
     - 4 policies em `usuario_empresas`;
     - 4 policies em `organizacao_licencas`;
     - `has_company_permission` com `search_path=""`.
   - A suíte pgTAP ainda não foi executada no ambiente remoto; o teste foi versionado para execução no ciclo de testes do banco.

## Revalidação atual do Supabase

- Perfil Master confirmado: `is_master=true`, `is_admin=false`.
- Policies de `empresas` e `usuario_empresas` mantêm `app_private.is_master()` como caminho explícito de acesso organizacional.
- Advisor de segurança: permanece apenas o aviso externo de **Leaked Password Protection Disabled**.
- Advisor de performance: há avisos informativos de índices ainda não utilizados; não foram tratados como erro, pois a homologação ainda possui pouca carga/dados.
- A homologação continua com **1 organização, 0 empresas e apenas 1 perfil Master**.
- O teste funcional multiempresa continua pendente porque ainda não existem usuários operacionais e empresas A/B/C reais de homologação para reproduzir o cenário completo.

## Próxima etapa

A próxima etapa da homologação é o teste funcional de isolamento entre Empresa A/B/C, incluindo:
- usuário Master;
- Administrador de Empresa;
- usuário operacional vinculado a uma empresa;
- tentativa de acesso a dados, grupos e perfis de outra empresa;
- validação das permissões por módulo.

A suíte automatizada de banco deve acompanhar essa etapa para registrar casos permitidos e negados.

Somente após essa validação funcional e a auditoria final a branch deverá ser considerada para promoção à `main`.

# Controle de acesso — Solar ERP

## Modelo oficial

```
ORGANIZAÇÃO
├── MASTER
│   ├── empresas e filiais
│   ├── licenças/capacidade
│   └── módulos/licenças
└── EMPRESAS LICENCIADAS
    ├── Administrador da empresa
    │   └── acesso operacional total na empresa
    └── Perfis da empresa
        └── permissões configuradas pelo Administrador
```

### Regras

1. **Master não possui acesso operacional automático.**
2. **Administrador é escopado à empresa** por `usuario_empresas.is_administrador=true`.
3. **Master só opera uma empresa quando houver vínculo explícito** em `usuario_empresas`.
4. **Perfil de empresa** é vinculado por `usuario_empresas.grupo_id`.
5. `usuario_grupos` permanece para grupos de **ORGANIZAÇÃO**; grupos de empresa não são atribuídos globalmente.
6. **Licença não concede permissão**. Ela limita capacidade e módulos disponíveis.
7. RLS é a autoridade final; guards do frontend não substituem as políticas do banco.

## Estrutura persistida

- `perfis`: identidade do usuário e flags de organização.
- `empresas`: matriz/filial e escopo empresarial.
- `usuario_empresas`: vínculo usuário × empresa × perfil/administração.
- `grupos_permissao`: definição dos perfis/grupos.
- `grupo_permissoes`: permissões de cada grupo.
- `usuario_grupos`: apenas grupos de escopo organização.
- `organizacao_modulos`: módulos licenciados/ativos.
- `organizacao_licencas`: capacidade contratada de empresas e filiais.

## Funções de autorização

- `app_private.is_master()`
- `app_private.has_org_access(uuid)`
- `app_private.has_company_access(uuid)`
- `app_private.is_company_admin(uuid)`
- `app_private.is_any_company_admin()`
- `app_private.has_module_access(text)`
- `app_private.has_permission(text)`
- `app_private.has_company_permission(uuid,text)`
- `app_private.has_license_capacity(uuid,text)`

As funções SECURITY DEFINER usam `search_path = ''` e nomes qualificados.

## Fluxo de concessão

```
Master
  ↓
Empresa
  ↓
usuario_empresas
  ├── is_administrador = true
  └── grupo_id = Perfil Empresa
```

Um usuário pode ter permissões diferentes em empresas diferentes porque o grupo é associado ao vínculo com a empresa.

## Core

Clientes e Produtos/Serviços pertencem ao **CORE**. As rotas `/clientes` e `/produtos` não dependem mais do módulo COMERCIO.

## Propostas

Propostas foram alinhadas ao módulo **SERVICOS**. As chaves de permissão `comercio.propostas.*` foram migradas para `servicos.propostas.*`.

## Licenciamento

A tabela `organizacao_licencas` controla capacidade de matrizes e filiais. O código Foundation de desenvolvimento é provisório e não representa plano comercial.

## Teste de referência

- Master sem vínculo com A → não acessa dados operacionais de A.
- Master com vínculo/admin em A → acessa A.
- Administrador A → acesso total operacional de A, limitado aos módulos licenciados.
- Administrador A → não administra B.
- Mesmo usuário pode ter Perfil A em A e Perfil B em B.
- Empresa C sem vínculo → sem acesso.

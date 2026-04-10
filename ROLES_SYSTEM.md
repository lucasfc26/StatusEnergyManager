# Sistema de Roles e Permissões

## 📋 Visão Geral

O sistema agora suporta 3 tipos de usuários (roles):

1. **Administrador** - Acesso completo a todos os dados
2. **Profissional** - Acesso apenas aos dados que criou
3. **Cliente** - Acesso apenas às UCs associadas a ele

## 🔐 Controle de Acesso

### Tabela de Permissões

| Ação                | Administrador | Profissional  | Cliente  |
| ------------------- | ------------- | ------------- | -------- |
| Visualizar Clientes | Todos         | Seus próprios | ❌       |
| Criar Clientes      | ✅            | ✅            | ❌       |
| Editar Clientes     | Todos         | Seus próprios | ❌       |
| Deletar Clientes    | Todos         | Seus próprios | ❌       |
| Visualizar UCs      | Todas         | Suas próprias | Suas UCs |
| Criar UCs           | ✅            | ✅            | ❌       |
| Editar UCs          | Todas         | Suas próprias | ❌       |
| Deletar UCs         | Todas         | Suas próprias | ❌       |
| Visualizar Faturas  | Todas         | Suas próprias | Suas UCs |

## 📊 Estrutura de Banco de Dados

### Tabela `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role 'administrador' | 'profissional' | 'cliente',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Novas Colunas

- **unidades_consumidoras.cliente_user_id** - Conecta um cliente (tipo usuário) a uma UC

## 🔄 Migrations

As seguintes migrations foram criadas:

1. `20260409000003_create_user_roles.sql` - Cria tabela e enum de roles
2. `20260409000004_update_ucs_with_roles.sql` - Atualiza UCs com RLS baseado em roles
3. `20260409000005_update_faturas_rls_with_roles.sql` - Atualiza faturas com RLS

## 👤 Como Definir o Role de um Usuário

No Supabase, insira um registro na tabela `user_roles`:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user_uuid_aqui', 'profissional');
```

**Roles disponíveis:**

- `'administrador'` - Acesso total
- `'profissional'` - Pode gerenciar seus próprios dados
- `'cliente'` - Acesso somente leitura para suas UCs

## 💾 Integração no Frontend

### Acessar o Role do Usuário

```typescript
import { useStore } from './store';

function MyComponent() {
  const { user } = useStore();

  return (
    <div>
      {user?.role === 'administrador' && (
        <AdminPanel />
      )}
      {user?.role === 'profissional' && (
        <ProfessionalDashboard />
      )}
      {user?.role === 'cliente' && (
        <ClientPortal />
      )}
    </div>
  );
}
```

### Condicionar Ações por Role

```typescript
if (user?.role === "administrador" || user?.role === "profissional") {
  // Pode criar clientes
}

if (user?.role === "cliente") {
  // Pode apenas visualizar suas UCs
}
```

## 🚀 Próximos Passos

1. ✅ Criar migrations (já feito)
2. ✅ Atualizar tipos TypeScript (já feito)
3. ✅ Atualizar Store Zustand (já feito)
4. 📝 Aplicar roles aos usuários existentes no Supabase
5. 📝 Criar interface para gerenciar roles (admin)
6. 📝 Atualizar componentes para respeitar permissões

## ⚠️ Notas Importantes

- O **RLS (Row Level Security)** está ativado no banco de dados
- Todas as queries são filtradas automaticamente pelo Supabase
- O frontend valida permissões com `user.role`
- Criar usuário como "cliente" requer que ele tenha `cliente_user_id` em uma UC

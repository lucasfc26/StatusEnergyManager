-- ============================================================
-- Script de Exemplo: Atribuir Roles aos Usuários
-- ============================================================
-- Este é um script de exemplo para atribuir roles aos usuários existentes.
-- Execute cada comando conforme necessário no Supabase SQL Editor.

-- ============================================================
-- IMPORTANTE: Substitua user_uuid_aqui pelos IDs reais dos usuários!
-- ============================================================

-- ============================================================
-- Exemplo 1: Criar um usuário como ADMINISTRADOR
-- ============================================================
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('seu_uuid_do_admin_aqui', 'administrador');

-- ============================================================
-- Exemplo 2: Criar múltiplos usuários como PROFISSIONAL
-- ============================================================
-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('uuid_profissional_1', 'profissional'),
--   ('uuid_profissional_2', 'profissional');

-- ============================================================
-- Exemplo 3: Criar usuários como CLIENTE
-- ============================================================
-- Nota: Clientes precisam estar associados a uma UC
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('uuid_cliente_aqui', 'cliente');

-- Depois associar o cliente a uma UC:
-- UPDATE public.unidades_consumidoras
-- SET cliente_user_id = 'uuid_cliente_aqui'
-- WHERE id = 'uuid_da_uc_aqui';

-- ============================================================
-- Visualizar os roles criados
-- ============================================================
-- SELECT ur.user_id, ur.role, COUNT(c.id) as total_clientes
-- FROM public.user_roles ur
-- LEFT JOIN public.clientes c ON ur.user_id = c.user_id
-- GROUP BY ur.user_id, ur.role;

-- ============================================================
-- Atualizar role de um usuário existente
-- ============================================================
-- UPDATE public.user_roles
-- SET role = 'profissional'
-- WHERE user_id = 'uuid_do_usuario_aqui';

-- ============================================================
-- Deletar role de um usuário (vai para default 'cliente')
-- ============================================================
-- DELETE FROM public.user_roles WHERE user_id = 'uuid_do_usuario_aqui';

-- ============================================================
-- Ver todos os usuários e seus roles
-- ============================================================
-- SELECT 
--   ur.user_id,
--   ur.role,
--   au.email,
--   ur.created_at
-- FROM public.user_roles ur
-- JOIN auth.users au ON ur.user_id = au.id
-- ORDER BY ur.created_at DESC;

-- ============================================================
-- Contar usuários por role
-- ============================================================
-- SELECT role, COUNT(*) as total
-- FROM public.user_roles
-- GROUP BY role;

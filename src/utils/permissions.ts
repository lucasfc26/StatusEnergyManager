import { User } from "../types";

/**
 * Verificações de permissão baseadas no role do usuário
 */

export const canViewClientes = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "administrador" || user.role === "profissional";
};

export const canCreateCliente = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "administrador" || user.role === "profissional";
};

export const canEditCliente = (
  user: User | null,
  cliente_user_id: string,
): boolean => {
  if (!user) return false;
  if (user.role === "administrador") return true;
  return user.role === "profissional" && user.id === cliente_user_id;
};

export const canDeleteCliente = (
  user: User | null,
  cliente_user_id: string,
): boolean => {
  if (!user) return false;
  if (user.role === "administrador") return true;
  return user.role === "profissional" && user.id === cliente_user_id;
};

export const canViewAllData = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "administrador";
};

export const canViewUC = (
  user: User | null,
  uc_user_id: string,
  uc_cliente_user_id?: string | null,
): boolean => {
  if (!user) return false;
  if (user.role === "administrador") return true;
  if (user.role === "profissional") return user.id === uc_user_id;
  if (user.role === "cliente") return user.id === uc_cliente_user_id;
  return false;
};

export const canCreateUC = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "administrador" || user.role === "profissional";
};

export const canEditUC = (user: User | null, uc_user_id: string): boolean => {
  if (!user) return false;
  if (user.role === "administrador") return true;
  return user.role === "profissional" && user.id === uc_user_id;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    administrador: "Administrador",
    profissional: "Profissional",
    cliente: "Cliente",
  };
  return labels[role] || role;
};

export const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    administrador: "bg-red-100 text-red-800",
    profissional: "bg-blue-100 text-blue-800",
    cliente: "bg-green-100 text-green-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
};

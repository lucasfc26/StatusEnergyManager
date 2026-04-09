import { useState } from 'react';
import { useStore } from '../../store';
import { User, Building2, CreditCard, Bell, Shield, Save } from 'lucide-react';

export function Configuracoes() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'empresa', label: 'Empresa', icon: Building2 },
    { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie suas preferências e dados da conta</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {activeTab === 'perfil' && <PerfilTab user={user} />}
            {activeTab === 'empresa' && <EmpresaTab user={user} />}
            {activeTab === 'assinatura' && <AssinaturaTab />}
            {activeTab === 'notificacoes' && <NotificacoesTab />}
            {activeTab === 'seguranca' && <SegurancaTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfilTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informações Pessoais</h2>
      
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <User className="h-10 w-10 text-white" />
        </div>
        <div>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            Alterar foto
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG ou GIF. Máx 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
          <input
            type="text"
            defaultValue={user?.nome}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-mail</label>
          <input
            type="email"
            defaultValue={user?.email}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cargo</label>
          <input
            type="text"
            placeholder="Administrador"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-white font-semibold hover:shadow-lg transition-all">
          <Save className="h-5 w-5" />
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

function EmpresaTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dados da Empresa</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da Empresa</label>
          <input
            type="text"
            defaultValue={user?.empresa}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CNPJ</label>
          <input
            type="text"
            placeholder="00.000.000/0000-00"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inscrição Estadual</label>
          <input
            type="text"
            placeholder="000.000.000.000"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CEP</label>
          <input
            type="text"
            placeholder="00000-000"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cidade</label>
          <input
            type="text"
            placeholder="São Paulo"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
          <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none">
            <option>SP</option>
            <option>RJ</option>
            <option>MG</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bairro</label>
          <input
            type="text"
            placeholder="Centro"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-white font-semibold hover:shadow-lg transition-all">
          <Save className="h-5 w-5" />
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

function AssinaturaTab() {
  const planos = [
    { nome: 'Básico', preco: 97, clientes: 20, ucs: 50, atual: false },
    { nome: 'Profissional', preco: 197, clientes: 100, ucs: 500, atual: true },
    { nome: 'Empresarial', preco: 397, clientes: 'Ilimitado', ucs: 'Ilimitado', atual: false },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plano e Assinatura</h2>
      
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm">Plano Atual</p>
            <h3 className="text-2xl font-bold">Profissional</h3>
            <p className="text-emerald-100 mt-1">R$ 197/mês • Próxima cobrança em 15/06/2024</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              Alterar plano
            </button>
            <button className="px-4 py-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium transition-colors">
              Gerenciar pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Clientes</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">5 / 100</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '5%' }}></div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">UCs</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">26 / 500</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '5.2%' }}></div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">Planos Disponíveis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`relative rounded-xl border-2 p-4 ${
              plano.atual
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {plano.atual && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                Atual
              </span>
            )}
            <h4 className="font-semibold text-gray-900 dark:text-white">{plano.nome}</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              R${plano.preco}<span className="text-sm font-normal text-gray-500">/mês</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• {plano.clientes} clientes</li>
              <li>• {plano.ucs} UCs</li>
            </ul>
            {!plano.atual && (
              <button className="mt-4 w-full py-2 border border-emerald-500 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                Alterar para este plano
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">Método de Pagamento</h3>
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
            VISA
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expira em 12/2025</p>
          </div>
        </div>
        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
          Alterar
        </button>
      </div>
    </div>
  );
}

function NotificacoesTab() {
  const [notifications, setNotifications] = useState({
    faturasNovas: true,
    faturasVencimento: true,
    faturasErro: true,
    relatoriosSemanais: false,
    promocoes: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferências de Notificação</h2>
      
      <div className="space-y-4">
        <NotificationToggle
          title="Novas faturas extraídas"
          description="Receba notificações quando uma nova fatura for extraída"
          enabled={notifications.faturasNovas}
          onToggle={() => toggleNotification('faturasNovas')}
        />
        <NotificationToggle
          title="Faturas próximas do vencimento"
          description="Alertas de faturas que vencem em até 3 dias"
          enabled={notifications.faturasVencimento}
          onToggle={() => toggleNotification('faturasVencimento')}
        />
        <NotificationToggle
          title="Erros na extração"
          description="Notificações quando houver falhas na extração de faturas"
          enabled={notifications.faturasErro}
          onToggle={() => toggleNotification('faturasErro')}
        />
        <NotificationToggle
          title="Relatórios semanais"
          description="Resumo semanal com indicadores do seu negócio"
          enabled={notifications.relatoriosSemanais}
          onToggle={() => toggleNotification('relatoriosSemanais')}
        />
        <NotificationToggle
          title="Promoções e novidades"
          description="Receba ofertas especiais e novidades da plataforma"
          enabled={notifications.promocoes}
          onToggle={() => toggleNotification('promocoes')}
        />
      </div>
    </div>
  );
}

function NotificationToggle({ 
  title, 
  description, 
  enabled, 
  onToggle 
}: { 
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function SegurancaTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Segurança</h2>
      
      {/* Change Password */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white">Alterar Senha</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha atual</label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova senha</label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar nova senha</label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-white font-semibold hover:shadow-lg transition-all">
          <Shield className="h-5 w-5" />
          Atualizar senha
        </button>
      </div>

      {/* Two Factor */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white">Autenticação de dois fatores</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Adicione uma camada extra de segurança à sua conta</p>
          </div>
          <button className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
            Ativar
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Sessões ativas</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Este dispositivo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chrome em Windows • São Paulo, BR</p>
              </div>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              Atual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

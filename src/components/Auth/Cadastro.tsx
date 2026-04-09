import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { supabase } from "../../lib/supabase";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  User,
  CreditCard,
  QrCode,
  Eye,
  EyeOff,
} from "lucide-react";

interface Plano {
  id: string;
  nome: string;
  preco: number;
  limite_clientes: number;
  limite_ucs: number;
  recursos: string[];
}

const planos: Plano[] = [
  {
    id: "basico",
    nome: "Básico",
    preco: 97,
    limite_clientes: 20,
    limite_ucs: 50,
    recursos: [
      "Até 20 clientes",
      "Até 50 UCs",
      "Dashboard básico",
      "Suporte por email",
    ],
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: 197,
    limite_clientes: 100,
    limite_ucs: 500,
    recursos: [
      "Até 100 clientes",
      "Até 500 UCs",
      "Dashboard avançado",
      "Relatórios completos",
      "Suporte prioritário",
    ],
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    preco: 397,
    limite_clientes: 999,
    limite_ucs: 9999,
    recursos: [
      "Clientes ilimitados",
      "UCs ilimitadas",
      "API de integração",
      "White label",
      "Suporte 24/7",
    ],
  },
];

export function Cadastro() {
  const [step, setStep] = useState(1);
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    empresa: "",
    telefone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao">("pix");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useStore();

  const handlePlanoSelect = (plano: Plano) => {
    setSelectedPlano(plano);
    setStep(2);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome.trim(),
            empresa: formData.empresa.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setStep(3);
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await login(formData.email, formData.senha);
      if (success) {
        navigate("/");
      } else {
        // Conta criada mas email ainda não confirmado
        setError(
          "Verifique seu e-mail para confirmar a conta antes de continuar.",
        );
      }
    } catch {
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="mt-2 text-gray-600">
            Comece a gerenciar suas faturas de energia hoje
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                  step >= s
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-16 mx-2 rounded-full ${
                    step > s ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Choose Plan */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
                Escolha seu plano
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {planos.map((plano) => (
                  <div
                    key={plano.id}
                    onClick={() => handlePlanoSelect(plano)}
                    className={`relative cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all hover:shadow-xl ${
                      plano.id === "profissional"
                        ? "border-emerald-500 shadow-lg shadow-emerald-100"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    {plano.id === "profissional" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-1 text-xs font-semibold text-white">
                        Mais popular
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plano.nome}
                    </h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        R${plano.preco}
                      </span>
                      <span className="ml-2 text-gray-500">/mês</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plano.recursos.map((recurso, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Check className="h-4 w-4 text-emerald-500" />
                          {recurso}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-white font-semibold hover:shadow-lg transition-all">
                      Escolher plano
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: User Data */}
          {step === 2 && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-emerald-500" />
                  Seus dados
                </h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.senha}
                        onChange={(e) =>
                          setFormData({ ...formData, senha: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) =>
                          setFormData({ ...formData, empresa: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 pl-12 pr-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        placeholder="Nome da empresa"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {loading ? "Criando conta..." : "Continuar"}
                      {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && selectedPlano && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-emerald-500" />
                  Pagamento
                </h2>

                {/* Plan Summary */}
                <div className="rounded-lg bg-gray-50 p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Plano {selectedPlano.nome}
                    </span>
                    <span className="font-semibold text-gray-900">
                      R${selectedPlano.preco}/mês
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 py-4 transition-all ${
                      paymentMethod === "pix"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <QrCode className="h-5 w-5" />
                    Pix
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cartao")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 py-4 transition-all ${
                      paymentMethod === "cartao"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    Cartão
                  </button>
                </div>

                {paymentMethod === "pix" && (
                  <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg mb-6">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Escaneie o QR Code ou copie a chave Pix
                    </p>
                    <button className="mt-2 text-emerald-600 text-sm font-medium hover:text-emerald-700">
                      Copiar código Pix
                    </button>
                  </div>
                )}

                {paymentMethod === "cartao" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número do cartão
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Validade
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                          placeholder="000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-4">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {loading ? "Processando..." : "Finalizar assinatura"}
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

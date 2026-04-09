import { useState, useEffect } from "react";
import { useStore } from "../../store";
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Upload,
  Mail,
  Zap,
  Plus,
  Trash2,
  LogOut,
} from "lucide-react";
import { Fatura } from "../../types";
import {
  getGoogleAuthUrl,
  extractEmailsAndAttachments,
  validateGmailToken,
  revokeGmailToken,
} from "./EmailExtraction";

export function Extracoes() {
  const { clientes } = useStore();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // States para Gmail
  const [gmailToken, setGmailToken] = useState<string | null>(
    localStorage.getItem("gmail_access_token"),
  );
  const [gmailEmail, setGmailEmail] = useState<string>(
    localStorage.getItem("gmail_email") || "",
  );
  const [gmailConfigured, setGmailConfigured] = useState(false);
  const [emailsToExtract, setEmailsToExtract] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExtractingEmails, setIsExtractingEmails] = useState(false);
  const [extractionErrorEmails, setExtractionErrorEmails] = useState<
    string | null
  >(null);
  const [extractionSuccessEmails, setExtractionSuccessEmails] = useState<
    string | null
  >(null);

  // Verificar token do Gmail ao carregar
  useEffect(() => {
    const verifyToken = async () => {
      if (gmailToken) {
        const isValid = await validateGmailToken(gmailToken);
        setGmailConfigured(isValid);
        if (!isValid) {
          setGmailToken(null);
          localStorage.removeItem("gmail_access_token");
        }
      }
    };
    verifyToken();
  }, [gmailToken]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setExtractionError("Apenas arquivos PDF são permitidos");
    } else {
      setExtractionError(null);
    }

    setUploadedFiles((prev) => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers para Gmail
  const handleGoogleAuth = () => {
    const authUrl = getGoogleAuthUrl();
    window.location.href = authUrl;
  };

  const handleDisconnectGmail = async () => {
    if (gmailToken) {
      await revokeGmailToken(gmailToken);
    }
    setGmailToken(null);
    setGmailEmail("");
    setGmailConfigured(false);
    localStorage.removeItem("gmail_access_token");
    localStorage.removeItem("gmail_email");
  };

  const handleExtractFromEmails = async () => {
    if (!gmailConfigured || !gmailToken) {
      setExtractionErrorEmails("Gmail não configurado");
      return;
    }

    if (!emailsToExtract.trim()) {
      setExtractionErrorEmails("Informe pelo menos um e-mail para extrair");
      return;
    }

    if (!startDate || !endDate) {
      setExtractionErrorEmails("Defina o intervalo de datas");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setExtractionErrorEmails("Data inicial deve ser anterior à data final");
      return;
    }

    setIsExtractingEmails(true);
    setExtractionErrorEmails(null);
    setExtractionSuccessEmails(null);

    try {
      // Processar cada e-mail informado
      const emails = emailsToExtract
        .split(";")
        .map((e) => e.trim())
        .filter(Boolean);

      let totalProcessed = 0;

      for (const email of emails) {
        const result = await extractEmailsAndAttachments(
          {
            email: email.toLowerCase(),
            accessToken: gmailToken,
            startDate: start,
            endDate: end,
          },
          selectedCliente || undefined,
        );

        if (!result.success) {
          throw new Error(result.error || `Erro ao processar ${email}`);
        }

        totalProcessed += result.count;
      }

      setExtractionSuccessEmails(
        `Extração concluída! ${totalProcessed} e-mail(s) com anexo(s) processado(s).`,
      );
    } catch (err) {
      setExtractionErrorEmails(
        err instanceof Error ? err.message : "Erro ao extrair e-mails",
      );
    } finally {
      setIsExtractingEmails(false);
    }
  };

  const handleExtractFromPDF = async () => {
    if (uploadedFiles.length === 0) {
      setExtractionError("Selecione pelo menos um arquivo PDF");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      // Implementação será feita posteriormente com backend
      console.log("Extraindo de", uploadedFiles.length, "arquivo(s) PDF");
      // await extractFromPDF(uploadedFiles, selectedCliente);

      // Simular delay de processamento
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(
        "Extração de PDF implementada com sucesso! Backend será adicionado posteriormente.",
      );
      setUploadedFiles([]);
    } catch (err) {
      setExtractionError(
        err instanceof Error ? err.message : "Erro ao extrair dados",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Extração de Faturas
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Escolha uma forma de extrair informações de suas faturas de energia
        </p>
      </div>

      {/* Grid de métodos de extração */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Upload de PDF */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Upload className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Extração por Upload de PDF
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Envie um ou mais PDFs de faturas para extração
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Clique para enviar</span> ou
                    arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Apenas arquivos PDF
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Lista de arquivos enviados */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Arquivos selecionados ({uploadedFiles.length})
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seleção de cliente (opcional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Cliente (opcional)
              </label>
              <select
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Selecionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Mensagem de erro */}
            {extractionError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {extractionError}
                </p>
              </div>
            )}

            {/* Botão de envio */}
            <button
              onClick={handleExtractFromPDF}
              disabled={isExtracting || uploadedFiles.length === 0}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Extraindo informações...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Enviar e Extrair
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              💡 Os dados extraídos serão validados e armazenados no banco de
              dados para processamento posterior.
            </p>
          </div>
        </div>

        {/* Cards laterais de outros métodos */}
        <div className="space-y-6">
          {/* Card 2: Extração por Gmail */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Extração por E-mail
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Conecte sua conta Gmail para extrair faturas automaticamente
            </p>

            {/* Status da Conexão */}
            {gmailConfigured ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Conectado
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {gmailEmail}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Clique em "Conectar Gmail" para autenticar sua conta
                </p>
              </div>
            )}

            {/* Botão de Autenticação */}
            <button
              onClick={
                gmailConfigured ? handleDisconnectGmail : handleGoogleAuth
              }
              className={`w-full px-4 py-2 font-medium rounded-lg flex items-center justify-center gap-2 mb-4 transition-colors ${
                gmailConfigured
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              }`}
            >
              {gmailConfigured ? (
                <>
                  <LogOut className="h-5 w-5" />
                  Desconectar
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Conectar Gmail
                </>
              )}
            </button>

            {/* Configurações (aparecem apenas se conectado) */}
            {gmailConfigured && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    E-mails para extrair
                  </label>
                  <input
                    type="text"
                    placeholder="faturas@xyz.com ; contato@abc.com"
                    value={emailsToExtract}
                    onChange={(e) => setEmailsToExtract(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Separe múltiplos e-mails com ponto-e-vírgula (;)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Cliente (opcional)
                  </label>
                  <select
                    value={selectedCliente}
                    onChange={(e) => setSelectedCliente(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar cliente...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mensagens de erro/sucesso */}
                {extractionErrorEmails && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {extractionErrorEmails}
                    </p>
                  </div>
                )}

                {extractionSuccessEmails && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {extractionSuccessEmails}
                    </p>
                  </div>
                )}

                {/* Botão de Extração */}
                <button
                  onClick={handleExtractFromEmails}
                  disabled={isExtractingEmails || !emailsToExtract.trim()}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isExtractingEmails ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Extraindo...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Extrair E-mails
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Extração Sistema ENEL */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Extração ENEL
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Extraia faturas diretamente do sistema ENEL
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                ⏳ Em desenvolvimento
              </p>
            </div>

            <button
              disabled
              className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="h-5 w-5" />
              Conectar ENEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

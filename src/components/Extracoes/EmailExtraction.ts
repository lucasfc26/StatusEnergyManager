/**
 * Módulo de Extração de Faturas via Gmail
 * Utiliza a API do Google Gmail para buscar e-mails com anexos
 */

interface GmailConfig {
  email: string;
  accessToken: string;
  startDate: Date;
  endDate: Date;
}

interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: Date;
  attachments: EmailAttachment[];
}

interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data?: string;
}

/**
 * Inicializa a autenticação com Google OAuth 2.0
 * @returns URL de autenticação do Google
 */
export function getGoogleAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/gmail.readonly",
  );

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
}

/**
 * Troca o authorization code pelo access token
 * @param code - Código de autorização recebido do Google
 * @returns Token de acesso
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    const response = await fetch("/api/auth/google/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Erro ao trocar código por token:", error);
    throw error;
  }
}

/**
 * Busca e-mails da conta Gmail especificada com filtros
 * @param config - Configuração do Gmail
 * @returns Lista de e-mails com anexos
 */
export async function fetchEmailsWithAttachments(
  config: GmailConfig,
): Promise<EmailMessage[]> {
  try {
    // Construir query para a API do Gmail
    const query = buildGmailQuery(
      config.email,
      config.startDate,
      config.endDate,
    );

    // Buscar IDs de mensagens
    const messageIds = await searchMessages(config.accessToken, query);

    if (messageIds.length === 0) {
      console.log("Nenhum e-mail encontrado com os critérios especificados");
      return [];
    }

    // Buscar detalhes de cada mensagem
    const emails: EmailMessage[] = [];

    for (const messageId of messageIds) {
      const message = await getMessageDetails(config.accessToken, messageId);
      emails.push(message);
    }

    return emails;
  } catch (error) {
    console.error("Erro ao buscar e-mails:", error);
    throw error;
  }
}

/**
 * Constrói a query de busca para a API do Gmail
 */
function buildGmailQuery(
  email: string,
  startDate: Date,
  endDate: Date,
): string {
  const start = formatDateForGmail(startDate);
  const end = formatDateForGmail(endDate);

  // Query para buscar e-mails de um remetente com anexos em um intervalo de data
  return `from:${email} has:attachment after:${start} before:${end}`;
}

/**
 * Formata data para formato aceito pelo Gmail
 */
function formatDateForGmail(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Busca IDs de mensagens no Gmail
 */
async function searchMessages(
  accessToken: string,
  query: string,
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erro na busca de mensagens: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages?.map((msg: { id: string }) => msg.id) || [];
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    throw error;
  }
}

/**
 * Obtém os detalhes completos de uma mensagem, incluindo anexos
 */
async function getMessageDetails(
  accessToken: string,
  messageId: string,
): Promise<EmailMessage> {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao obter detalhes da mensagem: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const headers = data.payload.headers;

    // Extrair informações do cabeçalho
    const getHeader = (name: string) =>
      headers.find((h: { name: string; value: string }) => h.name === name)
        ?.value || "";

    const attachments = await extractAttachments(
      accessToken,
      messageId,
      data.payload.parts,
    );

    return {
      id: messageId,
      threadId: data.threadId,
      from: getHeader("From"),
      subject: getHeader("Subject"),
      date: new Date(getHeader("Date")),
      attachments,
    };
  } catch (error) {
    console.error("Erro ao obter detalhes da mensagem:", error);
    throw error;
  }
}

/**
 * Extrai os anexos de uma mensagem
 */
async function extractAttachments(
  accessToken: string,
  messageId: string,
  parts: any[],
): Promise<EmailAttachment[]> {
  const attachments: EmailAttachment[] = [];

  if (!parts) return attachments;

  for (const part of parts) {
    if (part.filename && part.filename.length > 0) {
      const attachment: EmailAttachment = {
        id: part.partId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.size || 0,
      };

      // Baixar dados do anexo se for PDF ou XLSX
      if (
        part.mimeType === "application/pdf" ||
        part.mimeType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        try {
          attachment.data = await downloadAttachment(
            accessToken,
            messageId,
            part.partId,
          );
        } catch (error) {
          console.error(`Erro ao baixar anexo ${part.filename}:`, error);
        }
      }

      attachments.push(attachment);
    }
  }

  return attachments;
}

/**
 * Baixa um anexo específico da mensagem
 */
async function downloadAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string,
): Promise<string> {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erro ao baixar anexo: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data; // Base64 encoded data
  } catch (error) {
    console.error("Erro ao baixar anexo:", error);
    throw error;
  }
}

/**
 * Salva os e-mails com anexos no banco de dados
 */
export async function saveEmailsToDatabase(
  emails: EmailMessage[],
  clienteId?: string,
): Promise<void> {
  try {
    const response = await fetch("/api/emails/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emails,
        clienteId: clienteId || null,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao salvar e-mails no banco de dados: ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Erro ao salvar e-mails:", error);
    throw error;
  }
}

/**
 * Função principal para processar extração de e-mails
 */
export async function extractEmailsAndAttachments(
  config: GmailConfig,
  clienteId?: string,
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Validar configuração
    if (!config.email || !config.accessToken) {
      throw new Error("Configuração de Gmail inválida");
    }

    if (config.startDate >= config.endDate) {
      throw new Error("Data inicial deve ser anterior à data final");
    }

    // Buscar e-mails
    const emails = await fetchEmailsWithAttachments(config);

    if (emails.length === 0) {
      return {
        success: true,
        count: 0,
      };
    }

    // Salvar no banco de dados
    await saveEmailsToDatabase(emails, clienteId);

    return {
      success: true,
      count: emails.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erro na extração de e-mails:", errorMessage);

    return {
      success: false,
      count: 0,
      error: errorMessage,
    };
  }
}

/**
 * Valida token de acesso ao Gmail
 */
export async function validateGmailToken(
  accessToken: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" +
        accessToken,
    );

    return response.ok;
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return false;
  }
}

/**
 * Revoga token de acesso ao Gmail
 */
export async function revokeGmailToken(accessToken: string): Promise<void> {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  } catch (error) {
    console.error("Erro ao revogar token:", error);
  }
}

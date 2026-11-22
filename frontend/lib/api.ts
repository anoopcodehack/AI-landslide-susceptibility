/**
 * Centralized API base URL configuration.
 * Defaults to http://localhost:8000 for local development.
 * Can be overridden in production (e.g. Vercel) by setting NEXT_PUBLIC_API_URL.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export interface TelegramAlertPayload {
  level?: "RED" | "ORANGE" | "YELLOW" | "GREEN";
  sector: string;
  sector_kn?: string;
  rainfall_mm?: number;
  susceptibility_pct?: number;
  message_en: string;
  message_kn?: string;
  bot_token?: string;
  chat_id?: string;
}

export interface TelegramAlertResponse {
  status: "SENT" | "SIMULATED" | "ERROR";
  recipient_chat_id: string;
  formatted_message: string;
  telegram_response?: any;
  detail: string;
}

/**
 * Dispatch official bilingual (English + Kannada) Civil Defense alert to Telegram
 */
export async function sendTelegramAlert(
  payload: TelegramAlertPayload
): Promise<TelegramAlertResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/alerts/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to dispatch alert: ${errText}`);
  }
  return res.json();
}

/**
 * Check recent Telegram updates to auto-detect the user's chat_id
 */
export async function autoDetectTelegramChat(botToken?: string): Promise<{
  ok: boolean;
  detected?: boolean;
  chat_id?: string;
  user?: string;
  bot_username?: string;
  detail: string;
}> {
  const query = botToken ? `?bot_token=${encodeURIComponent(botToken)}` : "";
  const res = await fetch(`${API_BASE_URL}/api/v1/alerts/telegram/updates${query}`);
  if (!res.ok) {
    return { ok: false, detail: "Failed to connect to backend updates API" };
  }
  return res.json();
}

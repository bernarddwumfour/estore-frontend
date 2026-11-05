
import axios from "axios";
import securityAxios from "@/axios-instances/SecurityAxios";


export interface AssistantProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  discounted_price: number;
  is_in_stock: boolean;
  image: string | null;
}


export interface AssistantProduct {
  id: string;
  title: string;
  slug: string;
  min_price: number | null;
  max_price: number | null;
  has_stock: boolean;
  image: string | null;
  variants?: AssistantProductVariant[];

}

export interface AssistantResponse {
  conversation_id: string;
  message_id: string;
  response: string;
  created_at: string;
  products?: AssistantProduct[];
}

export interface SendMessagePayload {
  message: string;
  conversation_id?: string;
}

interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
}

export async function sendAssistantMessage(
  payload: SendMessagePayload,
  signal?: AbortSignal
): Promise<AssistantResponse> {
  const message = payload.message.trim();

  if (!message) {
    throw new Error("Message cannot be empty.");
  }

  if (message.length > 4000) {
    throw new Error(
      "Message cannot exceed 4000 characters."
    );
  }

  try {
    const response = await securityAxios.post<
      APIResponse<AssistantResponse>
    >(
      "/assistant/chat/",
      {
        message,
        ...(payload.conversation_id
          ? { conversation_id: payload.conversation_id }
          : {}),
      },
      { signal }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(
        result.message || "Unable to send message."
      );
    }

    return result.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (status === 403) {
        throw new Error(
          "You do not have permission to use the assistant."
        );
      }

      if (status === 429) {
        throw new Error(
          "Too many requests. Please try again later."
        );
      }

      if (status && status >= 500) {
        throw new Error(
          "The assistant service is temporarily unavailable."
        );
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Unable to send message."
      );
    }

    throw error;
  }
}

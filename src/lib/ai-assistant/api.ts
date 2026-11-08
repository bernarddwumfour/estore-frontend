
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
  selected_variant_id?: string | null;
  variants?: AssistantProductVariant[];

}

export interface AssistantPromotion {
  slug: string;
  name: string;
  description: string;
  bundle_price: number;
  original_total: number;
  savings_amount: number;
  savings_percentage: number;
  ends_at: string | null;
  images: Array<{ url: string; alt_text: string }>;
  items: Array<{ product_title: string; product_slug: string; quantity: number; is_free: boolean; attributes: Record<string, string>; image_url: string | null }>;
  has_stock: boolean;
}

export interface AssistantResponse {
  conversation_id: string | null;
  message_id: string;
  response: string;
  created_at: string;
  products?: AssistantProduct[];
  promotions?: AssistantPromotion[];
  order_draft?: AssistantOrderDraft | null;
  order_tracking?: AssistantOrderTracking | null;
  requires_shipping_address?: boolean;
}

export interface AssistantOrderDraft {
  id: string;
  confirmation_token: string;
  expires_at: string;
  items: Array<{ product_id: string; variant_id: string; title: string; quantity: number; attributes: Record<string, string>; unit_price: number; image: string | null }>;
  subtotal: number;
  total: number;
  currency: string;
  shipping_options: Array<{ id: string; name: string; cost: number; estimated_days?: string }>;
  selected_shipping_method: string;
  shipping_address: { label: string };
  payment_methods: Array<{ id: "pod" | "paystack"; name: string }>;
  selected_payment_method: "pod" | "paystack" | "";
  error?: string;
}

export interface AssistantTrackedOrder {
  order_number: string;
  status: string;
  status_display: string;
  payment_status: string;
  created_at: string;
  total: number;
  currency: string;
  items: Array<{
    product: string;
    variant: Record<string, string>;
    quantity: number;
    image: string | null;
  }>;
  items_count: number;
  shipment: {
    status: string;
    status_display: string;
    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    estimated_delivery: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    tracking_history: Array<{
      status: string;
      status_display: string;
      location: string | null;
      description: string | null;
      created_at: string;
    }>;
  } | null;
}

export interface AssistantOrderTracking {
  orders: AssistantTrackedOrder[];
  message?: string | null;
  view?: "list" | "detail";
}

export interface SendMessagePayload {
  message: string;
  conversation_id?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function sendGuestAssistantMessage(
  payload: SendMessagePayload,
  signal?: AbortSignal,
): Promise<AssistantResponse> {
  const message = payload.message.trim();
  if (!message) throw new Error('Message cannot be empty.');
  if (message.length > 4000) throw new Error('Message cannot exceed 4000 characters.');
  try {
    const response = await securityAxios.post<APIResponse<AssistantResponse>>(
      '/assistant/guest/chat/',
      { message, history: payload.history ?? [] },
      { signal },
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Unable to send message.');
    }
    return response.data.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) throw new Error('Too many messages. Please try again later.');
      if (error.response?.status && error.response.status >= 500) throw new Error('The shopping assistant is temporarily unavailable.');
      throw new Error(error.response?.data?.message || error.message || 'Unable to send message.');
    }
    throw error;
  }
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

export async function confirmAssistantOrder(
  draft: AssistantOrderDraft,
  payment_method: "pod" | "paystack",
  shipping_method: string,
) {
  const response = await securityAxios.post(`/assistant/orders/${draft.id}/confirm/`, {
    confirmation_token: draft.confirmation_token,
    payment_method,
    shipping_method,
  });
  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || "Unable to place order.");
  }
  return response.data.data;
}

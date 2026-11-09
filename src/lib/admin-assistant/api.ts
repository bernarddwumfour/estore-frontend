import securityAxios from "@/axios-instances/SecurityAxios";

export interface PendingAdminAction {
  action_id: string;
  action: string;
  details: {
    data: Record<string, unknown>;
    target_id: string;
    target_summary?: string;
    ids: string[];
    bulk_action: string | null;
    preview?: AdminActionPreview | null;
  };
  expires_in_seconds: number;
  confirmation_path: string;
}

export type AdminActionPreview =
  | {
      type: 'social_post';
      caption: string;
      image_urls: string[];
      targets: Array<{ platform: string; accountId?: string }>;
      scheduled_for: string | null;
    }
  | {
      type: 'promotion';
      public_id: string;
      name: string;
      description: string;
      bundle_price: string;
      image_urls: string[];
      items: Array<{ product_title: string; sku: string; quantity: number; is_free: boolean; image_url: string }>;
    }
  | {
      type: 'blog_post';
      public_id: string;
      title: string;
      excerpt: string;
      content: string;
      cover_image_url: string;
      author_name: string;
      status: string;
    };

export interface AdminEntityDetail {
  entity: 'promotion' | 'blog_post';
  public_id: string;
  preview: AdminActionPreview;
  fields: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
}

export interface AdminAgentReply {
  response: string;
  pending_actions: PendingAdminAction[];
  tables?: AdminResultTable[];
  details?: AdminEntityDetail[];
  conversation?: { id: string; title: string };
}

export interface AdminConversationSummary {
  id: string;
  title: string;
  updated_at: string;
}

export interface AdminSavedConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  attachments?: PickedMedia[];
  tables?: AdminResultTable[];
  details?: AdminEntityDetail[];
}

export interface AdminSavedConversation extends AdminConversationSummary {
  messages: AdminSavedConversationMessage[];
}

interface PickedMedia {
  id?: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
}

export interface AdminResultTable {
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
  total: number;
  pagination?: Record<string, unknown> | null;
}

export async function sendAdminAgentMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = [],
  mediaIds: string[] = [],
  conversationId?: string | null,
): Promise<AdminAgentReply> {
  const response = await securityAxios.post<{ data: AdminAgentReply }>(
    "/assistant/admin/chat/",
    { message, history, media_ids: mediaIds, ...(conversationId ? { conversation_id: conversationId } : {}) },
  );
  return response.data.data;
}

export async function listAdminConversations(): Promise<AdminConversationSummary[]> {
  const response = await securityAxios.get<{ data: { conversations: AdminConversationSummary[] } }>(
    '/assistant/admin/conversations/',
  );
  return response.data.data.conversations;
}

export async function getAdminConversation(id: string): Promise<AdminSavedConversation> {
  const response = await securityAxios.get<{ data: AdminSavedConversation }>(
    `/assistant/admin/conversations/${id}/`,
  );
  return response.data.data;
}

export async function appendAdminConversationEvent(id: string, content: string): Promise<void> {
  await securityAxios.post(`/assistant/admin/conversations/${id}/events/`, { content });
}

export async function prepareAdminBulkProductAction(
  ids: string[],
  action: string,
): Promise<PendingAdminAction> {
  const response = await securityAxios.post<{
    data: { pending_action: PendingAdminAction };
  }>("/assistant/admin/actions/prepare/", { ids, action });
  return response.data.data.pending_action;
}

export async function prepareAdminMarketingAction(
  entity: 'promotion' | 'discount_code' | 'blog_post' | 'review',
  ids: string[],
  action: string,
  review_type?: 'product' | 'order',
): Promise<PendingAdminAction> {
  const response = await securityAxios.post<{
    data: { pending_action: PendingAdminAction };
  }>("/assistant/admin/marketing/actions/prepare/", { entity, ids, action, review_type });
  return response.data.data.pending_action;
}

export async function confirmAdminAction(actionId: string): Promise<unknown> {
  const confirmationPath = actionId.startsWith('/')
    ? actionId.replace(/^\/api/, '')
    : `/assistant/admin/actions/${actionId}/confirm/`;
  const response = await securityAxios.post<{ data: { result: unknown } }>(
    confirmationPath,
  );
  return response.data.data.result;
}

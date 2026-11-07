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
  };
  expires_in_seconds: number;
  confirmation_path: string;
}

export interface AdminAgentReply {
  response: string;
  pending_actions: PendingAdminAction[];
  tables?: AdminResultTable[];
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
): Promise<AdminAgentReply> {
  const response = await securityAxios.post<{ data: AdminAgentReply }>(
    "/assistant/admin/chat/",
    { message, history },
  );
  return response.data.data;
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

'use client';

import { useState, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Bot, Check, ImagePlus, Loader2, Send, Sparkles, Trash2, X } from 'lucide-react';

import { useAuth } from '@/lib/use-auth';
import { DataTable } from '@/widgets/custom-table/DataTable';
import { MediaPicker, type PickedMedia } from '@/widgets/social/MediaPicker';
import {
  confirmAdminAction,
  prepareAdminBulkProductAction,
  prepareAdminMarketingAction,
  sendAdminAgentMessage,
  type AdminEntityDetail,
  type AdminActionPreview,
  type AdminResultTable,
  type PendingAdminAction,
} from '@/lib/admin-assistant/api';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  actions?: PendingAdminAction[];
  tables?: AdminResultTable[];
  details?: AdminEntityDetail[];
  attachments?: PickedMedia[];
};

function tableValue(row: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[part];
  }, row);
}

function tableIntro(tables: AdminResultTable[]): string {
  return tables.map(table => {
    const subjects: Record<string, string> = {
      Products: 'products',
      Variants: 'variants',
      Categories: 'categories',
      'Inventory health': 'at-risk inventory items',
      Users: 'users',
      Affiliates: 'affiliates',
      Promotions: 'promotions',
      'Discount codes': 'discount codes',
      'Blog posts': 'blog posts',
      Reviews: 'reviews',
    };
    const subject = subjects[table.title] ?? table.title.toLowerCase();
    if (!table.total) return `No matching ${subject} were found.`;
    return `Showing ${table.rows.length} of ${table.total} ${subject} matching your request.`;
  }).join(' ');
}

function ResultTable({ table, onPrepareAction }: {
  table: AdminResultTable;
  onPrepareAction: (entity: 'product' | 'promotion' | 'discount_code' | 'blog_post' | 'review', selected: Array<Record<string, unknown> & { id: string | number }>, action: string) => void;
}) {
  const hasImages = ['Products', 'Variants', 'Categories', 'Promotions', 'Blog posts'].includes(table.title);
  const rows = table.rows.map((row, index) => {
    const displayRow: Record<string, unknown> & { id: string | number } = {
      id: String(row.id ?? row.variant_id ?? row.user_id ?? `${table.title}-${index}`),
    };
    if (hasImages) {
      const directImages = Array.isArray(row.images)
        ? row.images.map(image => typeof image === 'string' ? image : (image as Record<string, unknown>)?.url).filter((url): url is string => typeof url === 'string' && Boolean(url))
        : [];
      const product = row.default_variant as Record<string, unknown> | null;
      const defaultImages = Array.isArray(product?.images)
        ? product.images.map(image => (image as Record<string, unknown>)?.url).filter((url): url is string => typeof url === 'string' && Boolean(url))
        : [];
      const variants = Array.isArray(row.variants) ? row.variants as Array<Record<string, unknown>> : [];
      const variantImages = variants.flatMap(variant => Array.isArray(variant.images)
        ? variant.images.map(image => (image as Record<string, unknown>)?.url).filter((url): url is string => typeof url === 'string' && Boolean(url))
        : []);
      const categoryImage = typeof row.image === 'string' ? [row.image] : [];
      const coverImage = typeof row.cover_image_url === 'string' ? [row.cover_image_url] : [];
      displayRow.images = directImages.length ? directImages : defaultImages.length ? defaultImages : variantImages.length ? variantImages : categoryImage.length ? categoryImage : coverImage;
    }
    for (const column of table.columns) {
      const key = column.key.replace(/\.([a-z])/g, (_, letter: string) => letter.toUpperCase()).replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      displayRow[key] = tableValue(row, column.key);
    }
    return displayRow;
  });

  return (
    <section className="mt-3 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <h3 className="text-sm font-semibold">{table.title}</h3>
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{table.total} total</span>
      </div>
      <DataTable
        data={rows}
        excludeColumns={['id']}
        images={hasImages ? { images: item => item.images as string[] } : {}}
        bulkActions={table.title === 'Products' ? [
          { label: 'Publish', onClick: selected => onPrepareAction('product', selected, 'publish') },
          { label: 'Set to draft', onClick: selected => onPrepareAction('product', selected, 'draft') },
          { label: 'Archive', onClick: selected => onPrepareAction('product', selected, 'archive') },
          { label: 'Feature', onClick: selected => onPrepareAction('product', selected, 'feature') },
          { label: 'Unfeature', onClick: selected => onPrepareAction('product', selected, 'unfeature') },
          { label: 'Delete', variant: 'destructive', onClick: selected => onPrepareAction('product', selected, 'delete') },
        ] : table.title === 'Promotions' ? [
          { label: 'Activate', onClick: selected => onPrepareAction('promotion', selected, 'activate') },
          { label: 'Pause', onClick: selected => onPrepareAction('promotion', selected, 'pause') },
          { label: 'Delete', variant: 'destructive', onClick: selected => onPrepareAction('promotion', selected, 'delete') },
        ] : table.title === 'Discount codes' ? [
          { label: 'Activate', onClick: selected => onPrepareAction('discount_code', selected, 'activate') },
          { label: 'Deactivate', onClick: selected => onPrepareAction('discount_code', selected, 'deactivate') },
        ] : table.title === 'Blog posts' ? [
          { label: 'Publish', onClick: selected => onPrepareAction('blog_post', selected, 'publish') },
          { label: 'Archive', onClick: selected => onPrepareAction('blog_post', selected, 'archive') },
          { label: 'Delete', variant: 'destructive', onClick: selected => onPrepareAction('blog_post', selected, 'delete') },
        ] : table.title === 'Reviews' ? [
          { label: 'Approve', onClick: selected => onPrepareAction('review', selected, 'approve') },
          { label: 'Reject', variant: 'destructive', onClick: selected => onPrepareAction('review', selected, 'reject') },
        ] : []}
        bulkActionsMessage="Select rows to prepare an action"
        emptyTitle="No matching records"
        emptyDescription="No records matched this request."
      />
      {table.pagination && <p className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Page {String(table.pagination.current_page ?? '—')} of {String(table.pagination.total_pages ?? '—')}
      </p>}
    </section>
  );
}

function errorText(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function CreatePreview({ preview }: { preview: AdminActionPreview }) {
  if (preview.type === 'blog_post') {
    return (
      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700">Blog post preview</div>
        {preview.cover_image_url
          ? <img src={preview.cover_image_url} alt={`Cover for ${preview.title}`} className="aspect-[16/8] w-full object-cover" />
          : <div className="flex aspect-[16/8] items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-900">No cover image selected</div>}
        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold dark:bg-slate-800">{preview.public_id}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 capitalize dark:bg-slate-800">{preview.status}</span>
            <span>By {preview.author_name}</span>
          </div>
          <h4 className="text-xl font-bold leading-tight">{preview.title}</h4>
          {preview.excerpt && <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{preview.excerpt}</p>}
          <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">{preview.content}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700">Promotion preview</div>
      {preview.image_urls.length > 0
        ? <div className="relative">
            <img src={preview.image_urls[0]} alt={`${preview.name} promotion`} className="aspect-[16/8] w-full object-cover" />
            {preview.image_urls.length > 1 && <div className="flex gap-2 overflow-x-auto border-t border-slate-200 p-2 dark:border-slate-700">
              {preview.image_urls.slice(1).map((url, index) => <img key={`${url}-${index}`} src={url} alt={`${preview.name} image ${index + 2}`} className="size-14 shrink-0 rounded-md object-cover" />)}
            </div>}
          </div>
        : <div className="flex aspect-[16/8] items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-900">No promotion images selected</div>}
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bundle offer · {preview.public_id}</p><h4 className="mt-1 text-xl font-bold">{preview.name}</h4></div>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-lg font-bold dark:bg-slate-800">{preview.bundle_price}</p>
        </div>
        {preview.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{preview.description}</p>}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {preview.items.map((item, index) => <div key={`${item.sku}-${index}`} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            {item.image_url
              ? <img src={item.image_url} alt="" className="size-12 shrink-0 rounded-md object-cover" />
              : <div className="size-12 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800" />}
            <div className="min-w-0"><p className="truncate text-sm font-medium">{item.product_title}</p><p className="text-xs text-slate-500">{item.is_free ? 'Free item' : `Qty ${item.quantity}`} · {item.sku}</p></div>
          </div>)}
        </div>
      </div>
    </section>
  );
}

function DetailCard({ detail }: { detail: AdminEntityDetail }) {
  const fields = Object.entries(detail.fields).filter(([, value]) => value !== '' && value != null);
  const formatValue = (key: string, value: unknown) => {
    if (typeof value === 'boolean') {
      return <span className={`inline-flex rounded-full px-2 py-0.5 font-medium ${value ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{value ? 'Yes' : 'No'}</span>;
    }
    if (typeof value === 'string' && key.endsWith('_at')) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
      }
    }
    if (key === 'slug') return <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] dark:bg-slate-800">{String(value)}</code>;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <section className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <h3 className="text-sm font-semibold">Detailed {detail.entity === 'promotion' ? 'promotion' : 'blog post'} · {detail.public_id}</h3>
      <CreatePreview preview={detail.preview} />
      {detail.items && detail.items.length > 0 && <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800"><tr>{['Product', 'SKU', 'Qty', 'Current price', 'Stock', 'Available'].map(label => <th key={label} className="px-3 py-2 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{detail.items.map((item, index) => <tr key={`${String(item.sku)}-${index}`} className="border-t border-slate-200 dark:border-slate-700">
            <td className="px-3 py-2">{String(item.product_title ?? '')}{item.is_free ? ' (free)' : ''}</td>
            <td className="px-3 py-2">{String(item.sku ?? '')}</td>
            <td className="px-3 py-2">{String(item.quantity ?? '')}</td>
            <td className="px-3 py-2">{String(item.current_price ?? '—')}</td>
            <td className="px-3 py-2">{String(item.current_stock ?? '—')}</td>
            <td className="px-3 py-2">{String(item.is_available ?? '—')}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {fields.map(([key, value]) => <div key={key} className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-950">
          <dt className="font-medium capitalize text-slate-500">{key === 'slug' ? 'URL slug' : key.replaceAll('_', ' ')}</dt>
          <dd className="break-words">{formatValue(key, value)}</dd>
        </div>)}
      </dl>
    </section>
  );
}

function ActionCard({ action, onConfirmed }: {
  action: PendingAdminAction;
  onConfirmed: (actionId: string, result: unknown) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState('');
  const preview = action.details.preview;
  const previewFields = preview?.type === 'blog_post'
    ? new Set(['title', 'post_code', 'excerpt', 'content', 'cover_image_url', 'author_name', 'status'])
    : preview?.type === 'promotion'
      ? new Set(['items', 'promotion_code', 'image_count', 'name', 'description', 'bundle_price'])
      : new Set<string>();

  if (dismissed) return null;

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await confirmAdminAction(action.confirmation_path);
      onConfirmed(action.action_id, result);
      setDismissed(true);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-4 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Review {action.action.replaceAll('_', ' ')}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Expires in 10 minutes</span>
      </div>
      {preview && <CreatePreview preview={preview} />}
      <dl className="mt-3 space-y-1 text-sm">
        {action.details.target_id && <div><dt className="inline font-medium">Target: </dt><dd className="inline break-all">{action.details.target_id}</dd></div>}
        {action.details.target_summary && <div><dt className="inline font-medium">Account: </dt><dd className="inline">{action.details.target_summary}</dd></div>}
        {action.details.bulk_action && <div><dt className="inline font-medium">Action: </dt><dd className="inline">{action.details.bulk_action}</dd></div>}
        {action.details.ids.length > 0 && <div><dt className="inline font-medium">Items: </dt><dd className="inline">{action.details.ids.length}</dd></div>}
        {Object.entries(action.details.data).filter(([key]) => !previewFields.has(key)).map(([key, value]) => (
          <div key={key} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2">
            <dt className="font-medium capitalize">{key.replaceAll('_', ' ')}</dt>
            <dd className="break-words">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
          </div>
        ))}
      </dl>
      {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={busy} onClick={confirm}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Confirm change
        </button>
        <button type="button" disabled={busy} onClick={() => setDismissed(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700">
          <X className="size-4" /> Dismiss
        </button>
      </div>
    </section>
  );
}

export function AdminAssistantChat({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<PickedMedia[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const prepareTableAction = async (
    entity: 'product' | 'promotion' | 'discount_code' | 'blog_post' | 'review',
    selected: Array<Record<string, unknown> & { id: string | number }>,
    action: string,
  ) => {
    const ids = selected.map(item => String(item.id));
    const reviewTypes = [...new Set(selected.map(item => item.type).filter((type): type is string => typeof type === 'string'))];
    if (entity === 'review' && reviewTypes.length !== 1) {
      setError('Select reviews of one type at a time (product or order).');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const pendingAction = entity === 'product'
        ? await prepareAdminBulkProductAction(ids, action)
        : await prepareAdminMarketingAction(
          entity, ids, action,
          entity === 'review' ? reviewTypes[0] as 'product' | 'order' : undefined,
        );
      setMessages(current => [...current, {
        id: Date.now(),
        role: 'assistant',
        text: `Review this ${action} ${entity.replaceAll('_', ' ')} action before confirming it.`,
        actions: [pendingAction],
      }]);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput('');
    setError('');
    setBusy(true);
    const attachments = selectedMedia;
    if (attachments.some(media => !media.id)) {
      setError('One or more selected images are missing a media ID. Please select them again.');
      setBusy(false);
      return;
    }
    const userMessageId = Date.now();
    setMessages(current => [...current, { id: userMessageId, role: 'user', text: message, attachments }]);
    try {
      const reply = await sendAdminAgentMessage(
        message,
        messages.slice(-12).map(({ role, text }) => ({ role, text })),
        attachments.map(media => media.id).filter((id): id is string => Boolean(id)),
      );
      const structuredIntro = [
        ...(reply.tables?.length ? [tableIntro(reply.tables)] : []),
        ...(reply.details || []).map(detail => `Here are the detailed ${detail.entity === 'promotion' ? 'promotion' : 'blog post'} details for ${detail.public_id}.`),
      ];
      setMessages(current => [...current, {
        id: Date.now() + 1, role: 'assistant',
        // Use a compact table intro; the model's row-by-row answer would duplicate
        // the structured rows in the table and in the history sent on the next turn.
        text: structuredIntro.length ? structuredIntro.join(' ') : reply.response,
        actions: reply.pending_actions || [],
        tables: reply.tables || [],
        details: reply.details || [],
      }]);
      setSelectedMedia([]);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  };

  const onConfirmed = (actionId: string, result: unknown) => {
    setMessages(current => [...current, {
      id: Date.now(), role: 'assistant',
      text: `Change confirmed. Result: ${JSON.stringify(result)}`,
    }]);
  };

  if (user && !['admin', 'staff'].includes(user.role || '')) {
    return <div className="p-8 text-sm text-red-700">Admin or staff access is required.</div>;
  }

  return (
    <div className={compact
      ? 'flex h-full min-h-0 w-full flex-col p-4'
      : 'mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 sm:p-6 lg:p-8'}>
      <div className={compact ? 'mb-3' : 'mb-6'}>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          <Sparkles className="size-3.5" /> Store management
        </div>
        <h1 className={compact ? 'text-lg font-bold text-slate-950 dark:text-white' : 'text-2xl font-bold text-slate-950 dark:text-white'}>Admin Agent</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Ask about your catalog, promotions, discount codes, blog posts, and reviews. Confirm changes before they are applied.</p>
      </div>

      <div role="log" aria-label="Admin Agent conversation" className={compact
        ? 'min-h-0 flex-1 space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950'
        : 'min-h-[26rem] flex-1 space-y-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6'}>
        {messages.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Bot className="mb-4 size-10 text-slate-700 dark:text-slate-300" />
            <p className="font-semibold text-slate-900 dark:text-white">What would you like to manage?</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">Try “Show products with low stock” or “Find draft products”.</p>
          </div>
        )}
        {messages.map(message => (
          <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-[85%]' : message.tables?.length ? 'max-w-full' : 'max-w-[90%]'}>
            {message.text && <div className={message.role === 'user'
              ? 'whitespace-pre-wrap rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white dark:bg-slate-700'
              : 'whitespace-pre-wrap rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100'}>
              {message.text}
            </div>}
            {message.attachments && message.attachments.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map(media => <img key={media.id ?? media.url} src={media.url} alt={media.title || 'Attached image'} className="size-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />)}
            </div>}
            {message.tables?.map((table, index) => <ResultTable key={`${table.title}-${index}`} table={table} onPrepareAction={prepareTableAction} />)}
            {message.details?.map((detail, index) => <DetailCard key={`${detail.public_id}-${index}`} detail={detail} />)}
            {message.actions?.map(action => (
              <ActionCard key={action.action_id} action={action} onConfirmed={onConfirmed} />
            ))}
          </div>
        ))}
        {busy && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Thinking…</p>}
      </div>

      {selectedMedia.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto">
        {selectedMedia.map(media => <div key={media.id ?? media.url} className="relative size-16 shrink-0">
          <img src={media.url} alt={media.title || 'Attached image'} className="size-16 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
          <button type="button" aria-label="Remove attached image" onClick={() => setSelectedMedia(current => current.filter(item => item.id !== media.id))}
            className="absolute -right-1 -top-1 rounded-full bg-slate-900 p-1 text-white"><Trash2 className="size-3" /></button>
        </div>)}
      </div>}
      <form onSubmit={send} className="mt-4 flex gap-3">
        <label htmlFor="admin-agent-input" className="sr-only">Message Admin Agent</label>
        <button type="button" onClick={() => setMediaPickerOpen(true)} aria-label="Attach images"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <ImagePlus className="size-4" />
        </button>
        <input id="admin-agent-input" value={input} onChange={event => setInput(event.target.value)}
          maxLength={4000} placeholder="Ask about your store…"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        <button type="submit" disabled={busy || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-slate-700">
          <Send className="size-4" /> Send
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        selectedUrls={selectedMedia.map(media => media.url)}
        mediaTypes={['image']}
        onSelect={media => setSelectedMedia(current => [...current, ...media.filter(item => !current.some(existing => existing.id === item.id))].slice(0, 10))}
      />
    </div>
  );
}

export default function AdminAssistantPage() {
  return <AdminAssistantChat />;
}

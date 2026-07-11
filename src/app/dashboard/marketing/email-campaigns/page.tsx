'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, FlaskConical, Pencil, Plus, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import securityAxios from '@/axios-instances/SecurityAxios';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/endpoints/endpoints';
import { ActionsDropdown, type ActionItem } from '@/widgets/ActionsDropdown/ActionsDropdown';
import { CustomDialog } from '@/widgets/CustomDialog/CustomDialog';
import { InfoDialog } from '@/widgets/CustomDialog/InfoDialog';
import { CustomSheet } from '@/widgets/CustomSheet/CustomSheet';
import { CustomFilter, type FilterConfig } from '@/widgets/CustomFilter/CustomFilter';
import { CustomPagination, type PaginationMeta } from '@/widgets/CustomPagination/CustomPagination';
import { DataTable } from '@/widgets/Customtable/DataTable';
import { TableSkeleton } from '@/widgets/Customtable/TableSkeleton';

interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    preheader: string;
    campaign_type: 'newsletter' | 'promotion' | 'announcement' | 'custom';
    segment: string;
    status: 'draft' | 'sending' | 'sent' | 'partially_sent' | 'failed';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    error_sample: { email: string; error: string }[];
    created_by: string | null;
    created_at: string;
    updated_at: string;
    sent_at: string | null;
    html_body?: string;
    text_body?: string;
}

interface SegmentOption {
    value: string;
    label: string;
    recipients: number;
}

interface CampaignPayload {
    name: string;
    subject: string;
    preheader: string;
    campaign_type: string;
    segment: string;
    html_body: string;
}

const CAMPAIGN_TYPES = [
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'custom', label: 'Custom' },
];

const fetchCampaigns = async (params?: any): Promise<{
    data: {
        campaigns: EmailCampaign[];
        total: number;
        pagination: PaginationMeta;
    };
}> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.campaign_type) queryParams.append('campaign_type', params.campaign_type);

    const response = await securityAxios.get(
        `${endpoints.marketing.adminCampaigns}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
};

const fetchCampaignDetail = async (id: string): Promise<EmailCampaign> => {
    const response = await securityAxios.get(endpoints.marketing.adminCampaignDetail.replace(':id', id));
    return response.data.data;
};

const fetchSegments = async (campaignType?: string): Promise<SegmentOption[]> => {
    const suffix = campaignType ? `?campaign_type=${campaignType}` : '';
    const response = await securityAxios.get(`${endpoints.marketing.adminCampaignSegments}${suffix}`);
    return response.data.data.segments;
};

const createCampaign = async (payload: Record<string, any>) => {
    const response = await securityAxios.post(endpoints.marketing.adminCampaignCreate, payload);
    return response.data;
};

const updateCampaign = async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
    const response = await securityAxios.patch(
        endpoints.marketing.adminCampaignUpdate.replace(':id', id),
        payload
    );
    return response.data;
};

const sendCampaign = async (id: string) => {
    const response = await securityAxios.post(endpoints.marketing.adminCampaignSend.replace(':id', id));
    return response.data;
};

const testSendCampaign = async ({ id, email }: { id: string; email: string }) => {
    const response = await securityAxios.post(
        endpoints.marketing.adminCampaignTestSend.replace(':id', id),
        { email }
    );
    return response.data;
};

const filterConfig: FilterConfig = {
    fields: [
        {
            name: 'status',
            type: 'select',
            placeholder: 'Status',
            options: [
                { value: 'draft', label: 'Draft' },
                { value: 'sending', label: 'Sending' },
                { value: 'sent', label: 'Sent' },
                { value: 'partially_sent', label: 'Partially Sent' },
                { value: 'failed', label: 'Failed' },
            ],
            defaultValue: '',
            width: '140px',
        },
        {
            name: 'campaign_type',
            type: 'select',
            placeholder: 'Type',
            options: CAMPAIGN_TYPES,
            defaultValue: '',
            width: '140px',
        },
    ],
    searchPlaceholder: 'Search by name or subject...',
    showSearch: true,
};

const emptyPayload: CampaignPayload = {
    name: '',
    subject: '',
    preheader: '',
    campaign_type: 'newsletter',
    segment: 'all_users',
    html_body: '',
};

function CampaignForm({
    campaign,
    onSubmit,
    onCancel,
    isSubmitting,
}: {
    campaign?: EmailCampaign | null;
    onSubmit: (payload: Record<string, any>) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<CampaignPayload>(emptyPayload);
    const [showPreview, setShowPreview] = useState(false);

    const { data: segments } = useQuery({
        queryKey: ['campaign-segments', form.campaign_type],
        queryFn: () => fetchSegments(form.campaign_type),
    });

    useEffect(() => {
        if (!campaign) {
            setForm(emptyPayload);
            return;
        }
        setForm({
            name: campaign.name,
            subject: campaign.subject,
            preheader: campaign.preheader || '',
            campaign_type: campaign.campaign_type,
            segment: campaign.segment,
            html_body: campaign.html_body || '',
        });
    }, [campaign]);

    const updateField = (field: keyof CampaignPayload, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const selectedSegment = segments?.find((s) => s.value === form.segment);

    const handleSubmit = () => {
        if (!form.name.trim() || !form.subject.trim() || !form.html_body.trim()) {
            toast.error('Name, subject and HTML body are required');
            return;
        }
        onSubmit({
            name: form.name.trim(),
            subject: form.subject.trim(),
            preheader: form.preheader.trim(),
            campaign_type: form.campaign_type,
            segment: form.segment,
            html_body: form.html_body,
        });
    };

    const inputClass =
        'w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white';

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Internal campaign name"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input
                        value={form.subject}
                        onChange={(e) => updateField('subject', e.target.value)}
                        placeholder="Email subject line"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preheader (optional)</label>
                    <input
                        value={form.preheader}
                        onChange={(e) => updateField('preheader', e.target.value)}
                        placeholder="Preview text shown after the subject"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <select
                        value={form.campaign_type}
                        onChange={(e) => updateField('campaign_type', e.target.value)}
                        className={inputClass}
                    >
                        {CAMPAIGN_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Audience</label>
                    <select
                        value={form.segment}
                        onChange={(e) => updateField('segment', e.target.value)}
                        className={inputClass}
                    >
                        {(segments || []).map((segment) => (
                            <option key={segment.value} value={segment.value}>
                                {segment.label} ({segment.recipients} recipients)
                            </option>
                        ))}
                    </select>
                    {form.campaign_type === 'promotion' && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            Promotion campaigns automatically exclude users who opted out of marketing emails.
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">HTML Body</label>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
                        {showPreview ? 'Edit HTML' : 'Preview'}
                    </Button>
                </div>
                {showPreview ? (
                    <iframe
                        title="Email preview"
                        sandbox=""
                        srcDoc={form.html_body || '<p style="font-family:sans-serif;color:#888">Nothing to preview yet.</p>'}
                        className="w-full h-72 border border-gray-200 dark:border-gray-800 rounded-lg bg-white"
                    />
                ) : (
                    <textarea
                        value={form.html_body}
                        onChange={(e) => updateField('html_body', e.target.value)}
                        placeholder="<h1>Hello!</h1><p>Write your email HTML here...</p>"
                        rows={12}
                        className={`${inputClass} font-mono text-sm`}
                    />
                )}
            </div>

            {selectedSegment && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    This campaign will reach <strong>{selectedSegment.recipients}</strong> recipient(s) when sent.
                </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Draft'}
                </Button>
            </div>
        </div>
    );
}

export default function EmailCampaignsPage() {
    const queryClient = useQueryClient();
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<EmailCampaign | null>(null);
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [testSendTarget, setTestSendTarget] = useState<EmailCampaign | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [filters, setFilters] = useState({ page: 1, limit: 20 });
    const [appliedFilters, setAppliedFilters] = useState({ search: '', status: '', campaign_type: '' });
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => { } });

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['email-campaigns', filters.page, filters.limit, appliedFilters],
        queryFn: () => fetchCampaigns({ page: filters.page, limit: filters.limit, ...appliedFilters }),
        refetchInterval: (query) =>
            (query.state.data?.data?.campaigns || []).some((c) => c.status === 'sending') ? 5000 : false,
    });

    const { data: viewingCampaign } = useQuery({
        queryKey: ['email-campaign', viewingId],
        queryFn: () => fetchCampaignDetail(viewingId as string),
        enabled: !!viewingId,
    });

    const invalidate = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    };

    const createMutation = useMutation({
        mutationFn: createCampaign,
        onSuccess: () => {
            toast.success('Campaign draft created');
            setCreating(false);
            invalidate();
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create campaign'),
    });

    const updateMutation = useMutation({
        mutationFn: updateCampaign,
        onSuccess: () => {
            toast.success('Campaign updated');
            setEditing(null);
            invalidate();
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update campaign'),
    });

    const sendMutation = useMutation({
        mutationFn: sendCampaign,
        onSuccess: () => {
            toast.success('Campaign send started');
            invalidate();
        },
        onError: (err: any) => {
            const errors = err?.response?.data?.errors;
            const firstError = errors && Object.values(errors)[0];
            toast.error((firstError as string) || err?.response?.data?.message || 'Failed to send campaign');
        },
    });

    const testSendMutation = useMutation({
        mutationFn: testSendCampaign,
        onSuccess: () => {
            toast.success('Test email sent');
            setTestSendTarget(null);
            setTestEmail('');
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send test email'),
    });

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters({
            search: newFilters.search || '',
            status: newFilters.status || '',
            campaign_type: newFilters.campaign_type || '',
        });
        setFilters((current) => ({ ...current, page: 1 }));
    };

    const handleSend = (campaign: EmailCampaign) => {
        setConfirmDialog({
            open: true,
            title: 'Send Campaign',
            message: `Send "${campaign.name}" to the "${campaign.segment.replace(/_/g, ' ')}" segment now? This cannot be undone.`,
            onConfirm: () => {
                sendMutation.mutate(campaign.id);
                setConfirmDialog((current) => ({ ...current, open: false }));
            },
        });
    };

    const getActions = (campaign: EmailCampaign): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                label: 'View Details',
                icon: <Eye size={14} />,
                onClick: () => setViewingId(campaign.id),
                color: 'blue',
            },
        ];
        if (campaign.status === 'draft') {
            actions.push({
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: async () => {
                    const detail = await fetchCampaignDetail(campaign.id);
                    setEditing(detail);
                },
                color: 'violet',
            });
        }
        actions.push({
            label: 'Send Test',
            icon: <FlaskConical size={14} />,
            onClick: () => setTestSendTarget(campaign),
            color: 'amber',
        });
        if (campaign.status === 'draft' || campaign.status === 'failed') {
            actions.push({
                label: 'Send Now',
                icon: <Send size={14} />,
                onClick: () => handleSend(campaign),
                color: 'emerald',
            });
        }
        return actions;
    };

    const campaigns = data?.data?.campaigns || [];
    const pagination = data?.data?.pagination;
    const total = data?.data?.total || 0;
    const draftCount = campaigns.filter((c) => c.status === 'draft').length;
    const sentCount = campaigns.filter((c) => c.status === 'sent' || c.status === 'partially_sent').length;

    const tableRows = campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        campaign_type: c.campaign_type,
        segment: c.segment.replace(/_/g, ' '),
        status: c.status,
        recipients: c.total_recipients,
        sent: c.sent_count,
        failed: c.failed_count,
        created_at: c.created_at,
    }));

    if (isError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Email Campaigns</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Compose and send emails to your user segments.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error loading campaigns: {(error as Error)?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Email Campaigns</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Compose and send emails to your user segments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drafts (this page)</p>
                    <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
                </div>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sent (this page)</p>
                    <p className="text-2xl font-bold text-emerald-600">{sentCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Button onClick={() => setCreating(true)} className="gap-2">
                    <Plus size={16} />
                    New Campaign
                </Button>
                <Button variant="outline" onClick={() => { refetch(); toast.success('Campaigns refreshed'); }} className="gap-2">
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            <CustomFilter
                config={filterConfig}
                filters={appliedFilters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                    setAppliedFilters({ search: '', status: '', campaign_type: '' });
                    setFilters((current) => ({ ...current, page: 1 }));
                }}
            />

            <InfoDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((current) => ({ ...current, open }))}
                title={confirmDialog.title}
                infoMessage={confirmDialog.message}
                variant="info"
                primaryButtonText="Send Now"
                secondaryButtonText="Cancel"
                primaryAction={confirmDialog.onConfirm}
                secondaryAction={() => setConfirmDialog((current) => ({ ...current, open: false }))}
            />

            <CustomDialog
                title="New Campaign"
                description="Compose a new email campaign draft."
                open={creating}
                onOpenChange={(open) => !open && setCreating(false)}
                contentWidth="max-w-3xl"
            >
                <CampaignForm
                    onSubmit={(payload) => createMutation.mutate(payload)}
                    onCancel={() => setCreating(false)}
                    isSubmitting={createMutation.isPending}
                />
            </CustomDialog>

            <CustomDialog
                title={`Edit ${editing?.name || 'Campaign'}`}
                description="Only draft campaigns can be edited."
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                contentWidth="max-w-3xl"
            >
                <CampaignForm
                    campaign={editing}
                    onSubmit={(payload) => editing && updateMutation.mutate({ id: editing.id, payload })}
                    onCancel={() => setEditing(null)}
                    isSubmitting={updateMutation.isPending}
                />
            </CustomDialog>

            <CustomDialog
                title="Send Test Email"
                description={`Send "${testSendTarget?.name || ''}" to a single address for review.`}
                open={!!testSendTarget}
                onOpenChange={(open) => { if (!open) { setTestSendTarget(null); setTestEmail(''); } }}
                contentWidth="max-w-md"
            >
                <div className="space-y-4">
                    <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setTestSendTarget(null); setTestEmail(''); }}>Cancel</Button>
                        <Button
                            onClick={() => testSendTarget && testSendMutation.mutate({ id: testSendTarget.id, email: testEmail })}
                            disabled={testSendMutation.isPending || !testEmail.trim()}
                        >
                            {testSendMutation.isPending ? 'Sending...' : 'Send Test'}
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            <CustomSheet
                title="Campaign Details"
                description="Delivery stats and email content."
                side="bottom"
                size="lg"
                open={!!viewingId}
                onOpenChange={(open) => !open && setViewingId(null)}
            >
                {viewingCampaign && (
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900 dark:text-white">{viewingCampaign.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Subject</label>
                                <p className="text-gray-900 dark:text-white">{viewingCampaign.subject}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type / Segment</label>
                                <p className="text-gray-900 dark:text-white capitalize">
                                    {viewingCampaign.campaign_type} → {viewingCampaign.segment.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <p className="text-gray-900 dark:text-white capitalize">{viewingCampaign.status.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Delivery</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingCampaign.sent_count} sent / {viewingCampaign.failed_count} failed of {viewingCampaign.total_recipients}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Sent At</label>
                                <p className="text-gray-900 dark:text-white">
                                    {viewingCampaign.sent_at ? new Date(viewingCampaign.sent_at).toLocaleString() : '-'}
                                </p>
                            </div>
                        </div>
                        {viewingCampaign.error_sample?.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Errors (sample)</label>
                                <ul className="text-sm text-red-600 dark:text-red-400 list-disc pl-5">
                                    {viewingCampaign.error_sample.map((e, i) => (
                                        <li key={i}>{e.email}: {e.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email Preview</label>
                            <iframe
                                title="Campaign preview"
                                sandbox=""
                                srcDoc={viewingCampaign.html_body || ''}
                                className="w-full h-80 border border-gray-200 dark:border-gray-800 rounded-lg bg-white mt-1"
                            />
                        </div>
                    </div>
                )}
            </CustomSheet>

            {isLoading ? (
                <TableSkeleton />
            ) : (
                <>
                    <DataTable
                        data={tableRows}
                        renderActions={(row: { id: string }) => {
                            const campaign = campaigns.find((c) => c.id === row.id);
                            if (!campaign) return null;
                            return (
                                <ActionsDropdown
                                    actions={getActions(campaign)}
                                    maxVisible={3}
                                    showLabels={false}
                                    buttonSize="sm"
                                />
                            );
                        }}
                        excludeColumns={['id']}
                        badges={{
                            status: {
                                draft: 'amber',
                                sending: 'blue',
                                sent: 'emerald',
                                partially_sent: 'violet',
                                failed: 'rose',
                            },
                            campaign_type: {
                                newsletter: 'blue',
                                promotion: 'violet',
                                announcement: 'amber',
                                custom: 'zinc',
                            },
                        }}
                        emptyTitle="No Campaigns"
                        emptyDescription="Create your first email campaign to engage your customers."
                    />

                    {pagination && pagination.total_pages > 1 && (
                        <CustomPagination
                            pagination={pagination}
                            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                            onLimitChange={(limit) => setFilters({ page: 1, limit })}
                            showLimitSelector={true}
                            limitOptions={[10, 20, 50, 100]}
                        />
                    )}
                </>
            )}
        </div>
    );
}

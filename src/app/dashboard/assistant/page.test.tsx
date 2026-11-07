import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminAssistantPage from './page';
import { useAuth } from '@/lib/use-auth';
import { confirmAdminAction, sendAdminAgentMessage } from '@/lib/admin-assistant/api';

vi.mock('@/lib/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('@/lib/admin-assistant/api', () => ({
  sendAdminAgentMessage: vi.fn(),
  confirmAdminAction: vi.fn(),
}));

describe('Admin Assistant page', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'admin' } } as ReturnType<typeof useAuth>);
    vi.mocked(sendAdminAgentMessage).mockReset();
    vi.mocked(confirmAdminAction).mockReset();
  });

  it('shows a prepared change and only confirms after a click', async () => {
    const user = userEvent.setup();
    vi.mocked(sendAdminAgentMessage).mockResolvedValue({
      response: 'Review the proposed update.',
      pending_actions: [{
        action_id: 'action-1', action: 'update_product', expires_in_seconds: 600,
        confirmation_path: '/api/assistant/admin/actions/action-1/confirm/',
        details: { data: { status: 'published' }, target_id: 'product-1', ids: [], bulk_action: null },
      }],
    });
    vi.mocked(confirmAdminAction).mockResolvedValue({ id: 'product-1' });

    render(<AdminAssistantPage />);
    await user.type(screen.getByRole('textbox', { name: /message admin agent/i }), 'Publish this product');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByText('Review the proposed update.')).toBeInTheDocument();
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(confirmAdminAction).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /confirm change/i }));
    expect(confirmAdminAction).toHaveBeenCalledWith('/api/assistant/admin/actions/action-1/confirm/');
    expect(await screen.findByText(/change confirmed/i)).toBeInTheDocument();
  });

  it('blocks customer accounts', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'customer' } } as ReturnType<typeof useAuth>);
    render(<AdminAssistantPage />);
    expect(screen.getByText(/admin or staff access is required/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

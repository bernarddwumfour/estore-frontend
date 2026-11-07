import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AdminAssistantLauncher } from './AdminAssistantLauncher';
import { useAuth } from '@/lib/use-auth';

vi.mock('@/lib/use-auth', () => ({ useAuth: vi.fn() }));

describe('Admin Assistant launcher', () => {
  it('opens the dashboard chat sheet for staff', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'staff' } } as ReturnType<typeof useAuth>);
    render(<AdminAssistantLauncher />);
    await userEvent.click(screen.getByRole('button', { name: /open admin agent/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /message admin agent/i })).toBeInTheDocument();
  });

  it('is hidden from customers', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'customer' } } as ReturnType<typeof useAuth>);
    render(<AdminAssistantLauncher />);
    expect(screen.queryByRole('button', { name: /open admin agent/i })).not.toBeInTheDocument();
  });
});

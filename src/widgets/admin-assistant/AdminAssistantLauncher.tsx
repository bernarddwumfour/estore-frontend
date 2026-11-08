'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { AdminAssistantChat } from '@/app/dashboard/assistant/page';
import { useAuth } from '@/lib/use-auth';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function AdminAssistantLauncher() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || !['admin', 'staff'].includes(user.role || '')) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin agent"
        className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 sm:bottom-7 sm:right-7"
      >
        <MessageCircle className="size-6" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex h-dvh w-full min-w-0 max-w-full flex-col gap-0 overflow-hidden p-0 sm:w-[440px] sm:max-w-[440px] dark:bg-slate-950">
          <div className="min-h-0 flex-1 overflow-hidden">
            <AdminAssistantChat compact />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

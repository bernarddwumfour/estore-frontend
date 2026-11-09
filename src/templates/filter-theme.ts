import { cn as mergeClasses } from '@/lib/utils';

// Resolve colors before merging so hover/focus states and portalled menus match.
const furnitureColors: Record<string, string> = {
  'bg-slate-950': 'bg-[#654035]',
  'bg-slate-900': 'bg-[#654035]',
  'bg-slate-800': 'bg-[#503027]',
  'bg-slate-200': 'bg-[#e7e1d3]',
  'bg-slate-100': 'bg-[#f4f1ea]',
  'bg-slate-50': 'bg-[#f6f3ec]',
  'bg-emerald-500': 'bg-[#654035]',
  'text-slate-900': 'text-[#654035]',
  'text-slate-700': 'text-[#654035]',
  'text-slate-600': 'text-[#6b6b5a]',
  'text-slate-500': 'text-[#6b6b5a]',
  'text-slate-400': 'text-[#a6a08f]',
  'border-slate-950': 'border-[#654035]',
  'border-slate-900': 'border-[#654035]',
  'border-slate-400': 'border-[#654035]',
  'border-slate-300': 'border-[#654035]',
  'border-slate-200': 'border-[#e7e1d3]',
  'border-slate-100': 'border-[#e7e1d3]',
  'ring-slate-400': 'ring-[#654035]',
};

export function filterThemeClasses(...inputs: Parameters<typeof mergeClasses>) {
  const classes = mergeClasses(...inputs);
  if (process.env.NEXT_PUBLIC_STORE !== 'furniture') return classes;
  return classes.replace(/(?:bg|text|border|ring)-(?:slate|emerald)-\d+/g,
    color => furnitureColors[color] ?? color);
}

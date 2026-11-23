'use client';

import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/axios-instances/SecurityAxios';
import { apiMessage } from '@/lib/api-message';
import { allRecords, base, persistImages, upgradeCanvas, type Template as ApiTemplate, type Category, type Slot } from '../api';
import { ActiveSelection, Canvas, Circle as FabricCircle, Control, controlsUtils, FabricImage, Gradient as FabricGradient, Group, Line as FabricLine, Path as FabricPath, PencilBrush, Rect, Textbox, Triangle as FabricTriangle, FabricObject } from 'fabric';
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, Circle, Copy, Download, Eye, EyeOff, ImagePlus, Loader2, Lock, Minus, MoreHorizontal, MousePointer2, PaintBucket, PenTool, Pencil, Plus, Redo2, RotateCcw, RotateCw, Save, Square, Trash2, Triangle, Type, Undo2, Unlock, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@orshot/colorshot/react';
import '@orshot/colorshot/styles.css';
import { parseGradient } from '@orshot/colorshot';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

FabricObject.customProperties = [...new Set([...FabricObject.customProperties, 'templateSlot', 'templateSlotType', 'templateImageFrame', 'name', 'frameWidth', 'frameHeight', 'frameLeft', 'frameTop', 'cropFrameWidth', 'cropFrameHeight', 'cropBaseScale', 'cropCenterX', 'cropCenterY', 'cropZoom'])];
type TemplateRecord = { apiTemplate?: ApiTemplate; id: string; name: string; width: number; height: number; json: Record<string, unknown>; updatedAt: string };
type TemplateConfig = { name?: string; width?: number; height?: number; background?: string | Record<string, unknown>; elements: Array<Record<string, unknown>> };
type TemplateSlot = { key: string; type: 'text' | 'image'; defaultValue: string };
const toEditorRecord = (template: ApiTemplate): TemplateRecord => {
  const { width, height, json } = template.content;
  if (!width || !height || !json || !Array.isArray(json.objects)) {
    throw new Error(`Template "${template.name}" is missing its saved canvas JSON or dimensions.`);
  }
  return { id: template.id, name: template.name, width, height, json, updatedAt: template.updated_at ?? '', apiTemplate: template };
};
const SAMPLE_CONFIG = JSON.stringify({
  name: 'Cosmetic Gold Sale', width: 720, height: 720, background: '#8d0908',
  elements: [
    { type: 'circle', x: 64, y: -58, width: 590, height: 590, fill: '#a30d0b', opacity: 0.42 },
    { type: 'circle', x: 92, y: -25, width: 526, height: 526, fill: '#720706', opacity: 0.2 },
    { type: 'path', d: 'M -24 386 C 74 294 177 246 307 263 C 454 282 576 236 744 112 L 744 172 C 584 308 473 336 307 315 C 171 297 80 367 -24 458 Z', fill: { type: 'gradient', start: '#b66a00', end: '#ffe64d', angle: 0 } },
    { type: 'path', d: 'M -14 373 C 85 290 185 257 306 272 C 451 289 573 244 728 132', fill: 'transparent', stroke: '#fff07b', strokeWidth: 3, opacity: 0.72 },
    { type: 'circle', x: 68, y: 169, width: 10, height: 10, fill: '#ffd75a', opacity: 0.75 },
    { type: 'circle', x: 613, y: 354, width: 8, height: 8, fill: '#ffd75a', opacity: 0.65 },
    { type: 'text', text: 'Best cosmetic set for', placeholder: 'campaign_line', x: 156, y: 35, width: 408, fontSize: 28, fontStyle: 'italic', color: '#fff0df', align: 'center', fontFamily: 'Georgia' },
    { type: 'text', text: 'COSMETIC', placeholder: 'product_name', x: 68, y: 78, width: 584, fontSize: 64, fontWeight: 'bold', color: '#8f2900', align: 'center', fontFamily: 'Georgia' },
    { type: 'text', text: 'COSMETIC', x: 68, y: 73, width: 584, fontSize: 64, fontWeight: 'bold', color: { type: 'gradient', start: '#fff566', end: '#e78a00', angle: 90 }, align: 'center', fontFamily: 'Georgia' },
    { type: 'image', placeholder: 'product_bottle', x: 158, y: 198, width: 164, height: 374, fill: '#9b1714' },
    { type: 'image', placeholder: 'product_jar', x: 350, y: 368, width: 202, height: 190, fill: '#a61916' },
    { type: 'circle', x: 447, y: 190, width: 136, height: 136, fill: { type: 'gradient', start: '#fff174', end: '#d98a00', angle: 45 } },
    { type: 'circle', x: 455, y: 198, width: 120, height: 120, fill: '#740707' },
    { type: 'text', text: 'Discount', x: 469, y: 224, width: 92, fontSize: 21, color: '#fff1a1', align: 'center', fontFamily: 'Georgia' },
    { type: 'text', text: '25%', placeholder: 'discount', x: 463, y: 249, width: 104, fontSize: 36, fontWeight: 'bold', color: '#fff1a1', align: 'center', fontFamily: 'Georgia' },
    { type: 'path', d: 'M 477 307 Q 457 329 433 337 Q 453 320 460 297 Z', fill: '#e4a400', stroke: '#ffe45c', strokeWidth: 2 },
    { type: 'rect', x: 280, y: 594, width: 160, height: 42, fill: { type: 'gradient', start: '#ffe75b', end: '#c66b00', angle: 90 }, radius: 21 },
    { type: 'text', text: 'BUY NOW', placeholder: 'call_to_action', x: 292, y: 602, width: 136, fontSize: 20, fontWeight: 'bold', color: '#551000', align: 'center', fontFamily: 'Arial' },
    { type: 'text', text: 'WWW.URWEBSITEURL.COM', placeholder: 'website', x: 186, y: 654, width: 348, fontSize: 18, fontWeight: 'bold', color: '#ffd15a', align: 'center', fontFamily: 'Georgia' },
  ],
}, null, 2);
const BIKE_SAMPLE_CONFIG = JSON.stringify({
  name: 'Get the Best Bike', width: 720, height: 720, background: '#f7f7f5',
  elements: [
    { type: 'circle', x: 68, y: 64, width: 580, height: 470, fill: '#eeeeeb', opacity: 0.42 },
    { type: 'text', text: 'LOGO HERE', placeholder: 'brand_name', x: 42, y: 30, width: 180, fontSize: 17, fontWeight: 'bold', color: '#f36a05', fontFamily: 'Arial' },
    { type: 'text', text: 'TAGLINE HERE', placeholder: 'tagline', x: 42, y: 51, width: 180, fontSize: 11, color: '#4c4c4c', fontFamily: 'Arial' },
    { type: 'circle', x: 590, y: 34, width: 22, height: 22, fill: '#262626' },
    { type: 'text', text: 'f', x: 596, y: 37, width: 12, fontSize: 14, fontWeight: 'bold', color: '#ffffff', align: 'center' },
    { type: 'circle', x: 616, y: 34, width: 22, height: 22, fill: '#f36a05' },
    { type: 'text', text: 'X', x: 621, y: 38, width: 12, fontSize: 10, fontWeight: 'bold', color: '#ffffff', align: 'center' },
    { type: 'circle', x: 642, y: 34, width: 22, height: 22, fill: '#262626' },
    { type: 'text', text: '◎', x: 646, y: 35, width: 14, fontSize: 14, color: '#ffffff', align: 'center' },
    { type: 'text', text: 'G E T   T H E   B E S T', placeholder: 'offer_line', x: 118, y: 76, width: 484, fontSize: 22, fontWeight: 'bold', color: '#f36a05', align: 'center', fontFamily: 'Arial' },
    { type: 'text', text: 'BIKE', placeholder: 'product_title', x: 30, y: 96, width: 660, fontSize: 190, fontWeight: 'bold', color: '#fa6900', align: 'center', fontFamily: 'Impact' },
    { type: 'path', d: 'M 20 536 L 134 452 L 553 452 L 701 536 L 660 568 L 56 568 Z', fill: { type: 'gradient', start: '#f8bd82', end: '#fff5e9', angle: 90 }, opacity: 0.8 },
    { type: 'path', d: 'M 104 558 L 174 474 L 205 474 L 164 558 Z M 290 558 L 311 474 L 340 474 L 332 558 Z M 514 558 L 478 474 L 507 474 L 572 558 Z', fill: '#ffffff', opacity: 0.84 },
    { type: 'circle', x: 125, y: 466, width: 470, height: 48, fill: '#373737', opacity: 0.22 },
    { type: 'image', placeholder: 'product_image', x: 76, y: 168, width: 568, height: 356, fill: '#f7f7f5' },
    { type: 'text', text: 'CALL US FOR DETAILS', x: 55, y: 615, width: 190, fontSize: 12, color: '#696969', align: 'center', fontFamily: 'Arial' },
    { type: 'text', text: '+000 1234 5678', placeholder: 'phone_number', x: 48, y: 635, width: 205, fontSize: 20, fontWeight: 'bold', color: '#f36a05', align: 'center', fontFamily: 'Arial' },
    { type: 'rect', x: 286, y: 631, width: 148, height: 42, fill: '#f20d18', radius: 21 },
    { type: 'text', text: 'CONTACT NOW', placeholder: 'call_to_action', x: 296, y: 642, width: 128, fontSize: 15, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Arial' },
    { type: 'text', text: 'VISIT US FOR DETAILS', x: 477, y: 615, width: 190, fontSize: 12, color: '#696969', align: 'center', fontFamily: 'Arial' },
    { type: 'text', text: 'YOUR WEBSITE', placeholder: 'website', x: 477, y: 635, width: 190, fontSize: 20, fontWeight: 'bold', color: '#f36a05', align: 'center', fontFamily: 'Arial' },
    { type: 'rect', x: 0, y: 0, width: 7, height: 720, fill: '#101010' },
    { type: 'rect', x: 713, y: 0, width: 7, height: 720, fill: '#101010' },
  ],
}, null, 2);
const EARBUDS_BANNER_CONFIG = JSON.stringify({
  name: 'Earbuds Plus Promotion', width: 720, height: 360, background: '#242424',
  elements: [
    { type: 'path', d: 'M 292 360 C 378 273 501 238 720 190 L 720 360 Z', fill: { type: 'gradient', start: '#bd9d50', end: '#f0d58a', angle: 0 } },
    { type: 'path', d: 'M 378 360 C 457 295 567 260 720 232 L 720 360 Z', fill: '#dec37c', opacity: 0.56 },
    { type: 'text', text: '◉  EARBUDS', placeholder: 'brand_name', x: 38, y: 20, width: 150, fontSize: 14, fontWeight: 'bold', color: '#e4ce8e', fontFamily: 'Arial' },
    { type: 'text', text: 'New collection', placeholder: 'collection_name', x: 36, y: 63, width: 235, fontSize: 22, fontStyle: 'italic', color: '#f4f0e7', fontFamily: 'Georgia' },
    { type: 'text', text: 'EARBUDS PLUS', placeholder: 'product_name', x: 34, y: 91, width: 400, fontSize: 48, fontWeight: 'bold', color: '#d8bd72', fontFamily: 'Arial' },
    { type: 'text', text: 'Immersive sound. Effortless style.', placeholder: 'tagline', x: 38, y: 149, width: 350, fontSize: 17, color: '#f5f2e8', fontFamily: 'Arial' },
    { type: 'text', text: 'Clear calls  ·  All-day comfort  ·  Wireless freedom', placeholder: 'features', x: 38, y: 179, width: 390, fontSize: 12, color: '#c7c3b9', fontFamily: 'Arial' },
    { type: 'circle', x: 330, y: 34, width: 82, height: 82, fill: '#d7bd79' },
    { type: 'circle', x: 334, y: 38, width: 74, height: 74, fill: '#242424' },
    { type: 'text', text: '70%\nOFF', placeholder: 'discount', x: 346, y: 50, width: 50, fontSize: 19, fontWeight: 'bold', color: '#e3cb83', align: 'center', fontFamily: 'Arial' },
    { type: 'rect', x: 38, y: 231, width: 122, height: 34, fill: '#e4cb82', radius: 17 },
    { type: 'text', text: 'SHOP NOW', placeholder: 'call_to_action', x: 48, y: 239, width: 102, fontSize: 14, fontWeight: 'bold', color: '#28251e', align: 'center', fontFamily: 'Arial' },
    { type: 'text', text: 'Limited time offer', x: 177, y: 241, width: 150, fontSize: 12, color: '#ece8dc', fontFamily: 'Arial' },
    { type: 'text', text: 'GH₵ 299', placeholder: 'price', x: 177, y: 256, width: 150, fontSize: 15, fontWeight: 'bold', color: '#e4cb82', fontFamily: 'Arial' },
    { type: 'image', placeholder: 'earbuds_product', x: 492, y: 46, width: 184, height: 266, fill: '#e8e9e9' },
    { type: 'text', text: 'www.iplug.com.gh', placeholder: 'website', x: 38, y: 324, width: 210, fontSize: 12, color: '#bdb8aa', fontFamily: 'Arial' },
  ],
}, null, 2);
const DIMENSIONS = {
  square: { width: 720, height: 720, label: 'Square post (1080 × 1080)' },
  portrait: { width: 720, height: 900, label: 'Portrait post (1080 × 1350)' },
  story: { width: 720, height: 1280, label: 'Story (1080 × 1920)' },
  landscape: { width: 720, height: 360, label: 'Landscape banner (1080 × 540)' },
};

function makeLinearGradient(width: number, height: number, start: string, end: string, angle: number) {
  const radians = angle * Math.PI / 180;
  const halfLength = Math.sqrt(width * width + height * height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const dx = Math.cos(radians) * halfLength;
  const dy = Math.sin(radians) * halfLength;
  return new FabricGradient<'linear'>({
    type: 'linear', gradientUnits: 'pixels',
    coords: { x1: centerX - dx, y1: centerY - dy, x2: centerX + dx, y2: centerY + dy },
    colorStops: [{ offset: 0, color: start }, { offset: 1, color: end }],
  });
}

function resolveConfigFill(fill: unknown, width: number, height: number) {
  if (typeof fill === 'string') return fill;
  if (fill && typeof fill === 'object') {
    const gradient = fill as { type?: unknown; start?: unknown; end?: unknown; angle?: unknown };
    if (gradient.type === 'gradient' && typeof gradient.start === 'string' && typeof gradient.end === 'string') {
      return makeLinearGradient(width, height, gradient.start, gradient.end, Number(gradient.angle ?? 0));
    }
  }
  return '#e5e7eb';
}

const getObjectName = (object?: FabricObject | null) => object?.get('name') as string | undefined;
const getLayerLabel = (object: FabricObject) => object instanceof Textbox ? (object.text || 'Text').split('\n')[0] : object instanceof FabricImage ? 'Image' : object instanceof FabricPath ? (getObjectName(object) === 'custom-shape' ? 'Custom shape' : getObjectName(object) === 'custom-path' ? 'Custom path' : 'Freehand path') : getObjectName(object)?.replace('image-slot:', '') || 'Shape';
const getSlotTypeForObject = (object?: FabricObject | null): 'text' | 'image' | null => {
  if (!object) return null;
  const name = getObjectName(object) || '';
  if (object.get('templateSlotType') === 'image' || name.startsWith('image-slot:')) return 'image';
  if (object instanceof Textbox) return 'text';
  if (object instanceof FabricImage) return 'image';
  return null;
};
const canBecomeImageFrame = (object?: FabricObject | null) => !!object && !getObjectName(object)?.startsWith('image-slot:') && (
  object instanceof Rect || object instanceof FabricCircle || object instanceof FabricTriangle ||
  (object instanceof FabricPath && getObjectName(object) === 'custom-shape')
);
const getActionTargets = (object: FabricObject) => object instanceof ActiveSelection ? object.getObjects() : [object];
const fireModified = (canvas: Canvas, object: FabricObject) => canvas.fire('object:modified', { target: object });
const makeRotationControl = (x: number, y: number, offsetX: number, offsetY: number) => new Control({
  x, y, offsetX, offsetY, sizeX: 22, sizeY: 22, cursorStyle: 'grab', actionName: 'rotate',
  actionHandler: controlsUtils.rotationWithSnapping,
  cursorStyleHandler: controlsUtils.rotationStyleHandler,
  render: (ctx, left, top) => {
    ctx.save();
    ctx.beginPath(); ctx.arc(left, top, 9, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#111827'; ctx.stroke();
    ctx.beginPath(); ctx.arc(left, top, 4.5, -0.75, 4.6); ctx.lineWidth = 1.6; ctx.strokeStyle = '#111827'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(left + 2.2, top - 5); ctx.lineTo(left + 6.8, top - 5.2); ctx.lineTo(left + 5.5, top - 1); ctx.closePath(); ctx.fillStyle = '#111827'; ctx.fill();
    ctx.restore();
  },
});
const installRotationControls = (object: FabricObject) => {
  if (object.controls.rotateTopLeft) return;
  const controls = { ...object.controls };
  delete controls.mtr;
  object.controls = {
    ...controls,
    rotateTopLeft: makeRotationControl(-0.5, -0.5, -18, -18),
    rotateTopRight: makeRotationControl(0.5, -0.5, 18, -18),
    rotateBottomLeft: makeRotationControl(-0.5, 0.5, -18, 18),
    rotateBottomRight: makeRotationControl(0.5, 0.5, 18, 18),
  };
};
type BezierAnchor = { x: number; y: number; inX: number; inY: number; outX: number; outY: number; hasHandles: boolean };
const buildBezierPath = (anchors: BezierAnchor[], closed: boolean) => {
  if (!anchors.length) return '';
  const commands = [`M ${anchors[0].x} ${anchors[0].y}`];
  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const current = anchors[index];
    if (previous.hasHandles || current.hasHandles) commands.push(`C ${previous.outX} ${previous.outY} ${current.inX} ${current.inY} ${current.x} ${current.y}`);
    else commands.push(`L ${current.x} ${current.y}`);
  }
  if (closed && anchors.length > 2) {
    const previous = anchors[anchors.length - 1];
    const first = anchors[0];
    if (previous.hasHandles || first.hasHandles) commands.push(`C ${previous.outX} ${previous.outY} ${first.inX} ${first.inY} ${first.x} ${first.y}`);
    commands.push('Z');
  }
  return commands.join(' ');
};

type FillMode = 'solid' | 'gradient';
function FillPicker({ label, mode, onModeChange, startColor, onStartColorChange, endColor, onEndColorChange, angle, onAngleChange, onApply, side, children }: {
  label: string;
  mode: FillMode;
  onModeChange: (mode: FillMode) => void;
  startColor: string;
  onStartColorChange: (color: string) => void;
  endColor: string;
  onEndColorChange: (color: string) => void;
  angle: number;
  onAngleChange: (angle: number) => void;
  onApply: () => void;
  side: 'left' | 'right';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pickerValue = mode === 'gradient' ? `linear-gradient(${angle + 90}deg, ${startColor}, ${endColor})` : startColor;
  const updatePickerValue = (value: string) => {
    const gradient = parseGradient(value);
    if (gradient?.type === 'linear') {
      const stops = gradient.items.filter(item => item.kind === 'stop');
      onModeChange('gradient');
      onStartColorChange(stops[0]?.color || startColor);
      onEndColorChange(stops.at(-1)?.color || endColor);
      onAngleChange((gradient.angle?.deg ?? 180) - 90);
    } else if (!gradient) {
      onModeChange('solid');
      onStartColorChange(value);
    }
  };
  const keepColorPopoverOpen = (event: Event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-colorshot]')) event.preventDefault();
  };
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent side={side} align="start" sideOffset={8} collisionPadding={16} onInteractOutside={keepColorPopoverOpen} className="template-editor-portal w-[min(18rem,calc(100vw-2rem))] space-y-3">
      <div className="text-sm font-semibold">{label}</div>
      <ColorPicker value={pickerValue} onChange={updatePickerValue} modes={['solid', 'linear']} outputFormat="hex" eyeDropper storageKey="estore-template-editor-colors" swatches={[{ id: 'recent', label: 'Recent', recent: true }]} size="sm" alpha={false} />
      <Button size="sm" className="w-full" onClick={() => { onApply(); setOpen(false); }}>Apply {mode === 'gradient' ? 'gradient' : 'color'}</Button>
    </PopoverContent>
  </Popover>;
}

function SingleColorPicker({ label, value, onChange, side = 'left' }: { label: string; value: string; onChange: (color: string) => void; side?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const keepColorPopoverOpen = (event: Event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-colorshot]')) event.preventDefault();
  };
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><button type="button" aria-label={label} title={label} className="h-9 w-12 shrink-0 cursor-pointer rounded border bg-background p-1"><span className="block h-full w-full rounded-sm" style={{ background: value }}/></button></PopoverTrigger>
    <PopoverContent side={side} align="start" sideOffset={8} collisionPadding={16} onInteractOutside={keepColorPopoverOpen} className="template-editor-portal w-[min(17rem,calc(100vw-2rem))] p-2">
      <div className="mb-2 text-xs font-medium">{label}</div>
      <ColorPicker value={value} onChange={onChange} modes={['solid']} outputFormat="hex" eyeDropper storageKey="estore-template-editor-colors" swatches={[{ id: 'recent', label: 'Recent', recent: true }]} size="sm" alpha={false}/>
    </PopoverContent>
  </Popover>;
}

async function paintTemplateConfig(canvas: Canvas, config: TemplateConfig) {
  canvas.clear();
  canvas.backgroundColor = config.background === undefined ? '#ffffff' : resolveConfigFill(config.background, canvas.getWidth(), canvas.getHeight());
  for (const [index, element] of config.elements.entries()) {
    const type = element.type;
    const left = Number(element.x ?? 0);
    const top = Number(element.y ?? 0);
    const width = Number(element.width ?? 300);
    if (![left, top, width].every(Number.isFinite) || width <= 0) throw new Error(`Element ${index + 1} has invalid position or width.`);
    if (type === 'text') {
      const fontSize = Number(element.fontSize ?? 32);
      canvas.add(new Textbox(String(element.text ?? 'Text'), {
        left, top, width, fontSize, fontFamily: String(element.fontFamily ?? 'Arial'),
        fontWeight: String(element.fontWeight ?? 'normal'), fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal', fill: resolveConfigFill(element.color, width, fontSize * 2),
        textAlign: element.align === 'center' || element.align === 'right' ? element.align : 'left',
        opacity: Number(element.opacity ?? 1), originX: 'left', originY: 'top',
      }));
      const textbox = canvas.getObjects().at(-1);
      if (typeof element.placeholder === 'string') textbox?.set('name', element.placeholder);
    } else if (type === 'rect') {
      const height = Number(element.height ?? 100);
      canvas.add(new Rect({ left, top, width, height, fill: resolveConfigFill(element.fill, width, height), rx: Number(element.radius ?? 0), ry: Number(element.radius ?? 0), opacity: Number(element.opacity ?? 1), originX: 'left', originY: 'top' }));
    } else if (type === 'circle') {
      const height = Number(element.height ?? width);
      const circle = new FabricCircle({ left, top, radius: 1, fill: resolveConfigFill(element.fill, 2, 2), opacity: Number(element.opacity ?? 1), originX: 'left', originY: 'top' });
      circle.set({ scaleX: width / 2, scaleY: height / 2 });
      canvas.add(circle);
    } else if (type === 'path') {
      if (typeof element.d !== 'string' || !element.d.trim()) throw new Error(`Element ${index + 1} needs an SVG path in its d field.`);
      const path = new FabricPath(element.d, { fill: 'transparent', stroke: typeof element.stroke === 'string' ? element.stroke : undefined, strokeWidth: Number(element.strokeWidth ?? 0), opacity: Number(element.opacity ?? 1), objectCaching: false });
      path.set('fill', resolveConfigFill(element.fill, path.width || width, path.height || Number(element.height ?? 200)));
      if (typeof element.placeholder === 'string') path.set('name', element.placeholder);
      canvas.add(path);
    } else if (type === 'image') {
      const height = Number(element.height ?? 200);
      const src = typeof element.src === 'string' ? element.src : '';
      if (src) {
        const image = await FabricImage.fromURL(src, { crossOrigin: 'anonymous' });
        const scale = Math.min(width / (image.width || 1), height / (image.height || 1));
        image.set({ left, top, scaleX: scale, scaleY: scale, originX: 'left', originY: 'top', name: `image-slot:${String(element.placeholder ?? index + 1)}` });
        canvas.add(image);
      } else {
        const slotName = `image-slot:${String(element.placeholder ?? index + 1)}`;
        const slot = new Rect({ left, top, width, height, fill: resolveConfigFill(element.fill, width, height), opacity: Number(element.opacity ?? 1), stroke: '#94a3b8', strokeDashArray: [8, 5], originX: 'left', originY: 'top' });
        slot.set('name', slotName);
        const label = new Textbox(String(element.placeholder ?? 'Image'), { left: left + 12, top: top + height / 2 - 16, width: width - 24, fontSize: 22, textAlign: 'center', fill: '#475569', originX: 'left', originY: 'top' });
        label.set('name', slotName);
        canvas.add(slot, label);
      }
    } else {
      throw new Error(`Element ${index + 1} has unsupported type. Use text, rect, circle, path, or image.`);
    }
  }
  canvas.requestRenderAll();
}

function getTemplateSlots(record: TemplateRecord): TemplateSlot[] {
  if (record.apiTemplate) return record.apiTemplate.slots.map(slot => ({ key: slot.key, type: slot.type, defaultValue: slot.default_value }));
  const objects = Array.isArray(record.json.objects) ? record.json.objects as Array<Record<string, unknown>> : [];
  const slots = new Map<string, TemplateSlot>();
  objects.forEach(object => {
    const name = typeof object.name === 'string' ? object.name : '';
    const type = object.templateSlotType === 'image' || name.startsWith('image-slot:') ? 'image' : 'text';
    const legacyKey = name.startsWith('image-slot:') ? name.slice('image-slot:'.length) : String(object.type).toLowerCase() === 'textbox' ? name : '';
    const key = typeof object.templateSlot === 'string' && object.templateSlot ? object.templateSlot : legacyKey;
    if (!key) return;
    const mapKey = `${type}:${key}`;
    if (!slots.has(mapKey)) slots.set(mapKey, { key, type, defaultValue: type === 'text' ? String(object.text ?? '') : '' });
  });
  return [...slots.values()];
}

async function applyTemplateSlots(canvas: Canvas, record: TemplateRecord, textValues: Record<string, string>, imageSources: Record<string, string>) {
  await canvas.loadFromJSON(record.json);
  canvas.getObjects().forEach(object => {
    const name = String(object.get('templateSlot') ?? getObjectName(object) ?? '');
    if (object instanceof Textbox && name in textValues) object.set('text', textValues[name]);
  });
  for (const [key, source] of Object.entries(imageSources)) {
    if (!source) continue;
    const slotName = `image-slot:${key}`;
    const slotObjects = canvas.getObjects().filter(object => object.get('templateSlot') === key || getObjectName(object) === slotName);
    const frame = slotObjects.find(object => object instanceof Rect);
    const existingImage = slotObjects.find(object => object instanceof FabricImage);
    if (!frame && !(existingImage instanceof FabricImage)) continue;
    const objects = canvas.getObjects();
    const originalIndex = objects.indexOf(frame ?? existingImage!);
    const insertionIndex = originalIndex - slotObjects.filter(object => objects.indexOf(object) < originalIndex).length;
    const bounds = frame?.getBoundingRect();
    const frameLeft = bounds?.left ?? Number(existingImage?.get('frameLeft') ?? existingImage?.left ?? 0);
    const frameTop = bounds?.top ?? Number(existingImage?.get('frameTop') ?? existingImage?.top ?? 0);
    const frameWidth = bounds?.width ?? Number(existingImage?.get('frameWidth') || existingImage?.getScaledWidth() || 1);
    const frameHeight = bounds?.height ?? Number(existingImage?.get('frameHeight') || existingImage?.getScaledHeight() || 1);
    const image = await FabricImage.fromURL(source);
    const clipPath = existingImage?.clipPath ? await existingImage.clipPath.clone() : undefined;
    const scale = Math.min(frameWidth / (image.width || 1), frameHeight / (image.height || 1));
    image.set({ left: frameLeft, top: frameTop, scaleX: scale, scaleY: scale, originX: 'left', originY: 'top', angle: existingImage?.angle ?? 0, clipPath, name: slotName, frameWidth, frameHeight, frameLeft, frameTop });
    canvas.remove(...slotObjects);
    canvas.insertAt(Math.max(0, insertionIndex), image);
  }
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

const readImageFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this image'));
  reader.onerror = () => reject(new Error('Could not read this image'));
  reader.readAsDataURL(file);
});

export default function MarketingTemplatesPage() {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLElement>(null);
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const imageSlotToReplaceRef = useRef<string | null>(null);
  const imageToReplaceRef = useRef<FabricImage | null>(null);
  const draggedImageRef = useRef<{ object: FabricImage; left: number; top: number } | null>(null);
  const altDragCloneRef = useRef<{ object: FabricObject; source: FabricObject; left: number; top: number } | null>(null);
  const altDragPendingRef = useRef(false);
  const cropMaskDragRef = useRef<{ object: FabricImage; left: number; top: number; clipLeft: number; clipTop: number } | null>(null);
  const cropEditingRef = useRef<FabricImage | null>(null);
  const pendingLoadRef = useRef<TemplateRecord | null>(null);
  const loadedInitialTemplateRef = useRef<string | null>(null);
  const pendingSlotPreviewRef = useRef<{ record: TemplateRecord; textValues: Record<string, string>; imageSources: Record<string, string> } | null>(null);
  const pendingConfigRef = useRef<TemplateConfig | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const historyTimerRef = useRef<number | null>(null);
  const restoringHistoryRef = useRef(false);
  const clipboardRef = useRef<FabricObject | null>(null);
  const templatesRef = useRef<TemplateRecord[]>([]);
  const templatesLoadedRef = useRef(false);
  const categoriesLoadedRef = useRef(false);
  const templatesRequestRef = useRef<Promise<void> | null>(null);
  const categoriesRequestRef = useRef<Promise<void> | null>(null);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [openingTemplate, setOpeningTemplate] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [slotDefinitions, setSlotDefinitions] = useState<Slot[]>([]);
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateStatus, setTemplateStatus] = useState<ApiTemplate['status']>('draft');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveDetailsDialogOpen, setSaveDetailsDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled promotion');
  const [format, setFormat] = useState<keyof typeof DIMENSIONS>('square');
  const [zoom, setZoom] = useState(0.75);
  const [selectedObject, setSelectedObject] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(false);
  const [selectionKind, setSelectionKind] = useState<'text' | 'shape' | 'image' | null>(null);
  const [selectedSlotAction, setSelectedSlotAction] = useState<{ type: 'text' | 'image'; hasSlot: boolean } | null>(null);
  const [selectedImageFrameAction, setSelectedImageFrameAction] = useState<{ eligible: boolean; enabled: boolean } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [slotDialog, setSlotDialog] = useState<{ object: FabricObject; type: 'text' | 'image'; originalKey: string } | null>(null);
  const [slotKey, setSlotKey] = useState('');
  const [slotLabel, setSlotLabel] = useState('');
  const [slotDefaultValue, setSlotDefaultValue] = useState('');
  const [slotRequired, setSlotRequired] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedFontSize, setSelectedFontSize] = useState(32);
  const [selectedColor, setSelectedColor] = useState('#171717');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState('#171717');
  const [penColor, setPenColor] = useState('#171717');
  const [penWidth, setPenWidth] = useState(5);
  const [bezierAnchors, setBezierAnchors] = useState<BezierAnchor[]>([]);
  const bezierDragIndexRef = useRef<number | null>(null);
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(5);
  const [selectedBold, setSelectedBold] = useState(false);
  const [selectedAlign, setSelectedAlign] = useState('left');
  const [selectedOpacity, setSelectedOpacity] = useState(1);
  const [layers, setLayers] = useState<Array<{ index: number; label: string; visible: boolean; locked: boolean }>>([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);
  const [leftPanelTab, setLeftPanelTab] = useState<'tools' | 'layers'>('tools');
  const [activeTool, setActiveTool] = useState('select');
  const [canvasDropActive, setCanvasDropActive] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const [slotTestDialogOpen, setSlotTestDialogOpen] = useState(false);
  const [slotTestTemplates, setSlotTestTemplates] = useState<TemplateRecord[]>([]);
  const [slotTestTemplateId, setSlotTestTemplateId] = useState('');
  const [slotTestValues, setSlotTestValues] = useState<Record<string, string>>({});
  const [slotTestImages, setSlotTestImages] = useState<Record<string, string>>({});
  const [slotPreviewTemplate, setSlotPreviewTemplate] = useState<TemplateRecord | null>(null);
  const [slotTestError, setSlotTestError] = useState('');
  const [configText, setConfigText] = useState('');
  const [savedJson, setSavedJson] = useState('');
  const [configError, setConfigError] = useState('');
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const [backgroundFillMode, setBackgroundFillMode] = useState<'solid' | 'gradient'>('solid');
  const [backgroundGradientEnd, setBackgroundGradientEnd] = useState('#f97316');
  const [backgroundGradientAngle, setBackgroundGradientAngle] = useState(0);
  const [selectedFillMode, setSelectedFillMode] = useState<'solid' | 'gradient'>('solid');
  const [selectedLine, setSelectedLine] = useState(false);
  const [selectedCustomShape, setSelectedCustomShape] = useState(false);
  const [selectedImageCropped, setSelectedImageCropped] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropEditing, setCropEditing] = useState(false);
  const [shapeGradientEnd, setShapeGradientEnd] = useState('#f97316');
  const [shapeGradientAngle, setShapeGradientAngle] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedGeometry, setSelectedGeometry] = useState({ left: 0, top: 0, width: 0, height: 0, angle: 0, locked: false, visible: true });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: FabricObject } | null>(null);
  const [floatingActionsPosition, setFloatingActionsPosition] = useState<{ left: number; top: number } | null>(null);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);

  const ensureTemplatesLoaded = async () => {
    if (templatesLoadedRef.current) return;
    if (templatesRequestRef.current) return templatesRequestRef.current;
    templatesRequestRef.current = allRecords<ApiTemplate>('templates').then(items => {
      const records = items.filter(item => item.type === 'image').map(toEditorRecord);
      const merged = new Map(records.map(record => [record.id, record]));
      templatesRef.current.forEach(record => merged.set(record.id, record));
      templatesRef.current = [...merged.values()];
      setTemplates(templatesRef.current);
      templatesLoadedRef.current = true;
    }).finally(() => { templatesRequestRef.current = null; });
    return templatesRequestRef.current;
  };

  const ensureCategoriesLoaded = async () => {
    if (categoriesLoadedRef.current) return;
    if (categoriesRequestRef.current) return categoriesRequestRef.current;
    categoriesRequestRef.current = allRecords<Category>('categories').then(items => {
      setCategories(items);
      categoriesLoadedRef.current = true;
    }).finally(() => { categoriesRequestRef.current = null; });
    return categoriesRequestRef.current;
  };

  const updateFloatingActionsPosition = useCallback(() => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    const viewport = canvasViewportRef.current;
    const wrapper = canvasWrapperRef.current;
    if (!canvas || !active || !viewport || !wrapper) { setFloatingActionsPosition(null); return; }
    const viewportRect = viewport.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const displayScale = wrapperRect.width / (canvas.getWidth() || 1);
    const bounds = active.getBoundingRect();
    const left = wrapperRect.left - viewportRect.left + viewport.scrollLeft + (bounds.left + bounds.width / 2) * displayScale;
    const objectTop = wrapperRect.top - viewportRect.top + viewport.scrollTop + bounds.top * displayScale;
    const top = objectTop > 56 ? objectTop - 8 : objectTop + bounds.height * displayScale + 48;
    setFloatingActionsPosition({ left: Math.max(80, Math.min(viewport.scrollWidth - 80, left)), top });
  }, []);

  const recordHistoryNow = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || restoringHistoryRef.current) return;
    const snapshot = JSON.stringify(canvas.toObject(['templateSlot', 'templateSlotType', 'templateImageFrame', 'name', 'frameWidth', 'frameHeight', 'frameLeft', 'frameTop', 'cropFrameWidth', 'cropFrameHeight', 'cropBaseScale', 'cropCenterX', 'cropCenterY', 'cropZoom']));
    const history = historyRef.current.slice(0, historyIndexRef.current + 1);
    if (history.at(-1) !== snapshot) history.push(snapshot);
    if (history.length > 100) history.shift();
    historyRef.current = history;
    historyIndexRef.current = history.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const scheduleHistory = useCallback(() => {
    if (restoringHistoryRef.current) return;
    if (historyTimerRef.current) window.clearTimeout(historyTimerRef.current);
    historyTimerRef.current = window.setTimeout(() => { historyTimerRef.current = null; recordHistoryNow(); }, 250);
  }, [recordHistoryNow]);

  const restoreHistory = useCallback(async (snapshot: string, index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    restoringHistoryRef.current = true;
    await canvas.loadFromJSON(JSON.parse(snapshot));
    canvas.discardActiveObject();
    const background = canvas.backgroundColor;
    if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
    else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
    canvas.requestRenderAll();
    historyIndexRef.current = index;
    setCanUndo(index > 0);
    setCanRedo(index < historyRef.current.length - 1);
    restoringHistoryRef.current = false;
  }, []);

  const undo = useCallback(() => {
    if (historyTimerRef.current) {
      window.clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
      recordHistoryNow();
    }
    const nextIndex = historyIndexRef.current - 1;
    const snapshot = historyRef.current[nextIndex];
    if (snapshot) void restoreHistory(snapshot, nextIndex);
  }, [recordHistoryNow, restoreHistory]);

  const redo = useCallback(() => {
    if (historyTimerRef.current) {
      window.clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
      recordHistoryNow();
    }
    const nextIndex = historyIndexRef.current + 1;
    const snapshot = historyRef.current[nextIndex];
    if (snapshot) void restoreHistory(snapshot, nextIndex);
  }, [recordHistoryNow, restoreHistory]);

  useEffect(() => {
    let cancelled = false;
    const selectedId = new URLSearchParams(window.location.search).get('id');
    if (selectedId) window.requestAnimationFrame(() => { if (!cancelled) setOpeningTemplate(true); });
    if (!selectedId) return () => { cancelled = true; };
    void api.get(`${base}/templates/${selectedId}`).then(response => {
      if (cancelled) return;
      const template = response.data.data.template as ApiTemplate;
      if (template.type !== 'image') throw new Error('This is not an image template.');
      const record = toEditorRecord(template);
      templatesRef.current = [record];
      setTemplates([record]);
    }).catch(error => { setOpeningTemplate(false); toast.error(apiMessage(error, 'Could not load this template. Reload to retry.')); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!canvasVersion) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id || loadedInitialTemplateRef.current === id) return;
    const record = templates.find(template => template.id === id);
    if (!record) return;
    const applyRecordDetails = () => {
      setTemplateId(record.id);
      setTemplateName(record.name);
      setSlotDefinitions(record.apiTemplate?.slots ?? []);
      setTemplateDescription(record.apiTemplate?.description ?? '');
      setTemplateStatus(record.apiTemplate?.status ?? 'draft');
      setCategoryIds(record.apiTemplate?.category_ids ?? []);
    };

    const targetFormat = Object.entries(DIMENSIONS).find(([, size]) => size.width === record.width && size.height === record.height)?.[0] as keyof typeof DIMENSIONS | undefined;
    if (targetFormat && targetFormat !== format) {
      loadedInitialTemplateRef.current = id;
      pendingLoadRef.current = record;
      window.requestAnimationFrame(() => { applyRecordDetails(); setFormat(targetFormat); });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) { loadedInitialTemplateRef.current = null; return; }
    loadedInitialTemplateRef.current = id;
    void canvas.loadFromJSON(record.json).then(() => {
      applyRecordDetails();
      canvas.getObjects().forEach(installRotationControls);
      canvas.requestRenderAll();
      scheduleHistory();
      setOpeningTemplate(false);
    }).catch(error => { setOpeningTemplate(false); toast.error(apiMessage(error, 'Could not load this template into the editor.')); });
  }, [templates, canvasVersion, format, scheduleHistory]);

  useEffect(() => {
    if (!elementRef.current) return;
    const canvas = new Canvas(elementRef.current, {
      width: DIMENSIONS[format].width,
      height: DIMENSIONS[format].height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;
    setCanvasVersion(version => version + 1);
    const initialSnapshot = JSON.stringify(canvas.toObject(['templateSlot', 'templateSlotType', 'templateImageFrame', 'name', 'frameWidth', 'frameHeight', 'frameLeft', 'frameTop', 'cropFrameWidth', 'cropFrameHeight', 'cropBaseScale', 'cropCenterX', 'cropCenterY', 'cropZoom']));
    historyRef.current = [initialSnapshot];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    if (pendingSlotPreviewRef.current) {
      const preview = pendingSlotPreviewRef.current;
      pendingSlotPreviewRef.current = null;
      void applyTemplateSlots(canvas, preview.record, preview.textValues, preview.imageSources).then(() => {
        canvas.getObjects().forEach(installRotationControls);
        setTemplateId('');
        setTemplateName(`${preview.record.name.replace(/ \(unsaved\)$/, '')} preview`);
        setSlotPreviewTemplate(preview.record);
        const background = canvas.backgroundColor;
        if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
        else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
        scheduleHistory();
        setSlotTestDialogOpen(false);
        toast.success('Slot preview loaded on the canvas.');
      }).catch(() => setSlotTestError('Could not apply these slot values to the template.'));
    }
    if (pendingLoadRef.current) {
      const template = pendingLoadRef.current;
      pendingLoadRef.current = null;
      void canvas.loadFromJSON(template.json).then(() => {
        const background = canvas.backgroundColor;
        if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
        else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
        canvas.getObjects().forEach(installRotationControls);
        canvas.requestRenderAll(); scheduleHistory(); setOpeningTemplate(false);
      }).catch(error => { setOpeningTemplate(false); toast.error(apiMessage(error, 'Could not load this template into the editor.')); });
    }
    if (pendingConfigRef.current) {
      const config = pendingConfigRef.current;
      pendingConfigRef.current = null;
      void paintTemplateConfig(canvas, config).then(() => {
        setTemplateName(typeof config.name === 'string' ? config.name : 'AI template');
        setTemplateId('');
        setCanvasBackground(typeof config.background === 'string' ? config.background : '#ffffff');
        setBackgroundFillMode('solid');
        scheduleHistory();
        toast.success('Canvas format matched the JSON. Template is loaded and editable.');
      }).catch(error => setConfigError(error instanceof Error ? error.message : 'Could not load template config'));
    }
    const updateSelection = () => {
      const active = canvas.getActiveObject();
      if (cropEditingRef.current && cropEditingRef.current !== active) {
        cropEditingRef.current.set({ lockMovementX: false, lockMovementY: false, lockScalingX: true, lockScalingY: true });
        cropEditingRef.current = null;
        setCropEditing(false);
      }
      setActiveLayerIndex(active ? canvas.getObjects().indexOf(active) : null);
      setLayers(canvas.getObjects().map((object, index) => ({ index, label: getLayerLabel(object), visible: object.visible, locked: object.lockMovementX === true })).reverse());
      setSelectedObject(!!active);
      setSelectionCount(active instanceof ActiveSelection ? active.getObjects().length : active ? 1 : 0);
      setSelectedGroup(active instanceof Group && !(active instanceof ActiveSelection));
      if (active instanceof ActiveSelection) {
        setLeftPanelTab('layers');
        setSelectionKind(null);
        setSelectedCustomShape(false);
        setSelectedSlotAction(null);
        setSelectedImageFrameAction(null);
        setSelectedGeometry({
          left: Math.round(active.left || 0),
          top: Math.round(active.top || 0),
          width: Math.round(active.getScaledWidth()),
          height: Math.round(active.getScaledHeight()),
          angle: Math.round(active.angle || 0),
          locked: active.getObjects().every(object => object.lockMovementX === true),
          visible: active.visible,
        });
        updateFloatingActionsPosition();
        return;
      }
      const activeName = getObjectName(active) || '';
      const activeSlotType = getSlotTypeForObject(active);
      const activeSlotKey = String(active?.get('templateSlot') || (activeName.startsWith('image-slot:') ? activeName.slice('image-slot:'.length) : active instanceof Textbox ? activeName : ''));
      setSelectedSlotAction(activeSlotType ? { type: activeSlotType, hasSlot: Boolean(activeSlotKey) } : null);
      const imageFrameEligible = canBecomeImageFrame(active);
      setSelectedImageFrameAction(imageFrameEligible ? { eligible: true, enabled: active?.get('templateImageFrame') === true } : null);
      if (active) {
        setLeftPanelTab('layers');
        const isCroppedImage = getObjectName(active) === 'image-crop';
        setSelectedGeometry({
          left: Math.round(active.left || 0),
          top: Math.round(active.top || 0),
          width: Math.round(isCroppedImage ? Number(active.get('cropFrameWidth')) || active.getScaledWidth() : active.getScaledWidth()),
          height: Math.round(isCroppedImage ? Number(active.get('cropFrameHeight')) || active.getScaledHeight() : active.getScaledHeight()),
          angle: Math.round(active.angle || 0),
          locked: active.lockMovementX === true,
          visible: active.visible,
        });
      }
      updateFloatingActionsPosition();
      if (active instanceof Textbox) {
        setSelectedCustomShape(false);
        setSelectionKind('text');
        setSelectedText(active.text || '');
        setSelectedFont(active.fontFamily || 'Arial');
        setSelectedFontSize(active.fontSize || 32);
        setSelectedColor(typeof active.fill === 'string' && /^#[0-9a-f]{6}$/i.test(active.fill) ? active.fill : '#171717');
        setSelectedBold(active.fontWeight === 'bold' || Number(active.fontWeight) >= 600);
        setSelectedAlign(active.textAlign || 'left');
      } else if (active instanceof FabricImage) {
        setSelectedCustomShape(false);
        setSelectionKind('image');
        setSelectedImageCropped(getObjectName(active) === 'image-crop');
        setSelectedOpacity(active.opacity ?? 1);
        setCropZoom(Number(active.get('cropZoom') || 1));
      } else if (active) {
        setSelectionKind('shape');
        const isCustomFilledShape = active instanceof FabricPath && getObjectName(active) === 'custom-shape';
        setSelectedCustomShape(isCustomFilledShape);
        const hasStrokeSelection = active instanceof FabricLine || (active instanceof FabricPath && !isCustomFilledShape);
        setSelectedLine(hasStrokeSelection);
        setSelectedStrokeWidth(Number(active.strokeWidth) || 5);
        setSelectedStrokeColor(typeof active.stroke === 'string' ? active.stroke : '#171717');
        setSelectedOpacity(active.opacity ?? 1);
        const color = hasStrokeSelection ? active.stroke : active.fill;
        setSelectedColor(typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : '#e5e7eb');
        setSelectedFillMode(active.fill instanceof FabricGradient ? 'gradient' : 'solid');
        if (active.fill instanceof FabricGradient && active.fill.colorStops.length > 1) {
          setSelectedColor(active.fill.colorStops[0].color);
          setShapeGradientEnd(active.fill.colorStops.at(-1)?.color || '#f97316');
        }
      } else {
        setLeftPanelTab('tools');
        setSelectionKind(null);
        setSelectedCustomShape(false);
      }
    };
    canvas.on('selection:created', updateSelection);
    canvas.on('selection:updated', updateSelection);
    canvas.on('selection:cleared', updateSelection);
    canvas.on('object:added', ({ target }) => { if (target) installRotationControls(target); });
    canvas.on('object:added', updateSelection);
    canvas.on('object:removed', updateSelection);
    canvas.on('object:modified', updateSelection);
    canvas.on('object:added', scheduleHistory);
    canvas.on('object:removed', scheduleHistory);
    canvas.on('object:modified', scheduleHistory);
    canvas.on('text:changed', scheduleHistory);
    canvas.on('path:created', ({ path }) => { canvas.setActiveObject(path); canvas.requestRenderAll(); scheduleHistory(); setActiveTool('select'); });
    canvas.getObjects().forEach(installRotationControls);
    canvas.on('mouse:down:before', ({ e, target }) => {
      if (!e.altKey || !target || !target.selectable || target.evented === false) return;
      e.preventDefault();
      altDragPendingRef.current = true;
      draggedImageRef.current = null;
      void target.clone().then(clone => {
        clone.set({ left: target.left || 0, top: target.top || 0, selectable: true, evented: true });
        canvas.add(clone);
        canvas.setActiveObject(clone);
        altDragCloneRef.current = { object: clone, source: target, left: clone.left || 0, top: clone.top || 0 };
        canvas._setupCurrentTransform(e, clone, true);
        canvas.requestRenderAll();
      });
    });
    canvas.on('mouse:down', ({ e, target }) => {
      if (e.altKey || altDragPendingRef.current) { draggedImageRef.current = null; cropMaskDragRef.current = null; return; }
      if (target instanceof FabricImage) draggedImageRef.current = { object: target, left: target.left || 0, top: target.top || 0 };
      else draggedImageRef.current = null;
      if (target instanceof FabricImage && getObjectName(target) === 'image-crop' && cropEditingRef.current !== target && target.clipPath) {
        cropMaskDragRef.current = { object: target, left: target.left || 0, top: target.top || 0, clipLeft: target.clipPath.left || 0, clipTop: target.clipPath.top || 0 };
      } else cropMaskDragRef.current = null;
    });
    canvas.on('object:moving', ({ target }) => {
      const drag = cropMaskDragRef.current;
      if (!drag || target !== drag.object || cropEditingRef.current === drag.object || !drag.object.clipPath) return;
      drag.object.clipPath.set({ left: drag.clipLeft + (drag.object.left || 0) - drag.left, top: drag.clipTop + (drag.object.top || 0) - drag.top });
      drag.object.clipPath.setCoords();
    });
    canvas.on('mouse:up', async ({ e }) => {
      cropMaskDragRef.current = null;
      const altDrag = altDragCloneRef.current;
      altDragCloneRef.current = null;
      if (altDrag) {
        altDragPendingRef.current = false;
        draggedImageRef.current = null;
        if (Math.hypot((altDrag.object.left || 0) - altDrag.left, (altDrag.object.top || 0) - altDrag.top) < 2) {
          canvas.remove(altDrag.object);
          canvas.setActiveObject(altDrag.source);
        } else fireModified(canvas, altDrag.object);
        canvas.requestRenderAll();
        return;
      }
      altDragPendingRef.current = false;
      const drag = draggedImageRef.current;
      draggedImageRef.current = null;
      if (!drag || Math.hypot((drag.object.left || 0) - drag.left, (drag.object.top || 0) - drag.top) < 4) return;
      const pointer = canvas.getScenePoint(e);
      const shape = canvas.getObjects().slice().reverse().find(object => object !== drag.object && object.visible && object.lockMovementX !== true && object.get('templateImageFrame') === true && canBecomeImageFrame(object) && object.containsPoint(pointer));
      if (!shape) return;
      const clip = await shape.clone();
      const frame = shape.getBoundingRect();
      const center = shape.getCenterPoint();
      const scale = Math.max(frame.width / (drag.object.width || 1), frame.height / (drag.object.height || 1));
      clip.set({ absolutePositioned: true, selectable: false, evented: false });
      drag.object.set({ left: center.x, top: center.y, originX: 'center', originY: 'center', angle: shape.angle || 0, scaleX: scale, scaleY: scale, clipPath: clip, name: 'image-crop', cropFrameWidth: frame.width, cropFrameHeight: frame.height, cropBaseScale: scale, cropCenterX: center.x, cropCenterY: center.y, cropZoom: 1, lockMovementX: false, lockMovementY: false, lockScalingX: true, lockScalingY: true });
      canvas.remove(shape);
      canvas.bringObjectToFront(drag.object);
      canvas.setActiveObject(drag.object);
      canvas.requestRenderAll();
      canvas.fire('object:modified', { target: drag.object });
      toast.success('Image cropped into shape.');
    });
    return () => { if (historyTimerRef.current) window.clearTimeout(historyTimerRef.current); canvas.dispose(); canvasRef.current = null; };
  }, [format, scheduleHistory, updateFloatingActionsPosition]);

  const updateSelected = (property: string, value: string | number) => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    active.set(property, value);
    if (active instanceof Textbox && property === 'text') active.initDimensions();
    active.setCoords();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: active });
  };

  const updateSelectedText = (value: string) => { setSelectedText(value); updateSelected('text', value); };
  const updateSelectedFont = (value: string) => { setSelectedFont(value); updateSelected('fontFamily', value); };
  const updateSelectedFontSize = (value: number) => { setSelectedFontSize(value); updateSelected('fontSize', value); };
  const updateSelectedColor = (value: string) => { const object = canvasRef.current?.getActiveObject(); setSelectedColor(value); updateSelected(object instanceof FabricLine || (object instanceof FabricPath && getObjectName(object) !== 'custom-shape') ? 'stroke' : 'fill', value); };
  const updateSelectedStrokeColor = (value: string) => { setSelectedStrokeColor(value); updateSelected('stroke', value); };
  const updateSelectedStrokeWidth = (value: number) => { setSelectedStrokeWidth(value); updateSelected('strokeWidth', value); };
  const updateSelectedBold = (value: boolean) => { setSelectedBold(value); updateSelected('fontWeight', value ? 'bold' : 'normal'); };
  const updateSelectedAlign = (value: string) => { setSelectedAlign(value); updateSelected('textAlign', value); };
  const updateSelectedOpacity = (value: number) => { setSelectedOpacity(value); updateSelected('opacity', value); };

  const updateGeometry = (field: 'left' | 'top' | 'width' | 'height' | 'angle', value: number) => {
    const canvas = canvasRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !object || !Number.isFinite(value)) return;
    if (getObjectName(object) === 'image-crop' && !cropEditingRef.current && object.clipPath && (field === 'left' || field === 'top')) {
      const delta = value - Number(object.get(field) || 0);
      object.clipPath.set(field, Number(object.clipPath.get(field) || 0) + delta);
      object.clipPath.setCoords();
    }
    if (field === 'width') object.set('scaleX', value / (object.width || 1));
    else if (field === 'height') object.set('scaleY', value / (object.height || 1));
    else object.set(field, value);
    object.setCoords();
    setSelectedGeometry(previous => ({ ...previous, [field]: value }));
    canvas.requestRenderAll();
    fireModified(canvas, object);
  };

  const rotateSelected = (degrees: number) => {
    const object = canvasRef.current?.getActiveObject();
    if (object) updateGeometry('angle', (object.angle || 0) + degrees);
  };

  const fitSelectedImage = (mode: 'contain' | 'cover') => {
    const canvas = canvasRef.current;
    const image = canvas?.getActiveObject();
    if (!canvas || !(image instanceof FabricImage)) return;
    const frameWidth = Number(image.get('frameWidth') || image.getScaledWidth());
    const frameHeight = Number(image.get('frameHeight') || image.getScaledHeight());
    const frameLeft = Number(image.get('frameLeft') ?? image.left ?? 0);
    const frameTop = Number(image.get('frameTop') ?? image.top ?? 0);
    const scale = mode === 'cover'
      ? Math.max(frameWidth / (image.width || 1), frameHeight / (image.height || 1))
      : Math.min(frameWidth / (image.width || 1), frameHeight / (image.height || 1));
    image.set({ left: frameLeft, top: frameTop, scaleX: scale, scaleY: scale, frameWidth, frameHeight, frameLeft, frameTop,
      clipPath: mode === 'cover' ? new Rect({ left: frameLeft, top: frameTop, width: frameWidth, height: frameHeight, absolutePositioned: true }) : undefined });
    image.setCoords();
    canvas.requestRenderAll();
    fireModified(canvas, image);
  };

  const enterCropEdit = useCallback((image?: FabricImage) => {
    const canvas = canvasRef.current;
    const target = image ?? canvas?.getActiveObject();
    if (!canvas || !(target instanceof FabricImage) || getObjectName(target) !== 'image-crop') return;
    cropEditingRef.current = target;
    setCropEditing(true);
    target.set({ lockMovementX: false, lockMovementY: false, lockScalingX: false, lockScalingY: false });
    canvas.setActiveObject(target);
    canvas.requestRenderAll();
    fireModified(canvas, target);
  }, []);

  const exitCropEdit = useCallback(() => {
    const canvas = canvasRef.current;
    const image = cropEditingRef.current;
    if (!canvas || !image) return;
    image.set({ lockMovementX: false, lockMovementY: false, lockScalingX: true, lockScalingY: true });
    cropEditingRef.current = null;
    setCropEditing(false);
    canvas.requestRenderAll();
    fireModified(canvas, image);
  }, []);

  const setCropImageZoom = (value: number) => {
    const canvas = canvasRef.current;
    const image = cropEditingRef.current;
    if (!canvas || !image) return;
    const baseScale = Number(image.get('cropBaseScale')) || Math.max(Number(image.get('cropFrameWidth')) / (image.width || 1), Number(image.get('cropFrameHeight')) / (image.height || 1));
    image.set({ scaleX: baseScale * value, scaleY: baseScale * value, cropZoom: value });
    image.setCoords();
    setCropZoom(value);
    canvas.requestRenderAll();
    fireModified(canvas, image);
  };

  const resetCropImage = () => {
    const canvas = canvasRef.current;
    const image = cropEditingRef.current;
    if (!canvas || !image) return;
    const baseScale = Number(image.get('cropBaseScale')) || 1;
    image.set({ left: Number(image.get('cropCenterX')), top: Number(image.get('cropCenterY')), scaleX: baseScale, scaleY: baseScale, cropZoom: 1 });
    image.setCoords();
    setCropZoom(1);
    canvas.requestRenderAll();
    fireModified(canvas, image);
  };

  const duplicateObject = useCallback(async (source?: FabricObject) => {
    const canvas = canvasRef.current;
    const object = source ?? canvas?.getActiveObject();
    if (!canvas || !object) return;
    if (object instanceof ActiveSelection) {
      const originals = object.getObjects();
      canvas.discardActiveObject();
      const clones = await Promise.all(originals.map(item => item.clone()));
      clones.forEach(clone => clone.set({ left: (clone.left || 0) + 24, top: (clone.top || 0) + 24, selectable: true, evented: true }));
      canvas.add(...clones);
      const selection = new ActiveSelection(clones, { canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
      return;
    }
    const clone = await object.clone();
    clone.set({ left: (object.left || 0) + 24, top: (object.top || 0) + 24, selectable: true, evented: true });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
  }, []);

  const copyObject = useCallback(async () => {
    const object = canvasRef.current?.getActiveObject();
    if (object) clipboardRef.current = await object.clone();
  }, []);

  const pasteObject = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !clipboardRef.current) return;
    const clone = await clipboardRef.current.clone();
    clone.set({ left: (clone.left || 0) + 24, top: (clone.top || 0) + 24, selectable: true, evented: true });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
    clipboardRef.current = clone;
  }, []);

  const handleCanvasContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = canvas.findTarget(event.nativeEvent).target ?? canvas.getActiveObject();
    if (!target) { setContextMenu(null); return; }
    canvas.setActiveObject(target);
    canvas.requestRenderAll();
    setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 220), y: Math.min(event.clientY, window.innerHeight - 300), target });
  };

  type ObjectAction = 'duplicate' | 'delete' | 'forward' | 'backward' | 'front' | 'back' | 'lock' | 'hide' | 'show' | 'replace';

  const groupSelectedObjects = useCallback(() => {
    const canvas = canvasRef.current;
    const selection = canvas?.getActiveObject();
    if (!canvas || !(selection instanceof ActiveSelection) || selection.getObjects().length < 2) return;
    const objects = selection.getObjects();
    canvas.discardActiveObject();
    canvas.remove(...objects);
    const group = new Group(objects);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    toast.success('Elements grouped. Use Ctrl/⌘+Shift+G to ungroup.');
  }, []);

  const ungroupSelectedObject = useCallback(() => {
    const canvas = canvasRef.current;
    const group = canvas?.getActiveObject();
    if (!canvas || !(group instanceof Group) || group instanceof ActiveSelection) return;
    const objects = group.removeAll();
    canvas.discardActiveObject();
    canvas.remove(group);
    canvas.add(...objects);
    const selection = objects.length > 1 ? new ActiveSelection(objects, { canvas }) : objects[0];
    if (selection) canvas.setActiveObject(selection);
    canvas.requestRenderAll();
    toast.success('Group ungrouped.');
  }, []);

  const performObjectAction = useCallback((object: FabricObject, action: ObjectAction) => {
    const canvas = canvasRef.current;
    if (!canvas || !object) return;
    if (action === 'duplicate') { void duplicateObject(object); return; }
    const targets = getActionTargets(object);
    if (action === 'delete') { canvas.discardActiveObject(); canvas.remove(...targets); canvas.requestRenderAll(); return; }
    if (action === 'forward') targets.forEach(target => canvas.bringObjectForward(target));
    if (action === 'backward') targets.slice().reverse().forEach(target => canvas.sendObjectBackwards(target));
    if (action === 'front') targets.forEach(target => canvas.bringObjectToFront(target));
    if (action === 'back') targets.slice().reverse().forEach(target => canvas.sendObjectToBack(target));
    if (action === 'lock') { const locked = !targets.every(target => target.lockMovementX === true); targets.forEach(target => target.set({ lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked, lockRotation: locked })); }
    if (action === 'hide') { canvas.discardActiveObject(); targets.forEach(target => target.set('visible', false)); }
    if (action === 'show') { targets.forEach(target => target.set('visible', true)); if (targets.length === 1) canvas.setActiveObject(targets[0]); }
    if (action === 'replace' && object instanceof FabricImage) { imageSlotToReplaceRef.current = null; imageToReplaceRef.current = object; imagePickerRef.current?.click(); }
    targets.forEach(target => fireModified(canvas, target));
    canvas.requestRenderAll();
  }, [duplicateObject]);

  const runContextAction = (action: ObjectAction) => {
    const object = contextMenu?.target;
    setContextMenu(null);
    if (object) performObjectAction(object, action);
  };

  const runLayerAction = (index: number, action: ObjectAction) => {
    const object = canvasRef.current?.getObjects()[index];
    if (object) performObjectAction(object, action);
  };

  const toggleSelectedImageFrame = (object: FabricObject) => {
    const canvas = canvasRef.current;
    if (!canvas || !canBecomeImageFrame(object)) return;
    const enabled = object.get('templateImageFrame') !== true;
    object.set('templateImageFrame', enabled);
    setSelectedImageFrameAction({ eligible: true, enabled });
    canvas.requestRenderAll();
    fireModified(canvas, object);
    toast.success(enabled ? 'Shape is now an image frame. Drop an image onto it to crop.' : 'Image frame disabled for this shape.');
  };

  const openSlotDialog = (object: FabricObject) => {
    const type = getSlotTypeForObject(object);
    if (!type) return;
    const objectName = getObjectName(object) || '';
    const legacyKey = objectName.startsWith('image-slot:') ? objectName.slice('image-slot:'.length) : type === 'text' ? objectName : '';
    const originalKey = String(object.get('templateSlot') || legacyKey);
    const existing = slotDefinitions.find(slot => slot.key === originalKey);
    const suggestedKey = type === 'text' && object instanceof Textbox
      ? object.text.trim().split(/\s+/).slice(0, 4).join('_').toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/^_+|_+$/g, '')
      : `image_${slotDefinitions.filter(slot => slot.type === 'image').length + 1}`;
    const key = existing?.key || originalKey || suggestedKey || `${type}_1`;
    setSlotDialog({ object, type, originalKey });
    setSlotKey(key);
    setSlotLabel(existing?.label || key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()));
    setSlotDefaultValue(existing?.default_value ?? (type === 'text' && object instanceof Textbox ? object.text || '' : ''));
    setSlotRequired(existing?.required ?? false);
  };

  const saveSlotFromDialog = () => {
    const canvas = canvasRef.current;
    const dialog = slotDialog;
    if (!canvas || !dialog || !canvas.getObjects().includes(dialog.object)) return;
    const key = slotKey.trim().replace(/[^A-Za-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^[^A-Za-z]+/, '').slice(0, 64);
    if (!key) { toast.error('Enter a slot key that starts with a letter.'); return; }
    if (slotDefinitions.some(slot => slot.key === key && slot.key !== dialog.originalKey)) {
      toast.error('A slot with that key already exists.');
      return;
    }

    const oldImageName = dialog.originalKey ? `image-slot:${dialog.originalKey}` : '';
    const affected = dialog.originalKey
      ? canvas.getObjects().filter(object => String(object.get('templateSlot') || '') === dialog.originalKey || (oldImageName && getObjectName(object) === oldImageName) || (dialog.type === 'text' && getObjectName(object) === dialog.originalKey))
      : [dialog.object];
    const affectedObjects = affected.length ? affected : [dialog.object];
    affectedObjects.forEach(object => {
      object.set({ templateSlot: key, templateSlotType: dialog.type });
      if (dialog.type === 'text') {
        object.set('name', key);
      } else {
        if (!(object instanceof FabricImage)) object.set('name', `image-slot:${key}`);
        if (object instanceof FabricImage) {
          const bounds = object.getBoundingRect();
          object.set({
            frameLeft: Number(object.get('frameLeft') ?? bounds.left),
            frameTop: Number(object.get('frameTop') ?? bounds.top),
            frameWidth: Number(object.get('cropFrameWidth') ?? object.get('frameWidth') ?? bounds.width),
            frameHeight: Number(object.get('cropFrameHeight') ?? object.get('frameHeight') ?? bounds.height),
          });
        }
        if (object instanceof Textbox) object.set('text', slotLabel.trim() || key.replaceAll('_', ' '));
      }
      fireModified(canvas, object);
    });

    setSlotDefinitions(current => [
      ...current.filter(slot => slot.key !== dialog.originalKey && slot.key !== key),
      { key, label: slotLabel.trim() || key.replaceAll('_', ' '), type: dialog.type, default_value: dialog.type === 'text' ? slotDefaultValue : '', required: slotRequired },
    ]);
    setSelectedSlotAction({ type: dialog.type, hasSlot: true });
    canvas.setActiveObject(dialog.object);
    canvas.requestRenderAll();
    scheduleHistory();
    setSlotDialog(null);
    toast.success(`${dialog.type === 'text' ? 'Text' : 'Image'} slot saved`);
  };

  const applyBackgroundStyle = (mode = backgroundFillMode, start = canvasBackground, end = backgroundGradientEnd, angle = backgroundGradientAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBackgroundFillMode(mode);
    setCanvasBackground(start);
    setBackgroundGradientEnd(end);
    setBackgroundGradientAngle(angle);
    canvas.backgroundColor = mode === 'gradient'
      ? makeLinearGradient(canvas.getWidth(), canvas.getHeight(), start, end, angle)
      : start;
    canvas.requestRenderAll();
    scheduleHistory();
  };

  const applySelectedGradient = (start = selectedColor, end = shapeGradientEnd, angle = shapeGradientAngle) => {
    const canvas = canvasRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !object) return;
    setSelectedColor(start);
    setShapeGradientEnd(end);
    setShapeGradientAngle(angle);
    setSelectedFillMode('gradient');
    const fill = makeLinearGradient(object.width || 1, object.height || 1, start, end, angle);
    object.set(object instanceof FabricLine || (object instanceof FabricPath && getObjectName(object) !== 'custom-shape') ? 'stroke' : 'fill', fill);
    canvas.requestRenderAll();
    fireModified(canvas, object);
  };

  const applySelectedFill = (mode = selectedFillMode, start = selectedColor, end = shapeGradientEnd, angle = shapeGradientAngle) => {
    setSelectedFillMode(mode);
    if (mode === 'gradient') applySelectedGradient(start, end, angle);
    else updateSelectedColor(start);
  };

  const reorderLayers = (fromDisplayIndex: number, toDisplayIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || fromDisplayIndex === toDisplayIndex) return;
    const topDown = canvas.getObjects().slice().reverse();
    const [moved] = topDown.splice(fromDisplayIndex, 1);
    if (!moved) return;
    topDown.splice(toDisplayIndex, 0, moved);
    topDown.reverse().forEach((object, index) => canvas.moveObjectTo(object, index));
    setLayers(canvas.getObjects().map((object, index) => ({ index, label: getLayerLabel(object), visible: object.visible, locked: object.lockMovementX === true })).reverse());
    const activeObject = canvas.getActiveObject();
    setActiveLayerIndex(activeObject ? canvas.getObjects().indexOf(activeObject) : null);
    canvas.requestRenderAll();
    scheduleHistory();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasContainer = canvas.lowerCanvasEl.parentElement;
    if (!canvasContainer) return;
    canvasContainer.style.width = `${DIMENSIONS[format].width}px`;
    canvasContainer.style.height = `${DIMENSIONS[format].height}px`;
    canvasContainer.style.transform = `scale(${zoom})`;
    canvasContainer.style.transformOrigin = 'top left';
    canvas.calcOffset();
    canvas.requestRenderAll();
    updateFloatingActionsPosition();
  }, [format, zoom, updateFloatingActionsPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const brush = new PencilBrush(canvas);
    brush.color = penColor;
    brush.width = penWidth;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = activeTool === 'pen';
  }, [activeTool, penColor, penWidth]);

  const addTextAt = (left: number, top: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    left = Math.max(0, Math.min(left, canvas.getWidth() - 120));
    top = Math.max(0, Math.min(top, canvas.getHeight() - 60));
    const text = new Textbox('Your promotion headline', {
      left, top, width: Math.max(96, Math.min(420, canvas.getWidth() - left - 24)), fontSize: 42,
      fontFamily: 'Arial', fontWeight: 'bold', fill: '#171717', originX: 'left', originY: 'top',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    setActiveTool('select');
  };

  const addText = () => addTextAt(48, 56);

  const addShapeAt = (kind: 'rectangle' | 'circle' | 'triangle' | 'line', centerX: number, centerY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shape = kind === 'rectangle'
      ? new Rect({ left: centerX - 90, top: centerY - 55, width: 180, height: 110, fill: '#f97316', originX: 'left', originY: 'top' })
      : kind === 'circle'
        ? new FabricCircle({ left: centerX - 55, top: centerY - 55, radius: 55, fill: '#f97316', originX: 'left', originY: 'top' })
        : kind === 'triangle'
          ? new FabricTriangle({ left: centerX - 65, top: centerY - 60, width: 130, height: 120, fill: '#f97316', originX: 'left', originY: 'top' })
          : new FabricLine([centerX - 80, centerY, centerX + 80, centerY], { stroke: '#171717', strokeWidth: 8 });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
    setActiveTool('select');
  };

  const addShape = (kind: 'rectangle' | 'circle' | 'triangle' | 'line') => {
    const canvas = canvasRef.current;
    if (canvas) addShapeAt(kind, canvas.getWidth() / 2, canvas.getHeight() / 2);
  };

  const finishBezierPath = useCallback((closed = false) => {
    const canvas = canvasRef.current;
    const anchors = bezierAnchors;
    if (!canvas || anchors.length < 2) {
      setBezierAnchors([]);
      setActiveTool('select');
      return;
    }
    const path = new FabricPath(buildBezierPath(anchors, closed), {
      fill: closed ? '#f97316' : 'transparent', stroke: penColor, strokeWidth: penWidth,
      strokeLineCap: 'round', strokeLineJoin: 'round', objectCaching: false,
    });
    path.set('name', closed ? 'custom-shape' : 'custom-path');
    canvas.add(path);
    canvas.setActiveObject(path);
    canvas.requestRenderAll();
    scheduleHistory();
    setBezierAnchors([]);
    setActiveTool('select');
  }, [bezierAnchors, penColor, penWidth, scheduleHistory]);

  const addBezierAnchor = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!canvas || !bounds.width || !bounds.height) return;
    const point = { x: ((event.clientX - bounds.left) / bounds.width) * canvas.getWidth(), y: ((event.clientY - bounds.top) / bounds.height) * canvas.getHeight() };
    const first = bezierAnchors[0];
    if (bezierAnchors.length > 2 && first && Math.hypot(point.x - first.x, point.y - first.y) < 18) {
      finishBezierPath(true);
      return;
    }
    const next = [...bezierAnchors, { ...point, inX: point.x, inY: point.y, outX: point.x, outY: point.y, hasHandles: false }];
    setBezierAnchors(next);
    bezierDragIndexRef.current = next.length - 1;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveBezierHandle = (event: ReactPointerEvent<SVGSVGElement>) => {
    const index = bezierDragIndexRef.current;
    const canvas = canvasRef.current;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (index === null || !canvas || !bounds.width || !bounds.height || (event.buttons & 1) !== 1) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * canvas.getWidth();
    const y = ((event.clientY - bounds.top) / bounds.height) * canvas.getHeight();
    setBezierAnchors(current => current.map((anchor, anchorIndex) => anchorIndex === index ? { ...anchor, inX: anchor.x - (x - anchor.x), inY: anchor.y - (y - anchor.y), outX: x, outY: y, hasHandles: true } : anchor));
  };

  const endBezierHandle = () => { bezierDragIndexRef.current = null; };

  const addImageSlotAt = (centerX: number, centerY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = Math.min(240, canvas.getWidth() - 24);
    const height = Math.min(160, canvas.getHeight() - 24);
    const left = Math.max(0, Math.min(canvas.getWidth() - width, centerX - width / 2));
    const top = Math.max(0, Math.min(canvas.getHeight() - height, centerY - height / 2));
    const slotName = `image-slot:${crypto.randomUUID()}`;
    const slot = new Rect({ left, top, width, height, fill: '#e5e7eb', stroke: '#94a3b8', strokeDashArray: [8, 5], originX: 'left', originY: 'top' });
    slot.set('name', slotName);
    const label = new Textbox('Double-click to add image', { left: left + 8, top: top + height / 2 - 12, width: width - 16, fontSize: 16, textAlign: 'center', fill: '#475569', originX: 'left', originY: 'top' });
    label.set('name', slotName);
    canvas.add(slot, label);
    canvas.setActiveObject(label);
    canvas.requestRenderAll();
    setActiveTool('select');
  };

  const startToolDrag = (event: DragEvent<HTMLButtonElement>, type: string) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-iplug-template-tool', type);
  };

  const handleToolDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/x-iplug-template-tool');
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / zoom;
    const y = (event.clientY - bounds.top) / zoom;
    if (type === 'text') addTextAt(x, y);
    else if (type === 'image') addImageSlotAt(x, y);
    else if (type === 'rectangle' || type === 'circle' || type === 'triangle' || type === 'line') addShapeAt(type, x, y);
  };

  const addImage = async (file?: File) => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    if (!file.type.startsWith('image/')) { toast.error('Choose an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('For this preview, images must be smaller than 2 MB'); return; }
    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid image'));
        reader.onerror = () => reject(new Error('Could not read image'));
        reader.readAsDataURL(file);
      });
      const image = await FabricImage.fromURL(source);
      const imageToReplace = imageToReplaceRef.current;
      const slotName = imageSlotToReplaceRef.current;
      const croppedImage = imageToReplace && imageToReplace.clipPath && Number(imageToReplace.get('cropFrameWidth')) > 0;
      if (croppedImage) {
        const frameWidth = Number(imageToReplace.get('cropFrameWidth'));
        const frameHeight = Number(imageToReplace.get('cropFrameHeight'));
        const scale = Math.max(frameWidth / (image.width || 1), frameHeight / (image.height || 1));
        const clip = await imageToReplace.clipPath!.clone();
        image.set({ left: imageToReplace.left, top: imageToReplace.top, scaleX: scale, scaleY: scale, originX: imageToReplace.originX, originY: imageToReplace.originY, angle: imageToReplace.angle, clipPath: clip, name: getObjectName(imageToReplace), cropFrameWidth: frameWidth, cropFrameHeight: frameHeight, cropBaseScale: scale, cropCenterX: Number(imageToReplace.get('cropCenterX')), cropCenterY: Number(imageToReplace.get('cropCenterY')), cropZoom: 1, lockMovementX: false, lockMovementY: false, lockScalingX: true, lockScalingY: true });
      } else {
      const slotObjects = slotName ? canvas.getObjects().filter(object => getObjectName(object) === slotName) : [];
      const slot = slotObjects.find(object => object instanceof Rect);
      const bounds = imageToReplace?.getBoundingRect() ?? slot?.getBoundingRect();
      const targetWidth = bounds?.width ?? canvas.getWidth() * 0.72;
      const targetHeight = bounds?.height ?? canvas.getHeight() * 0.56;
      const scale = Math.min(targetWidth / (image.width || 1), targetHeight / (image.height || 1));
      const frameLeft = bounds?.left ?? (canvas.getWidth() - targetWidth) / 2;
      const frameTop = bounds?.top ?? (canvas.getHeight() - targetHeight) / 2;
      image.set({ left: frameLeft, top: frameTop, scaleX: scale, scaleY: scale, originX: 'left', originY: 'top', name: slotName ?? getObjectName(imageToReplace) ?? 'editable-image', frameWidth: targetWidth, frameHeight: targetHeight, frameLeft, frameTop });
      }
      const slotObjects = slotName ? canvas.getObjects().filter(object => getObjectName(object) === slotName) : [];
      if (imageToReplace) { image.set('templateSlot', imageToReplace.get('templateSlot') ?? ''); image.set('templateSlotType', imageToReplace.get('templateSlotType') ?? 'image'); canvas.remove(imageToReplace); }
      else if (slotName) { image.set('templateSlot', slotName.replace('image-slot:', '')); image.set('templateSlotType', 'image'); }
      slotObjects.forEach(object => canvas.remove(object));
      imageSlotToReplaceRef.current = null;
      imageToReplaceRef.current = null;
      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
      setActiveTool('select');
    } catch {
      toast.error('Could not load this image');
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      const command = event.ctrlKey || event.metaKey;
      const canvas = canvasRef.current;
      const focusedObject = canvas?.getActiveObject();
      if (focusedObject instanceof Textbox && focusedObject.isEditing) return;
      if (activeTool === 'bezier') {
        if (event.key === 'Enter') { event.preventDefault(); finishBezierPath(false); }
        if (event.key === 'Escape') { event.preventDefault(); setBezierAnchors([]); setActiveTool('select'); }
        return;
      }
      if (event.key === 'Escape' && activeTool === 'pen') { setActiveTool('select'); return; }
      if (command && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
      if (command && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return; }
      if (command && event.key.toLowerCase() === 'g') { event.preventDefault(); if (event.shiftKey) ungroupSelectedObject(); else groupSelectedObjects(); return; }
      if (command && event.key.toLowerCase() === 'c') { if (canvas?.getActiveObject()) { event.preventDefault(); void copyObject(); } return; }
      if (command && event.key.toLowerCase() === 'v') { event.preventDefault(); void pasteObject(); return; }
      if (command && event.key.toLowerCase() === 'd') { event.preventDefault(); void duplicateObject(); return; }
      if (!canvas) return;
      if (command && (event.key === ']' || event.key === '}')) { const active = canvas.getActiveObject(); if (active) { event.preventDefault(); performObjectAction(active, 'forward'); } return; }
      if (command && (event.key === '[' || event.key === '{')) { const active = canvas.getActiveObject(); if (active) { event.preventDefault(); performObjectAction(active, 'backward'); } return; }
      if (event.key === 'Delete' || event.key === 'Backspace') { const active = canvas.getActiveObject(); if (active) { event.preventDefault(); performObjectAction(active, 'delete'); } return; }
      if (event.key.toLowerCase() === 't') {
        event.preventDefault();
        const text = new Textbox('Your promotion headline', { left: 48, top: 56, width: canvas.getWidth() - 96, fontSize: 42, fontFamily: 'Arial', fontWeight: 'bold', fill: '#171717', originX: 'left', originY: 'top' });
        canvas.add(text); canvas.setActiveObject(text); canvas.requestRenderAll(); return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const active = canvas.getActiveObject();
        if (!active || !active.selectable) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const previousLeft = active.left || 0;
        const previousTop = active.top || 0;
        if (event.key === 'ArrowUp') active.top = (active.top || 0) - step;
        if (event.key === 'ArrowDown') active.top = (active.top || 0) + step;
        if (event.key === 'ArrowLeft') active.left = (active.left || 0) - step;
        if (event.key === 'ArrowRight') active.left = (active.left || 0) + step;
        if (getObjectName(active) === 'image-crop' && !cropEditingRef.current && active.clipPath) {
          const dx = (active.left || 0) - previousLeft;
          const dy = (active.top || 0) - previousTop;
          active.clipPath.set({ left: (active.clipPath.left || 0) + dx, top: (active.clipPath.top || 0) + dy });
          active.clipPath.setCoords();
        }
        active.setCoords(); canvas.requestRenderAll(); canvas.fire('object:modified', { target: active });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, bezierAnchors, copyObject, duplicateObject, finishBezierPath, groupSelectedObjects, pasteObject, performObjectAction, redo, undo, ungroupSelectedObject]);

  const handleCanvasDoubleClick = useCallback((target?: FabricObject | null) => {
    const active = target ?? canvasRef.current?.getActiveObject();
    const name = getObjectName(active) || '';
    if (active instanceof FabricImage) {
      if (name === 'image-crop') {
        if (cropEditingRef.current === active) exitCropEdit();
        else enterCropEdit(active);
        return;
      }
      imageToReplaceRef.current = active;
      imageSlotToReplaceRef.current = null;
      imagePickerRef.current?.click();
    } else if (name.startsWith('image-slot:')) {
      imageToReplaceRef.current = null;
      imageSlotToReplaceRef.current = name;
      imagePickerRef.current?.click();
    }
  }, [enterCropEdit, exitCropEdit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onCanvasDoubleClick = ({ target }: { target?: FabricObject }) => handleCanvasDoubleClick(target);
    canvas.on('mouse:dblclick', onCanvasDoubleClick);
    return () => { canvas.off('mouse:dblclick', onCanvasDoubleClick); };
  }, [format, handleCanvasDoubleClick]);

  const loadConfig = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let config: TemplateConfig;
    try {
      const parsed = JSON.parse(configText) as TemplateConfig;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.elements)) throw new Error('JSON must include an elements array.');
      if (parsed.elements.length > 100) throw new Error('A template can contain at most 100 elements.');
      config = parsed;
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Invalid JSON');
      return;
    }
    if (config.width && config.height) {
      const matchingFormat = Object.entries(DIMENSIONS).find(([, size]) => size.width === config.width && size.height === config.height)?.[0] as keyof typeof DIMENSIONS | undefined;
      if (matchingFormat && matchingFormat !== format) {
        pendingConfigRef.current = config;
        setFormat(matchingFormat);
        setConfigError('');
        setConfigDialogOpen(false);
        return;
      }
      if (!matchingFormat && (config.width / config.height).toFixed(3) !== (DIMENSIONS[format].width / DIMENSIONS[format].height).toFixed(3)) {
        setConfigError('Choose dimensions that match one of the available canvas formats.');
        return;
      }
    }
    setConfigError('');
    try {
      await paintTemplateConfig(canvas, config);
      setTemplateName(typeof config.name === 'string' ? config.name : 'AI template');
      setTemplateId('');
      const background = canvas.backgroundColor;
      if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
      else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
      setConfigDialogOpen(false);
      toast.success('Template loaded onto the canvas. You can edit its elements now.');
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Could not load template config');
    }
  };

  const saveTemplate = async (): Promise<boolean> => {
    const canvas = canvasRef.current;
    if (!canvas || saving) return false;
    if (!templateName.trim()) { toast.error('Enter a template name before saving.'); return false; }
    setSaving(true);
    try {
      const json = await persistImages(canvas.toObject(['templateSlot', 'templateSlotType', 'templateImageFrame', 'name', 'frameWidth', 'frameHeight', 'frameLeft', 'frameTop', 'cropFrameWidth', 'cropFrameHeight', 'cropBaseScale', 'cropCenterX', 'cropCenterY', 'cropZoom'])) as Record<string, unknown>;
      const discovered = upgradeCanvas(json);
      const serialized = json.objects as Record<string, unknown>[];
      canvas.getObjects().forEach((object, index) => { object.set('templateSlot', serialized[index]?.templateSlot ?? ''); object.set('templateSlotType', serialized[index]?.templateSlotType ?? ''); });
      const slots = [...slotDefinitions, ...discovered.filter(slot => !slotDefinitions.some(s => s.key === slot.key))];
      const previous = templatesRef.current.find(t => t.id === templateId)?.apiTemplate;
      const data = { name: templateName.trim(), description: templateDescription, type: 'image', status: templateStatus, slots, category_ids: categoryIds, content: { width: canvas.getWidth(), height: canvas.getHeight(), json }, revision: previous?.revision };
      const response = previous ? await api.patch(`${base}/templates/${previous.id}`, data) : await api.post(`${base}/templates`, data);
      const saved = response.data.data.template as ApiTemplate;
      const record = toEditorRecord(saved);
      templatesRef.current = [record, ...templatesRef.current.filter(t => t.id !== record.id)];
      setTemplates(templatesRef.current); setTemplateId(saved.id); setSlotDefinitions(saved.slots);
      setSavedJson(JSON.stringify(saved, null, 2));
      toast.success('Template saved');
      return true;
    } catch (error) { toast.error(apiMessage(error, 'Could not save template')); return false; }
    finally { setSaving(false); }
  };

  const loadTemplate = async (id: string) => {
    const record = templatesRef.current.find(item => item.id === id);
    if (!record) return;
    setSlotDefinitions(record.apiTemplate?.slots ?? []); setTemplateDescription(record.apiTemplate?.description ?? '');
    setTemplateStatus(record.apiTemplate?.status ?? 'draft'); setCategoryIds(record.apiTemplate?.category_ids ?? []);
    setSlotPreviewTemplate(null);
    const targetFormat = Object.entries(DIMENSIONS).find(([, size]) => size.width === record.width && size.height === record.height)?.[0] as keyof typeof DIMENSIONS | undefined;
    if (targetFormat && targetFormat !== format) {
      pendingLoadRef.current = record;
      setTemplateId(id);
      setTemplateName(record.name);
      setFormat(targetFormat);
      return;
    }
    setTemplateId(id);
    setTemplateName(record.name);
    await canvasRef.current?.loadFromJSON(record.json);
    const background = canvasRef.current?.backgroundColor;
    if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
    else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
    canvasRef.current?.requestRenderAll();
  };

  const chooseSlotTestTemplate = (id: string, available = slotTestTemplates) => {
    const record = available.find(item => item.id === id);
    setSlotTestTemplateId(id);
    setSlotTestError('');
    setSlotTestImages({});
    setSlotTestValues(record ? Object.fromEntries(getTemplateSlots(record).filter(slot => slot.type === 'text').map(slot => [slot.key, slot.defaultValue])) : {});
  };

  const openSlotTester = async () => {
    try { await ensureTemplatesLoaded(); }
    catch (error) { toast.error(apiMessage(error, 'Could not load saved templates.')); return; }
    const canvas = canvasRef.current;
    const currentDraft: TemplateRecord | null = canvas && canvas.getObjects().length ? {
      id: '__current_canvas__', name: `${templateName || 'Current canvas'} (unsaved)`,
      width: canvas.getWidth(), height: canvas.getHeight(),
      json: canvas.toObject(['templateSlot', 'templateSlotType', 'templateImageFrame', 'name', 'frameWidth', 'frameHeight', 'frameLeft', 'frameTop', 'cropFrameWidth', 'cropFrameHeight', 'cropBaseScale', 'cropCenterX', 'cropCenterY', 'cropZoom']),
      updatedAt: new Date().toISOString(),
    } : null;
    const available = [...(currentDraft ? [currentDraft] : []), ...templatesRef.current];
    setSlotTestTemplates(available);
    setSlotTestDialogOpen(true);
    const initial = available.some(item => item.id === slotTestTemplateId) ? slotTestTemplateId : available[0]?.id || '';
    if (slotPreviewTemplate?.id === initial) setSlotTestTemplateId(initial);
    else chooseSlotTestTemplate(initial, available);
  };

  const openSavedTemplates = async () => {
    try {
      await ensureTemplatesLoaded();
      setSavedDialogOpen(true);
    } catch (error) {
      toast.error(apiMessage(error, 'Could not load saved templates.'));
    }
  };

  const openSaveDetails = async () => {
    try {
      await ensureCategoriesLoaded();
    } catch (error) {
      toast.error(apiMessage(error, 'Could not load template categories.'));
    }
    setSaveDetailsDialogOpen(true);
  };

  const previewSlotTest = async () => {
    const record = slotTestTemplates.find(item => item.id === slotTestTemplateId);
    const canvas = canvasRef.current;
    if (!record || !canvas) return;
    setSlotTestError('');
    const targetFormat = Object.entries(DIMENSIONS).find(([, size]) => size.width === record.width && size.height === record.height)?.[0] as keyof typeof DIMENSIONS | undefined;
    if (targetFormat && targetFormat !== format) {
      pendingSlotPreviewRef.current = { record, textValues: slotTestValues, imageSources: slotTestImages };
      setFormat(targetFormat);
      return;
    }
    try {
      await applyTemplateSlots(canvas, record, slotTestValues, slotTestImages);
      canvas.getObjects().forEach(installRotationControls);
      setTemplateId('');
      setTemplateName(`${record.name.replace(/ \(unsaved\)$/, '')} preview`);
      setSlotPreviewTemplate(record);
      const background = canvas.backgroundColor;
      if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
      else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
      scheduleHistory();
      setSlotTestDialogOpen(false);
      toast.success('Slot preview loaded on the canvas.');
    } catch {
      setSlotTestError('Could not apply these slot values to the template.');
    }
  };

  const resetSlotPreview = async () => {
    const record = slotPreviewTemplate;
    const canvas = canvasRef.current;
    if (!record || !canvas) return;
    await canvas.loadFromJSON(record.json);
    canvas.getObjects().forEach(installRotationControls);
    canvas.requestRenderAll();
    setTemplateId(record.id === '__current_canvas__' ? '' : record.id);
    setTemplateName(record.name.replace(/ \(unsaved\)$/, ''));
    setSlotPreviewTemplate(null);
    const background = canvas.backgroundColor;
    if (typeof background === 'string') { setCanvasBackground(background); setBackgroundFillMode('solid'); }
    else if (background instanceof FabricGradient) { setCanvasBackground(background.colorStops[0]?.color || '#ffffff'); setBackgroundGradientEnd(background.colorStops.at(-1)?.color || '#f97316'); setBackgroundFillMode('gradient'); }
    scheduleHistory();
  };

  const newTemplate = () => {
    setSlotDefinitions([]); setCategoryIds([]); setTemplateDescription(''); setTemplateStatus('draft');
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSlotPreviewTemplate(null);
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    setCanvasBackground('#ffffff');
    setBackgroundFillMode('solid');
    canvas.requestRenderAll();
    scheduleHistory();
    setTemplateId('');
    setTemplateName('Untitled promotion');
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png', multiplier: 1.5 });
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName.trim().replace(/[^a-z0-9-_]+/gi, '-') || 'promotion'}.png`;
    link.click();
  };

  const deleteTemplate = async () => {
    const record = templatesRef.current.find(t => t.id === templateId)?.apiTemplate;
    if (!record) return;
    try { await api.patch(`${base}/templates/${record.id}`, { ...record, status: 'archived' }); setTemplateStatus('archived'); toast.success('Template archived'); }
    catch (error) { toast.error(apiMessage(error, 'Could not archive template')); }
  };

  const handleWorkspacePointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Node;
    if (canvasWrapperRef.current?.contains(target) || leftPanelRef.current?.contains(target) || rightPanelRef.current?.contains(target)) return;
    if (target instanceof Element && target.closest('[data-template-floating-actions], [data-slot="dropdown-menu-content"], [data-slot="popover-content"], [data-colorshot-popover], [data-colorshot]')) return;
    const canvas = canvasRef.current;
    if (canvas?.getActiveObject()) canvas.discardActiveObject();
    canvas?.requestRenderAll();
    setActiveLayerIndex(null);
    setLeftPanelTab('tools');
  };

  return <div className="template-editor space-y-5" onPointerDownCapture={handleWorkspacePointerDownCapture}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><Link href="/dashboard/templates" className="text-sm underline">All templates</Link><h1 className="text-2xl font-bold tracking-tight">Image template</h1><p className="text-sm text-muted-foreground">Create reusable designs for promotions and social posts.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={newTemplate}><Plus className="mr-2 size-4" />New</Button><Button variant="outline" onClick={() => void openSlotTester()}>Test slots</Button><Button variant="outline" disabled={saving} onClick={() => void openSaveDetails()}><Save className="mr-2 size-4" />Save template</Button><Button onClick={exportPng}><Download className="mr-2 size-4" />{slotPreviewTemplate ? 'Create PNG' : 'Export PNG'}</Button></div>
    </div>
    <div className="grid gap-4 xl:h-[calc(100vh-200px)] xl:grid-cols-[16rem_minmax(0,1fr)_18rem] xl:items-stretch">
      <div ref={leftPanelRef} className="min-w-0 xl:h-full xl:min-h-0">
      <Tabs value={leftPanelTab} onValueChange={value => setLeftPanelTab(value as 'tools' | 'layers')} className="rounded-lg border bg-card p-3 xl:h-full xl:min-h-0 xl:overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>
        <TabsContent value="tools" className="mt-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={activeTool === 'select' ? 'secondary' : 'ghost'} className="template-editor-tool aspect-square h-auto w-full rounded-md flex-col justify-center gap-1.5 px-1 py-2" onClick={() => setActiveTool('select')} title="Select and move objects"><MousePointer2 className="size-5"/><span className="text-[11px]">Select</span></Button>
            <Button type="button" variant={activeTool === 'pen' ? 'secondary' : 'ghost'} className="template-editor-tool aspect-square h-auto w-full rounded-md flex-col justify-center gap-1.5 px-1 py-2" onClick={() => { if (activeTool === 'pen') setActiveTool('select'); else { const canvas = canvasRef.current; canvas?.discardActiveObject(); canvas?.requestRenderAll(); setActiveTool('pen'); } }} title="Draw freehand paths"><Pencil className="size-5"/><span className="text-[11px]">Pen</span></Button>
            <Button type="button" variant={activeTool === 'bezier' ? 'secondary' : 'ghost'} className="template-editor-tool aspect-square h-auto w-full rounded-md flex-col justify-center gap-1.5 px-1 py-2" onClick={() => { const canvas = canvasRef.current; canvas?.discardActiveObject(); canvas?.requestRenderAll(); setBezierAnchors([]); setActiveTool(activeTool === 'bezier' ? 'select' : 'bezier'); }} title="Create a custom curve or shape"><PenTool className="size-5"/><span className="text-[11px]">Bezier</span></Button>
            <Button type="button" draggable variant="ghost" className="template-editor-tool aspect-square h-auto w-full rounded-md cursor-grab flex-col justify-center gap-1.5 px-1 py-2 active:cursor-grabbing" onDragStart={event => startToolDrag(event, 'text')} onClick={addText} title="Add or drag text onto the canvas"><Type className="size-5"/><span className="text-[11px]">Text</span></Button>
            <Button type="button" draggable variant="ghost" title="Add or drag an image slot onto the canvas" className="template-editor-tool aspect-square h-auto w-full rounded-md cursor-grab flex-col justify-center gap-1.5 px-1 py-2 active:cursor-grabbing" onDragStart={event => startToolDrag(event, 'image')} onClick={() => { imageSlotToReplaceRef.current = null; imageToReplaceRef.current = null; imagePickerRef.current?.click(); }}><ImagePlus className="size-5"/><span className="text-[11px]">Image</span></Button>
            <Button type="button" draggable variant="ghost" className="template-editor-tool aspect-square h-auto w-full rounded-md cursor-grab flex-col justify-center gap-1.5 px-1 py-2 active:cursor-grabbing" onDragStart={event => startToolDrag(event, 'rectangle')} onClick={() => addShape('rectangle')} title="Add or drag rectangle"><Square className="size-5"/><span className="text-[11px]">Rectangle</span></Button>
            <Button type="button" draggable variant="ghost" className="template-editor-tool aspect-square h-auto w-full rounded-md cursor-grab flex-col justify-center gap-1.5 px-1 py-2 active:cursor-grabbing" onDragStart={event => startToolDrag(event, 'circle')} onClick={() => addShape('circle')} title="Add or drag circle"><Circle className="size-5"/><span className="text-[11px]">Circle</span></Button>
            <Button type="button" draggable variant="ghost" className="template-editor-tool aspect-square h-auto w-full rounded-md cursor-grab flex-col justify-center gap-1.5 px-1 py-2 active:cursor-grabbing" onDragStart={event => startToolDrag(event, 'triangle')} onClick={() => addShape('triangle')} title="Add or drag triangle"><Triangle className="size-5"/><span className="text-[11px]">Triangle</span></Button>
            <Button type="button" draggable variant="ghost" className="template-editor-tool aspect-square h-auto w-full rounded-md cursor-grab flex-col justify-center gap-1.5 px-1 py-2 active:cursor-grabbing" onDragStart={event => startToolDrag(event, 'line')} onClick={() => addShape('line')} title="Add or drag line"><Minus className="size-5"/><span className="text-[11px]">Line</span></Button>
            <FillPicker label="Canvas background" mode={backgroundFillMode} onModeChange={setBackgroundFillMode} startColor={canvasBackground} onStartColorChange={setCanvasBackground} endColor={backgroundGradientEnd} onEndColorChange={setBackgroundGradientEnd} angle={backgroundGradientAngle} onAngleChange={setBackgroundGradientAngle} onApply={applyBackgroundStyle} side="right"><Button type="button" variant="ghost" title="Canvas background color or gradient" className="template-editor-tool aspect-square h-auto w-full rounded-md flex-col justify-center gap-1.5 px-1 py-2"><PaintBucket className="size-5"/><span className="text-[11px]">Background</span><span className="h-1 w-8 rounded-full" style={{ background: backgroundFillMode === 'gradient' ? `linear-gradient(${backgroundGradientAngle + 90}deg, ${canvasBackground}, ${backgroundGradientEnd})` : canvasBackground }}/></Button></FillPicker>
          </div>
        </TabsContent>
        <TabsContent value="layers" className="mt-3 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-hidden">
          {layers.length ? <div className="mt-2 min-h-0 max-h-[calc(72vh-5rem)] w-full space-y-1 overflow-y-auto xl:max-h-none xl:flex-1">{layers.map((layer, displayIndex) => <div key={layer.index} draggable onDragStart={event => { setDraggedLayerIndex(displayIndex); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(displayIndex)); }} onDragEnd={() => setDraggedLayerIndex(null)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const from = draggedLayerIndex ?? Number(event.dataTransfer.getData('text/plain')); reorderLayers(from, displayIndex); setDraggedLayerIndex(null); }} className={`flex cursor-grab items-center gap-1 rounded-md pr-1 active:cursor-grabbing ${activeLayerIndex === layer.index ? 'bg-muted' : ''} ${draggedLayerIndex === displayIndex ? 'opacity-40' : ''}`}>
            <button type="button" onClick={() => { const canvas = canvasRef.current; const object = canvas?.getObjects()[layer.index]; if (canvas && object) { object.set('visible', true); canvas.setActiveObject(object); canvas.requestRenderAll(); } }} className={`min-w-0 flex-1 truncate rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${layer.visible ? '' : 'opacity-50'}`} title={layer.label}>{layer.label}{!layer.visible ? ' · Hidden' : layer.locked ? ' · Locked' : ''}</button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button type="button" size="icon" variant="ghost" aria-label={`Actions for ${layer.label}`} title="Layer actions" className="size-8 shrink-0"><MoreHorizontal className="size-4"/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, 'duplicate')}><Copy/>Duplicate</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, 'lock')}>{layer.locked ? <Unlock/> : <Lock/>}{layer.locked ? 'Unlock' : 'Lock'}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, layer.visible ? 'hide' : 'show')}>{layer.visible ? <EyeOff/> : <Eye/>}{layer.visible ? 'Hide' : 'Show'}</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, 'forward')}><ArrowUpToLine/>Move up one layer</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, 'backward')}><ArrowDownToLine/>Move down one layer</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, 'front')}><ArrowUpToLine/>Move to top</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => runLayerAction(layer.index, 'back')}><ArrowDownToLine/>Move to bottom</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem variant="destructive" onSelect={() => runLayerAction(layer.index, 'delete')}><Trash2/>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>)}</div> : <p className="mt-2 text-xs text-muted-foreground">Elements you add will appear here.</p>}
          <p className="mt-2 text-[11px] text-muted-foreground">Drag a layer to change stacking order.</p>
        </TabsContent>
      </Tabs>
      </div>
      <section className="flex min-w-0 flex-col space-y-3 rounded-lg border bg-card p-4 xl:h-full xl:min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
          <Input aria-label="Template name" value={templateName} onChange={event => setTemplateName(event.target.value)} className="w-36 min-w-0 shrink-0 sm:w-40" />
          <Select value={format} onValueChange={value => setFormat(value as keyof typeof DIMENSIONS)}><SelectTrigger className="w-52 shrink-0"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(DIMENSIONS).map(([key, size]) => <SelectItem key={key} value={key}>{size.label}</SelectItem>)}</SelectContent></Select>
          <Button size="icon" variant="ghost" aria-label="Undo" title="Undo (Ctrl/⌘ Z)" disabled={!canUndo} onClick={undo}><Undo2 className="size-4"/></Button>
          <Button size="icon" variant="ghost" aria-label="Redo" title="Redo (Ctrl/⌘ Shift Z)" disabled={!canRedo} onClick={redo}><Redo2 className="size-4"/></Button>
          {templateId && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void deleteTemplate()}><Trash2 className="mr-2 size-4" />Archive template</Button>}
          </div>
          <div className="flex shrink-0 items-center gap-2"><Button size="sm" variant="outline" onClick={() => void openSavedTemplates()}>Saved templates</Button><Button size="sm" onClick={() => setConfigDialogOpen(true)}><WandSparkles className="mr-2 size-4"/>Generate template</Button></div>
        </div>
        {slotPreviewTemplate && <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2"><div><p className="text-sm font-medium">Previewing {slotPreviewTemplate.name.replace(/ \(unsaved\)$/, '')}</p><p className="text-xs text-muted-foreground">Slot values are applied to this canvas. The saved template stays unchanged.</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setSlotTestDialogOpen(true)}>Edit slots</Button><Button size="sm" variant="ghost" onClick={() => void resetSlotPreview()}>Discard preview</Button></div></div>}
        <div ref={canvasViewportRef} onScroll={updateFloatingActionsPosition} className="relative h-[72vh] w-full min-h-0 overflow-auto rounded-md bg-muted/60 p-4 pb-16 xl:h-auto xl:flex-1">
          <div ref={canvasWrapperRef} onContextMenu={handleCanvasContextMenu} onDragEnter={event => { if (event.dataTransfer.types.includes('application/x-iplug-template-tool')) setCanvasDropActive(true); }} onDragOver={event => { if (event.dataTransfer.types.includes('application/x-iplug-template-tool')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; } }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCanvasDropActive(false); }} onDrop={event => { handleToolDrop(event); setCanvasDropActive(false); }} className={`relative mx-auto shadow-lg ${canvasDropActive ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ width: DIMENSIONS[format].width * zoom, height: DIMENSIONS[format].height * zoom }}>
            <canvas ref={elementRef} />
            {openingTemplate && <div role="status" aria-live="polite" className="absolute inset-0 z-40 grid place-items-center"><div className="flex items-center gap-3 rounded-lg border bg-card px-5 py-4 text-sm font-medium shadow-lg"><Loader2 className="size-5 animate-spin text-primary"/><span>Loading template…</span></div></div>}
            {activeTool === 'bezier' && <svg viewBox={`0 0 ${DIMENSIONS[format].width} ${DIMENSIONS[format].height}`} preserveAspectRatio="none" aria-label="Bezier path drawing canvas" className="absolute inset-0 z-20 h-full w-full touch-none cursor-crosshair" onPointerDown={addBezierAnchor} onPointerMove={moveBezierHandle} onPointerUp={endBezierHandle} onPointerCancel={endBezierHandle} onDoubleClick={event => event.stopPropagation()}>
              <rect x="0" y="0" width={DIMENSIONS[format].width} height={DIMENSIONS[format].height} fill="transparent" />
              {bezierAnchors.length > 0 && <path d={buildBezierPath(bezierAnchors, false)} fill="none" stroke={penColor} strokeWidth={penWidth} strokeDasharray="6 4"/>}
              {bezierAnchors.map((anchor, index) => <g key={`${index}-${anchor.x}-${anchor.y}`}>
                {anchor.hasHandles && <><line x1={anchor.inX} y1={anchor.inY} x2={anchor.outX} y2={anchor.outY} stroke="#2563eb" strokeWidth="2"/><circle cx={anchor.inX} cy={anchor.inY} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2"/><circle cx={anchor.outX} cy={anchor.outY} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2"/></>}
                <circle cx={anchor.x} cy={anchor.y} r="6" fill="#fff" stroke="#111827" strokeWidth="2"/>
              </g>)}
            </svg>}
          </div>
          {selectedObject && floatingActionsPosition && <div data-template-floating-actions className="absolute z-30 flex items-center gap-0.5 rounded-md border bg-background/95 p-0.5 shadow-md backdrop-blur" style={{ left: floatingActionsPosition.left, top: floatingActionsPosition.top, transform: 'translate(-50%, -100%)' }}>
            <Button size="icon" variant="ghost" className="size-7" aria-label="Duplicate selected element" title="Duplicate" onClick={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'duplicate'); }}><Copy className="size-3.5"/></Button>
            <Button size="icon" variant="ghost" className="size-7" aria-label={selectedGeometry.locked ? 'Unlock selected element' : 'Lock selected element'} title={selectedGeometry.locked ? 'Unlock' : 'Lock'} onClick={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'lock'); }}>{selectedGeometry.locked ? <Unlock className="size-3.5"/> : <Lock className="size-3.5"/>}</Button>
            <Button size="icon" variant="ghost" className="size-7" aria-label="Hide selected element" title="Hide" onClick={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'hide'); }}><EyeOff className="size-3.5"/></Button>
            <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" aria-label="Delete selected element" title="Delete" onClick={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'delete'); }}><Trash2 className="size-3.5"/></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-7" aria-label="More selected element actions" title="More actions"><ChevronDown className="size-4"/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom">
                <DropdownMenuItem onSelect={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'forward'); }}><ArrowUpToLine/>Move up one layer</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'backward'); }}><ArrowDownToLine/>Move down one layer</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'front'); }}><ArrowUpToLine/>Move to top</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { const object = canvasRef.current?.getActiveObject(); if (object) performObjectAction(object, 'back'); }}><ArrowDownToLine/>Move to bottom</DropdownMenuItem>
                {selectionCount > 1 && <><DropdownMenuSeparator/><DropdownMenuItem onSelect={groupSelectedObjects}>Group selection <span className="ml-auto text-xs text-muted-foreground">Ctrl/⌘ G</span></DropdownMenuItem></>}
                {selectedGroup && <><DropdownMenuSeparator/><DropdownMenuItem onSelect={ungroupSelectedObject}>Ungroup <span className="ml-auto text-xs text-muted-foreground">Ctrl/⌘ Shift G</span></DropdownMenuItem></>}
                {selectedImageFrameAction && <><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => { const object = canvasRef.current?.getActiveObject(); if (object) toggleSelectedImageFrame(object); }}>{selectedImageFrameAction.enabled ? 'Remove image frame' : 'Convert to image frame'}</DropdownMenuItem></>}
                {selectedSlotAction && <><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => { const object = canvasRef.current?.getActiveObject(); if (object) openSlotDialog(object); }}>{selectedSlotAction.hasSlot ? 'Edit' : 'Create'} {selectedSlotAction.type} slot</DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>}
          <div className="pointer-events-none sticky bottom-3 z-10 -mt-14 flex justify-end pr-3"><div className="pointer-events-auto flex items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-lg backdrop-blur"><Button size="sm" variant="ghost" aria-label="Zoom out" disabled={zoom <= 0.3} onClick={() => setZoom(value => Math.max(0.3, Math.round((value - 0.1) * 10) / 10))}>−</Button><span className="w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span><Button size="sm" variant="ghost" aria-label="Zoom in" disabled={zoom >= 1} onClick={() => setZoom(value => Math.min(1, Math.round((value + 0.1) * 10) / 10))}>+</Button><Button size="sm" variant="ghost" onClick={() => setZoom(0.75)}>Reset</Button></div></div>
        </div>
      </section>
      <aside ref={rightPanelRef} className="space-y-5 rounded-lg border bg-card p-4 xl:h-full xl:min-h-0 xl:overflow-y-auto">
        <input ref={imagePickerRef} className="sr-only" type="file" accept="image/*" onChange={event => { void addImage(event.target.files?.[0]); event.currentTarget.value = ''; }} />
        <div>
          <h2 className="font-semibold">{selectionCount > 1 ? `${selectionCount} selected elements` : selectedGroup ? 'Selected group' : selectionKind ? 'Selected object' : activeTool === 'bezier' ? 'Bezier pen settings' : activeTool === 'pen' ? 'Freehand pen settings' : 'Selected object'}</h2>
          {selectionCount > 1 ? <div className="mt-3 space-y-3"><p className="text-xs text-muted-foreground">Delete, duplicate, lock, hide, and stack actions apply to all selected elements.</p><Button size="sm" variant="outline" className="w-full" onClick={groupSelectedObjects}>Group selection</Button></div>
            : selectedGroup ? <div className="mt-3 space-y-3"><p className="text-xs text-muted-foreground">Move and transform these elements together, or ungroup them to edit each element.</p><Button size="sm" variant="outline" className="w-full" onClick={ungroupSelectedObject}>Ungroup elements</Button></div>
              : !selectionKind && (activeTool === 'pen' || activeTool === 'bezier') ? <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium"><span>Stroke color</span><SingleColorPicker label="Pen stroke color" value={penColor} onChange={setPenColor}/></div>
            <label className="block text-xs font-medium">Stroke width ({penWidth}px)<input aria-label="Pen stroke width" className="mt-2 w-full" type="range" min={1} max={40} step={1} value={penWidth} onChange={event => setPenWidth(Number(event.target.value))} /></label>
            <p className="text-xs text-muted-foreground">{activeTool === 'bezier' ? 'Click to place points, drag a point to curve it, click near the first point to close, then press Enter to finish or Escape to cancel.' : 'Draw directly on the canvas. Press Escape or select the Select tool when finished.'}</p>
          </div> : !selectionKind ? <p className="mt-2 text-xs text-muted-foreground">Select text, a shape, or an image on the canvas to edit it.</p> : <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-medium">X<Input className="mt-1" type="number" value={selectedGeometry.left} onChange={event => updateGeometry('left', Number(event.target.value))}/></label>
              <label className="block text-xs font-medium">Y<Input className="mt-1" type="number" value={selectedGeometry.top} onChange={event => updateGeometry('top', Number(event.target.value))}/></label>
              <label className="block text-xs font-medium">Width<Input className="mt-1" type="number" min={1} value={selectedGeometry.width} onChange={event => updateGeometry('width', Math.max(1, Number(event.target.value)))}/></label>
              <label className="block text-xs font-medium">Height<Input className="mt-1" type="number" min={1} value={selectedGeometry.height} onChange={event => updateGeometry('height', Math.max(1, Number(event.target.value)))}/></label>
              <label className="col-span-2 block text-xs font-medium">Rotation<div className="mt-1 flex items-center gap-1"><Button type="button" size="icon" variant="outline" aria-label="Rotate counterclockwise 15 degrees" title="Rotate −15°" onClick={() => rotateSelected(-15)}><RotateCcw className="size-4"/></Button><Input type="number" aria-label="Rotation degrees" value={selectedGeometry.angle} onChange={event => updateGeometry('angle', Number(event.target.value))}/><Button type="button" size="icon" variant="outline" aria-label="Rotate clockwise 15 degrees" title="Rotate +15°" onClick={() => rotateSelected(15)}><RotateCw className="size-4"/></Button></div></label>
            </div>
            {selectionKind === 'text' && <>
              <label className="block text-xs font-medium">Text<Input className="mt-1" value={selectedText} onChange={event => updateSelectedText(event.target.value)} /></label>
              <label className="block text-xs font-medium">Font<select className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm" value={selectedFont} onChange={event => updateSelectedFont(event.target.value)}>{['Arial', 'Georgia', 'Verdana', 'Times New Roman', 'Courier New', 'Trebuchet MS'].map(font => <option key={font} value={font}>{font}</option>)}</select></label>
              <label className="block text-xs font-medium">Font size<Input className="mt-1" type="number" min={8} max={200} value={selectedFontSize} onChange={event => updateSelectedFontSize(Math.max(8, Number(event.target.value) || 8))} /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedBold} onChange={event => updateSelectedBold(event.target.checked)} />Bold</label>
              <label className="block text-xs font-medium">Alignment<select className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm" value={selectedAlign} onChange={event => updateSelectedAlign(event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
              <div className="flex items-center justify-between text-xs font-medium"><span>Text color</span><SingleColorPicker label="Text color" value={selectedColor} onChange={updateSelectedColor}/></div>
            </>}
            {selectionKind === 'shape' && <><FillPicker label={selectedLine ? 'Stroke' : 'Shape fill'} mode={selectedFillMode} onModeChange={setSelectedFillMode} startColor={selectedColor} onStartColorChange={setSelectedColor} endColor={shapeGradientEnd} onEndColorChange={setShapeGradientEnd} angle={shapeGradientAngle} onAngleChange={setShapeGradientAngle} onApply={applySelectedFill} side="left"><Button type="button" variant="outline" className="w-full justify-between"><span>{selectedLine ? 'Stroke' : 'Fill'}</span><span className="h-5 w-8 rounded border" style={{ background: selectedFillMode === 'gradient' ? `linear-gradient(${shapeGradientAngle + 90}deg, ${selectedColor}, ${shapeGradientEnd})` : selectedColor }}/></Button></FillPicker>{selectedCustomShape && <><div className="flex items-center justify-between text-xs font-medium"><span>Outline color</span><SingleColorPicker label="Custom shape outline color" value={selectedStrokeColor} onChange={updateSelectedStrokeColor}/></div><label className="block text-xs font-medium">Outline width ({selectedStrokeWidth}px)<input aria-label="Custom shape outline width" className="mt-2 w-full" type="range" min={0} max={40} step={1} value={selectedStrokeWidth} onChange={event => updateSelectedStrokeWidth(Number(event.target.value))}/></label></>}{selectedLine && <label className="block text-xs font-medium">Stroke width ({selectedStrokeWidth}px)<input aria-label="Selected path stroke width" className="mt-2 w-full" type="range" min={1} max={40} step={1} value={selectedStrokeWidth} onChange={event => updateSelectedStrokeWidth(Number(event.target.value))}/></label>}<label className="block text-xs font-medium">Opacity ({Math.round(selectedOpacity * 100)}%)<input aria-label="Shape opacity" className="mt-2 w-full" type="range" min={0.1} max={1} step={0.05} value={selectedOpacity} onChange={event => updateSelectedOpacity(Number(event.target.value))}/></label></>}
            {selectionKind === 'image' && <><label className="block text-xs font-medium">Opacity ({Math.round(selectedOpacity * 100)}%)<input aria-label="Image opacity" className="mt-2 w-full" type="range" min={0.1} max={1} step={0.05} value={selectedOpacity} onChange={event => updateSelectedOpacity(Number(event.target.value))} /></label>{selectedImageCropped ? cropEditing ? <div className="space-y-2 rounded-md border p-3"><p className="text-xs text-muted-foreground">Drag the image inside its shape. Use the slider to zoom.</p><label className="block text-xs font-medium">Crop zoom ({Math.round(cropZoom * 100)}%)<input aria-label="Crop image zoom" className="mt-2 w-full" type="range" min={1} max={3} step={0.05} value={cropZoom} onChange={event => setCropImageZoom(Number(event.target.value))}/></label><div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" onClick={resetCropImage}>Reset crop</Button><Button size="sm" onClick={exitCropEdit}>Done</Button></div></div> : <Button size="sm" variant="outline" className="w-full" onClick={() => enterCropEdit()}>Edit image crop</Button> : <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" onClick={() => fitSelectedImage('contain')}>Fit image</Button><Button size="sm" variant="outline" onClick={() => fitSelectedImage('cover')}>Fill frame</Button></div>}</>}
          </div>}
        </div>
      </aside>
    </div>
    {contextMenu && <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)}><div role="menu" className="fixed min-w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={event => event.stopPropagation()}>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('duplicate')}>Duplicate <span className="float-right text-xs text-muted-foreground">Ctrl/⌘ D</span></button>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('forward')}>Bring forward</button>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('front')}>Bring to front</button>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('backward')}>Send backward</button>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('back')}>Send to back</button>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('lock')}>{contextMenu.target.lockMovementX ? 'Unlock' : 'Lock'} movement</button>
      <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('hide')}>Hide layer</button>
      {contextMenu.target instanceof FabricImage && <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => runContextAction('replace')}>Replace image</button>}
      <div className="my-1 border-t"/><button role="menuitem" className="w-full rounded px-3 py-2 text-left text-sm text-destructive hover:bg-accent" onClick={() => runContextAction('delete')}>Delete <span className="float-right text-xs">Del</span></button>
    </div></div>}
    <Dialog open={saveDetailsDialogOpen} onOpenChange={setSaveDetailsDialogOpen}>
      <DialogContent className="template-editor-portal sm:max-w-lg">
        <DialogHeader><DialogTitle>Save image template</DialogTitle><DialogDescription>Add the template details and categories before saving this design.</DialogDescription></DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="save-template-description">Description</label><Textarea id="save-template-description" value={templateDescription} onChange={event => setTemplateDescription(event.target.value)} placeholder="Describe what this template is for…" /></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="save-template-status">Status</label><Select value={templateStatus} onValueChange={value => setTemplateStatus(value as ApiTemplate['status'])}><SelectTrigger id="save-template-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><p className="text-sm font-medium">Categories</p>{categories.length ? <div className="grid gap-2 sm:grid-cols-2">{categories.map(category => <label key={category.id} className="flex items-center gap-2 rounded-md border p-3 text-sm"><Checkbox checked={categoryIds.includes(category.id)} onCheckedChange={() => setCategoryIds(current => current.includes(category.id) ? current.filter(id => id !== category.id) : [...current, category.id])} />{category.name}</label>)}</div> : <p className="text-sm text-muted-foreground">No categories available.</p>}</div>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setSaveDetailsDialogOpen(false)} disabled={saving}>Cancel</Button><Button type="button" onClick={async () => { if (await saveTemplate()) setSaveDetailsDialogOpen(false); }} disabled={saving}><Save className="mr-2 size-4"/>{saving ? 'Saving…' : templateId ? 'Save changes' : 'Save template'}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={!!slotDialog} onOpenChange={open => { if (!open) setSlotDialog(null); }}>
      <DialogContent className="template-editor-portal sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{slotDialog && (slotDialog.originalKey ? 'Edit' : 'Create')} {slotDialog?.type} slot</DialogTitle>
          <DialogDescription>This selected {slotDialog?.type === 'text' ? 'text element' : 'image element'} will be replaceable when someone uses the template.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">Slot key<Input value={slotKey} onChange={event => setSlotKey(event.target.value)} placeholder={slotDialog?.type === 'text' ? 'product_name' : 'product_image'} /><span className="block text-xs font-normal text-muted-foreground">Use letters, numbers, and underscores. The key must start with a letter.</span></label>
          <label className="block space-y-2 text-sm font-medium">Label<Input value={slotLabel} onChange={event => setSlotLabel(event.target.value)} placeholder="Product name" /></label>
          {slotDialog?.type === 'text' && <label className="block space-y-2 text-sm font-medium">Default text<Input value={slotDefaultValue} onChange={event => setSlotDefaultValue(event.target.value)} placeholder="Starting text for this slot" /></label>}
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={slotRequired} onCheckedChange={checked => setSlotRequired(checked === true)} />Require this slot when using the template</label>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setSlotDialog(null)}>Cancel</Button>
            <Button type="button" onClick={saveSlotFromDialog}>{slotDialog?.originalKey ? 'Save slot' : 'Create slot'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={slotTestDialogOpen} onOpenChange={setSlotTestDialogOpen}>
      <DialogContent className="template-editor-portal sm:max-w-xl">
        <DialogHeader><DialogTitle>Test template slots</DialogTitle><DialogDescription>Choose a saved template or the current canvas, fill its text and image slots, then preview the result on the canvas. This local test does not change the saved template.</DialogDescription></DialogHeader>
        {slotTestTemplates.length ? <Select value={slotTestTemplateId} onValueChange={id => chooseSlotTestTemplate(id)}>
          <SelectTrigger><SelectValue placeholder="Choose a template" /></SelectTrigger>
          <SelectContent>{slotTestTemplates.map(record => <SelectItem key={record.id} value={record.id}>{record.name}</SelectItem>)}</SelectContent>
        </Select> : <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">Add elements to the canvas or save a template first, then test its slots here.</p>}
        {slotTestTemplateId && (() => {
          const record = slotTestTemplates.find(item => item.id === slotTestTemplateId);
          const slots = record ? getTemplateSlots(record) : [];
          return <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1">
            {slots.length ? slots.map(slot => <div key={`${slot.type}:${slot.key}`} className="space-y-1.5 rounded-md border p-3">
              <label className="block text-sm font-medium">{slot.key.replace(/[_-]+/g, ' ')} <span className="text-xs font-normal text-muted-foreground">({slot.type})</span></label>
              {slot.type === 'text'
                ? <Input aria-label={`Text slot ${slot.key}`} value={slotTestValues[slot.key] ?? slot.defaultValue} onChange={event => setSlotTestValues(current => ({ ...current, [slot.key]: event.target.value }))}/>
                : <><Input aria-label={`Image slot ${slot.key}`} type="file" accept="image/*" onChange={async event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (!file) return; if (!file.type.startsWith('image/')) { setSlotTestError('Choose an image file.'); return; } if (file.size > 2 * 1024 * 1024) { setSlotTestError('Images must be smaller than 2 MB for this preview.'); return; } try { const source = await readImageFile(file); setSlotTestImages(current => ({ ...current, [slot.key]: source })); setSlotTestError(''); } catch { setSlotTestError('Could not read this image.'); } }}/>{slotTestImages[slot.key] && <div className="flex items-center gap-3"><Image src={slotTestImages[slot.key]} alt={`Preview for ${slot.key}`} width={64} height={64} unoptimized className="size-16 rounded border object-contain"/><Button type="button" size="sm" variant="ghost" onClick={() => setSlotTestImages(current => { const next = { ...current }; delete next[slot.key]; return next; })}>Remove image</Button></div>}</>}
            </div>) : <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">This template has no named slots. Add named text placeholders or image slots in the editor, then save the template to test them here.</p>}
          </div>;
        })()}
        {slotTestError && <p role="alert" className="text-sm text-destructive">{slotTestError}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setSlotTestDialogOpen(false)}>Cancel</Button><Button disabled={!slotTestTemplateId} onClick={() => void previewSlotTest()}>Preview on canvas</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
      <DialogContent className="template-editor-portal sm:max-w-xl">
        <DialogHeader><DialogTitle>Generate template</DialogTitle><DialogDescription>Paste the reusable template JSON and preview it on the canvas. AI generation will be connected here later.</DialogDescription></DialogHeader>
        <Textarea value={configText} onChange={event => { setConfigText(event.target.value); setConfigError(''); }} rows={14} spellCheck={false} className="max-h-[55vh] overflow-y-auto font-mono text-xs" placeholder="Paste generated template JSON…"/>
        {configError && <p role="alert" className="text-sm text-destructive">{configError}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { setConfigText(SAMPLE_CONFIG); setConfigError(''); }}>Cosmetics poster JSON</Button><Button size="sm" variant="outline" onClick={() => { setConfigText(BIKE_SAMPLE_CONFIG); setConfigError(''); }}>Bike poster JSON</Button><Button size="sm" variant="outline" onClick={() => { setConfigText(EARBUDS_BANNER_CONFIG); setConfigError(''); }}>Earbuds banner JSON</Button></div><Button disabled={!configText.trim()} onClick={() => void loadConfig()}><WandSparkles className="mr-2 size-4"/>Preview on canvas</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={savedDialogOpen} onOpenChange={setSavedDialogOpen}>
      <DialogContent className="template-editor-portal sm:max-w-md">
        <DialogHeader><DialogTitle>Saved templates</DialogTitle><DialogDescription>Choose a saved design to continue editing.</DialogDescription></DialogHeader>
        {templates.length ? <div className="max-h-[55vh] space-y-1 overflow-y-auto">{templates.map(item => <button key={item.id} onClick={() => { void loadTemplate(item.id); setSavedDialogOpen(false); }} className={`w-full rounded-md px-3 py-3 text-left text-sm hover:bg-muted ${templateId === item.id ? 'bg-muted font-medium' : ''}`}>{item.name}<span className="block text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</span></button>)}</div> : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No saved templates yet.</p>}
      </DialogContent>
    </Dialog>
    {savedJson && <details className="rounded-lg border bg-card p-4"><summary className="cursor-pointer font-medium">Last saved JSON</summary><pre className="mt-3 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">{savedJson}</pre></details>}
  </div>;
}

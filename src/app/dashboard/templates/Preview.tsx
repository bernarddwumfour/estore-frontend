'use client';
import { useEffect, useRef, useState } from 'react';
import { StaticCanvas, FabricImage, Rect, Textbox, type FabricObject } from 'fabric';
import { Button } from '@/components/ui/button';
import type { Template } from './api';
export default function Preview({ template, values }: { template: Template; values: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null); const canvasRef = useRef<StaticCanvas | null>(null);
  const [error, setError] = useState(''); const [ready, setReady] = useState(false);
  const text = (template.content.text ?? '').replace(/{{\s*(\w+)\s*}}/g, (_, key) => values[key] ?? template.slots.find(s => s.key === key)?.default_value ?? '');
  useEffect(() => {
    if (template.type !== 'image' || !ref.current) return;
    let cancelled = false;
    const width = template.content.width!, height = template.content.height!;
    const element = document.createElement('canvas'); element.style.maxWidth = '100%'; element.style.height = 'auto'; ref.current.replaceChildren(element);
    const canvas = new StaticCanvas(element, { width, height }); canvasRef.current = canvas;
    const render = async () => {
      setReady(false); setError('');
      try {
        await canvas.loadFromJSON(template.content.json!);
        if (cancelled) return;
        for (const slot of template.slots) {
          const value = values[slot.key] ?? slot.default_value;
          const objects = canvas.getObjects().filter(o => o.get('templateSlot') === slot.key);
          if (slot.type === 'text') objects.forEach(o => { if (o instanceof Textbox) { o.set('text', value); o.initDimensions(); } });
          else if (value) {
            const placeholders = objects.filter(o => !(o instanceof Textbox));
            for (const object of placeholders) {
              const image = await FabricImage.fromURL(value, { crossOrigin: 'anonymous' });
              if (cancelled) return;
              const w = object.getScaledWidth(), h = object.getScaledHeight();
              const scale = Math.max(w / image.width, h / image.height);
              const center = object.getCenterPoint();
              const clip = object.clipPath ? await object.clipPath.clone() : new Rect({ left: center.x, top: center.y, width: w, height: h, originX: 'center', originY: 'center', angle: object.angle, absolutePositioned: true });
              image.set({ left: center.x, top: center.y, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale, angle: object.angle, opacity: object.opacity, clipPath: clip });
              const index = canvas.getObjects().indexOf(object as FabricObject);
              canvas.remove(object); canvas.insertAt(index, image);
            }
            objects.filter(o => o instanceof Textbox).forEach(o => canvas.remove(o));
          }
        }
        if (!cancelled) { canvas.renderAll(); setReady(true); }
      } catch { if (!cancelled) setError('Could not load an image in this template. Choose another image or check its URL.'); }
    };
    void render();
    return () => { cancelled = true; canvasRef.current = null; void canvas.dispose(); };
  }, [template, values]);
  return <div className="space-y-3">{template.type === 'text' ? <><div className="whitespace-pre-wrap rounded border bg-muted p-5">{text}</div><Button variant="outline" onClick={() => navigator.clipboard.writeText(text)}>Copy text</Button></> : <><div className="overflow-auto rounded border bg-muted p-3"><div ref={ref}/></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button variant="outline" disabled={!ready} onClick={() => { try { const link = document.createElement('a'); link.download = `${template.name.replace(/[^a-z0-9_-]/gi, '-')}.png`; link.href = canvasRef.current!.toDataURL({ format: 'png', multiplier: 1.5 }); link.click(); } catch { setError('This image provider does not allow export. Upload the image instead.'); } }}>Export PNG</Button></>}</div>;
}

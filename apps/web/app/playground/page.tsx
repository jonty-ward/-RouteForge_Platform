'use client';

import { useEffect, useRef, useState } from 'react';
import { usePixiApp } from '@routeforge/pixi-playground';


export default function PlaygroundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = usePixiApp(containerRef, { backgroundColor: 0x1a1a1a });
  const spriteRef = useRef<any>(null);
  const wheelHandlerRef = useRef<((event: WheelEvent) => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => {
      const app = appRef.current;
      if (app) app.renderer.resize(window.innerWidth, window.innerHeight - 60);
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [appRef]);

  useEffect(() => {
    return () => {
      if (wheelHandlerRef.current) {
        window.removeEventListener('wheel', wheelHandlerRef.current);
      }
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const app = appRef.current;
    if (!file || !app) return;

    try {
      const { Sprite, Texture } = await import('pixi.js');

      let sourceImage: ImageBitmap | HTMLImageElement;
      if (typeof createImageBitmap === 'function') {
        sourceImage = await createImageBitmap(file);
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onerror = () => reject(fr.error);
          fr.onload = () => resolve(fr.result as string);
          fr.readAsDataURL(file);
        });

        sourceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = dataUrl;
        });
      }

      const texture = Texture.from(sourceImage as any);

      if (spriteRef.current) {
        try {
          app.stage.removeChild(spriteRef.current);
        } catch {
          // no-op
        }
        spriteRef.current.destroy();
        spriteRef.current = null;
      }

      if (wheelHandlerRef.current) {
        window.removeEventListener('wheel', wheelHandlerRef.current);
        wheelHandlerRef.current = null;
      }

      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.position.set(window.innerWidth / 2, (window.innerHeight - 60) / 2);
      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.cursor = 'grab';

      const stopDrag = () => {
        setIsDragging(false);
        sprite.cursor = 'grab';
      };

      sprite.on('pointerdown', (ev: any) => {
        setIsDragging(true);
        dragOffsetRef.current = {
          x: sprite.position.x - ev.global.x,
          y: sprite.position.y - ev.global.y,
        };
        sprite.cursor = 'grabbing';
      });

      sprite.on('pointermove', (ev: any) => {
        if (!isDragging) return;
        sprite.position.x = ev.global.x + dragOffsetRef.current.x;
        sprite.position.y = ev.global.y + dragOffsetRef.current.y;
      });

      sprite.on('pointerup', stopDrag);
      sprite.on('pointerupoutside', stopDrag);

      const onWheel = (event: WheelEvent) => {
        if (!spriteRef.current) return;
        event.preventDefault();
        const scaleAmount = 1.1;
        spriteRef.current.scale.x *= event.deltaY > 0 ? 1 / scaleAmount : scaleAmount;
        spriteRef.current.scale.y *= event.deltaY > 0 ? 1 / scaleAmount : scaleAmount;
      };

      window.addEventListener('wheel', onWheel, { passive: false });
      wheelHandlerRef.current = onWheel;

      app.stage.addChild(sprite);
      spriteRef.current = sprite;
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const handleRotate = (angle: number) => {
    if (spriteRef.current) {
      spriteRef.current.rotation += angle;
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="bg-gray-800 p-4 text-white flex gap-4 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="px-4 py-2 bg-blue-600 rounded cursor-pointer hover:bg-blue-700"
        />
        <button onClick={() => handleRotate(Math.PI / 4)} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
          Rotate +45°
        </button>
        <button onClick={() => handleRotate(-Math.PI / 4)} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
          Rotate -45°
        </button>
        <span className="text-sm text-gray-400">Drag to move • Scroll to zoom</span>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }} />
    </div>
  );
}

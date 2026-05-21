import { useEffect, useRef } from 'react';
import type { Application } from 'pixi.js';

export function usePixiApp(containerRef: React.RefObject<HTMLElement>, opts?: any) {
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let app: Application | null = null;
    let mounted = true;

    const initPixi = async () => {
      const { Application } = await import('pixi.js');

      const container = containerRef.current!;
      const rect = container.getBoundingClientRect();
      const width = opts?.width ?? Math.max(1, rect.width || window.innerWidth);
      const height = opts?.height ?? Math.max(1, rect.height || window.innerHeight);

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);

      app = new Application();
      await app.init({
        ...(opts || {}),
        view: canvas,
        width,
        height,
      } as any);

      if (!mounted) {
        app.destroy(true);
        return;
      }

      app.renderer.resize(width, height);
      appRef.current = app;
    };

    initPixi().catch((error) => {
      console.error('Pixi init failed:', error);
    });

    return () => {
      mounted = false;
      if (app) {
        app.destroy(true);
        app = null;
      }
      appRef.current = null;
    };
  }, [containerRef, opts]);

  return appRef;
}

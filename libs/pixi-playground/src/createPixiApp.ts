import type { Application } from 'pixi.js';

export type CreatePixiOptions = any;

export async function createPixiApp(options?: CreatePixiOptions) {
  // Use dynamic import so this module can be built for node without bundling Pixi.
  const pixi = await import('pixi.js');
  const { Application } = pixi as typeof import('pixi.js');

  const app = new Application(options || {});
  return app as Application;
}

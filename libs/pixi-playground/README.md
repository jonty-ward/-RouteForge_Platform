# @routeforge/pixi-playground

Small helper library to create and manage a Pixi.js Application in client code.

Usage:

1. Add `pixi.js` to your app (peer dependency of the lib):

```
pnpm add pixi.js -w
```

2. From a client component:

```tsx
import { useRef } from 'react';
import { usePixiApp } from '@routeforge/pixi-playground';

export default function Page() {
  const ref = useRef<HTMLDivElement>(null);
  usePixiApp(ref, { backgroundColor: 0x1a1a1a });
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}
```

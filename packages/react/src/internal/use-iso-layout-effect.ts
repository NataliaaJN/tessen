import { useEffect, useLayoutEffect } from 'react';

/** `useLayoutEffect` in the browser, `useEffect` on the server (which would warn otherwise). */
export const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

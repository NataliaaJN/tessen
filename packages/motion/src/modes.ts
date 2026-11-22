/** Values of `data-tessen-motion`. Without the attribute, `prefers-reduced-motion` decides. */
export const motionModes = ['off', 'reduced', 'full'] as const;
export type MotionMode = (typeof motionModes)[number];

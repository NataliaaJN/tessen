import { AspectRatio, Stack } from '@tessen-ui/react';

const fill = { display: 'grid', placeItems: 'center', blockSize: '100%', background: 'var(--tessen-color-surface-subtle, #eef)' } as const;

export default function Example() {
  return (
    <Stack direction="horizontal" gap="4">
      <div style={{ inlineSize: 160 }}>
        <AspectRatio ratio="16/9">
          <div style={fill}>16/9</div>
        </AspectRatio>
      </div>
      <div style={{ inlineSize: 160 }}>
        <AspectRatio ratio="1/1">
          <div style={fill}>1/1</div>
        </AspectRatio>
      </div>
    </Stack>
  );
}

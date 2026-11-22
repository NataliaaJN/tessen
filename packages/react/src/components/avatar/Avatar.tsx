'use client';

import {
  avatarInitials,
  avatarVariants,
  type AvatarVariantProps,
} from '@tessen-ui/core/contracts/avatar';
import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface AvatarProps
  extends AvatarVariantProps, Omit<HTMLAttributes<HTMLSpanElement>, keyof AvatarVariantProps> {
  src?: string;
  /** Alt text of the image. Defaults to `name`. */
  alt?: string;
  /** The person or thing: names the avatar and gives the initials of the fallback. */
  name?: string;
}

/** The image when it loads; otherwise the initials of `name` (also while there is no `src`). */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size, shape, className, ...rest },
  ref,
) {
  const [failed, setFailed] = useState<string | undefined>();
  const showImage = Boolean(src) && failed !== src;
  const resolved = avatarVariants({ size, shape });
  return (
    <span
      {...rest}
      {...resolved.attrs}
      ref={ref}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : name}
      data-state={showImage ? 'image' : 'fallback'}
      className={cx(resolved.class, className)}
    >
      {showImage ? (
        <img
          className="t-avatar__image"
          src={src}
          alt={alt ?? name ?? ''}
          onError={() => setFailed(src)}
        />
      ) : (
        <span className="t-avatar__fallback" aria-hidden="true">
          {avatarInitials(name)}
        </span>
      )}
    </span>
  );
});

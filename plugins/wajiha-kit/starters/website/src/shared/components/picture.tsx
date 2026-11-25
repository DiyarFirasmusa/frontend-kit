import type { ImgHTMLAttributes } from 'react';

type PictureProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'width' | 'height' | 'alt' | 'src'
> & {
  src: string;
  /** In the page language. Use "" only for a purely decorative image. */
  alt: string;
  /** Required, so the browser reserves the space before the file arrives (no layout shift). */
  width: number;
  height: number;
  /** The one image that is the page's biggest element: loaded first, never lazily. */
  priority?: boolean;
};

export function Picture({ priority = false, alt, ...props }: PictureProps) {
  return (
    <img
      {...props}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cn } from '@/lib/utils';
import { Slot } from '@/lib/vendor/slot';
import { variants, type VariantProps } from '@/lib/vendor/variants';

/* Geometry and tones live in src/style/button.css (`.btn` + `.btn-*`).
   This wrapper only maps the component API onto those classes:
   default = base `.btn` (38px), lg = 44px, sm = 32px, xs = 28px,
   pill = 40px rounded-full (top-bar CTA). Icon sizes are square. */

const buttonVariants = variants('group/button btn', {
  variants: {
    variant: {
      default: 'btn-primary',
      navy: 'btn-navy',
      outline: 'btn-outline',
      outlinePrimary: 'btn-outline-primary',
      secondary: 'btn-soft-primary',
      ghost: 'btn-ghost',
      destructive: 'btn-soft-danger',
      destructiveSolid: 'btn-danger',
      link: 'btn-link',
    },
    size: {
      default: '',
      xs: 'btn-xs',
      sm: 'btn-sm',
      lg: 'btn-lg',
      pill: 'btn-pill',
      icon: 'btn-icon',
      'icon-xs': 'btn-icon btn-xs',
      'icon-sm': 'btn-icon btn-sm',
      'icon-lg': 'btn-icon btn-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      />
    );
  }
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

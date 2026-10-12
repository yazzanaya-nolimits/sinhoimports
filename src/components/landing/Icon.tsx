import { cn } from '@/lib/utils';

/**
 * Ícone do Google Material Symbols (Outlined).
 * Nomes em https://fonts.google.com/icons
 * O tamanho segue as classes w-* / h-* do Tailwind, como nos ícones antigos.
 */
type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  label?: string;
};

export const Icon = ({ name, className, filled, label }: IconProps) => (
  <span
    className={cn('ms-box', filled && 'ms-fill', className)}
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    aria-label={label}
  >
    <span className="ms-glyph">{name}</span>
  </span>
);

type ShimProps = { className?: string };
const shim = (name: string) => {
  const C = ({ className }: ShimProps) => <Icon name={name} className={className} />;
  C.displayName = `Icon(${name})`;
  return C;
};

// Substitutos diretos dos ícones usados antes, para trocar só o import.
export const X = shim('close');
export const MessageCircle = shim('forum');
export const CreditCard = shim('credit_card');
export const Tag = shim('sell');
export const CheckCircle2 = shim('check_circle');
export const Loader2 = shim('progress_activity');
export const ArrowRight = shim('arrow_forward');
export const Search = shim('search');
export const LayoutGrid = shim('grid_view');

export default Icon;

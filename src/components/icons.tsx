import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ícones do Google Material Symbols (Outlined), usados no site e no painel.
 * Catálogo de nomes: https://fonts.google.com/icons
 * O tamanho segue as classes w-* / h-* do Tailwind; a cor segue text-*.
 */
type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  label?: string;
};

export const Icon = ({ name, className, filled, label }: IconProps) => (
  <span
    className={cn('ms-box', (filled || /\bfill-/.test(className ?? '')) && 'ms-fill', className)}
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    aria-label={label}
  >
    <span className="ms-glyph">{name}</span>
  </span>
);

type ShimProps = HTMLAttributes<HTMLSpanElement> & { className?: string };
export type AppIcon = (props: ShimProps) => JSX.Element;

const shim = (name: string): AppIcon => {
  const C = ({ className, ...rest }: ShimProps) => (
    <span
      {...rest}
      className={cn('ms-box', /\bfill-/.test(className ?? '') && 'ms-fill', className)}
      aria-hidden={rest['aria-label'] ? undefined : true}
    >
      <span className="ms-glyph">{name}</span>
    </span>
  );
  (C as { displayName?: string }).displayName = `Icon(${name})`;
  return C;
};

// Mesmos nomes dos ícones usados antes: trocar só o import mantém tudo funcionando.
export const AlertTriangle = shim('warning');
export const ArrowDown = shim('arrow_downward');
export const ArrowLeft = shim('arrow_back');
export const ArrowRight = shim('arrow_forward');
export const ArrowUp = shim('arrow_upward');
export const Boxes = shim('inventory_2');
export const Check = shim('check');
export const CheckCircle2 = shim('check_circle');
export const ChevronDown = shim('expand_more');
export const ChevronLeft = shim('chevron_left');
export const ChevronRight = shim('chevron_right');
export const ChevronUp = shim('expand_less');
export const Circle = shim('circle');
export const Copy = shim('content_copy');
export const CreditCard = shim('credit_card');
export const DollarSign = shim('payments');
export const Dot = shim('fiber_manual_record');
export const Download = shim('download');
export const Edit2 = shim('edit');
export const ExternalLink = shim('open_in_new');
export const Eye = shim('visibility');
export const EyeOff = shim('visibility_off');
export const FileImage = shim('image');
export const FileText = shim('description');
export const Filter = shim('filter_list');
export const GripVertical = shim('drag_indicator');
export const Hash = shim('tag');
export const HelpCircle = shim('help');
export const History = shim('history');
export const Home = shim('home');
export const Image = shim('image');
export const Images = shim('photo_library');
export const Kanban = shim('view_kanban');
export const Languages = shim('translate');
export const LayoutDashboard = shim('space_dashboard');
export const LayoutGrid = shim('grid_view');
export const Loader2 = shim('progress_activity');
export const Lock = shim('lock');
export const LogIn = shim('login');
export const LogOut = shim('logout');
export const Mail = shim('mail');
export const Megaphone = shim('campaign');
export const Menu = shim('menu');
export const MessageCircle = shim('forum');
export const MoreHorizontal = shim('more_horiz');
export const Package = shim('package_2');
export const Palette = shim('palette');
export const PanelLeft = shim('left_panel_open');
export const Pencil = shim('edit');
export const Phone = shim('call');
export const Plus = shim('add');
export const Power = shim('power_settings_new');
export const Save = shim('save');
export const Search = shim('search');
export const Settings = shim('settings');
export const ShieldAlert = shim('gpp_maybe');
export const ShieldCheck = shim('verified_user');
export const ShieldOff = shim('gpp_bad');
export const ShoppingBag = shim('shopping_bag');
export const ShoppingCart = shim('shopping_cart');
export const Sparkles = shim('auto_awesome');
export const Tag = shim('sell');
export const Trash2 = shim('delete');
export const TrendingDown = shim('trending_down');
export const TrendingUp = shim('trending_up');
export const Upload = shim('upload');
export const Users = shim('group');
export const X = shim('close');
export const Zap = shim('bolt');

export default Icon;

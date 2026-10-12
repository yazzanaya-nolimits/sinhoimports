// Classes compartilhadas da vitrine pública, para manter o visual consistente.
export const container = 'mx-auto w-full max-w-[1280px] px-4 sm:px-6';

export const eyebrow = 'font-body text-xs tracking-[0.32em] uppercase';

export const sectionTitle =
  'font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.22] tracking-[0.06em] uppercase';

const btnBase =
  'inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 font-body text-[13px] tracking-[0.2em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sinho-gold focus-visible:ring-offset-2 focus-visible:ring-offset-sinho-ink';

export const btnPrimary = `${btnBase} bg-sinho-gold text-sinho-ink font-medium hover:bg-sinho-gold-hover`;

export const btnOutline = `${btnBase} border border-sinho-line-strong text-sinho-ivory hover:border-sinho-gold hover:text-sinho-gold`;

export const btnOutlineDark = `${btnBase} border border-sinho-dark text-sinho-dark hover:bg-sinho-dark hover:text-sinho-ivory`;

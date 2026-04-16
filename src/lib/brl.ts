const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}

export function parseBRL(str: string): number {
  const cleaned = str.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

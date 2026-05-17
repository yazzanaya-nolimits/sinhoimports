import { Download, FileImage, FileText, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Asset = {
  title: string;
  description: string;
  href: string;
  filename: string;
  icon: typeof FileImage;
  preview?: string;
  previewBg?: string;
};

const assets: Asset[] = [
  {
    title: 'Logo Símbolo',
    description: 'Versão apenas com o símbolo (monograma SI no frasco), PNG com fundo preto. Ideal para favicons, avatares e aplicações compactas.',
    href: '/brand/sinho-logo-simbolo.png',
    filename: 'sinho-imports-logo-simbolo.png',
    icon: FileImage,
    preview: '/brand/sinho-logo-simbolo.png',
    previewBg: '#101820',
  },
  {
    title: 'Logo Completa',
    description: 'Versão principal com símbolo + tipografia "SINHO IMPORTS", PNG com fundo preto. Use em comunicações oficiais, redes sociais e papelaria.',
    href: '/brand/sinho-logo-completa.png',
    filename: 'sinho-imports-logo-completa.png',
    icon: FileImage,
    preview: '/brand/sinho-logo-completa.png',
    previewBg: '#101820',
  },
  {
    title: 'Portfólio da Marca (PDF)',
    description: 'Manual completo de identidade visual: paleta Pantone, tipografia, regras de uso do logo e diretrizes da marca.',
    href: '/brand/sinho-brand-portfolio.pdf',
    filename: 'sinho-imports-portfolio-marca.pdf',
    icon: FileText,
  },
];

const palette = [
  { name: 'Pantone 871 C', label: 'Gold', hex: '#84754E' },
  { name: 'Pantone 872 C', label: 'Light Gold', hex: '#C9B37D' },
  { name: 'Pantone Black 6 C', label: 'Black', hex: '#101820' },
];

const BrandingPage = () => {
  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-theme-gradient">
          Branding da Marca
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recursos oficiais para download — logos, paleta e manual da identidade Sinho Imports.
        </p>
      </header>

      {/* Paleta */}
      <Card className="p-5 bg-card/60 backdrop-blur border-border">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-lg">Paleta oficial</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {palette.map((c) => (
            <div key={c.hex} className="rounded-lg overflow-hidden border border-border">
              <div className="h-20" style={{ background: c.hex }} />
              <div className="p-3 bg-background/60">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.label} · {c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets.map((a) => {
          const Icon = a.icon;
          return (
            <Card key={a.href} className="p-5 bg-card/60 backdrop-blur border-border flex flex-col gap-4">
              {a.preview ? (
                <div
                  className="rounded-lg border border-border overflow-hidden flex items-center justify-center h-40"
                  style={{ background: a.previewBg ?? '#101820' }}
                >
                  <img src={a.preview} alt={a.title} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="rounded-lg border border-border flex items-center justify-center h-40 bg-gradient-to-br from-primary/10 to-background">
                  <FileText className="w-14 h-14 text-primary opacity-80" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <h3 className="font-serif text-base font-semibold">{a.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
              </div>
              <Button asChild className="w-full gap-2">
                <a href={a.href} download={a.filename}>
                  <Download className="w-4 h-4" />
                  Baixar arquivo
                </a>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BrandingPage;

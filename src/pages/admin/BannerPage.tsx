import { useEffect, useState } from 'react';
import { Zap, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useBanner } from '@/hooks/useBanner';

export default function BannerPage() {
  const { banner, update } = useBanner();
  const { toast } = useToast();
  const [mensagem, setMensagem] = useState('');
  const [ativo, setAtivo] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setMensagem(banner.mensagem || '');
      setAtivo(!!banner.ativo);
    }
  }, [banner]);

  const handlePublish = async () => {
    setSaving(true);
    const { error } = await update({ mensagem, ativo });
    setSaving(false);
    if (error) toast({ title: 'Erro ao publicar', variant: 'destructive' });
    else toast({ title: ativo ? 'Banner publicado!' : 'Banner desativado!' });
  };

  const handleToggle = async (next: boolean) => {
    setAtivo(next);
    await update({ mensagem, ativo: next });
    toast({ title: next ? 'Banner ativado' : 'Banner desativado' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">Banner Promocional</h1>
        <p className="text-sm text-muted-foreground">Faixa animada exibida no topo do site.</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Banner ativo</Label>
            <p className="text-xs text-muted-foreground">
              Quando ligado, a faixa vermelha aparece no topo do site.
            </p>
          </div>
          <Switch checked={ativo} onCheckedChange={handleToggle} />
        </div>

        <div className="space-y-2">
          <Label>Mensagem do banner</Label>
          <Input
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder='Ex: "PROMOÇÃO RELÂMPAGO — 30% OFF hoje apenas!"'
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">{mensagem.length}/200</p>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preview</Label>
          {mensagem.trim() ? (
            <div className="mt-2 w-full bg-red-600 text-white overflow-hidden rounded-md shadow-lg">
              <div className="flex animate-marquee whitespace-nowrap py-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-3 px-8 font-bold text-sm uppercase tracking-wider">
                    <Zap className="w-4 h-4 fill-white" />
                    {mensagem}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-2 p-4 rounded-md border border-dashed text-center text-xs text-muted-foreground">
              Digite uma mensagem para ver o preview.
            </div>
          )}
        </div>

        <Button
          className="bg-gradient-gold text-primary-foreground w-full sm:w-auto"
          onClick={handlePublish}
          disabled={saving}
        >
          <Save className="mr-2 w-4 h-4" />
          Publicar banner
        </Button>
      </Card>
    </div>
  );
}

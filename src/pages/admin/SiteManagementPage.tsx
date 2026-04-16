import { useState } from 'react';
import { Save, Palette, Image, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme, type ThemeKey } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const themes: { key: ThemeKey; label: string; desc: string; preview: string }[] = [
  { key: 'black-gold', label: 'Preto Elegante / Dourado', desc: 'Luxo clássico, tema padrão', preview: 'bg-black border-yellow-600' },
  { key: 'navy-white', label: 'Azul Marinho / Branco', desc: 'Clean, minimalista, profissional', preview: 'bg-[#001F3F] border-blue-400' },
  { key: 'neon-green', label: 'Verde Neon / Vibrante', desc: 'Tech, descolado, futurista', preview: 'bg-black border-green-400' },
];

const SiteManagementPage = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [heroTitle, setHeroTitle] = useState(() => localStorage.getItem('sinho_hero_title') || 'Luxo Original para Todo Brasil');
  const [heroDesc, setHeroDesc] = useState(() => localStorage.getItem('sinho_hero_desc') || 'Perfumes árabes originais, relógios de luxo e acessórios premium.');

  const [popupEnabled, setPopupEnabled] = useState(() => {
    const cfg = JSON.parse(localStorage.getItem('sinho_popup_config') || '{"enabled":true}');
    return cfg.enabled;
  });
  const [popupText, setPopupText] = useState(() => {
    const cfg = JSON.parse(localStorage.getItem('sinho_popup_config') || '{"text":"Espere! Ganhe 10% off no WhatsApp"}');
    return cfg.text;
  });
  const [popupDelay, setPopupDelay] = useState(() => {
    const cfg = JSON.parse(localStorage.getItem('sinho_popup_config') || '{"delay":0}');
    return String(cfg.delay);
  });

  const saveHero = () => {
    localStorage.setItem('sinho_hero_title', heroTitle);
    localStorage.setItem('sinho_hero_desc', heroDesc);
    toast({ title: 'Hero atualizado!' });
  };

  const savePopup = () => {
    localStorage.setItem('sinho_popup_config', JSON.stringify({
      enabled: popupEnabled,
      text: popupText,
      delay: Number(popupDelay) || 0,
    }));
    toast({ title: 'Popup configurado!' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Gerenciar Site Público</h1>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Palette className="w-5 h-5" /> Tema do Site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {themes.map(t => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); toast({ title: `Tema "${t.label}" aplicado!` }); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  theme === t.key ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className={`w-full h-16 rounded-lg mb-3 border-2 ${t.preview}`} />
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hero Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Image className="w-5 h-5" /> Hero / Slider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título Principal</Label>
            <Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} maxLength={100} className="mt-1" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={heroDesc} onChange={e => setHeroDesc(e.target.value)} maxLength={300} className="mt-1" rows={3} />
          </div>
          <Button onClick={saveHero} className="bg-gradient-gold text-primary-foreground">
            <Save className="mr-2 h-4 w-4" /> Salvar Hero
          </Button>
        </CardContent>
      </Card>

      {/* Popup Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Bell className="w-5 h-5" /> Pop-up Exit-Intent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={popupEnabled} onCheckedChange={setPopupEnabled} />
            <Label>{popupEnabled ? 'Ativado' : 'Desativado'}</Label>
          </div>
          <div>
            <Label>Texto do Popup</Label>
            <Input value={popupText} onChange={e => setPopupText(e.target.value)} maxLength={150} className="mt-1" />
          </div>
          <div>
            <Label>Delay (segundos)</Label>
            <Input type="number" value={popupDelay} onChange={e => setPopupDelay(e.target.value)} min="0" max="30" className="mt-1 w-24" />
          </div>
          <Button onClick={savePopup} className="bg-gradient-gold text-primary-foreground">
            <Save className="mr-2 h-4 w-4" /> Salvar Popup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteManagementPage;

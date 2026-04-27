import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Save, GripVertical, Image as ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCarrossel } from '@/hooks/useCarrossel';

export default function CarrosselPage() {
  const { imagens, uploadImage, addImagem, removeImagem, toggleAtivo, saveOrder } = useCarrossel();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);

  useEffect(() => {
    setOrder(imagens.map(i => i.id));
    setOrderDirty(false);
  }, [imagens]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande (máx 5MB)', variant: 'destructive' });
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      toast({ title: 'Formato inválido', description: 'Use JPG, PNG ou WebP', variant: 'destructive' });
      return;
    }
    setPendingFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handlePublish = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const url = await uploadImage(pendingFile);
    if (!url) { setUploading(false); toast({ title: 'Falha no upload', variant: 'destructive' }); return; }
    const { error } = await addImagem(url);
    setUploading(false);
    if (error) { toast({ title: 'Erro ao salvar', variant: 'destructive' }); return; }
    toast({ title: 'Imagem adicionada ao carrossel!' });
    setPendingFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const next = [...order];
    const from = next.indexOf(dragId);
    const to = next.indexOf(overId);
    if (from < 0 || to < 0) return;
    next.splice(to, 0, next.splice(from, 1)[0]);
    setOrder(next);
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    await saveOrder(order);
    setOrderDirty(false);
    toast({ title: 'Ordem do carrossel salva!' });
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover esta imagem do carrossel?')) return;
    const { error } = await removeImagem(id);
    if (error) toast({ title: 'Erro ao remover', variant: 'destructive' });
    else toast({ title: 'Imagem removida' });
  };

  const orderedItems = order
    .map(id => imagens.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">Fotos do Carrossel</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as imagens exibidas no carrossel principal do site. Atualizações em tempo real.
        </p>
      </div>

      {/* Upload */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Adicionar nova foto
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full aspect-video object-cover rounded-lg border border-primary/40" />
            ) : (
              <div className="w-full aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                Selecione uma imagem (JPG, PNG ou WebP — máx 5MB)
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload className="mr-2 w-4 h-4" /> Selecionar arquivo
            </Button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleSelect}
            />
            <Button
              className="bg-gradient-gold text-primary-foreground"
              onClick={handlePublish}
              disabled={!pendingFile || uploading}
            >
              {uploading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
              Publicar no carrossel
            </Button>
            {pendingFile && (
              <Button variant="ghost" size="sm" onClick={() => { setPendingFile(null); setPreviewUrl(null); }}>
                Cancelar seleção
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Lista */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">
            Imagens atuais ({orderedItems.length})
          </h2>
          <Button
            onClick={handleSaveOrder}
            disabled={!orderDirty}
            className="bg-gradient-gold text-primary-foreground"
          >
            <Save className="mr-2 w-4 h-4" /> Salvar ordem
          </Button>
        </div>

        {orderedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma imagem no carrossel ainda.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Arraste para reordenar. Use o switch para ativar/desativar.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {orderedItems.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={e => handleDragOver(e, c.id)}
                  className={`relative group rounded-lg border border-border overflow-hidden cursor-move transition-all ${
                    dragId === c.id ? 'opacity-40 scale-95' : 'hover:border-primary/50'
                  } ${!c.ativo ? 'opacity-50' : ''}`}
                >
                  <img src={c.url} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded p-1">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(c.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/90 backdrop-blur-sm flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {c.ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {c.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                    <Switch
                      checked={c.ativo}
                      onCheckedChange={(v) => toggleAtivo(c.id, v)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {orderDirty && (
          <p className="text-xs text-yellow-500">
            ⚠ Você tem alterações de ordem não salvas. Clique em "Salvar ordem".
          </p>
        )}
      </Card>
    </div>
  );
}

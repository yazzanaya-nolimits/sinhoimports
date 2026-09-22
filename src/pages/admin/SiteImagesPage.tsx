import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Save, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSiteImages } from '@/hooks/useSiteImages';
import { useAuth } from '@/contexts/AuthContext';
import AdminWriteGuard from '@/components/admin/AdminWriteGuard';
import { IMAGE_ACCEPT, validateImage } from '@/lib/imageUpload';

export default function SiteImagesPage() {
  const { capa, carrossel, uploadImage, setCapa, addCarrossel, removeImage, saveOrder } = useSiteImages();
  const { toast } = useToast();
  const { isPinFallback } = useAuth();
  const capaInputRef = useRef<HTMLInputElement>(null);
  const carrosselInputRef = useRef<HTMLInputElement>(null);

  const [previewCapa, setPreviewCapa] = useState<string | null>(null);
  const [pendingCapaFile, setPendingCapaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);

  useEffect(() => {
    setOrder(carrossel.map(c => c.id));
    setOrderDirty(false);
  }, [carrossel]);

  useEffect(() => () => {
    if (previewCapa) URL.revokeObjectURL(previewCapa);
  }, [previewCapa]);

  const handleCapaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validationError = validateImage(f);
    if (validationError) {
      toast({ title: 'Imagem inválida', description: validationError, variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setPendingCapaFile(f);
    setPreviewCapa(URL.createObjectURL(f));
  };

  const handleCapaPublish = async () => {
    if (!pendingCapaFile) return;
    setUploading(true);
    try {
      const upload = await uploadImage(pendingCapaFile);
      const { error } = await setCapa(upload);
      if (error) throw error;
      toast({ title: 'Capa atualizada com sucesso!' });
      setPendingCapaFile(null);
      setPreviewCapa(null);
      if (capaInputRef.current) capaInputRef.current.value = '';
    } catch (error) {
      toast({ title: 'Não foi possível atualizar a capa', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleCarrosselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validationError = validateImage(f);
    if (validationError) {
      toast({ title: 'Imagem inválida', description: validationError, variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const upload = await uploadImage(f);
      const { error } = await addCarrossel(upload);
      if (error) throw error;
      toast({ title: 'Imagem adicionada ao carrossel!' });
    } catch (error) {
      toast({ title: 'Não foi possível enviar a imagem', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
    const { error } = await saveOrder(order);
    if (error) toast({ title: 'Não foi possível salvar a ordem', description: error.message, variant: 'destructive' });
    else { setOrderDirty(false); toast({ title: 'Ordem do carrossel salva!' }); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover esta imagem?')) return;
    const { error } = await removeImage(id);
    if (error) toast({ title: 'Não foi possível remover', description: error.message, variant: 'destructive' });
    else toast({ title: 'Imagem removida' });
  };

  const orderedItems = order
    .map(id => carrossel.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gradient-gold">Imagens do Site</h1>
        <p className="text-sm text-muted-foreground">Gerencie capa principal e carrossel da página inicial.</p>
      </div>
      <AdminWriteGuard />

      {/* Capa Principal */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Capa Principal
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Capa atual</p>
            {capa?.url ? (
              <img src={capa.url} alt="Capa atual" className="w-full aspect-video object-cover rounded-lg border border-border" />
            ) : (
              <div className="w-full aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                Nenhuma capa definida (usando padrão)
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Preview da nova capa</p>
            {previewCapa ? (
              <img src={previewCapa} alt="Preview" className="w-full aspect-video object-cover rounded-lg border border-primary/40" />
            ) : (
              <div className="w-full aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                Selecione uma imagem
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => capaInputRef.current?.click()} disabled={uploading || isPinFallback}>
            <Upload className="mr-2 w-4 h-4" /> Selecionar imagem
          </Button>
          <input
            ref={capaInputRef}
            type="file"
            className="hidden"
            accept={IMAGE_ACCEPT}
            onChange={handleCapaSelect}
          />
          <Button
            className="bg-gradient-gold text-primary-foreground"
            onClick={handleCapaPublish}
            disabled={!pendingCapaFile || uploading || isPinFallback}
          >
            {uploading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
            Atualizar capa
          </Button>
        </div>
      </Card>

      {/* Carrossel */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Carrossel ({orderedItems.length})
          </h2>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" onClick={() => carrosselInputRef.current?.click()} disabled={uploading || isPinFallback}>
              {uploading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Upload className="mr-2 w-4 h-4" />}
              Adicionar imagem
            </Button>
            <input
              ref={carrosselInputRef}
              type="file"
              className="hidden"
              accept={IMAGE_ACCEPT}
              onChange={handleCarrosselUpload}
            />
            <Button
              onClick={handleSaveOrder}
              disabled={!orderDirty || isPinFallback}
              className="bg-gradient-gold text-primary-foreground"
            >
              <Save className="mr-2 w-4 h-4" /> Salvar ordem
            </Button>
          </div>
        </div>

        {orderedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma imagem no carrossel ainda.
          </p>
        ) : (
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
                }`}
              >
                <img src={c.url} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded p-1">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(c.id)}
                  disabled={isPinFallback}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
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

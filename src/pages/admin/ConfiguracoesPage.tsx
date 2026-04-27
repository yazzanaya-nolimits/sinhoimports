import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Power, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth, type Modulo, type Membro } from '@/contexts/AuthContext';
import { MODULOS, defaultPermissoes } from '@/lib/permissions';

type FormState = {
  id?: string;
  user_id?: string;
  nome: string;
  username: string;
  email: string;
  senha: string;
  permissoes: Record<Modulo, string>;
  status: 'ativo' | 'inativo';
};

const empty = (): FormState => ({
  nome: '', username: '', email: '', senha: '',
  permissoes: defaultPermissoes(), status: 'ativo',
});

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const { membro: meuMembro, isPinFallback } = useAuth();
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState<FormState>(empty());
  const [editing, setEditing] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase.from('membros').select('*').order('created_at', { ascending: false });
    setMembros((data as unknown as Membro[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase.channel('membros_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membros' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const openNew = () => {
    setForm(empty());
    setEditing(false);
    setOpen(true);
  };

  const openEdit = (m: Membro) => {
    setForm({
      id: m.id, user_id: m.user_id,
      nome: m.nome, username: m.username, email: m.email, senha: '',
      permissoes: { ...defaultPermissoes(), ...m.permissoes },
      status: m.status,
    });
    setEditing(true);
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome.trim() || !form.username.trim() || !form.email.trim()) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (!editing && form.senha.length < 6) {
      toast({ title: 'Senha precisa ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing && form.id) {
        const { error } = await supabase.from('membros').update({
          nome: form.nome, username: form.username, email: form.email,
          permissoes: form.permissoes, status: form.status,
        }).eq('id', form.id);
        if (error) throw new Error(error.message);
        toast({ title: 'Membro atualizado' });
      } else {
        // Cria via edge function (precisa service-role)
        const { data, error } = await supabase.functions.invoke('admin-create-membro', {
          body: {
            nome: form.nome, username: form.username, email: form.email,
            senha: form.senha, permissoes: form.permissoes,
          },
        });
        if (error) throw new Error(error.message);
        const result = data as { ok?: boolean; error?: string };
        if (result?.error) throw new Error(result.error);
        toast({ title: 'Membro criado com sucesso' });
      }
      setOpen(false);
      fetchAll();
    } catch (e) {
      toast({ title: 'Erro', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (m: Membro) => {
    const novo = m.status === 'ativo' ? 'inativo' : 'ativo';
    const { error } = await supabase.from('membros').update({ status: novo }).eq('id', m.id);
    if (error) toast({ title: error.message, variant: 'destructive' });
    else toast({ title: `Membro ${novo}` });
  };

  const remove = async (m: Membro) => {
    if (!confirm(`Excluir membro "${m.nome}"? Essa ação é irreversível.`)) return;
    const { data, error } = await supabase.functions.invoke('admin-delete-membro', {
      body: { user_id: m.user_id },
    });
    if (error || (data as { error?: string })?.error) {
      toast({ title: 'Erro', description: (data as { error?: string })?.error || error?.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Membro excluído' });
    fetchAll();
  };

  const isFirstSetup = membros.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gradient-gold">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gestão de membros e níveis de acesso</p>
        </div>
        <Button onClick={openNew} className="gap-2" style={{ background: 'var(--gradient-gold)', color: 'hsl(0 0% 4%)' }}>
          <Plus className="w-4 h-4" /> Novo membro
        </Button>
      </div>

      {isPinFallback && isFirstSetup && (
        <div className="rounded-lg border border-electric/40 bg-electric/5 p-4 text-sm">
          <strong className="text-electric">Setup inicial:</strong> você está no modo PIN. Crie agora o primeiro membro
          (admin master) para começar a usar login por usuário e senha.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : membros.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum membro cadastrado</TableCell></TableRow>
            ) : membros.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.nome}</TableCell>
                <TableCell className="font-mono text-sm">{m.username}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                <TableCell>
                  <Badge variant={m.status === 'ativo' ? 'default' : 'secondary'}
                    className={m.status === 'ativo' ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white border-0' : ''}>
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleStatus(m)} title={m.status === 'ativo' ? 'Desativar' : 'Ativar'}>
                      <Power className={`w-4 h-4 ${m.status === 'ativo' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(m)} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(m)}
                      disabled={meuMembro?.user_id === m.user_id} title="Excluir">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? 'Editar membro' : 'Novo membro'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Nome completo *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <Label>Nome de usuário *</Label>
                <Input value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })} />
              </div>
              <div>
                <Label>E-mail *</Label>
                <Input type="email" value={form.email} disabled={editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {editing && <p className="text-xs text-muted-foreground mt-1">E-mail não pode ser alterado</p>}
              </div>
              {!editing && (
                <div>
                  <Label>Senha * <span className="text-xs text-muted-foreground">(min. 6)</span></Label>
                  <div className="relative">
                    <Input type={showPwd ? 'text' : 'password'} value={form.senha}
                      onChange={(e) => setForm({ ...form, senha: e.target.value })} className="pr-10" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/40">
                <Switch checked={form.status === 'ativo'}
                  onCheckedChange={(v) => setForm({ ...form, status: v ? 'ativo' : 'inativo' })} />
                <span className="text-sm">Membro {form.status === 'ativo' ? 'ativo' : 'inativo'}</span>
              </div>
            )}

            <div>
              <Label className="text-base font-semibold">Permissões por módulo</Label>
              <div className="mt-2 space-y-2">
                {MODULOS.map(({ key, label, levels }) => (
                  <div key={key} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-background/40">
                    <span className="text-sm font-medium">{label}</span>
                    <Select value={form.permissoes[key]}
                      onValueChange={(v) => setForm({ ...form, permissoes: { ...form.permissoes, [key]: v } })}>
                      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
            <Button onClick={save} disabled={saving} style={{ background: 'var(--gradient-gold)', color: 'hsl(0 0% 4%)' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? 'Salvar alterações' : 'Criar membro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfiguracoesPage;

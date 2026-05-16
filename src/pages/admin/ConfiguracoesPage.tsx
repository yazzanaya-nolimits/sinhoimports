import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Pencil, Power, Loader2, X, Eye, EyeOff, Languages, Users, Palette, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth, type Modulo, type Membro } from '@/contexts/AuthContext';
import { MODULOS, defaultPermissoes } from '@/lib/permissions';
import { useTheme, THEME_META, type ThemeKey } from '@/contexts/ThemeContext';
import { useLanguage } from '@/hooks/useLanguage';
import { SUPPORTED_LANGS, type LangCode } from '@/i18n';

type FormState = {
  id?: string;
  user_id?: string;
  nome: string;
  username: string;
  senha: string;
  permissoes: Record<Modulo, string>;
  status: 'ativo' | 'inativo';
};

const empty = (): FormState => ({
  nome: '', username: '', senha: '',
  permissoes: defaultPermissoes(), status: 'ativo',
});

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { membro: meuMembro, isPinFallback } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  // ===== USERS =====
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

  const openNew = () => { setForm(empty()); setEditing(false); setShowPwd(false); setOpen(true); };
  const openEdit = (m: Membro) => {
    setForm({
      id: m.id, user_id: m.user_id,
      nome: m.nome, username: m.username, senha: '',
      permissoes: { ...defaultPermissoes(), ...m.permissoes },
      status: m.status,
    });
    setEditing(true); setOpen(true);
  };

  const save = async () => {
    if (!form.nome.trim() || !form.username.trim()) {
      toast({ title: 'Preencha nome e usuário', variant: 'destructive' });
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
          nome: form.nome, username: form.username,
          permissoes: form.permissoes, status: form.status,
        }).eq('id', form.id);
        if (error) throw new Error(error.message);
        toast({ title: t('settings.users.updated') });
      } else {
        const { data, error } = await supabase.functions.invoke('admin-create-membro', {
          body: {
            nome: form.nome, username: form.username,
            senha: form.senha, permissoes: form.permissoes,
          },
        });
        if (error) throw new Error(error.message);
        const result = data as { ok?: boolean; error?: string };
        if (result?.error) throw new Error(result.error);
        toast({ title: t('settings.users.created') });
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
    if (!confirm(t('settings.users.confirmDelete', { name: m.nome }))) return;
    const { data, error } = await supabase.functions.invoke('admin-delete-membro', {
      body: { user_id: m.user_id },
    });
    if (error || (data as { error?: string })?.error) {
      toast({ title: 'Erro', description: (data as { error?: string })?.error || error?.message, variant: 'destructive' });
      return;
    }
    toast({ title: t('settings.users.deleted') });
    fetchAll();
  };

  // ===== LANGUAGE =====
  const [langDraft, setLangDraft] = useState<LangCode>(language);
  useEffect(() => { setLangDraft(language); }, [language]);

  const saveLanguage = async () => {
    await setLanguage(langDraft);
    toast({ title: t('settings.language.saved') });
  };

  // ===== THEMES =====
  const [themeDraft, setThemeDraft] = useState<ThemeKey>(theme);
  useEffect(() => { setThemeDraft(theme); }, [theme]);

  const saveTheme = async () => {
    await setTheme(themeDraft, true);
    toast({ title: t('settings.themes.saved') });
  };

  const previewTheme = (key: ThemeKey) => {
    setThemeDraft(key);
    setTheme(key, false); // aplica visualmente sem persistir
  };

  const isFirstSetup = membros.length === 0;
  const isAdminRow = (m: Membro) => m.permissoes?.configuracoes === 'total';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gradient-gold">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="language" className="gap-2"><Languages className="w-4 h-4" />{t('settings.tabs.language')}</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" />{t('settings.tabs.users')}</TabsTrigger>
          <TabsTrigger value="themes" className="gap-2"><Palette className="w-4 h-4" />{t('settings.tabs.themes')}</TabsTrigger>
        </TabsList>

        {/* ===== LANGUAGE ===== */}
        <TabsContent value="language" className="mt-6">
          <Card className="p-6 space-y-5 max-w-2xl">
            <div>
              <h2 className="text-lg font-semibold">{t('settings.language.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings.language.desc')}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGS.map(l => {
                const active = langDraft === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => setLangDraft(l.code)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      active ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="text-3xl mb-2">{l.flag}</div>
                    <p className="font-semibold">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.code}</p>
                    {active && <Check className="w-4 h-4 text-primary mt-2" />}
                  </button>
                );
              })}
            </div>
            <Button onClick={saveLanguage} className="bg-gradient-gold text-primary-foreground">
              {t('settings.language.save')}
            </Button>
          </Card>
        </TabsContent>

        {/* ===== USERS ===== */}
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t('settings.users.title')}</h2>
            <Button onClick={openNew} className="gap-2 bg-gradient-gold text-primary-foreground">
              <Plus className="w-4 h-4" /> {t('settings.users.newMember')}
            </Button>
          </div>

          {isPinFallback && isFirstSetup && (
            <div className="rounded-lg border border-electric/40 bg-electric/5 p-4 text-sm">
              {t('settings.users.setupHint')}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('settings.users.username')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('common.loading')}</TableCell></TableRow>
                ) : membros.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('settings.users.noMembers')}</TableCell></TableRow>
                ) : membros.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {m.nome}
                        {isAdminRow(m) && (
                          <Badge className="bg-primary/20 text-primary border border-primary/40 text-[10px]">ADMIN</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{m.username}</TableCell>
                    <TableCell>
                      <Badge className={m.status === 'ativo'
                        ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white border-0'
                        : 'bg-secondary text-muted-foreground'}>
                        {m.status === 'ativo' ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => toggleStatus(m)}
                          title={m.status === 'ativo' ? t('settings.users.deactivate') : t('settings.users.activate')}>
                          <Power className={`w-4 h-4 ${m.status === 'ativo' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(m)} title={t('common.edit')}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(m)}
                          disabled={meuMembro?.user_id === m.user_id} title={t('common.delete')}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ===== THEMES ===== */}
        <TabsContent value="themes" className="mt-6">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">{t('settings.themes.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings.themes.desc')}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(Object.keys(THEME_META) as ThemeKey[]).map(key => {
                const meta = THEME_META[key];
                const active = themeDraft === key;
                return (
                  <div
                    key={key}
                    onClick={() => previewTheme(key)}
                    className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
                      active
                        ? 'border-primary shadow-2xl scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:scale-[1.01] hover:shadow-xl'
                    }`}
                  >
                    {/* Mini-preview do tema */}
                    <div
                      className="h-44 relative overflow-hidden"
                      style={{ background: meta.preview.bg }}
                    >
                      {/* mini sidebar */}
                      <div
                        className="absolute top-3 left-3 bottom-3 w-14 rounded-lg shadow-lg flex flex-col items-center pt-3 gap-1.5"
                        style={{ background: meta.preview.sidebar }}
                      >
                        <span className="w-7 h-1.5 rounded-full" style={{ background: meta.preview.primary, opacity: 0.9 }} />
                        <span className="w-7 h-1.5 rounded-full bg-white/40" />
                        <span className="w-7 h-1.5 rounded-full bg-white/30" />
                        <span className="w-7 h-1.5 rounded-full bg-white/20" />
                      </div>
                      {/* mini card */}
                      <div
                        className="absolute top-4 left-20 right-3 h-16 rounded-lg shadow-md p-2 flex flex-col justify-between"
                        style={{ background: meta.preview.card, border: `1px solid ${meta.preview.primary}33` }}
                      >
                        <span className="block w-2/3 h-2 rounded-full" style={{ background: meta.preview.text, opacity: 0.6 }} />
                        <span className="block w-12 h-3 rounded" style={{ background: meta.preview.primary }} />
                      </div>
                      {/* mini botão */}
                      <div
                        className="absolute bottom-4 left-20 right-3 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shadow"
                        style={{ background: `linear-gradient(135deg, ${meta.preview.primary}, ${meta.preview.accent})`, color: '#fff' }}
                      >
                        BOTÃO PREMIUM
                      </div>
                      {active && (
                        <div className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground p-1.5 shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Info + ação */}
                    <div className="p-4 bg-card space-y-3">
                      <div>
                        <p className="font-semibold flex items-center gap-2 text-card-foreground">
                          <span className="text-xl">{meta.emoji}</span>
                          {meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{meta.tagline}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <span className="w-5 h-5 rounded-full border border-border/60" style={{ background: meta.preview.bg }} />
                          <span className="w-5 h-5 rounded-full border border-border/60" style={{ background: meta.preview.primary }} />
                          <span className="w-5 h-5 rounded-full border border-border/60" style={{ background: meta.preview.accent }} />
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setThemeDraft(key); setTheme(key, true); toast({ title: t('settings.themes.saved') }); }}
                          className="btn-themed h-8 text-xs"
                          disabled={theme === key}
                        >
                          {theme === key ? t('settings.themes.current') : t('settings.themes.apply')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground flex-1">
                {t('settings.themes.current')}: <strong>{THEME_META[themeDraft].emoji} {THEME_META[themeDraft].label}</strong>
              </p>
              <Button
                variant="outline"
                onClick={() => { setTheme(theme, false); setThemeDraft(theme); }}
                disabled={themeDraft === theme}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={saveTheme} className="btn-themed">
                {t('settings.themes.apply')}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG NEW/EDIT MEMBER */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? t('settings.users.editMember') : t('settings.users.newMember')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>{t('settings.users.fullName')} *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <Label>{t('settings.users.username')} *</Label>
                <Input
                  value={form.username}
                  placeholder="ex: joao"
                  disabled={editing}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                />
                {!editing && <p className="text-xs text-muted-foreground mt-1">Apenas letras, números, _ . -</p>}
              </div>
              {!editing && (
                <div>
                  <Label>{t('settings.users.password')} * <span className="text-xs text-muted-foreground">({t('settings.users.passwordHint')})</span></Label>
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
                <span className="text-sm">
                  {t('settings.users.memberStatus', { status: form.status === 'ativo' ? t('common.active').toLowerCase() : t('common.inactive').toLowerCase() })}
                </span>
              </div>
            )}

            <div>
              <Label className="text-base font-semibold">{t('settings.users.permissionsTitle')}</Label>
              <div className="mt-2 space-y-2">
                {MODULOS.map(({ key, label, levels }) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-lg border border-border bg-background/40">
                    <span className="text-sm font-medium">{label}</span>
                    <Select value={form.permissoes[key]}
                      onValueChange={(v) => setForm({ ...form, permissoes: { ...form.permissoes, [key]: v } })}>
                      <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
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
              <X className="w-4 h-4 mr-1" /> {t('common.cancel')}
            </Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-gold text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfiguracoesPage;

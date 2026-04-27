import { useMemo, useState } from 'react';
import { Plus, Search, Download, Phone, Mail, Trash2, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useCrmLeads, STAGES, Lead, LeadStage } from '@/hooks/useCrmLeads';
import { downloadCSV } from '@/lib/csv';

const PIE_COLORS = ['#3b82f6', '#a855f7', '#eab308', '#f97316', '#d97706', '#0284c7', '#22c55e', '#ef4444'];

export default function CrmPage() {
  const { leads, createLead, updateLead, moveLead, deleteLead } = useCrmLeads();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [periodDays, setPeriodDays] = useState<string>('all');

  const [openNew, setOpenNew] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (search) {
        const q = search.toLowerCase();
        if (!l.nome.toLowerCase().includes(q) && !(l.telefone || '').toLowerCase().includes(q)) {
          return false;
        }
      }
      if (stageFilter !== 'all' && l.etapa !== stageFilter) return false;
      if (periodDays !== 'all') {
        const days = parseInt(periodDays);
        const limit = Date.now() - days * 24 * 60 * 60 * 1000;
        if (new Date(l.created_at).getTime() < limit) return false;
      }
      return true;
    });
  }, [leads, search, stageFilter, periodDays]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const fechados = leads.filter(l => l.etapa === 'negocio_fechado').length;
    const semInteresse = leads.filter(l => l.etapa === 'sem_interesse').length;
    const andamento = total - fechados - semInteresse;
    const conversao = total > 0 ? (fechados / total) * 100 : 0;
    return { total, fechados, andamento, conversao };
  }, [leads]);

  const chartByStage = useMemo(
    () => STAGES.map(s => ({ name: s.label, total: leads.filter(l => l.etapa === s.key).length })),
    [leads],
  );

  const chartByInterest = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach(l => {
      const k = l.interesse?.trim() || 'Sem interesse definido';
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const chartByDay = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    leads.forEach(l => {
      const k = l.created_at.slice(0, 10);
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, total]) => ({
      date: date.slice(5),
      total,
    }));
  }, [leads]);

  const handleDrop = async (etapa: LeadStage) => {
    const lead = leads.find(l => l.id === draggingId);
    setDraggingId(null);
    if (!lead) return;
    const { error } = await moveLead(lead, etapa);
    if (error) toast({ title: 'Erro ao mover lead', description: error.message, variant: 'destructive' });
  };

  const handleExport = () => {
    const rows = filteredLeads.map(l => ({
      nome: l.nome,
      telefone: l.telefone || '',
      email: l.email || '',
      interesse: l.interesse || '',
      etapa: STAGES.find(s => s.key === l.etapa)?.label || l.etapa,
      observacao: l.observacao || '',
      criado_em: new Date(l.created_at).toLocaleString('pt-BR'),
    }));
    downloadCSV(`crm_leads_${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gradient-gold">CRM Comercial</h1>
          <p className="text-sm text-muted-foreground">Acompanhe leads e oportunidades em tempo real.</p>
        </div>
        <Button onClick={() => setOpenNew(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total de leads</p>
          <p className="text-2xl font-bold">{metrics.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Negócios fechados</p>
          <p className="text-2xl font-bold text-green-500">{metrics.fechados}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Em andamento</p>
          <p className="text-2xl font-bold text-yellow-500">{metrics.andamento}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Taxa de conversão</p>
          <p className="text-2xl font-bold">{metrics.conversao.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            {STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={periodDays} onValueChange={setPeriodDays}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo período</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </Card>

      {/* Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => {
            const colLeads = filteredLeads.filter(l => l.etapa === stage.key);
            return (
              <div
                key={stage.key}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(stage.key)}
                className="w-72 flex-shrink-0 bg-card border border-border rounded-lg flex flex-col max-h-[70vh]"
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <span className="text-sm font-medium">{stage.label}</span>
                  </div>
                  <Badge variant="secondary">{colLeads.length}</Badge>
                </div>
                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                  {colLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingId(lead.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-3 bg-background border border-border rounded-md cursor-pointer hover:border-primary/50 transition-all ${
                        draggingId === lead.id ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{lead.nome}</p>
                          {lead.telefone && (
                            <p className="text-xs text-muted-foreground truncate">{lead.telefone}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!colLeads.length && (
                    <p className="text-xs text-muted-foreground text-center py-6">Vazio</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Leads por etapa</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartByStage}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Leads por interesse</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartByInterest} dataKey="value" nameKey="name" outerRadius={80} label>
                {chartByInterest.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">Novos leads (14 dias)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartByDay}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <NewLeadDialog open={openNew} onOpenChange={setOpenNew} onCreate={createLead} />

      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={updateLead}
        onDelete={id => setConfirmDelete(id)}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={o => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await deleteLead(confirmDelete);
                  setConfirmDelete(null);
                  setSelectedLead(null);
                  toast({ title: 'Lead excluído' });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewLeadDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (p: Partial<Lead>) => Promise<{ error: unknown }>;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Lead>>({ etapa: 'novo_contato' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.nome?.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await onCreate(form);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
      return;
    }
    toast({ title: 'Lead criado com sucesso!' });
    setForm({ etapa: 'novo_contato' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome completo *</Label>
            <Input value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Telefone / WhatsApp</Label>
            <Input value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Interesse / Produto</Label>
            <Input value={form.interesse || ''} onChange={e => setForm({ ...form, interesse: e.target.value })} />
          </div>
          <div>
            <Label>Observação inicial</Label>
            <Textarea
              rows={3}
              value={form.observacao || ''}
              onChange={e => setForm({ ...form, observacao: e.target.value })}
            />
          </div>
          <div>
            <Label>Coluna de entrada</Label>
            <Select value={form.etapa} onValueChange={(v: LeadStage) => setForm({ ...form, etapa: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar lead'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadDrawer({
  lead, onClose, onUpdate, onDelete,
}: {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Lead>) => Promise<{ error: unknown }>;
  onDelete: (id: string) => void;
}) {
  const { toast } = useToast();
  const [obs, setObs] = useState('');
  const [edit, setEdit] = useState<Partial<Lead>>({});

  // sync when opened
  useState(() => {
    if (lead) {
      setObs(lead.observacao || '');
      setEdit({ nome: lead.nome, telefone: lead.telefone, email: lead.email, interesse: lead.interesse });
    }
  });

  if (!lead) return null;

  const saveField = async (patch: Partial<Lead>) => {
    const { error } = await onUpdate(lead.id, patch);
    if (error) toast({ title: 'Erro ao salvar', variant: 'destructive' });
  };

  const openWhatsApp = () => {
    if (!lead.telefone) return;
    const phone = lead.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <Sheet open={!!lead} onOpenChange={o => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Lead</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Nome</Label>
            <Input
              defaultValue={lead.nome}
              onBlur={e => e.target.value !== lead.nome && saveField({ nome: e.target.value })}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              defaultValue={lead.telefone || ''}
              onBlur={e => saveField({ telefone: e.target.value })}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              defaultValue={lead.email || ''}
              onBlur={e => saveField({ email: e.target.value })}
            />
          </div>
          <div>
            <Label>Interesse</Label>
            <Input
              defaultValue={lead.interesse || ''}
              onBlur={e => saveField({ interesse: e.target.value })}
            />
          </div>
          <div>
            <Label>Etapa</Label>
            <Select value={lead.etapa} onValueChange={(v: LeadStage) => saveField({ etapa: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações (salva ao sair do campo)</Label>
            <Textarea
              rows={4}
              value={obs}
              onChange={e => setObs(e.target.value)}
              onBlur={() => obs !== lead.observacao && saveField({ observacao: obs })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={openWhatsApp} disabled={!lead.telefone} className="flex-1 gap-2">
              <Phone className="w-4 h-4" /> WhatsApp
            </Button>
            <Button variant="destructive" onClick={() => onDelete(lead.id)} className="gap-2">
              <Trash2 className="w-4 h-4" /> Excluir
            </Button>
          </div>

          <div>
            <Label>Histórico</Label>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border border-border rounded-md p-3">
              {(lead.historico || []).slice().reverse().map((h, i) => (
                <div key={i} className="text-xs border-l-2 border-primary/40 pl-2">
                  <p className="text-muted-foreground">{new Date(h.data).toLocaleString('pt-BR')}</p>
                  <p>
                    {h.acao}
                    {h.de && h.para && <> — <span className="text-muted-foreground">{h.de} → {h.para}</span></>}
                  </p>
                </div>
              ))}
              {!lead.historico?.length && (
                <p className="text-xs text-muted-foreground">Sem histórico ainda.</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

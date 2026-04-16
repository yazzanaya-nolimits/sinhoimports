import { useState } from 'react';
import { Plus, MessageCircle, Gift, Search, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { WHATSAPP_NUMBER } from '@/data/products';
import { formatBRL } from '@/lib/brl';

interface Client {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  address: string;
  spouseName: string;
  spouseBirthday: string;
  hasChildren: boolean;
  childrenBirthdays: string[];
  observation: string;
  lastPurchase?: string;
  lastProduct?: string;
  totalSpent: number;
}

const initialClients: Client[] = [
  { id: '1', name: 'Carlos Silva', phone: '11999887766', birthday: '1990-05-10', address: 'São Paulo, SP', spouseName: 'Ana Silva', spouseBirthday: '1992-05-15', hasChildren: true, childrenBirthdays: ['2020-04-25'], observation: 'Gosta de perfumes amadeirados', lastPurchase: '2026-04-10', lastProduct: 'Raghba - Lattafa', totalSpent: 569.70 },
  { id: '2', name: 'Mariana Costa', phone: '11988776655', birthday: '1985-04-25', address: 'Rio de Janeiro, RJ', spouseName: '', spouseBirthday: '', hasChildren: false, childrenBirthdays: [], observation: 'Coleciona relógios', lastPurchase: '2026-03-28', lastProduct: 'Submariner Date - Rolex', totalSpent: 14999.90 },
  { id: '3', name: 'Roberto Lima', phone: '21977665544', birthday: '1992-04-20', address: 'Belo Horizonte, MG', spouseName: 'Carla Lima', spouseBirthday: '1993-06-10', hasChildren: true, childrenBirthdays: ['2018-12-05', '2021-08-15'], observation: 'Prefere fragrâncias frescas', lastPurchase: '2026-04-05', lastProduct: 'Club de Nuit Intense', totalSpent: 219.90 },
];

const ClientsPage = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', birthday: '', address: '',
    spouseName: '', spouseBirthday: '', hasChildren: false,
    childrenBirthdays: [''], observation: '',
  });

  const addChild = () => setForm(f => ({ ...f, childrenBirthdays: [...f.childrenBirthdays, ''] }));
  const removeChild = (i: number) => setForm(f => ({ ...f, childrenBirthdays: f.childrenBirthdays.filter((_, idx) => idx !== i) }));
  const updateChild = (i: number, v: string) => setForm(f => ({ ...f, childrenBirthdays: f.childrenBirthdays.map((c, idx) => idx === i ? v : c) }));

  const addClient = () => {
    if (!form.name || !form.phone) {
      toast({ title: 'Nome e telefone são obrigatórios', variant: 'destructive' });
      return;
    }
    setClients(prev => [{
      id: String(Date.now()),
      name: form.name, phone: form.phone,
      birthday: form.birthday, address: form.address,
      spouseName: form.spouseName, spouseBirthday: form.spouseBirthday,
      hasChildren: form.hasChildren,
      childrenBirthdays: form.childrenBirthdays.filter(c => c),
      observation: form.observation,
      totalSpent: 0,
    }, ...prev]);
    setForm({ name: '', phone: '', birthday: '', address: '', spouseName: '', spouseBirthday: '', hasChildren: false, childrenBirthdays: [''], observation: '' });
    setShowForm(false);
    toast({ title: 'Cliente adicionado!' });
  };

  const sendBirthdayMsg = (name: string, phone: string) => {
    const msg = `Feliz aniversário, ${name}! 🎉 Ganhe 10% off na Sinho Imports! Fale conosco: https://wa.me/${WHATSAPP_NUMBER}`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const today = new Date();
  const isUpcoming = (dateStr: string) => {
    if (!dateStr) return false;
    const bd = new Date(dateStr + 'T12:00');
    const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    const diff = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  // Unified birthday list: client + spouse + children
  const allBirthdays: { label: string; date: string; phone: string; clientName: string }[] = [];
  clients.forEach(c => {
    if (isUpcoming(c.birthday)) allBirthdays.push({ label: c.name, date: c.birthday, phone: c.phone, clientName: c.name });
    if (c.spouseName && isUpcoming(c.spouseBirthday)) allBirthdays.push({ label: `${c.spouseName} (esposa de ${c.name})`, date: c.spouseBirthday, phone: c.phone, clientName: c.name });
    c.childrenBirthdays?.forEach((cb, i) => {
      if (isUpcoming(cb)) allBirthdays.push({ label: `Filho(a) ${i + 1} de ${c.name}`, date: cb, phone: c.phone, clientName: c.name });
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Clientes</h1>
        <Button size="sm" className="bg-gradient-gold text-primary-foreground" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif flex justify-between">
              <span className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Novo Cliente</span>
              <Button size="icon" variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} />
              <Input placeholder="Telefone/WhatsApp *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={15} />
              <div>
                <label className="text-xs text-muted-foreground">Aniversário</label>
                <Input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
              </div>
              <Input placeholder="Endereço" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} maxLength={200} />
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="font-semibold text-sm">Família</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="Nome da Esposa" value={form.spouseName} onChange={e => setForm(f => ({ ...f, spouseName: e.target.value }))} maxLength={100} />
                <div>
                  <label className="text-xs text-muted-foreground">Aniversário Esposa</label>
                  <Input type="date" value={form.spouseBirthday} onChange={e => setForm(f => ({ ...f, spouseBirthday: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.hasChildren} onCheckedChange={v => setForm(f => ({ ...f, hasChildren: v }))} />
                <Label>Tem Filhos</Label>
              </div>

              {form.hasChildren && (
                <div className="space-y-2">
                  {form.childrenBirthdays.map((cb, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Filho(a) {i + 1}</label>
                      <Input type="date" value={cb} onChange={e => updateChild(i, e.target.value)} className="flex-1" />
                      {form.childrenBirthdays.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeChild(i)}><X className="w-3 h-3" /></Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addChild}>
                    <Plus className="mr-1 h-3 w-3" /> Adicionar Filho
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Observação</label>
              <Textarea placeholder="Ex: Gosta de perfumes doces..." value={form.observation} onChange={e => setForm(f => ({ ...f, observation: e.target.value }))} maxLength={500} rows={2} />
            </div>

            <div className="flex gap-2">
              <Button className="bg-gradient-gold text-primary-foreground" onClick={addClient}>Salvar</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="aniversarios">
            <Gift className="mr-1 h-4 w-4" /> Aniversários ({allBirthdays.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Última Compra</TableHead>
                      <TableHead>Último Produto</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="text-right">Total Gasto</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            {c.spouseName && <p className="text-xs text-muted-foreground">💍 {c.spouseName}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>
                          {c.lastPurchase ? new Date(c.lastPurchase + 'T12:00').toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.lastProduct || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{c.observation || '-'}</TableCell>
                        <TableCell className="text-right text-primary font-bold">{formatBRL(c.totalSpent)}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" asChild>
                            <a href={`https://wa.me/55${c.phone}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aniversarios">
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Aniversários nos Próximos 30 Dias (Todos)</CardTitle></CardHeader>
            <CardContent>
              {allBirthdays.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum aniversário nos próximos 30 dias.</p>
              ) : (
                <div className="space-y-3">
                  {allBirthdays.map((b, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-lg p-4">
                      <div>
                        <p className="font-medium">{b.label}</p>
                        <p className="text-sm text-muted-foreground">
                          🎂 {new Date(b.date + 'T12:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => sendBirthdayMsg(b.label.split(' (')[0], b.phone)}>
                        <Gift className="mr-2 h-4 w-4" /> Enviar Parabéns
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsPage;

import { useState } from 'react';
import { Plus, MessageCircle, Gift, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { WHATSAPP_NUMBER } from '@/data/products';

interface Client {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  address: string;
  lastPurchase?: string;
  lastProduct?: string;
  totalSpent: number;
}

const initialClients: Client[] = [
  { id: '1', name: 'Carlos Silva', phone: '11999887766', birthday: '1990-05-10', address: 'São Paulo, SP', lastPurchase: '2026-04-10', lastProduct: 'Raghba - Lattafa', totalSpent: 569.70 },
  { id: '2', name: 'Mariana Costa', phone: '11988776655', birthday: '1985-04-25', address: 'Rio de Janeiro, RJ', lastPurchase: '2026-03-28', lastProduct: 'Submariner Date - Rolex', totalSpent: 14999.90 },
  { id: '3', name: 'Roberto Lima', phone: '21977665544', birthday: '1992-04-20', address: 'Belo Horizonte, MG', lastPurchase: '2026-04-05', lastProduct: 'Club de Nuit Intense', totalSpent: 219.90 },
];

const ClientsPage = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', birthday: '', address: '' });

  const addClient = () => {
    if (!form.name || !form.phone) {
      toast({ title: 'Nome e telefone são obrigatórios', variant: 'destructive' });
      return;
    }
    setClients(prev => [{
      id: String(Date.now()),
      name: form.name, phone: form.phone,
      birthday: form.birthday, address: form.address,
      totalSpent: 0,
    }, ...prev]);
    setForm({ name: '', phone: '', birthday: '', address: '' });
    setShowForm(false);
    toast({ title: 'Cliente adicionado!' });
  };

  const sendBirthdayMsg = (client: Client) => {
    const msg = `Feliz aniversário, ${client.name}! 🎉 Ganhe 10% off na Sinho Imports! Fale conosco: https://wa.me/${WHATSAPP_NUMBER}`;
    window.open(`https://wa.me/55${client.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const today = new Date();
  const birthdaysNext30 = clients.filter(c => {
    if (!c.birthday) return false;
    const bd = new Date(c.birthday + 'T12:00');
    const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    const diff = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
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
          <CardHeader><CardTitle className="text-lg font-serif">Novo Cliente</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Nome *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} />
              <Input placeholder="Telefone/WhatsApp *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={15} />
              <Input type="date" placeholder="Aniversário" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
              <Input placeholder="Endereço" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} maxLength={200} />
            </div>
            <div className="flex gap-2 mt-4">
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
            <Gift className="mr-1 h-4 w-4" /> Aniversários ({birthdaysNext30.length})
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
                      <TableHead className="text-right">Total Gasto</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>
                          {c.lastPurchase ? (
                            <span className="text-sm">
                              {new Date(c.lastPurchase + 'T12:00').toLocaleDateString('pt-BR')}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.lastProduct || '-'}</TableCell>
                        <TableCell className="text-right text-primary font-bold">R$ {c.totalSpent.toFixed(2)}</TableCell>
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
            <CardHeader><CardTitle className="text-lg font-serif">Aniversários nos Próximos 30 Dias</CardTitle></CardHeader>
            <CardContent>
              {birthdaysNext30.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum aniversário nos próximos 30 dias.</p>
              ) : (
                <div className="space-y-3">
                  {birthdaysNext30.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-4">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          🎂 {new Date(c.birthday + 'T12:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => sendBirthdayMsg(c)}>
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockProducts, CATEGORIES } from '@/data/products';
import { formatBRL } from '@/lib/brl';

const monthlySales = [
  { month: 'Nov', vendas: 18500 },
  { month: 'Dez', vendas: 32000 },
  { month: 'Jan', vendas: 21000 },
  { month: 'Fev', vendas: 25500 },
  { month: 'Mar', vendas: 28000 },
  { month: 'Abr', vendas: 19000 },
];

const topProducts = mockProducts
  .map(p => ({ ...p, totalSold: Math.floor(Math.random() * 50) + 5, totalRevenue: 0 }))
  .map(p => ({ ...p, totalRevenue: p.totalSold * p.sellPrice }))
  .sort((a, b) => b.totalSold - a.totalSold);

const ReportsPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-serif font-bold">Relatórios</h1>

    <Card>
      <CardHeader><CardTitle className="text-lg font-serif">Vendas Mensais</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySales}>
            <XAxis dataKey="month" stroke="hsl(0,0%,55%)" fontSize={12} />
            <YAxis stroke="hsl(0,0%,55%)" fontSize={12} />
            <Tooltip formatter={(value: number) => formatBRL(value)} />
            <Line type="monotone" dataKey="vendas" stroke="hsl(43, 72%, 55%)" strokeWidth={3} dot={{ fill: 'hsl(43, 72%, 55%)' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle className="text-lg font-serif">Top Produtos por Saída</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts.slice(0, 6)} layout="vertical">
            <XAxis type="number" stroke="hsl(0,0%,55%)" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="hsl(0,0%,55%)" fontSize={11} width={120} />
            <Tooltip formatter={(value: number) => `${value} un.`} />
            <Bar dataKey="totalSold" fill="hsl(43, 72%, 55%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle className="text-lg font-serif">Detalhamento de Produtos</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Vendas (un.)</TableHead>
                <TableHead className="text-right">Receita Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-primary">{i + 1}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>{CATEGORIES[p.category]}</TableCell>
                  <TableCell className="text-right">{p.totalSold}</TableCell>
                  <TableCell className="text-right text-primary font-bold">{formatBRL(p.totalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ReportsPage;

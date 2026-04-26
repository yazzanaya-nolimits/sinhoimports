# Painel de Gestão de Produtos com Supabase Realtime

## Contexto

O frontend do painel já está 100% implementado (formulário completo com cupom, upload, status, listagem em cards, toggle, edição, exclusão, busca, badges de desconto, validação de cupom em tempo real, Realtime subscribe). **O que falta é o backend**: o Lovable Cloud nunca foi ativado, então não existe a tabela `produtos`, nem o bucket de storage, nem as credenciais Supabase. É por isso que o painel hoje aparenta não persistir nada.

## O que será feito

### 1. Ativar Lovable Cloud
Provisiona automaticamente: banco PostgreSQL, Storage, credenciais (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) e Realtime. O `src/lib/supabase.ts` será ajustado para usar o client gerado pelo Cloud.

### 2. Migração SQL — tabela `produtos`
Cria a tabela exatamente com os campos do prompt:

```text
id                    uuid PK (gen_random_uuid)
nome                  text NOT NULL
descricao             text
valor                 numeric(10,2) NOT NULL
foto_url              text
imagem_destaque_url   text
cupom_codigo          text
cupom_tipo            text CHECK ('percentual' | 'fixo')
cupom_valor           numeric(10,2)
cupom_validade        date
status                text DEFAULT 'ativo' CHECK ('ativo' | 'inativo')
created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()
```

- Trigger `update_updated_at` para manter `updated_at`.
- Tabela adicionada à publicação `supabase_realtime` para Realtime funcionar.
- `REPLICA IDENTITY FULL` para receber payloads completos.

### 3. RLS (Row Level Security)
- **SELECT público**: qualquer visitante lê produtos `ativo` (a página inicial precisa funcionar sem login).
- **INSERT/UPDATE/DELETE**: apenas `authenticated`. Como o admin atual usa PIN no `localStorage` (não auth Supabase), a forma mais simples e segura é **manter políticas permissivas para anon temporariamente** OU migrar o admin para Supabase Auth. Ver decisão abaixo.

### 4. Storage — bucket `produtos`
- Bucket público `produtos`.
- Policies: leitura pública; upload/delete liberado (consistente com a estratégia de RLS escolhida).
- Limites no client já existentes: 5MB, JPG/PNG/WebP.

### 5. Pequenos ajustes de código (sem mexer em outras seções)
- `src/lib/supabase.ts`: usar o client integrado do Lovable Cloud.
- `useSupabaseProducts`: filtrar por `status` no SELECT público + trocar `Math.random()` no nome do arquivo por `crypto.randomUUID()` para evitar colisões.
- `ProductsSection`: ordenar por `created_at desc` para refletir cadastros recentes primeiro.
- Adicionar **preview do produto em tempo real** ao lado do formulário de cadastro (o prompt pede explicitamente; hoje só há thumbnail).
- Adicionar ordenação (nome / valor / data) na listagem do painel.

### Itens já prontos que NÃO precisam de mudança
- Validação de cupom (código/tipo/validade, mensagens "Cupom inválido"/"Cupom expirado").
- Badge "X% OFF" / "R$ X OFF" no card público.
- Toggle ativo/inativo, botão editar/excluir.
- Realtime subscription via `postgres_changes`.
- Toast "Produto salvo e publicado com sucesso!".
- Proteção do painel via `RequireAdmin` (PIN 2572) já existente.

## Decisão necessária — Autenticação do painel

O painel hoje é protegido apenas por PIN 2572 no localStorage. Para o Supabase aceitar inserções/uploads, preciso escolher:

**Opção A (rápida, recomendada para MVP):** RLS permissiva (anon pode escrever). Mantém o fluxo PIN atual sem fricção. **Risco:** qualquer pessoa com a anon key pode escrever via API. Aceitável para um catálogo interno pequeno.

**Opção B (segura, mais trabalho):** Migrar o login admin para Supabase Auth (email/senha do dono). RLS exige `authenticated`. Tela de PIN vira tela de login.

Vou seguir com **Opção A** salvo instrução em contrário — é o que mais se aproxima de "manter a autenticação já existente" mencionada no prompt.

## Detalhes técnicos

- Migração SQL com `CREATE TABLE`, trigger `BEFORE UPDATE`, `ALTER PUBLICATION supabase_realtime ADD TABLE produtos`.
- Bucket criado via `INSERT INTO storage.buckets`.
- Policies em `storage.objects` para o bucket `produtos`.
- Sem alteração em: Hero, Footer, Navbar, About, Testimonials, Contact, PDV, Clients, Financial, Reports, SiteManagement, Themes.

## Observação sobre GitHub
"Commit e push automático" não se aplica ao Lovable — o versionamento é gerenciado internamente pela plataforma e sincroniza com o GitHub conectado automaticamente após cada alteração. Não há comando manual a rodar.

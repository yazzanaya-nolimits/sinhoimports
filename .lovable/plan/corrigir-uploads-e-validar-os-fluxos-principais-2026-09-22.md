# Corrigir uploads e validar os fluxos principais

## Objetivo
Restabelecer o envio de fotos sem abrir permissões públicas inseguras e verificar os principais caminhos do site e do painel.

## Implementação

1. **Corrigir a autenticação do envio de fotos**
   - Manter leitura pública das imagens.
   - Exigir sessão administrativa real para inserir, substituir ou excluir arquivos.
   - Quando o painel estiver aberto pelo PIN legado, bloquear apenas as ações que precisam gravar dados e mostrar uma orientação clara para entrar com usuário e senha.
   - Alinhar as permissões das páginas “Imagens do Site” e “Fotos do Carrossel” com o módulo de Catálogo usado pelo menu.

2. **Melhorar o fluxo de upload**
   - Centralizar validação de JPG, PNG e WebP até 5 MB.
   - Mostrar o erro real quando o envio falhar, em vez da mensagem genérica atual.
   - Limpar o seletor corretamente após falha/cancelamento e liberar nova tentativa.
   - Exibir progresso, prévia e confirmação de sucesso sem travar outros botões.
   - Remover do armazenamento o arquivo recém-enviado quando o registro da galeria não puder ser salvo, evitando arquivos órfãos.

3. **Corrigir operações da galeria**
   - Tratar erros ao adicionar, remover, ativar/desativar e reordenar.
   - Confirmar exclusões e remover também o arquivo correspondente quando for seguro.
   - Atualizar a tela imediatamente após cada operação bem-sucedida.
   - Manter compatibilidade com as imagens já cadastradas na estrutura antiga.

4. **Varredura funcional**
   - Validar site público, catálogo, detalhes do produto e início do pagamento.
   - Validar login, navegação do painel, produtos, capa, carrossel e banner.
   - Conferir celular e desktop, erros do navegador, chamadas de rede e estado final da página.
   - Corrigir somente falhas reproduzidas nos fluxos acima; outras descobertas serão relatadas sem ampliar o escopo.

5. **Verificação final**
   - Confirmar integridade do código e ausência de erros na prévia.
   - Executar um upload real autenticado e remover somente o arquivo de teste ao terminar.
   - Não alterar produtos, imagens ou dados comerciais existentes.

## Observação de segurança
O PIN continuará disponível como acesso legado, mas não substituirá uma sessão autenticada nas gravações protegidas. Liberar uploads anônimos faria qualquer visitante poder alterar as imagens do site e não será usado.

# Manual do Usuário – Sistema de Armários Hospitalares

## 1. Objetivo do sistema
O Sistema de Armários Hospitalares foi criado para controlar, em tempo real, o uso de armários destinados a visitantes e acompanhantes. A ferramenta permite:

- acompanhar rapidamente quais armários estão livres, ocupados ou com devolução atrasada;
- registrar novos empréstimos para visitantes e acompanhantes;
- aplicar e acompanhar termos de responsabilidade;
- registrar movimentações de pertences e liberar armários com segurança;
- manter cadastros de armários físicos, unidades do hospital e usuários que operam o sistema;
- consultar logs de atividades e notificações automáticas sobre horários críticos.

## 2. O que você precisa antes de começar
- **Computador, tablet ou celular** com acesso à internet.
- **Navegador atualizado** (recomenda-se Google Chrome, Edge, Firefox ou Safari).
- **Link de acesso ao sistema** fornecido pela equipe de TI do hospital.
- **Conta autorizada** (quando o sistema estiver publicado no Google Apps Script, pode ser necessário fazer login com o e-mail institucional para registrar os dados em planilhas).

> Caso o sistema esteja sendo executado em modo de demonstração (sem conexão com a planilha Google), os dados exibidos são exemplos. Registros feitos nesse modo não ficam salvos após atualizar a página.

## 3. Conhecendo a tela principal
Ao abrir o sistema, você verá três áreas principais:

1. **Menu lateral (à esquerda)** – possui atalhos para todas as telas: Dashboard, Visitantes, Acompanhantes, históricos, Termos de Responsabilidade, Cadastros e Logs.
2. **Cabeçalho superior** – exibe o título da página, permite escolher o *Perfil* (Visitante, Acompanhante, Ambos ou Administrador) e a *Unidade* desejada, além do sino de notificações e da identificação do usuário.
3. **Conteúdo principal** – área onde são mostrados os cartões, tabelas e formulários de cada página.

### Seletores de Perfil e Unidade
- O seletor **Perfil** define quais armários aparecem (apenas visitantes, apenas acompanhantes ou ambos). Para usuários com privilégios de administrador, deixe em "Administrador" para enxergar tudo.
- O seletor **Unidade** filtra os dados por unidade hospitalar. Escolha "Todas as unidades" para visualizar o panorama completo.

### Painel de notificações
- Clique no sino no canto superior direito para abrir ou fechar a lista de notificações.
- O número sobre o sino mostra quantos alertas estão ativos. Alertas vermelhos indicam armários vencidos; amarelos indicam armários próximos do horário limite.

## 4. Dashboard – visão geral rápida
A página **Dashboard** abre por padrão e apresenta:

- **Cartões de indicadores**: mostram a quantidade de armários livres, em uso, próximos do horário de devolução e vencidos.
- **Filtros rápidos**: botões logo abaixo dos cartões permitem listar apenas armários de um status específico.
- **Grade de armários**: cada armário aparece como um cartão com número, status, unidade, responsável, paciente e horários. Se um armário tiver termo aplicado, clicar no cartão abre o termo correspondente.

Use o Dashboard para decidir prioridades de atendimento: trate primeiro armários "Vencidos", depois "Próximo do horário".

## 5. Gestão de armários para Visitantes e Acompanhantes
As páginas **Visitantes** e **Acompanhantes** têm funcionamento semelhante. Cada uma apresenta uma tabela com os armários em uso, seus responsáveis e botões de ação.

### 5.1. Registrar um novo armário
1. Acesse a página desejada pelo menu lateral.
2. Clique no botão **Novo Cadastro** no canto superior direito da tabela.
3. Preencha o formulário exibido:
   - **Nome do Visitante/Acompanhante**
   - **Nome do Paciente**
   - **Leito**
   - **Quantidade de Volumes**
   - **Hora prevista de saída** (apenas para visitantes; o campo aparece automaticamente quando necessário)
4. Confirme em **Salvar**. O sistema cria um registro com status “em uso” e o armário passa a aparecer nas tabelas e no Dashboard.

> Dica: utilize sempre dados completos para facilitar buscas futuras (por exemplo, informe nome e sobrenome do responsável e do paciente).

### 5.2. Aplicar o termo de responsabilidade
1. Localize o armário na tabela.
2. Clique no botão **Termo** da linha desejada.
3. Siga o assistente de 3 passos:
   - **Passo 1 – Dados do paciente**: informe nome, prontuário, data de nascimento, setor, leito e se o paciente está consciente.
   - **Passo 2 – Dados do acompanhante**: informe nome, telefone, documento e parentesco. Utilize o botão **Adicionar orientação** para registrar instruções passadas ao responsável.
   - **Passo 3 – Volumes armazenados**: registre cada volume com quantidade e descrição usando **Novo volume** e escreva um resumo final no campo de texto.
4. Clique em **Avançar** em cada etapa. No último passo, o botão muda para **Aplicar termo**. Ao concluir, o sistema confirma que o termo foi registrado.
5. Após aplicar o termo, o armário passa a aparecer também na página **Termo de Responsabilidade**.

### 5.3. Liberar (encerrar) um armário
1. Na tabela de Visitantes, Acompanhantes ou na página de Termos, clique em **Liberar** na linha do armário.
2. Revise os dados do paciente e do responsável apresentados.
3. Escolha o método de confirmação:
   - **Assinatura digital**: peça ao responsável para assinar diretamente no campo exibido. Use **Limpar assinatura** se precisar começar de novo.
   - **5 primeiros dígitos do CPF**: selecione essa opção e informe os números solicitados.
4. Arraste o controle deslizante até o fim para confirmar a identificação.
5. Marque a caixa de confirmação indicando que as responsabilidades foram esclarecidas.
6. O botão **Confirmar liberação** ficará ativo. Clique nele para encerrar o vínculo. O armário volta ao status “livre” e sai da lista de termos ativos.

### 5.4. Registrar movimentações de pertences
1. Acesse a página **Termo de Responsabilidade**.
2. Clique em **Movimentações** na linha do armário desejado.
3. Utilize o formulário para registrar entradas, saídas ou conferências de pertences:
   - Informe o tipo de movimentação, uma descrição clara, o responsável, data e hora.
   - Clique em **Adicionar movimentação**. As movimentações cadastradas aparecem na lista acima do formulário.

Registrar cada movimentação ajuda a rastrear objetos armazenados e quem realizou alterações.

## 6. Históricos
As páginas **Histórico Visitantes** e **Histórico Acompanhantes** exibem registros finalizados, com horários de início e fim, status e volumes. São úteis para consultas e auditorias. Os dados são preenchidos automaticamente quando um armário é liberado.

## 7. Cadastros administrativos
As páginas a seguir são voltadas para usuários com perfil administrativo.

### 7.1. Cadastro de armários físicos
- Clique em **Novo Armário** para abrir o assistente de cadastro em lote.
- Preencha as informações gerais: tipo (visitante/acompanhante), unidade, localização, prefixo e zeros à esquerda.
- Escolha o método de numeração:
  - **Número único** – cadastra apenas um armário específico.
  - **Sequência automática** – gera vários números contínuos. Informe quantidade e número inicial.
  - **Intervalo numérico** – cria armários do número inicial ao final indicado.
- A pré-visualização mostra exemplos dos números que serão criados.
- Confirme em **Cadastrar**. Um alerta final lista os armários adicionados.

Se precisar remover um armário físico, use o botão **Remover** na tabela. Isso apenas tira o item da lista atual; verifique com a TI antes de excluir armários já em uso na planilha oficial.

### 7.2. Cadastro de unidades
- Clique em **Nova Unidade**, informe o nome e confirme em **Salvar**.
- Para ativar ou inativar uma unidade, use o botão **Alternar status** na tabela.
- A lista de unidades alimenta o filtro do cabeçalho e os formulários de cadastro de armários.

### 7.3. Gestão de usuários
- Clique em **Novo Usuário** para abrir o formulário.
- Informe nome completo, e-mail e perfil (Usuário ou Administrador).
- Defina se o usuário terá acesso aos módulos de Visitantes e/ou Acompanhantes marcando as caixas correspondentes.
- Salve para adicionar à lista. Utilize o botão **Remover** para desativar um usuário (no modo integrado, a exclusão permanente deve ser confirmada com a equipe de TI).

### 7.4. Logs do sistema
A página **Logs** mostra quem realizou cada ação e quando. É apenas para leitura e serve como trilha de auditoria.

## 8. Boas práticas de uso
- Atualize o Dashboard periodicamente para garantir que as informações refletem a situação real.
- Sempre aplique o termo de responsabilidade antes de liberar o armário para uso.
- Registre movimentações assim que ocorrerem – isso evita dúvidas sobre pertences.
- Utilize descrições claras nos campos de observação.
- Ao liberar um armário, garanta que o responsável leu e aceitou as orientações antes de confirmar.
- Mantenha a lista de unidades e armários físicos atualizada para evitar duplicidades.

## 9. Solução de problemas
| Situação | Como resolver |
| --- | --- |
| Dados somem ao atualizar a página | Provavelmente o sistema está em modo de demonstração. Solicite à TI a publicação no Google Apps Script/Planilha oficial. |
| Botões não respondem | Atualize a página. Se continuar, limpe o cache do navegador ou troque de navegador. |
| Notificações não aparecem | Verifique se existem armários “em uso” com hora prevista próxima ou vencida. No modo demonstração os alertas seguem dados fictícios. |
| Não consigo confirmar liberação | Certifique-se de que o controle deslizante chegou a 100%, a caixa de confirmação está marcada e o método de confirmação foi preenchido (assinatura ou CPF). |
| Desejo alterar um cadastro antigo | Utilize as tabelas correspondentes. Para exclusões permanentes, contate a equipe de TI responsável pela planilha oficial. |

## 10. Contato e suporte
Em caso de dúvidas, problemas técnicos ou necessidade de treinamento, contate a equipe de TI/Núcleo de Armários informando:
- Seu nome e unidade;
- Número do armário envolvido;
- Descrição do problema e horário em que ocorreu;
- Capturas de tela, se possível.

Manter o suporte informado ajuda a garantir o bom funcionamento do sistema para toda a equipe.

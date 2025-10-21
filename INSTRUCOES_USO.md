# Instruções de Uso do Sistema de Armários

## Pré-requisitos

- Conta Google com acesso ao Google Drive, Google Planilhas e Google Apps Script.
- Permissão para criar arquivos no Drive da conta utilizada.

## Importando o código para o Google Apps Script

1. Acesse [https://script.google.com](https://script.google.com) e clique em **Novo projeto**.
2. Renomeie o projeto para algo fácil de identificar, por exemplo `Armários NAC`.
3. Substitua o conteúdo do arquivo padrão `Code.gs` pelo arquivo [`Code.gs`](Code.gs) deste repositório.
4. Adicione um novo arquivo **HTML** chamado `index` e copie o conteúdo de [`index.html`](index.html).
5. Salve as alterações.

> Dica: caso prefira utilizar o editor tradicional de planilha vinculada, basta abrir a planilha desejada e escolher **Extensões ▶ Apps Script**. O código funciona tanto em projetos vinculados quanto independentes.

## Configuração automática da planilha

- Ao executar o sistema pela primeira vez, se não houver uma planilha vinculada, uma planilha chamada `Sistema Armários Hospitalares - AAAAMMDD_HHMMSS` será criada automaticamente no Drive.
- O ID da planilha criada é salvo em `PropertiesService` para uso futuro. Não é necessário editar o código para começar.
- Para utilizar uma planilha já existente, basta preencher a constante `PLANILHA_ID` em `Code.gs` com o ID correspondente (a parte da URL entre `/d/` e `/edit`).

## Definindo a pasta para os PDFs

Os termos de responsabilidade são gerados como PDFs. Para organizar os arquivos:

1. Crie uma pasta no Google Drive onde os PDFs serão armazenados.
2. Copie o ID da pasta (parte final da URL ao abrir a pasta).
3. Atualize a constante `PASTA_DRIVE_ID` em `Code.gs` com esse ID.
4. Caso o ID não seja informado ou a pasta não exista, os PDFs serão gravados na raiz do Drive.

## Publicando o aplicativo web

1. No editor do Apps Script, clique em **Implantar ▶ Nova implantação**.
2. Selecione o tipo **Aplicativo da Web**.
3. Defina uma descrição, escolha **Executar como: Você** e, em **Quem tem acesso**, selecione *Qualquer pessoa com o link* (ou o nível desejado).
4. Clique em **Implantar** e autorize as permissões solicitadas pelo Google.
5. Copie a URL gerada. Essa é a URL que deve ser utilizada para acessar o sistema.

> Importante: abrir o arquivo `index.html` diretamente no navegador não funcionará porque o frontend depende da API `google.script.run`, disponível apenas dentro de um aplicativo web do Apps Script.

## Primeiro acesso

1. Acesse a URL publicada do aplicativo web.
2. Na primeira execução o sistema solicitará permissões e criará automaticamente a planilha com todas as abas necessárias.
3. Aguarde o carregamento inicial. Os armários de exemplo, usuários e unidades serão inseridos para facilitar os testes.
4. Utilize os botões da interface para cadastrar armários físicos, registrar visitantes/acompanhantes e gerar termos.

## Configurações opcionais

- **Usar outra planilha**: informe o ID em `PLANILHA_ID` ou configure `PropertiesService` com a chave `PLANILHA_ID`.
- **Recriar a estrutura**: utilize a ação "Inicializar base" no menu (ou execute manualmente a função `inicializarPlanilha` pelo Apps Script).
- **Auditoria**: todos os eventos são registrados na aba `LOGS`. Esta aba é criada automaticamente durante a inicialização.

## Solução de problemas

- **Mensagem `google.script.run indisponível`**: acesse o sistema apenas pela URL do aplicativo web implantado. Essa mensagem indica que o HTML foi aberto fora do ambiente do Apps Script.
- **Erro informando que a planilha não foi encontrada**: confirme se o ID configurado ainda é válido. Se tiver dúvidas, deixe `PLANILHA_ID` vazio para que o sistema gere uma nova planilha automaticamente.
- **Sem PDFs gerados**: confira se o ID da pasta informado em `PASTA_DRIVE_ID` é válido. Caso contrário, os arquivos serão enviados para a raiz do Drive.

Em caso de dúvidas adicionais, consulte o código-fonte e os comentários presentes em [`Code.gs`](Code.gs), que detalham cada função disponível.

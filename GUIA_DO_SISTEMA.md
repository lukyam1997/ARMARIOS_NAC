# Guia do Sistema de Armários Hospitalares

Este guia explica passo a passo como usar o sistema web de controle de armários hospitalares. O conteúdo foi escrito para pessoas sem experiência prévia em tecnologia, então siga cada etapa com calma. Sempre que aparecer a palavra **clique**, significa apertar o botão com o mouse ou tocar no botão, caso você esteja usando uma tela sensível ao toque.

## 1. Conhecendo a tela inicial

A imagem abaixo mostra a página principal do sistema. Os números na imagem correspondem às áreas descritas logo depois.

![Visão geral do painel do sistema](browser:/invocations/bjhpogkj/artifacts/artifacts/dashboard.png)

1. **Menu lateral (lado esquerdo):** lista de seções como *Dashboard*, *Visitantes*, *Acompanhantes* e outras.
2. **Cabeçalho:** mostra o título da tela atual, permite escolher o *Perfil* (tipo de usuário) e a *Unidade* (setor do hospital). Também fica o sino de notificações e os dados do usuário logado.
3. **Painel principal:** exibe gráficos, listas de armários e botões para cadastrar novas pessoas ou unidades.
4. **Painel de filtros:** botões para mostrar apenas armários livres, em uso, próximos do horário limite ou vencidos.

> **Dica:** Se algum texto estiver muito pequeno, use o atalho `Ctrl` + `+` (ou `⌘` + `+` no Mac) para aumentar o zoom do navegador.

## 2. Navegação geral

- **Trocar de seção:** clique no nome da seção dentro do menu lateral. O item selecionado fica destacado em azul.
- **Voltar para o início:** clique em *Dashboard* no menu lateral a qualquer momento.
- **Ver notificações:** clique no sino no canto superior direito. O número vermelho mostra quantas notificações novas existem.
- **Trocar unidade ou perfil:** use os menus suspensos (*Perfil* e *Unidade*) no cabeçalho. O sistema atualiza a página automaticamente.

## 3. Seções e funcionalidades

### 3.1 Dashboard

- Mostra um resumo dos armários, incluindo gráficos e contadores.
- Use os botões de filtro para destacar armários específicos.
- Ao clicar em um cartão de armário, aparecem informações detalhadas (quando disponíveis).

### 3.2 Visitantes

- Lista todos os armários destinados a visitantes.
- Cada linha da tabela mostra o número do armário, unidade, status e dados do visitante/paciente.
- Para registrar um novo visitante, clique em **Novo Cadastro** e preencha o formulário exibido.
- No menu de ações de cada linha (ícone de três pontos), você pode atualizar dados, registrar devoluções ou encerrar o uso do armário.

### 3.3 Acompanhantes

- Funciona de maneira muito parecida com a tela de visitantes.
- Para abrir um novo armário para acompanhantes, use o botão **Novo Cadastro**.
- Também é possível gerar termos de responsabilidade e registrar movimentações.

### 3.4 Histórico (Visitantes e Acompanhantes)

- Mostra os registros finalizados.
- Permite consultar datas de início e fim, quantidade de volumes e status final.
- Útil para auditorias ou para confirmar se um armário foi devolvido corretamente.

### 3.5 Termo de Responsabilidade

- Exibe somente armários de acompanhantes que possuem termo ativo.
- O botão de ações abre o termo para impressão ou assinatura, conforme o fluxo adotado pelo hospital.
- O painel também mostra as movimentações associadas.

### 3.6 Cadastro de Armários

- Lista todos os armários disponíveis na instituição.
- Use **Novo Armário** para registrar armários recém-instalados.
- Em cada linha é possível editar dados como localização ou status.

### 3.7 Cadastro de Unidades

- Registra setores do hospital (ex.: *NAC Eletiva*, *UTI Adulto*).
- O botão **Nova Unidade** abre um formulário simples com nome e status.

### 3.8 Usuários

- Cadastre pessoas que terão acesso ao sistema.
- Defina o perfil (Administrador, Visitante, Acompanhante) e quais módulos cada usuário pode ver.
- Manter a lista sempre atualizada garante rastreabilidade nas auditorias.

### 3.9 Logs

- Registro de todas as ações importantes realizadas no sistema.
- Útil para descobrir quem realizou determinada alteração e quando.

## 4. Principais fluxos de trabalho

Os diagramas abaixo representam os passos na ordem em que devem ser seguidos. Leia cada bloco com atenção antes de prosseguir para o próximo.

### 4.1 Cadastro e entrega de armário para visitante

```mermaid
flowchart TD
    A[Início do atendimento] --> B{Armário disponível?}
    B -- Não --> C[Registrar solicitação e aguardar liberação]
    B -- Sim --> D[Abrir página Visitantes]
    D --> E[Clicar em "Novo Cadastro"]
    E --> F[Preencher dados do visitante e paciente]
    F --> G[Salvar e entregar chave/armário]
    G --> H[Registrar volumes no termo interno]
    H --> I[Fim do processo]
```

### 4.2 Devolução de armário de acompanhante com termo ativo

```mermaid
flowchart TD
    A[Contato do acompanhante] --> B[Abrir seção Termo de Responsabilidade]
    B --> C[Selecionar armário e clicar em "Encerrar"]
    C --> D[Conferir movimentações e volumes]
    D --> E[Arrastar controle para confirmar identificação]
    E --> F[Coletar assinatura ou CPF]
    F --> G[Confirmar liberação no botão azul]
    G --> H[Armário liberado e termo encerrado]
```

### 4.3 Cadastro de novo armário físico

```mermaid
flowchart TD
    A[Planejamento de infraestrutura] --> B[Abrir "Cadastro de Armários"]
    B --> C[Clicar em "Novo Armário"]
    C --> D[Selecionar unidade e informar localização]
    D --> E[Definir tipo (visitante/acompanhante)]
    E --> F[Salvar registro]
    F --> G[Armário disponível para uso]
```

## 5. Solução de problemas comuns

| Situação | O que fazer |
| --- | --- |
| Não encontro um armário livre | Use os filtros "Livre" e "Próximo do horário" para localizar opções mais rapidamente. Se ainda assim não encontrar, acione a equipe de apoio para liberar um armário encerrado. |
| O botão **Salvar** não funciona | Verifique se todos os campos obrigatórios estão preenchidos (eles possuem um asterisco ou ficam destacados em vermelho). |
| Não consigo imprimir o termo | Certifique-se de que o navegador permite pop-ups e downloads. Tente novamente usando o botão de ações do termo. |
| Esqueci de encerrar um armário | Vá até a tela correspondente (Visitantes ou Acompanhantes), abra a linha desejada nas ações e finalize o atendimento. O registro também ficará disponível no histórico. |

## 6. Boas práticas

- Atualize os dados assim que algo acontecer. Quanto mais cedo, mais confiável fica o histórico.
- Use descrições claras nas movimentações (por exemplo, "Entrada de mochila azul").
- Revise os termos de responsabilidade diariamente para identificar vencimentos próximos.
- Faça logoff ou feche o navegador ao terminar o turno para evitar usos indevidos do sistema.

---

Pronto! Você já tem uma visão completa do sistema de armários hospitalares. Em caso de dúvidas, procure o time de tecnologia ou o responsável pelo setor.

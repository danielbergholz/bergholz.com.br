---
title: "Aprenda Herdr em 6 minutos: dois agentes em paralelo sem um pisar no outro"
description: "Instalei o Herdr e coloquei dois Claude Code trabalhando ao mesmo tempo no CourseShelf, cada um na sua worktree. O que funcionou, os três passos que a worktree não faz sozinha e onde o gargalo vai parar."
publishedAt: "2026-10-08T16:00:00Z"
tags: [ai, programming, productivity, elixir]
videoId: Rjgxo1vLVUE
estudioSource: canais/br/youtube/2026-10-02-herdr-agentes-em-paralelo
---

Rodar vários agentes de IA ao mesmo tempo tem dois problemas.

O primeiro: na mesma pasta, um pisa no outro. Edita o mesmo arquivo, roda os testes no meio da mudança do outro. O segundo: você passa o dia clicando em aba de terminal pra ver quem já terminou e quem ainda tá trabalhando.

![Eu, com três abas de agente abertas](https://media.giphy.com/media/3DnDRfZe2ubQc/giphy.gif)

O [Herdr](https://herdr.dev/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=aprenda-herdr-em-6-minutos) resolve os dois. Eu gravei um tutorial curto instalando ele e colocando dois Claude Code trabalhando em paralelo no CourseShelf, um projeto real meu em Elixir e Phoenix. Aqui vai a versão escrita.

[embed](https://youtu.be/Rjgxo1vLVUE)

## Instalar é uma linha

```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

Depois é só rodar `herdr` em qualquer diretório.

Uma coisa que eu gosto: dá pra usar o Herdr inteiro com o mouse. Clicar pra trocar de pane, arrastar a borda pra redimensionar, botão direito pra abrir menu. Você não precisa decorar nada pra começar.

Mas tudo tem atalho, e todos começam pelo prefixo `ctrl+b`. Você aperta `ctrl+b`, solta, e a próxima tecla vai pro Herdr, não pro programa rodando no terminal. É assim porque o agente e o shell já usam quase todas as combinações. Quem usa tmux já conhece. E `ctrl+b` seguido de `?` mostra todos os atalhos.

Os que eu usei no vídeo:

| Ação | Atalho |
| --- | --- |
| abrir um projeto (space) | `ctrl+b` `shift+n` |
| nova worktree | `ctrl+b` `shift+g` |
| nova aba | `ctrl+b` `c` |
| trocar de worktree | `ctrl+b` `w` |
| Goto (lista de agentes) | `ctrl+b` `g` |
| fechar a janela | `ctrl+b` `q` |
| todos os atalhos | `ctrl+b` `?` |

Pra abrir um projeto, eu clico em New na sidebar e dou `cd` pra pasta. Isso é um space, um por projeto. A sidebar já mostra o CourseShelf na branch `main`.

## Uma worktree por agente

Pra um agente não pisar no outro, cada um trabalha numa git worktree: outra pasta do mesmo repositório, na sua própria branch. No Herdr é botão direito no space, New worktree, nome da branch, Create and open. Ela aparece agrupada embaixo do projeto na sidebar.

Só que a worktree vem só com o que tá no Git. Então são mais três passos: secrets, dependências e escolher uma porta pro servidor local rodar.

### Secrets

Os secrets do CourseShelf ficam no `config/dev.secret.exs`, que tá no `.gitignore`. Pra eles irem junto, eu tenho um arquivo `.worktreeinclude` na raiz do projeto:

```text
# .worktreeinclude (courseshelf-v2)
config/dev.secret.exs
```

Esse arquivo diz pro [Claude Code](https://code.claude.com/docs/en/worktrees) e pro app do ChatGPT que, quando eles criarem uma worktree nova, é pra copiar esse arquivo. Por padrão o Herdr não lê o `.worktreeinclude`, então eu tive que instalar um plugin da comunidade pra esse workflow funcionar, o [herdr-worktreeinclude](https://github.com/eightHundreds/herdr-worktreeinclude):

```bash
herdr plugin install eightHundreds/herdr-worktreeinclude
```

### Dependências e porta

Pro servidor, eu abro uma aba nova na worktree. Primeiro as dependências, que no Elixir e Phoenix é `mix deps.get`.

Depois a porta. Por padrão o meu servidor usa a 4001, mas ele lê a variável de ambiente `PORT`:

```elixir
# config/dev.exs (courseshelf-v2)
http: [ip: {127, 0, 0, 1}, port: String.to_integer(System.get_env("PORT", "4001"))],
```

Então eu subo com `PORT=4002` na primeira worktree e `PORT=4003` na segunda. Cada worktree com o seu servidor, na sua aba. Na segunda worktree eu só repeti o processo: os secrets já tinham sido copiados automaticamente.

## Dois Claude Code trabalhando

Com as duas worktrees de pé, eu abri o Claude Code em cada uma. Na primeira, um botão pra copiar o link do post no blog. Na segunda, mudar o layout da lista de posts pra um grid de duas colunas. Um mexe na página do post, o outro na lista de posts.

São tarefas que não dependem uma da outra. Se dependem, é fila, não paralelo.

O Herdr reconhece o Claude Code sozinho, e Codex, OpenCode e vários outros. A sidebar mostra o estado de cada agente: os dois `working`.

E aqui tá a parte que resolve o segundo problema. Eu tava olhando uma aba quando o outro agente terminou. A sidebar marca `done`, aparece uma notificação e toca um som. Ele fica `done` até eu abrir. Se o agente pede permissão pra rodar um comando, ele aparece como `blocked`, esperando você, do mesmo jeito.

![Os agentes me esperando](https://media.giphy.com/media/QBd2kLB5qDmysEXre9/giphy.gif)

Pra navegar entre os agentes, dá pra usar a sidebar. Mas com `ctrl+b` e `g` eu abro o Goto, que lista todos os agentes, e apertando `d` ele filtra os que estão `done`.

## Fechar o terminal não mata nada

Com os dois agentes trabalhando, eu fechei a janela do terminal (`ctrl+b` e `q`). Abri outra, rodei `herdr` de novo, e tava tudo lá.

O Herdr roda num servidor em background. Quem guarda os terminais é ele, não a janela que você tá vendo.

## O gargalo agora sou eu

Os dois terminaram, e agora são duas mudanças pra revisar.

Primeiro no navegador. Na porta 4002, na página do post, o botão copia o link. Na 4003, as duas colunas na lista de posts, e uma só quando eu diminuo a janela.

Depois o código. Eu leio o diff dentro do próprio agente, com `/diff`. Um detalhe: com o zoom do terminal muito grande, o `/diff` não cabia. Escondi a sidebar do Herdr com o mouse, dei um zoom out e rodei de novo. No grid, uma alteração pequena no CSS. No botão de copiar, o agente também mexeu nas traduções, porque o CourseShelf tá em sete línguas.

Depois de revisar, fica a seu critério abrir uma PR ou fazer o merge na sua própria máquina.

## Limpando

Depois do merge, botão direito na worktree e Delete worktree checkout. Esse não tem atalho por padrão, mas dá pra configurar um.

O Herdr roda `git worktree remove`, mas [não apaga a branch](https://herdr.dev/docs/configuration/#worktrees). Isso é com você:

```bash
git branch -d blog-grid
```

## Para ser justo

O Claude desktop também cria uma worktree por sessão, com diff e navegador embutidos. Se você prefere interface gráfica e só usa Claude, ele resolve.

Eu volto pro Herdr quando quero ficar no terminal, misturar Claude Code com Codex e OpenCode lado a lado, ou deixar tudo rodando depois de fechar a janela.

## Meu veredito

Comece com dois agentes. Mais do que isso não adianta se você não consegue revisar o que eles fazem. O Herdr tira o caos de rodar agentes em paralelo, mas não tira de você a revisão.

Vídeo no YouTube: https://youtu.be/Rjgxo1vLVUE

Conheça meu trabalho: https://bergholz.com.br/

Obrigado por ler até aqui.

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

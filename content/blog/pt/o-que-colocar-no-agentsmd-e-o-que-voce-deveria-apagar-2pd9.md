---
title: O que colocar no AGENTS.md — e o que você deveria apagar
description: Eu já tentei enxugar o AGENTS.md do CourseShelf mais de uma vez.  O primeiro arquivo tinha 448...
publishedAt: 2026-09-17T16:42:13.862Z
updatedAt: 2026-09-17T16:44:10Z
tags: []
videoId: 2LgLiHZ4dl8
socialImage: /blog/c6ac5aeec3c22937b445.png
estudioSource: canais/br/youtube/2026-09-11-agents-md
---

Eu já tentei enxugar o `AGENTS.md` do CourseShelf mais de uma vez.

O primeiro arquivo tinha 448 linhas. Três dias depois, já tinha passado de 500. Fiz um commit chamado literalmente `Slim AGENTS.md` e cortei tudo para 109 linhas. Dois meses depois, ele estava com 231. Fiz outra limpeza, voltei para 128 e, quando gravei o vídeo, ele já tinha 142 linhas e quase duas mil palavras.

Logo no começo do próprio arquivo existe uma regra dizendo que ali só deveriam ficar instruções sempre verdadeiras e que o agente não consegue descobrir lendo o projeto.

![isso saiu do controle](https://media.giphy.com/media/x2LCi6Wudz85O/giphy.gif)

Então, sim: eu tenho um problema.

Cada crescimento fazia sentido no momento. Um agente erra, eu acrescento uma regra. O projeto ganha uma feature, eu documento. Uma linha por vez parece pouco. O problema aparece meses depois, quando todas elas entram juntas no contexto de toda tarefa.

Este artigo é uma auditoria desse caso real. A pergunta não é quantas linhas um `AGENTS.md` pode ter. É outra: **qual informação merece ocupar permanentemente a atenção do agente?**

[embed](https://youtu.be/2LgLiHZ4dl8)

## O que o AGENTS.md faz de verdade

O [`AGENTS.md`](https://agents.md/) é um arquivo Markdown com instruções persistentes para coding agents. O formato não exige campos ou seções específicas. O site oficial usa uma analogia útil: ele é um README para agentes.

Só que essa analogia também pode produzir o problema deste artigo. Se eu tratar o arquivo como uma apresentação completa do repositório, dá vontade de colocar ali a árvore de pastas, as versões de todas as bibliotecas, explicações de arquitetura e cada convenção que o time já discutiu.

Um README existe principalmente para uma pessoa consultar. O `AGENTS.md` é carregado pelo agente antes do trabalho e influencia as decisões seguintes. No Codex, por exemplo, as instruções podem vir do escopo global, da raiz do projeto e dos diretórios mais próximos do código. A [documentação oficial](https://learn.chatgpt.com/pt-BR/docs/agent-configuration/agents-md) explica que os arquivos são concatenados nessa ordem e que a orientação mais próxima aparece depois, prevalecendo quando existe conflito.

Isso muda a pergunta. Em vez de “esta informação é verdadeira sobre o projeto?”, eu passei a perguntar:

> Que decisão o agente tomaria diferente depois de ler esta linha?

Se eu não consigo responder, provavelmente a linha não está ajudando.

“Escreva código limpo” parece uma instrução, mas não resolve nenhuma decisão objetiva. Já estas duas linhas do CourseShelf mudam o comportamento de forma concreta:

```md
- **No password auth**: no `hashed_password`, no Bcrypt, no registration form,
  no magic links. All sign-in goes through `CourseShelfWeb.OAuthController`.

CI/CD (`.github/workflows/`): every PR runs `mix precommit` in CI, and
**merging to main auto-deploys production** on Fly once CI passes — treat a merge as a deploy.
```

Trechos de `courseshelf-v2/AGENTS.md`, no repositório real do CourseShelf.

O código mostra que não existe fluxo de senha. Ele não explica sozinho se isso foi uma decisão de produto ou se a feature ficou para depois. A primeira regra impede que um agente prestativo construa um fluxo inteiro que ninguém pediu.

O workflow de deploy também está no repositório. Tecnicamente, o agente poderia descobri-lo. Mas a consequência de errar é grande e o custo de manter uma frase é pequeno. Informação inferível não é automaticamente proibida; risco e custo de descoberta também entram na conta.

## Como uma regra razoável vira dívida de contexto

O primeiro `AGENTS.md` do CourseShelf tinha muita regra genérica de Phoenix. Também pedia uma “world-class UI”, “delightful details” e componentes escritos à mão com Tailwind.

“Faça uma interface incrível” não diz qual decisão tomar. A regra do Tailwind envelheceu pior ainda: hoje o projeto usa daisyUI de propósito.

Na primeira limpeza, eu tirei centenas de linhas do arquivo e movi a referência de framework para um `usage-rules.md`. O `AGENTS.md` ficou muito menor, mas a arquitetura ainda estava no meio do caminho. Esse arquivo novo não era claramente uma regra sempre ativa nem uma instrução carregada apenas quando determinada tarefa precisava dela.

Na segunda limpeza, autenticação, caching, privacidade e detalhes de Phoenix foram separados em skills específicas. No dia seguinte, ainda removi frases que não alteravam comportamento e uma regra duplicada.

![limpando a bagunça](https://media.giphy.com/media/fVQGKMAiIh17NqGMbM/giphy.gif)

O histórico deixou uma lição simples: mover texto para outro arquivo não basta. É preciso decidir **quando** aquela instrução deve entrar no contexto.

## Existe um lugar melhor para esta regra?

Antes de colocar uma nova regra na raiz, eu procuro a camada que consegue impor ou explicar aquela decisão com menos ambiguidade.

- Se o formatter consegue impor, deixo no formatter.
- Se um teste ou o CI consegue verificar, deixo a máquina verificar.
- Se a informação é para uma pessoa consultar, uso documentação normal.
- Se a regra vale apenas em um pacote ou diretório, uso um `AGENTS.md` mais próximo.
- Se ela só ajuda num tipo de trabalho, considero uma skill carregada naquela tarefa.

O exemplo mais claro no CourseShelf é uma antiga regra que poderia ser resumida como “sempre use streams no LiveView”. É curta, fácil de lembrar e ruim.

A skill atual preserva o contexto necessário para decidir:

```md
## Streams

Use streams for collections that are large, incrementally updated, or repeatedly
patched. Plain assigns are appropriate for small, bounded, read-only, or
page-at-a-time collections when that matches neighboring LiveViews.
```

Trecho de `courseshelf-v2/.claude/skills/phoenix-liveview/SKILL.md`.

Agora a instrução diz quando streams fazem sentido e quando uma lista normal basta. Existe contexto para escolher, em vez de uma ordem absoluta para obedecer.

Mas existe uma ressalva importante: mover uma regra ruim para uma skill não transforma essa regra em boa. Só faz com que ela incomode em menos tarefas.

## Modelos mais obedientes tornam a auditoria mais importante

A justificativa para manter as instruções enxutas não é apenas economizar tokens.

A [orientação oficial do GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra) diz que ele segue instruções gerais melhor que modelos anteriores, mas também pode ser mais sensível ao que encontra em skills e arquivos como `AGENTS.md`. A própria OpenAI recomenda auditar esses arquivos, porque orientação confusa ou conflitante pode alterar o comportamento do modelo.

A [documentação atual da Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) traz um problema parecido ao falar de migração. Instruções agressivas usadas para fazer modelos antigos chamarem ferramentas podem causar overtrigger nos Claude 4.6. A recomendação é reduzir esse tipo de linguagem quando ela deixa de ser necessária.

Essas são orientações dos fabricantes sobre modelos específicos, não uma lei universal sobre toda LLM. Mas as duas apontam para o mesmo risco operacional: um modelo seguir melhor uma instrução não torna aquela instrução correta.

Se o arquivo diz “sempre faça X”, o agente pode executar X perfeitamente mesmo quando aquela situação pede Y.

![ideia ruim](https://media.giphy.com/media/AMjNuK96WTXBHD52DZ/giphy.gif)

Foi por isso que a revisão mais recente do CourseShelf esclareceu quando implementar e quando apenas analisar, limitou a delegação aos casos em que ela ajuda e deixou a verificação proporcional ao tamanho da mudança. O projeto não mudou nessas três coisas. O modelo que lê as instruções mudou.

## Pequeno não significa vazio

Apagar tudo também não resolve. Sem as decisões que o código não revela, o agente volta a escolher defaults genéricos e pode repetir problemas que o time já resolveu.

Eu não tenho uma quantidade mágica de linhas. Um arquivo com 30 linhas vagas pode ser pior que outro com 150 linhas precisas. O meu filtro final tem três perguntas:

1. Esta informação muda uma decisão?
2. Ela ainda deve ser verdade daqui a seis meses?
3. Precisa aparecer em toda tarefa ou existe um lugar mais específico para ela?

Se o código ou um teste já responde, eu começo desconfiando. Se só vale para LiveView, vai para a skill. Decisão de produto, preferência deliberada ou consequência perigosa que o projeto não explica bem provavelmente merece ficar.

No CourseShelf, eu também mantenho uma fonte canônica. O `CLAUDE.md` contém apenas:

```md
@AGENTS.md
```

Assim, as regras compartilhadas ficam num formato aberto e o arquivo específico do harness funciona como um adaptador mínimo.

Depois de preparar este vídeo, eu já sei que o meu `AGENTS.md` não vai continuar igual. As decisões de produto, os limites e os acordos de trabalho ficam. O resto precisa provar que merece contexto permanente ou encontrar uma casa melhor.

As páginas oficiais e o estado do repositório foram conferidos novamente em 16 de setembro de 2026. O histórico de linhas vem dos commits reais do CourseShelf; as recomendações sobre modelos continuam identificadas como orientação dos respectivos fabricantes.

Vídeo no YouTube: https://youtu.be/2LgLiHZ4dl8

Conheça meu trabalho: https://bergholz.com.br/

## Links

- [AGENTS.md — formato aberto](https://agents.md/)
- [Codex — instruções personalizadas com AGENTS.md](https://learn.chatgpt.com/pt-BR/docs/agent-configuration/agents-md)
- [OpenAI — orientação do GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)
- [Anthropic — prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

Se você chegou até aqui, você é demais. Obrigado pelo seu tempo. Me conta nos comentários qual é a regra mais estranha que você já colocou — ou encontrou — num `AGENTS.md`. Até a próxima.

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

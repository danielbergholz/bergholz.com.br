---
title: "Para de revisar código linha por linha. Você virou o gargalo."
description: "O agente escreve 400 linhas em minutos e você leva uma hora pra ler. O que eu coloco no lugar do meu olho no CourseShelf."
publishedAt: "2026-10-05T16:00:00Z"
tags: [ai, programming, codereview, elixir]
videoId: DX58ddQ4VVI
estudioSource: canais/br/youtube/2026-10-02-pare-de-revisar-codigo
---

Você pede uma feature pro agente. Ele escreve quatrocentas linhas em poucos minutos. E aí você senta e lê tudo, linha por linha.

Parabéns. Você pegou a coisa mais rápida que já apareceu na programação e colocou você mesmo na frente dela.

![Eu, na linha 312 do diff](https://media.giphy.com/media/1X7cYIfuYOzI7sJPFg/giphy.gif)

Antes que alguém me acuse: eu não tô falando pra fazer merge no escuro e rezar. Tô falando que ler cada linha não é o jeito de garantir qualidade quando quem escreve o código é um agente. Tem jeito melhor, e ele é mais seguro que o seu olho.

Eu gravei um vídeo sobre isso com o que eu uso de verdade no CourseShelf, meu SaaS que tá em produção. Aqui vai a versão escrita, com o código.

[embed](https://youtu.be/DX58ddQ4VVI)

## A conta não fecha mais

Pensa em como era. Uma pessoa levava dias pra escrever um código que outra pessoa levava uma hora pra revisar. A revisão era barata perto da escrita, então fazia todo sentido ler tudo.

Agora inverteu. O agente escreve em minutos o que você leva uma hora pra ler.

E essa hora não é chute meu. A [SmartBear](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/), uma empresa que literalmente vende software de code review, recomenda revisar no máximo 200 a 400 linhas por vez, e diz que isso leva de 60 a 90 minutos. Quatrocentas linhas é uma feature média que o agente termina antes do seu café esfriar.

Aí sobram duas opções. Ou você trava o agente esperando você ler tudo, ou você passa o olho por cima e aprova. A segunda é pior, porque é fingir que revisou. Todo mundo que já recebeu um PR de duas mil linhas sabe o que acontece: "LGTM", merge, duas ave-marias e boa sorte.

![LGTM](https://media.giphy.com/media/hpAMh2sBYpsmFhSRPI/giphy.gif)

Então eu troquei o revisor. No lugar do meu olho lendo linha, entra um sistema que pega o problema sozinho. Ele tem três partes.

## 1. Checagem que não tem opinião

A primeira parte é um comando que roda e passa ou falha. Sem discussão, sem "depende".

- o compilador tratando warning como erro;
- o formatter;
- um linter fazendo análise estática;
- uma ferramenta de segurança procurando secrets no código e SQL montado na mão;
- testes: de backend, de front-end e com o agente usando o app no navegador.

O agente roda tudo isso antes de entregar, lê o erro e corrige sozinho. O que escapar dele, o CI pega antes de chegar em produção.

No CourseShelf isso é um alias só, o `mix precommit`. Este é o trecho do `mix.exs` hoje:

```elixir
# mix.exs (courseshelf-v2, commit e7729c1)
precommit: [
  "compile --warnings-as-errors",
  "skills.check",
  "deps.unlock --unused",
  "format",
  "gettext.extract --check-up-to-date",
  "credo --strict",
  "sobelow",
  "test"
]
```

O [Credo](https://github.com/rrrene/credo) é o linter. O [Sobelow](https://github.com/nccgroup/sobelow) é a análise de segurança feita pra Elixir e Phoenix: ele procura configuração insegura, XSS, SQL injection, command injection e mais uma lista de problemas conhecidos.

O CI roda o mesmo comando a cada push, e ainda confere se o `mix format` não mudou nenhum arquivo:

```yaml
# .github/workflows/ci.yml (courseshelf-v2)
- run: mix precommit

# The precommit alias runs `mix format` (it rewrites files instead of
# checking), so unformatted code passes it silently in CI. A dirty tree
# here means formatting drift.
- run: git diff --exit-code
```

E o deploy só acontece se o CI passou, e só do commit que o CI testou:

```yaml
# .github/workflows/deploy.yml (courseshelf-v2, trechos)
on:
  workflow_run:
    workflows: [CI]
# …
    if: >-
      github.event_name == 'workflow_dispatch' ||
      (github.event.workflow_run.conclusion == 'success' &&
       github.event.workflow_run.event == 'push')
# …
      # Deploy exactly the commit CI validated, not the branch tip — with
      # queued deploys the tip may already hold a newer, un-CI'd commit.
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_sha || github.ref }}
```

Repara que nada disso depende do agente estar num dia bom. O pipeline não deixa passar.

Se você usa JavaScript, a ideia é a mesma: Prettier, ESLint ou Biome, `tsc`, os testes e o `npm audit`, tudo num script que o agente roda e o CI roda de novo.

## 2. Um revisor com olhos novos

Só que checagem automática pega o que dá pra pegar com regra. Ela não te diz que o agente criou uma abstração inútil quando tinha um jeito dez vezes mais simples, ou que ele esqueceu de checar a permissão numa rota. Pra isso precisa de julgamento.

E aqui muita gente erra: pede pro mesmo agente revisar o que ele acabou de fazer. Ele revisa, acha dois detalhes minúsculos e fala que tá tudo bem.

Óbvio. O agente que escreveu o código é o pior revisor dele.

Tem estudo mostrando que, sem um sinal vindo de fora, os modelos têm dificuldade de corrigir o próprio raciocínio, e às vezes a resposta até piora depois que eles se autocorrigem ([Huang et al., ICLR 2024](https://arxiv.org/abs/2310.01798)). E tem outro mostrando que os modelos reconhecem o próprio texto e dão nota maior pra ele ([Panickssery et al., NeurIPS 2024](https://arxiv.org/abs/2404.13076)).

Os estudos não são sobre código. Mas o mecanismo é o mesmo, e é exatamente o que eu vejo no dia a dia.

Então o revisor precisa de olhos novos. O mínimo é uma sessão nova, com contexto limpo. A sessão que escreveu o código tá cheia das justificativas dela, sabe por que fez cada escolha, e isso contamina a revisão. A sessão nova só vê o código.

Melhor ainda: um modelo de outra empresa. Ele foi treinado com outros dados, de outro jeito, e tem outros pontos cegos. Isso é adversarial review de verdade.

Eu gosto de escrever código com o [Claude Code](https://claude.com/product/claude-code?utm_source=danielbergholz&utm_medium=blog&utm_campaign=pare-de-revisar-codigo) e revisar com um modelo chinês open weights, rodando no [OpenCode](https://opencode.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=pare-de-revisar-codigo) pelo [OpenRouter](https://openrouter.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=pare-de-revisar-codigo). Sai bem mais barato, porque revisar é ler muito e escrever pouco.

O detalhe importante: o revisor não manda em nada. Ele aponta. O agente que escreveu o código avalia ponto por ponto, corrige o que é bug (com teste) e descarta o que ele considera gosto.

No CourseShelf eu nem faço o merge. Se o CI passou e o revisor não achou nada, o merge acontece automaticamente.

## 3. Ler o diff de cima

Isso não quer dizer que você não olha nada. Você olha o diff. Mas olha de cima: não é ler linha, é ler quais arquivos mudaram.

Esta é uma feature real do CourseShelf, um resumo feito por IA dos comentários do YouTube de cada curso:

```text
$ git show --stat fd85544
fd85544 2026-06-24 feat: add AI "What learners say" comment digest

 knowledge-center/ai-integration-strategy.md        |  23 ++-
 lib/course_shelf/ai.ex                             |  12 ++
 lib/course_shelf/courses.ex                        |  21 +-
 lib/course_shelf/courses/comment_digest.ex         | 216 +++++++++++++++++++++
 lib/course_shelf/courses/comment_digest_ops.ex     | 100 ++++++++++
 lib/course_shelf/courses/course.ex                 |   6 +
 lib/course_shelf/courses/importer.ex               |  22 +++
 lib/course_shelf/workers/comment_digest_worker.ex  | 100 ++++++++++
 lib/course_shelf/youtube.ex                        |  68 +++++++
 lib/course_shelf_web/live/course_live/show.ex      |  76 ++++++++
 priv/gettext/default.pot                           | 173 ++++++++++-------
 priv/gettext/en/LC_MESSAGES/default.po             | 173 ++++++++++-------
 ...0260624083821_add_comment_digest_to_courses.exs |  16 ++
 test/course_shelf/ai_test.exs                      |  26 +++
 .../courses/comment_digest_ops_test.exs            |  53 +++++
 test/course_shelf/courses/comment_digest_test.exs  | 176 +++++++++++++++++
 test/course_shelf/courses/importer_test.exs        |  32 ++-
 .../workers/comment_digest_worker_test.exs         | 201 +++++++++++++++++++
 test/course_shelf/youtube_comments_test.exs        | 102 ++++++++++
 .../live/course_live/show_test.exs                 |  34 ++++
 20 files changed, 1479 insertions(+), 151 deletions(-)
```

Sem abrir um arquivo, dá pra ler bastante coisa:

- **Tem uma migration:** tô mexendo no banco. Pelo nome, só acrescenta um campo (`add_comment_digest_to_courses`), não apaga nada.
- **Tem um worker novo:** coisa rodando em background.
- **Mexeu no `ai.ex` e no `youtube.ex`:** chama API externa, então custa dinheiro e pode falhar.
- **A página do curso mudou (`course_live/show.ex`):** tem coisa nova na tela.
- **E tem teste pra quase tudo,** nenhum apagado.

Se mexesse com dependência, config, autenticação ou secret, eu parava e olhava com calma. E se apagasse teste? Red flag. Agente adora apagar o teste que tá falhando pra entregar tudo passando.

![Quando o diff tem um teste a menos](https://media.giphy.com/media/1SDN6kC0PLTlAvnftg/giphy.gif)

Bateu o olho e alguma coisa não fez sentido? Pede pro agente explicar em português o que ele fez, e questiona. Isso leva dois minutos, não uma hora.

## Você não precisa ser especialista

Pra fazer isso tudo você não precisa ser expert na linguagem. Você não precisa saber Elixir pra saber que uma pasta chamada `migrations` mexe no banco de dados.

Você precisa de intuição técnica: saber o que é banco, front-end, backend, rota, dependência, variável de ambiente. E isso não exige faculdade. Eu sou formado em Engenharia de Redes, não em Ciência da Computação. O que eu sei de desenvolvimento web eu aprendi trabalhando, quebrando coisa e estudando sozinho.

Intuição técnica se aprende com o tempo. Não precisa ser uma base forte. Precisa ser uma base.

## "Mas e quando o bug passar?"

Vai passar. E a questão é: antes passava também, com seres humanos lendo PR linha por linha. O revisor cansado lendo o PR de mil linhas deixa passar do mesmo jeito.

A diferença é o que acontece depois. O serviço que monitora erros avisa, o agente investiga, corrige em minutos, e o bug vira um teste novo. Esse teste vira mais uma checagem que roda pra sempre no `mix precommit`.

O seu olho cansado não melhora com o tempo. O pipeline melhora a cada novo bug.

## Meu veredito

Para de revisar código linha por linha. Isso acabou.

O seu trabalho agora é construir e cuidar do sistema que revisa: checagem que não tem opinião, revisor com olhos novos, e você lendo a lista de arquivos do diff, não cada linha.

Conheça meu trabalho: https://bergholz.com.br/

Valeu por ler até o final! E você, ainda lê cada linha que o agente escreve?

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

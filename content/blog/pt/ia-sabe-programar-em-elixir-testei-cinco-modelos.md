---
title: "IA sabe programar em Elixir? Testei cinco modelos e o erro foi outro"
description: "Montei uma armadilha pra cinco modelos errarem Elixir. Nenhum caiu. O que escorregou foi a convenção nova do Phoenix, e o bug passou em 44 testes."
publishedAt: "2026-10-22T16:00:00Z"
tags: [elixir, phoenix, ai, programming]
videoId: 0U4Ob-_oh1g
estudioSource: canais/br/youtube/2026-10-02-ia-sabe-programar-em-elixir
---

No meu [vídeo sobre Rust](/blog/rust-ia-e-uma-combinacao-absurda-ate-o-bug-compilar), eu disse que o ponto fraco do Elixir com IA é o treino: tem bem menos código Elixir na internet que JavaScript ou Python.

Essa frase ficou na minha cabeça. Porque, se ela for verdade, a IA devia escrever Elixir pior. Errar sintaxe, inventar função, escrever Elixir com cara de JavaScript.

Então eu fui testar. Cinco modelos, de um modelo de ponta da OpenAI até um que custou oito centavos de dólar pra fazer a tarefa inteira, e uma armadilha montada pra eles errarem Elixir.

Spoiler: eu tava meio errado.

![Eu tava errado](https://media.giphy.com/media/BvLBKDhHSZdAY/giphy.gif)

Mas eles erraram outra coisa. E esse erro vale pra sua stack também, mesmo que você nunca encoste em Elixir. O vídeo com o experimento inteiro tá aqui:

[embed](https://www.youtube.com/watch?v=0U4Ob-_oh1g)

## O arquivo que o Phoenix escreve pro agente

Um contexto rápido pra quem não usa Phoenix: é o framework web do Elixir, tipo o Rails do Ruby. Desde o Phoenix 1.8, de agosto de 2025, todo projeto novo já vem com um `AGENTS.md`, aquele arquivo de instruções que o agente lê antes de começar. Eu já escrevi sobre [o que colocar num AGENTS.md e o que apagar](/blog/o-que-colocar-no-agentsmd-e-o-que-voce-deveria-apagar-2pd9).

No [anúncio do Phoenix 1.8](https://www.phoenixframework.org/blog/phoenix-1-8-released), o time explica o motivo: as regras corrigem os erros comuns que as LLMs cometem com sintaxe, com o jeito de escrever a linguagem e com as APIs mais importantes.

O arquivo gerado tem 448 linhas, e dá pra separar em duas partes.

Uma é regra da linguagem. Por exemplo: em Elixir, você não pega o segundo item de uma lista com colchete, do jeito que faria em JavaScript. O arquivo manda usar `Enum.at(mylist, i)`.

A outra é convenção do Phoenix: como montar uma página, onde ficam as mensagens pro usuário, como criar o arquivo que mexe no banco.

Só que esse arquivo foi escrito pros modelos de agosto de 2025. Os modelos mudaram muito de lá pra cá. Então a pergunta foi: sem ele, a IA ainda erra Elixir?

## A armadilha

Criei um app Phoenix novo, apaguei o `AGENTS.md` e pedi uma feature que parece inocente: uma lista de leitura. Você salva artigo, filtra por status, ordena, essas coisas.

Só que cada pedaço do pedido foi escolhido pra puxar um erro que o arquivo corrige:

- **Etiqueta de prioridade.** Cada artigo tem uma prioridade de um a dez, e a tela mostra uma etiqueta: de oito pra cima é "urgente", de quatro a sete é "em breve", abaixo disso é "algum dia". Em JavaScript você escreveria isso com `else if`. Elixir não tem `else if`.
- **Artigo em destaque pela posição na lista**, pra ver se o modelo ia usar colchete.
- **Ordenar por qualquer coluna pela URL.** O jeito ingênuo transforma o texto da URL num atom. Atom é um tipo do Elixir que nunca sai da memória, então qualquer um consegue derrubar o app mandando URLs aleatórias.

O pedido tinha mais iscas (biblioteca HTTP, `<script>` solto no HTML, APIs antigas de formulário), mas essas três são as que mais têm cara de "dev de JavaScript escrevendo Elixir".

Cinco modelos fizeram a tarefa. O GPT-6.1 Sol, da OpenAI, no Codex. E quatro modelos open weights no OpenCode, que é o que muita gente usa pra trabalho barato: Kimi K3, DeepSeek V4.1 Flash, Qwen3.8 Flash e GLM 5.3 Flash. Cada um rodou uma vez, sozinho, sem ninguém ajudar, até os testes passarem.

## Nenhum caiu

Nenhum. Zero `else if`, zero colchete, ninguém transformou o texto da URL em atom.

E não foi só no código final. Eu li os logs, inclusive as tentativas no meio do caminho. Os erros que apareceram foram de formatação e de configurar o banco. Nada de sintaxe.

Todos terminaram com o projeto compilando sem warnings e com os testes passando. Inclusive o DeepSeek, que custou oito centavos.

Então a frase do vídeo de Rust tava errada? Em parte. Ter menos Elixir na internet não apareceu no código.

Só que o teste não acabou aí.

## O que eles erraram

No app do Kimi, você salva um artigo e... nada. O artigo aparece na lista, mas a mensagem de confirmação, "Article added to your reading list", nunca aparece. E a página fica sem cabeçalho.

O motivo tá na segunda parte do arquivo. No Phoenix 1.8, toda página começa com um componente de layout:

```html
<Layouts.app flash={@flash}>
```

É ele que mostra essas mensagens (o "flash", no vocabulário do Phoenix). Quatro dos cinco modelos esqueceram. Só o GPT fez certo. No Kimi e no DeepSeek, a mensagem sumiu. O Qwen nem usou flash. E o GLM tentou resolver chamando o componente de mensagens direto na página:

```html
<Layouts.flash_group flash={@flash} />
```

Essa é a primeira linha do template que o GLM escreveu (`lib/blank_web/live/reading_live.html.heex`). O `AGENTS.md` proíbe isso explicitamente: o `flash_group` só pode ser chamado dentro do `layouts.ex`.

E o Kimi terminou com 44 testes passando. Quarenta e quatro. Ninguém escreveu teste pra mensagem aparecer na tela, então o bug passou liso. Você só via abrindo o app.

![Tudo verde, tudo bem](https://media.giphy.com/media/2UCt7zbmsLoCXybx6t/giphy.gif)

E não foi só isso. Os quatro open weights escreveram a migration, que é o arquivo que cria a tabela no banco, na mão, com um horário falso no nome:

```text
priv/repo/migrations/20261001000000_create_reading_list_articles.exs
```

Esse é o do Kimi. O certo é pedir pro Phoenix gerar com `mix ecto.gen.migration`, que coloca o horário real. O GPT também escreveu a dele na mão, mas com um horário que parece real.

E nenhum dos cinco usou streams, que é o jeito do LiveView de lidar com lista grande sem guardar tudo na memória do processo.

Nada disso quebra o app hoje. Mas é tudo convenção do Phoenix, não da linguagem.

## Com o arquivo de volta

Aí eu rodei a mesma tarefa de novo, agora com o `AGENTS.md` no lugar.

Kimi, DeepSeek e GLM usaram o componente de layout e criaram a migration do jeito certo. A mensagem voltou. O Qwen ficou de fora dessa rodada, de tão lento. E o DeepSeek continuou sem streams.

O arquivo ajuda bastante. Mas não garante.

Teve ainda uma segunda rodada, nos mesmos projetos e ainda sem o arquivo, pedindo direto as partes difíceis do LiveView: streams, edição na própria linha, foco automático no campo, um "Copied!" que some depois de dois segundos. Todos resolveram. Mas o DeepSeek, o mais barato, escreveu este teste:

```elixir
test "hides Copied! again after two seconds", %{conn: conn} do
  article = article_fixture(%{url: "https://example.com/copy-me"})

  {:ok, view, _html} = live(conn, ~p"/reading")

  view |> element("#copy-#{article.id}") |> render_click()
  assert has_element?(view, "#copied-#{article.id}")

  Process.sleep(2_200)
  refute has_element?(view, "#copied-#{article.id}")
end
```

Trecho de `test/blank_web/live/reading_live_test.exs`, escrito pelo DeepSeek V4.1 Flash na rodada 2.

O teste fica parado esperando 2,2 segundos com `Process.sleep`. Funciona, mas deixa a suíte lenta, e quando a máquina tá carregada o teste começa a falhar do nada. O `AGENTS.md` também tem regra pra isso: "Avoid `Process.sleep/1` and `Process.alive?/1` in tests".

## Por que a IA erra o Phoenix e não o Elixir

Faz sentido quando você pensa em como o modelo aprende. Ele escreve o que mais viu no treino.

O Elixir tá na versão 1 há mais de dez anos. Mesmo com menos código que JavaScript, é muito código, e quase tudo ainda é o jeito certo de escrever.

Agora, o Phoenix 1.8 é de agosto de 2025. O modelo viu muito mais Phoenix antigo do que Phoenix novo. Aí ele escreve do jeito antigo, que compila, passa nos testes e tá errado.

Isso é a minha leitura do resultado, não algo que eu medi. Mas não é coisa de linguagem nichada. O Next.js, que tá em tudo quanto é lugar, [gera um AGENTS.md](https://nextjs.org/docs/app/guides/ai-agents) que começa assim:

> This is NOT the Next.js you know
>
> This version has breaking changes — APIs, conventions, and file structure may all differ from your training data.

Ou seja: essa versão pode ser diferente do que o modelo viu no treino.

E tem a convenção que modelo nenhum viu: a do seu projeto. Essa não tá na internet.

![Plot twist](https://media.giphy.com/media/PsBRTPKG71YVq/giphy.gif)

## O tamanho desse teste

Deixa eu ser honesto. Foi uma rodada por modelo, numa feature de cadastro com LiveView, rodando Elixir 1.18. Eu não testei GenServer, concorrência, sistema grande. É um experimento, não um benchmark.

E vale lembrar o que o [Dan Luu escreveu](https://danluu.com/pl-tokens/), que eu já citei no texto sobre Rust: a maioria das alegações de que tal linguagem é ótima pra LLM não se sustenta. Inclusive a de que Elixir é especialmente bom.

Então não sai daqui dizendo que Elixir é a melhor linguagem pra IA. Isso eu não testei.

## Troca a pergunta

IA sabe programar em Elixir? Pelo que eu vi, sabe. Até modelo barato.

O que ela não sabe é o que mudou há pouco tempo e o que é só do seu projeto.

Então troca a pergunta. Em vez de "a IA conhece essa linguagem?", pergunta "o que mudou recentemente nessa stack?" e "o que é convenção só do meu projeto?". É isso que vai no `AGENTS.md`. Regra de sintaxe que o modelo já sabe, você pode apagar. Se quiser uma certeza a mais, deixa lá.

E abre o app. Teste passando não prova que a tela funciona.

Se quiser fazer esse teste na sua stack, é simples: projeto novo, uma tarefa com armadilha, roda com e sem o arquivo, lê o diff e abre o app.

Vídeo no YouTube: [IA sabe programar em Elixir?](https://www.youtube.com/watch?v=0U4Ob-_oh1g)

Conheça meu trabalho: https://bergholz.com.br/

Obrigado por ler até aqui! Da próxima vez que o agente errar no seu projeto, vale perguntar antes se o problema é a linguagem ou a convenção.

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

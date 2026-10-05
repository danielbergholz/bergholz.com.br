---
title: "Claude Code não é Claude: a diferença entre harness e LLM"
description: Quando você abre o OpenCode e troca o modelo de Claude para GPT ou DeepSeek, uma parte importante...
publishedAt: 2026-09-08T19:47:48.005Z
updatedAt: 2026-09-08T23:08:03Z
tags: []
videoId: 1K9WuPsaXdc
socialImage: /blog/0751eb1817f9e676025f.png
devtoUrl: https://dev.to/danielbergholz/claude-code-nao-e-claude-a-diferenca-entre-harness-e-llm-a33
devtoId: 4577734
estudioSource: canais/br/youtube/2026-08-31-harness-vs-llm
---

Quando você abre o OpenCode e troca o modelo de Claude para GPT ou DeepSeek, uma parte importante continua exatamente no mesmo lugar. O OpenCode ainda controla quais arquivos podem ser lidos. Ele ainda oferece a ferramenta de terminal, ainda executa os comandos, mostra o diff, guarda a conversa e decide quando pedir a sua autorização.

Você trocou a LLM. Você não trocou o harness.

Agora faça o teste contrário: mantenha o Claude e saia do OpenCode para o Claude Code. O modelo pode ser o mesmo nos dois, mas o system prompt, as ferramentas, as permissões e a forma de gerenciar o contexto mudam. É por isso que a mesma IA pode parecer extremamente competente em um harness e extremamente perdida em outro.

Eu uso Claude Code, Codex, OpenCode e pi no dia a dia, e a gente costuma resumir tudo isso numa pergunta só: "qual a melhor IA para programar?".

![confuso](https://media.giphy.com/media/3EiNpweH34XGoQcq9Q/giphy.gif)

Só que essa pergunta mistura o modelo com todo o software que coloca esse modelo para trabalhar. Neste artigo eu quero separar as duas peças e mostrar tecnicamente o que acontece entre o seu prompt e o código alterado no seu computador. É a versão escrita do vídeo abaixo, com os links e os trechos de código que não cabem numa fala.

[embed](https://youtu.be/1K9WuPsaXdc)

## A LLM gera uma solicitação, não uma ação

A LLM é um modelo que recebe uma sequência de tokens e gera a próxima saída. Claude, GPT e DeepSeek são exemplos. Você envia instruções e contexto pela API, e o modelo devolve texto normal ou uma saída estruturada dizendo qual ferramenta ele gostaria de chamar e com quais argumentos.

Essa diferença é importantíssima: a LLM não abre o arquivo e não executa o comando. Ela gera uma solicitação.

Na API da Anthropic, por exemplo, a resposta do modelo vem com um bloco `tool_use` que só nomeia a ferramenta e os argumentos. Este exemplo é da [documentação oficial de tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview):

```json
{
  "type": "tool_use",
  "id": "toolu_01A09q90qw90lq917835lq9",
  "name": "get_weather",
  "input": { "location": "New York, NY", "unit": "fahrenheit" }
}
```

Repare que não tem temperatura nenhuma aí. Tem um pedido. Alguém ainda precisa rodar a função, pegar o resultado e mandar de volta.

## O harness é a ponte

Quem oferece essas capacidades é o harness. Claude Code, Codex, OpenCode e pi são exemplos. São programas rodando no seu computador, ou em algum ambiente remoto, que funcionam como uma ponte entre a API do modelo e o seu sistema operacional.

O harness lê arquivos de instruções como `AGENTS.md` ou `CLAUDE.md`, descobre quais ferramentas estão disponíveis, monta a requisição para a API, interpreta a resposta, valida os argumentos e só então executa alguma coisa.

Dá para ver isso em código aberto. O pi monta o system prompt numa função que recebe a lista de ferramentas selecionadas, os arquivos de contexto do projeto e as skills carregadas. Este é o começo de `packages/coding-agent/src/core/system-prompt.ts` no [repositório do pi](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/system-prompt.ts):

```typescript
export interface BuildSystemPromptOptions {
	/** Custom system prompt (replaces default). */
	customPrompt?: string;
	/** Tools to include in prompt. Default: [read, bash, edit, write] */
	selectedTools?: string[];
	/** Optional one-line tool snippets keyed by tool name. */
	toolSnippets?: Record<string, string>;
	/** Additional guideline bullets appended to the default system prompt guidelines. */
	promptGuidelines?: string[];
	/** Text to append to system prompt. */
	appendSystemPrompt?: string;
	/** Working directory. */
	cwd: string;
	/** Pre-loaded context files. */
	contextFiles?: Array<{ path: string; content: string }>;
	/** Pre-loaded skills. */
	skills?: Skill[];
}
```

Nada disso é "a IA". É software comum, escrito por gente, decidindo o que o modelo vai ver. A versão curta: a LLM decide a próxima ação. O harness fornece o ambiente e executa essa ação.

## O agent loop é literalmente um `while`

O coração de tudo isso é o agent loop. Enquanto o modelo continuar pedindo ferramentas, o harness continua executando e chamando o modelo de novo.

O ciclo é este:

1. Você faz um pedido.
2. O harness prepara uma requisição para a API com três grupos principais de informação: as instruções, a lista de ferramentas e as mensagens da conversa.
3. Acontece a inferência, que é só o nome técnico para uma execução do modelo.
4. A resposta termina de uma de duas formas: uma mensagem para você ou uma tool call.

Uma tool call costuma ser uma estrutura com o nome da ferramenta e os argumentos. Algo como a ferramenta `read_file` com o argumento `path` apontando para um componente React. Isso ainda não leu nada.

O harness recebe essa estrutura, verifica se a ferramenta existe, confere as permissões, executa a leitura no ambiente real e cria uma nova mensagem com o resultado. Essa mensagem entra no contexto, o harness chama a LLM de novo, e agora o modelo consegue analisar o conteúdo do arquivo e talvez pedir outra ferramenta: buscar uma função, aplicar um patch, rodar os testes.

O ciclo continua até o modelo devolver uma mensagem final em vez de outra tool call. Uma única tarefa que parece uma resposta simples no chat pode ter dez, vinte ou centenas de chamadas ao modelo e às ferramentas por baixo dos panos. É isso que transforma uma LLM que gera código em um agente que consegue trabalhar num repositório.

## Onde os harnesses começam a divergir

E aqui começa uma diferença enorme entre os produtos. O harness precisa decidir como buscar arquivos, como editar sem sobrescrever o arquivo inteiro, quanto output do terminal devolver, quando truncar um log, quando compactar a conversa e quais comandos exigem aprovação.

Ele também pode oferecer sandbox, subagents, skills, MCP, integração com IDE e estratégias diferentes para recuperar uma tool call inválida.

Duas ferramentas usando a mesma LLM podem tomar decisões de engenharia completamente diferentes em cada um desses pontos.

## A anatomia da requisição

Dá para abrir essa requisição um pouco mais.

O campo de instruções inclui o system prompt, ou developer instructions, dependendo da API. É onde o harness explica o papel do agente, as regras de segurança, como editar arquivos, quando rodar testes e como responder.

Depois vêm as tool definitions. Normalmente cada ferramenta tem um schema com quatro coisas importantes: nome, descrição, parâmetros e campos obrigatórios. Na [documentação da Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), uma definição mínima é assim:

```json
{
  "name": "get_weather",
  "description": "Get the current weather for a given location.",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {"type": "string", "description": "City and state, e.g. San Francisco, CA"}
    },
    "required": ["location"]
  }
}
```

Na documentação do Codex, a ferramenta `shell` segue a mesma lógica: ela informa ao modelo que recebe um comando, um diretório de trabalho e um timeout. O modelo foi treinado para olhar esse schema e produzir argumentos compatíveis.

Se o schema é ambíguo, o modelo chama a ferramenta errado. Se a descrição é gigantesca, ela consome mais tokens. Se existem quinze ferramentas com funções parecidas, o modelo precisa escolher entre quinze possibilidades antes mesmo de começar a resolver o seu problema.

## Tudo isso ocupa contexto

Não é só a sua mensagem que entra na context window. Entram as instruções, os schemas das ferramentas, o histórico, as tool calls e os resultados.

E muitas vezes o maior problema nem é a definição. É o resultado. Um comando que devolve cinco mil linhas de log pode consumir muito mais contexto do que o schema da ferramenta. Por isso os harnesses truncam outputs, resumem mensagens antigas e fazem compaction quando a sessão começa a crescer demais.

Ou seja: se você instalou 47 servidores MCP porque ficou animado demais num sábado, você pode ter transformado o seu agente numa árvore de Natal. Linda, cheia de coisa, mas com muito context bloat.

Para dar uma dimensão concreta, a [página de pricing da Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) documenta quanto cada ferramenta própria custa antes de qualquer uso. Para as versões anteriores da ferramenta de computer use, são 466 a 499 tokens a mais no system prompt e cerca de 735 tokens só na definição da ferramenta. O text editor custa 700 tokens de definição. E o toolset novo de computer use, com todos os membros padrão, adiciona por volta de 4.500 tokens por requisição.

![espera, o quê?](https://media.giphy.com/media/dpIj0g4UDYjfQnNIMD/giphy.gif)

Isso não quer dizer que toda ferramenta custa 700 tokens. São exemplos específicos. Mas provam que ferramentas não aparecem de graça no contexto. Mais ferramentas podem significar mais capacidade. Também podem significar mais tokens e mais chances de o modelo escolher a ferramenta errada.

## Então é por isso que existem Plan e Build?

Aqui eu faria uma correção importante.

É tentador dizer que os modos Plan e Build foram criados só para enviar menos tool definitions e ter menos context bloat. Isso pode fazer parte da implementação, mas não é a explicação universal.

Para entender esses modos, vale separar três conceitos:

- **Disponibilidade** é se a ferramenta aparece para o modelo. Se ela não foi enviada na lista de tools, a LLM nem sabe que ela existe.
- **Permissão** é se o harness deixa a chamada acontecer. Uma ferramenta pode existir, mas exigir aprovação ou estar completamente bloqueada.
- **Instrução** é o comportamento pedido ao modelo: "apenas analise", "crie um plano" ou "implemente e rode os testes".

No OpenCode, Build e Plan são perfis de agente. Segundo a [documentação](https://opencode.ai/docs/agents/), Build é o agente padrão com todas as ferramentas habilitadas, e Plan é um agente restrito em que edições de arquivo e comandos bash ficam em `ask` por padrão. As permissões aceitam `allow`, `ask` e `deny`. Ou seja, os perfis mudam prompt, modelo e, principalmente, permissões.

Dependendo do harness, negar uma ferramenta pode removê-la da descrição enviada ao modelo, economizando contexto e reduzindo escolhas. A mesma doc do OpenCode diz que um subagent com `deny` é removido da descrição da ferramenta Task, para o modelo nem tentar invocá-lo. Em outro harness, a ferramenta continua disponível, mas a execução é bloqueada ou pede aprovação.

O Claude Code fala em [permission modes](https://code.claude.com/docs/en/permissions): no modo plan, ele lê arquivos e roda comandos somente-leitura, mas não edita o seu código. O Codex combina [sandbox e approval policy](https://learn.chatgpt.com/codex/sandboxing) como controles separados: o sandbox vai de `read-only` a `danger-full-access`, e a aprovação vai de `untrusted` a `never`. Cada produto organiza isso de um jeito diferente.

Então os modos podem resolver três problemas diferentes: deixar a tarefa mais focada, impedir alterações acidentais e reduzir o que precisa entrar no contexto. Mas você precisa olhar a implementação do harness antes de sair afirmando que um determinado modo serve para economizar tokens.

## Como diagnosticar a peça errada

Essa distinção vira uma ferramenta prática de diagnóstico.

![investigando](https://media.giphy.com/media/3oriO8vwmRIZO6kcNO/giphy.gif)

Se o agente entende mal a arquitetura, escreve código ruim ou não consegue raciocinar sobre uma mudança complexa, pode ser limitação do modelo, ou um contexto ruim que foi entregue a ele.

Se ele escolhe a ferramenta errada, não encontra arquivos, executa comandos de forma estranha, perde o estado, compacta a conversa cedo demais ou pede autorização a cada cinco segundos, isso aponta muito mais para o harness e a sua configuração.

E tudo isso é testável. Se você mantém o OpenCode e troca Claude por GPT ou DeepSeek, você trocou o motor e preservou o sistema em volta. Se você mantém o mesmo modelo e sai do OpenCode para o Claude Code, agora você mudou o harness: prompt, ferramentas, loop, permissões e estratégia de contexto podem mudar juntos.

## Para ser justo

Não é um benchmark perfeito, porque alguns modelos são treinados para um harness específico. É razoável supor que o Claude se comporte melhor dentro do Claude Code, e o GPT dentro do Codex, porque o fabricante ajusta o modelo e o harness juntos. Isolar a variável "modelo" dentro de um harness neutro não elimina esse efeito.

Também é justo dizer que o modelo importa muito. Um harness excelente não faz um modelo fraco raciocinar sobre uma refatoração complexa. O harness administra e entrega a inteligência; ele não a cria.

Mesmo assim, trocar uma peça de cada vez é muito melhor do que comparar dois pacotes inteiros e concluir que toda a diferença veio da LLM.

## Meu veredito

Então, qual é a diferença entre harness e LLM?

A LLM é a capacidade de raciocinar e gerar a próxima ação. O harness é o sistema que transforma essa ação em trabalho: monta o contexto, oferece ferramentas, executa, aplica limites e mantém o loop funcionando.

O modelo define boa parte do teto da inteligência. O harness define quanto dessa inteligência chega viva no seu projeto. Por isso o mesmo modelo pode parecer mediano em uma ferramenta e genial em outra. E por isso também não existe "o melhor agente" olhando apenas para o nome da LLM por baixo dos panos.

Na próxima vez que uma ferramenta fizer alguma besteira, em vez de só perguntar "qual modelo você está usando?", pergunte também:

- que contexto ela montou;
- quais ferramentas ela ofereceu;
- que permissões estavam ativas;
- como ela gerenciou o loop.

Documentações e números de tokens foram conferidos nas páginas oficiais em 4 de setembro de 2026 e podem ter mudado quando você ler isto.

Vídeo no YouTube: https://youtu.be/1K9WuPsaXdc

Conheça meu trabalho: https://bergholz.com.br/

## Links

- [OpenAI, Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [OpenCode, agentes Build e Plan e permissões](https://opencode.ai/docs/agents/)
- [OpenCode](https://opencode.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=harness-vs-llm)
- [Anthropic, tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Anthropic, custo de tokens de tool use e computer use](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude Code, permission modes](https://code.claude.com/docs/en/permissions)
- [Codex, sandbox e approval policy](https://learn.chatgpt.com/codex/sandboxing)
- [pi coding agent, system-prompt.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/system-prompt.ts)

Se você chegou até aqui, você é demais. Obrigado pelo seu tempo. Me conta nos comentários qual combinação de harness e LLM você está usando hoje, e em qual tipo de tarefa ela te deixou na mão. Até a próxima.

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

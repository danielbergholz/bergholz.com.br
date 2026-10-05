---
title: O perigo de depender do Claude Code
description: Eu uso o Claude Code, pago a assinatura e aproveito as ferramentas que a Anthropic coloca nele....
publishedAt: 2026-09-24T16:52:51.595Z
updatedAt: 2026-09-24T16:53:43Z
tags: []
videoId: SrvWenpdRZY
socialImage: /blog/db7d1808883d2ee7ead0.png
devtoUrl: https://dev.to/danielbergholz/o-perigo-de-depender-do-claude-code-39j8
devtoId: 4670588
estudioSource: canais/br/youtube/2026-09-11-depender-claude-code
---

Eu uso o Claude Code, pago a assinatura e aproveito as ferramentas que a Anthropic coloca nele. Também uso e pago o Codex. São dois produtos excelentes, e seria desonesto fingir o contrário só para montar um argumento contra big tech.

Ao mesmo tempo, eu não confio nem na Anthropic nem na OpenAI para controlar uma dependência essencial da minha carreira.

![olhando em volta com preocupação](https://media.giphy.com/media/g0gEi7yMBUEol0Kvkx/giphy.gif)

As duas frases parecem contraditórias, mas não são. Eu quero usar a melhor ferramenta disponível hoje sem precisar reaprender minha profissão se a empresa mudar preço, limite, plano, disponibilidade regional ou simplesmente retirar a feature da qual meu workflow passou a depender.

[embed](https://youtu.be/SrvWenpdRZY)

## Quando o workflow vira uma caixa-preta

Imagine que alguém na sua empresa deixou o Claude Code Desktop perfeitamente configurado. Você dispara várias tarefas em paralelo. Cada agente altera uma parte do projeto. As previews locais abrem sem disputar a mesma porta. Os secrets aparecem na worktree certa e ninguém comita um `.env` por acidente.

Você está muito produtivo. A pergunta desconfortável é: você saberia reconstruir esse workflow fora do Claude Code?

Uma interface boa deveria esconder complexidade desnecessária. Esse é um dos motivos pelos quais pagamos por software. O problema começa quando eu confundo fluência naquela interface com domínio do sistema por baixo dela.

Git worktree, por exemplo, não é uma invenção do Claude Code nem do Codex. É um recurso do Git que mantém múltiplas árvores de trabalho ligadas ao mesmo repositório. O harness pode automatizar a criação e a limpeza dessas árvores, mas o isolamento dos arquivos continua sendo uma capacidade do Git.

E worktree não resolve tudo. Se dois agentes precisam subir o projeto ao mesmo tempo, cada servidor ainda precisa de uma porta. A nova checkout precisa receber configuração local. Secrets precisam chegar ao ambiente sem entrar no repositório. Dependências talvez precisem ser instaladas de novo.

Eu não preciso executar cada uma dessas etapas manualmente todos os dias. Preciso saber que elas existem. Esse modelo mental é o que me permite reconhecer o mesmo problema quando a interface muda.

![preso procurando uma saída](https://media.giphy.com/media/q0FDhGCjTFDW2HUKvb/giphy.gif)

## Minha configuração não pode ser dona do meu conhecimento

Eu vejo muita gente estudando todos os hacks de uma ferramenta: como abrir mais agentes, como criar uma skill, qual comando colocar no `CLAUDE.md`. Isso é útil. Eu também estudo essas coisas.

Só não quero que o conhecimento do projeto more inteiro num formato proprietário.

Para instruções compartilhadas, minha preferência é manter a fonte canônica no `AGENTS.md`, um formato aberto adotado por diferentes agentes. O Claude Code lê `CLAUDE.md`, mas sua própria documentação mostra que esse arquivo pode importar o `AGENTS.md`:

```md
@AGENTS.md

## Claude Code

- Instruções específicas para o Claude Code ficam aqui.
```

Assim, o conteúdo comum continua independente do harness, enquanto o `CLAUDE.md` vira um adaptador fino para o que é específico do produto.

Aplico a mesma ideia às skills. O formato gira em torno de um arquivo `SKILL.md` e foi publicado como padrão aberto. Os diretórios de descoberta ainda variam entre ferramentas, então existe trabalho de integração, mas a fonte da verdade não precisa ser reescrita a cada troca.

## Eu distribuo a dependência em três camadas

Eu não resolvo esse problema fingindo que ferramenta proprietária é ruim. Resolvo evitando que uma empresa seja dona de todas as peças.

A primeira camada é o harness. Eu uso Claude Code, Codex e OpenCode. Harness é o software que recebe seu pedido, monta o contexto, oferece ferramentas para o modelo e executa as ações escolhidas por ele. Se essa distinção é nova para você, eu expliquei o agent loop inteiro no vídeo [Qual a diferença entre LLM e harness?](https://www.youtube.com/watch?v=1K9WuPsaXdc).

Usar mais de um harness me força a separar princípio de conveniência. Worktree é princípio de isolamento. Um botão que cria a worktree para mim é conveniência. Os dois têm valor, mas só um deles sobrevive intacto quando eu troco de produto.

A segunda camada são os padrões abertos: `AGENTS.md`, `SKILL.md` e o próprio Git. Eles diminuem a quantidade de conhecimento que precisa ser migrada quando a ferramenta muda.

A terceira camada é uma rota para outros modelos e providers. No OpenCode com OpenRouter, eu uso modelos chineses, open weights e outras alternativas. Para Claude e GPT, meu volume torna a assinatura direta mais interessante do que pagar a API por token; essa é uma decisão pessoal de custo, não uma regra universal.

Gateways como OpenRouter e Vercel AI Gateway oferecem uma interface comum para trocar modelos e, em alguns casos, providers. Isso não elimina dependência de infraestrutura. A diferença é que essa infraestrutura pode ser substituível.

Com open weights, a rota de saída pode ser ainda mais forte. Eu não preciso ter uma GPU em casa para me beneficiar de pesos disponíveis: posso consumir o modelo por um host e migrar para outro compatível se o primeiro deixar de servi-lo. Independência, para mim, não é ter um datacenter na sala. É conseguir substituir uma peça sem reconstruir tudo.

## Para brasileiros, jurisdição faz parte da arquitetura

Em 12 de junho de 2026, o governo dos Estados Unidos emitiu uma diretiva para suspender o acesso de estrangeiros aos modelos Fable 5 e Mythos 5. A Anthropic disse que não conseguia verificar a nacionalidade em tempo real e, para cumprir a ordem, retirou os dois modelos de todos os clientes.

A empresa discordou da medida. Em 30 de junho, anunciou que os controles haviam sido retirados e que o Fable 5 voltaria a ficar disponível globalmente em 1º de julho. O acesso ao Mythos 5 foi restaurado inicialmente para um conjunto de organizações americanas.

Esse desfecho importa e precisa ser contado. O acesso voltou. Mesmo assim, o episódio mostrou que uma decisão de um governo estrangeiro conseguiu interromper um produto global de um dia para o outro.

Eu sou brasileiro. A maioria de quem acompanha meu canal também é. A gente não vota nesse governo e não tem influência sobre a empresa que precisa cumprir a ordem. Não é necessário transformar a Anthropic em vilã para concluir que essa dependência merece uma rota de saída.

![correndo em direção à liberdade](https://media.giphy.com/media/jc7a0kmlZEq7EJAtu2/giphy.gif)

## Para ser justo

Distribuir dependência tem custo. Mais ferramentas significam mais configuração, mais diferenças pequenas para lembrar e menos tempo aproveitando profundamente uma única interface. Um modelo open weights servido por terceiros também continua sujeito a preço, capacidade, privacidade e disponibilidade do host. Portabilidade não é soberania total.

Também não acho racional abandonar uma ferramenta excelente por causa de um risco hipotético. Se Claude Code é o melhor produto para o seu trabalho hoje, use. Aprenda os atalhos, configure as skills e aproveite as features que melhoram sua entrega.

Meu ponto é preservar a capacidade de sair.

## Use a ferramenta sem entregar sua autonomia

Eu quero usar cem por cento do Claude Code sem depender cem por cento da Anthropic. Por isso estudo os fundamentos que a interface automatiza, trabalho com mais de um harness, mantenho instruções e skills em formatos portáveis e conservo uma rota para modelos fora das duas empresas que dominam meu uso diário.

Não elimino toda dependência. Garanto que nenhuma empresa sozinha seja dona do meu harness, das instruções do projeto, do modelo e do acesso à inferência ao mesmo tempo.

Ferramentas mudam. Empresas mudam as regras. Modelos podem desaparecer. Os princípios ficam.

Vídeo no YouTube: https://youtu.be/SrvWenpdRZY

Conheça meu trabalho: https://bergholz.com.br/

## Links

- [Git worktrees](https://git-scm.com/docs/git-worktree)
- [Claude Code: worktrees](https://code.claude.com/docs/en/worktrees)
- [Claude Code: `CLAUDE.md` e import de `AGENTS.md`](https://code.claude.com/docs/en/memory)
- [AGENTS.md](https://agents.md/)
- [Anthropic: Agent Skills e `SKILL.md`](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [OpenCode](https://github.com/anomalyco/opencode)
- [OpenRouter: quickstart](https://openrouter.ai/docs/quickstart)
- [OpenRouter: seleção e fallback de providers](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Vercel AI Gateway: modelos e providers](https://vercel.com/docs/ai-gateway/models-and-providers)
- [Anthropic: suspensão de Fable 5 e Mythos 5](https://www.anthropic.com/news/fable-mythos-access)
- [Anthropic: restauração do Fable 5](https://www.anthropic.com/news/redeploying-fable-5)

Se você chegou até aqui, obrigado pelo seu tempo. Se Claude Code ou Codex sumisse amanhã, quanto do seu workflow continuaria funcionando? E qual seria o seu plano B?

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

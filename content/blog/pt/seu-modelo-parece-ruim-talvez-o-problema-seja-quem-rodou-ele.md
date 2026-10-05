---
title: "Seu modelo parece ruim? Talvez o problema seja quem rodou ele"
description: "Modelo, provider e AI gateway são três camadas diferentes. Mostro o que isso muda em preço, quantização e tool calls, com meu uso real de OpenCode e OpenRouter."
publishedAt: "2026-10-12T16:00:00Z"
tags: [ai, llm, opencode, programming]
videoId: P9KYwXNQmIw
estudioSource: canais/br/youtube/2026-09-24-o-que-e-ai-gateway
---

Essa semana eu tava usando o OpenCode com o MiMo V2.6 Pro, o modelo da Xiaomi. Se alguém me perguntasse qual IA eu usei, eu ia responder "MiMo" e pronto.

Só que aí eu abri os logs da OpenRouter e cada requisição tinha três nomes. O modelo era o MiMo. Quem rodou o modelo era a DeepInfra. E antes de chegar na DeepInfra, o pedido tinha passado pela própria OpenRouter.

![Tentando entender quantos nomes cabem numa IA só](https://media.giphy.com/media/WRQBXSCnEFJIuxktnw/giphy.gif)

Modelo, provider e gateway. Três coisas diferentes que a gente chama de "IA", e essa confusão tem consequência: o mesmo modelo muda de preço dependendo de quem roda e, às vezes, até responde diferente. Gravei um vídeo separando as três camadas. Esse texto é a versão pra leitura, com os números que conferi depois.

[embed](https://www.youtube.com/watch?v=P9KYwXNQmIw)

## Três camadas

O **modelo** é o que um laboratório como a Z.AI, a Moonshot ou a Xiaomi treina. O resultado é basicamente um arquivo gigante com bilhões de números, os famigerados pesos. Sozinho esse arquivo não faz nada: ele precisa rodar em GPU com muita memória.

Aí entra o **provider**, ou provedor de inferência. Inferência é só o nome técnico pra rodar o modelo e gerar uma resposta. O provider coloca o modelo em GPUs e te vende acesso por uma API, cobrando por token. Às vezes o laboratório e o provider são a mesma empresa, como a Anthropic com o Claude. Quando o modelo é open weights, ou seja, os pesos são públicos, qualquer empresa com GPU pode baixar e vender inferência.

Se você é dev web, pensa no Postgres. O Postgres é um só, e RDS, Neon e Supabase rodam esse mesmo Postgres, cada um com seu preço, sua performance e seus limites. O modelo é o Postgres. O provider é o RDS.

O **gateway** é uma porta de entrada única pra vários providers. Você tem uma API, uma chave e uma fatura. Ele recebe o pedido, escolhe pra qual provider mandar, tenta outro se esse cair e registra tudo.

Se você viu meu vídeo sobre [a diferença entre LLM e harness](https://www.youtube.com/watch?v=1K9WuPsaXdc), dá pra montar a pilha inteira. O OpenCode é o harness: monta o contexto e executa as ferramentas. A OpenRouter é o gateway. A DeepInfra, nessa demo, é o provider. E o MiMo é o modelo.

## Mesmo modelo, preços bem diferentes

Até modelo fechado tem mais de um provider. Na OpenRouter, a [página do Claude Sonnet 5](https://openrouter.ai/anthropic/claude-sonnet-5/providers) lista cinco: Anthropic, Amazon Bedrock, Google, Azure e Claude Platform on AWS. Mesmo modelo, cinco empresas rodando.

Com open weights a variedade é maior. O [GLM 5.3](https://openrouter.ai/z-ai/glm-5.3/providers), da Z.AI, tinha 31 providers quando conferi em 30/09/2026. No preço de entrada, o mais barato cobrava uns 13 centavos de dólar por milhão de tokens. A própria Z.AI, que treinou o modelo, cobrava US$ 1,40. O mais caro, US$ 2,80.

![Mesmo modelo, preço completamente diferente](https://media.giphy.com/media/SqmkZ5IdwzTP2/giphy.gif)

No vídeo eu falei em "cinco vezes de diferença". Era a conta certa no dia em que escrevi o roteiro, mas a lista muda toda semana e, na página de hoje, a diferença passa de vinte vezes. Guarde o espírito: o preço depende muito de quem roda.

Só que "pega o mais barato" tem pegadinha, e ela se chama quantização. Cada um daqueles bilhões de números do modelo é guardado com uma certa precisão. Em FP8, cada número usa oito bits. Em FP4, quatro. Menos bits, menos memória, GPU mais barata e preço menor. Só que você pode perder qualidade no caminho.

Na lista do GLM 5.3, a Z.AI roda o modelo em FP8, vários providers rodam em FP4 e uma boa parte nem informa. Também não é regra que menos bits seja pior: tem laboratório que serve o próprio modelo em uma precisão baixa. É uma variável que muda entre providers, e quase ninguém olha.

## Isso não é teoria: o teste da Moonshot

A Moonshot, que fez o Kimi, recebeu tanta reclamação de que o Kimi K2 errava tool calls que criou um teste só pra comparar os providers, o [K2 Vendor Verifier](https://github.com/MoonshotAI/K2-Vendor-Verifier).

Tool call, relembrando, é quando o modelo pede pro harness executar uma ferramenta, tipo ler um arquivo, mandando um JSON com os argumentos. O teste mede quantas dessas chamadas chegam com o JSON válido pro schema.

No teste de 15/11/2025 com o K2 0905, a API oficial da Moonshot acertou 100%. Vários providers também: DeepInfra, Fireworks e NovitaAI, por exemplo, ficaram em 100% nessa rodada. Mas Baseten, AtlasCloud e Together, acessados pela OpenRouter, ficaram entre 71,96% e 72,49%. Mais de uma a cada quatro tool calls chegava quebrada.

Isso tem quase um ano e pode já ter sido corrigido, então não é pra apontar dedo pra ninguém. O ponto é outro. Eu usei o Kimi e não gostei dele. Pode ser culpa de quem rodou o Kimi, não do Kimi em si.

![Antes de culpar o modelo, olha quem rodou](https://media.giphy.com/media/l36kU80xPf0ojG0Erg/giphy.gif)

A própria OpenRouter reconhece que isso existe. Ela tem a variante [Exacto](https://openrouter.ai/docs/guides/routing/model-variants/exacto), que ordena os providers priorizando os que têm sinais melhores de qualidade em tool calling. Você ativa colocando `:exacto` no nome do modelo. Pela documentação, o Auto Exacto já roda sozinho nas requisições com tool call.

## Quem escolhe o provider

Se você não escolher nada, o gateway escolhe. Segundo a [documentação de provider selection](https://openrouter.ai/docs/guides/routing/provider-selection), a OpenRouter dá prioridade a providers sem queda significativa nos últimos 30 segundos e, entre eles, sorteia com peso inverso ao quadrado do preço. Um provider a US$ 1 por milhão recebe nove vezes mais tráfego que um a US$ 3.

Se você quiser controlar, dá pra ordenar por preço, vazão ou latência, fixar um provider, proibir outros, filtrar por quantização ou desligar o fallback.

## O que eu uso de verdade

Na maior parte do tempo eu uso o OpenCode como harness e a OpenRouter como gateway. Pedi pra ele me explicar um projeto e fui olhar os logs: MiMo V2.6 Pro, provider DeepInfra, app OpenCode. As duas chamadas mais recentes custaram US$ 0,00118 e US$ 0,00325, frações de centavo.

Tem uma coluna ali que eu achei interessante: Routing Overhead, o tempo que a OpenRouter gastou decidindo pra onde mandar o pedido. Nas duas, 0,09 segundo. Guarda esse número.

A vantagem que eu mais gosto é trocar de modelo mudando uma string. Não preciso de conta na Xiaomi, na Z.AI ou na Moonshot, nem de cartão cadastrado em cada uma.

A OpenRouter não é a única opção. O console do OpenCode também funciona como gateway: o mesmo time que criou o harness vende créditos pra usar modelos. A diferença é a curadoria. Em vez de centenas de modelos, é uma lista que o time escolheu e testou pra coding agents. Eu tenho uns dólares de crédito lá também, mas na maioria das vezes uso a OpenRouter.

E olha que curioso: na aba Providers do console, a OpenRouter aparece como provider. Provider é quem tá logo abaixo de você na pilha. Pro console do OpenCode, é a OpenRouter. Pra OpenRouter, é a DeepInfra.

Tem ainda o Vercel AI Gateway, que eu nunca usei. Então só conto o que a [documentação](https://vercel.com/docs/ai-gateway) promete: foco em IA dentro de um app em produção, orçamento por projeto e por chave, log de cada requisição e fallback entre providers. O app nem precisa rodar na Vercel.

## Zero markup, mas alguém paga a conta

Todo mundo diz que não cobra markup no token, e nos três casos isso é verdade: o token custa o mesmo que no provider. Mas ninguém roda essa infraestrutura de graça.

A OpenRouter cobra [5,5% quando você compra crédito](https://openrouter.ai/pricing). O console do OpenCode repassa a taxa do cartão. A [Vercel não cobra nada no token](https://vercel.com/docs/ai-gateway/pricing), nem com a sua própria chave, mas a taxa de pagamento fica com você, e algumas features, como zero data retention pro time inteiro, são cobradas à parte. Nada disso é absurdo. Só vale saber onde o dinheiro aparece.

## Pra ser justo: quando não usar

Gateway não é obrigatório, e ele tem custo além de dinheiro. É mais um salto na rede. O overhead é pequeno, mas não é zero. É mais uma empresa vendo o seu prompt, e se isso é código de cliente, importa. É mais um contrato pra ler e mais uma dependência: se o gateway cair, cai tudo junto.

A vantagem é que a maioria fala o formato da API da OpenAI, então sair de um gateway costuma ser trocar uma URL e uma chave.

Também tem um caso que o gateway simplesmente não cobre: assinatura. Eu assino Claude Code e Codex, e esses planos não viram crédito em gateway nenhum. Pro Claude e pro GPT eu uso a assinatura direto. Por API, no volume que eu uso, ia sair caro demais.

Onde o gateway brilha pra mim é no resto: testar modelos chineses e open weights no OpenCode sem abrir conta em cada laboratório. E minha experiência com a OpenRouter sempre foi ótima. Não tenho nenhuma história de desastre pra contar, o que é quase um elogio chato.

Se você usa um modelo só, de um laboratório só, a API direta resolve. Não precisa inventar camada.

## Então, o que é um AI gateway?

O modelo é o arquivo de pesos. O provider é quem roda esse arquivo na GPU. O gateway é a porta de entrada que deixa você trocar os dois sem reescrever nada.

Da próxima vez que o modelo parecer ruim, antes de sair xingando ele, olha quem rodou, em qual quantização e por onde o pedido passou.

Vídeo no YouTube: [O que é um AI gateway?](https://www.youtube.com/watch?v=P9KYwXNQmIw)

Conheça meu trabalho: https://bergholz.com.br/

Obrigado por ler até aqui! Você usa algum gateway ou chama a API dos laboratórios direto?

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

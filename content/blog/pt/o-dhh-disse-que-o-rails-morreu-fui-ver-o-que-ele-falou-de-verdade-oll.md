---
title: O DHH disse que o Rails morreu? Fui ver o que ele falou de verdade
description: "O DHH abriu a keynote do Rails World com uma pergunta pra plateia: quem ainda escreve uma quantidade..."
publishedAt: 2026-10-01T18:12:42.705Z
updatedAt: 2026-10-01T18:14:29Z
tags:
  - discuss
  - programming
  - ruby
videoId: x8dt_Fr5gUc
socialImage: /blog/3ba0fc306491df731722.png
estudioSource: canais/br/youtube/2026-09-25-dhh-abandonou-rails
---

O DHH abriu a keynote do Rails World com uma pergunta pra plateia: quem ainda escreve uma quantidade relevante de código na mão toda semana?

Ele mesmo contou em voz alta: cinco mãos. Numa sala lotada de devs Rails.

Os tweets apareceram no mesmo dia. Gente dizendo "Rails is dead" com a foto do salão cheio, gente postando o slide do DHH como programador aposentado de 2001 a 2026, gente deprimida, gente agressiva. Uma resposta resumia bem: se você é dono do brinquedo e não liga mais pra ele, dá pra outra pessoa.

![Choque geral](https://media.giphy.com/media/raLP6IPECPxwoRnXvv/giphy.gif)

Fui assistir ao que ele disse de verdade, trecho por trecho, e gravei a reação. O que eu achei é que o anúncio é menor do que parece e a ideia por trás dele é maior.

[embed](https://www.youtube.com/watch?v=x8dt_Fr5gUc)

## O anúncio é sobre o HEY, não sobre o Rails

A nova versão do HEY, o e-mail da 37signals, não vai mais ser um web app. Vão ser apps nativos no front e Rust no back. Pelo que ele contou, os seis apps nativos tinham sido iniciados cerca de uma semana antes da keynote. Nada foi lançado.

Faz sentido pro HEY. Web app pra um time pequeno existe porque o time não consegue manter seis apps nativos. É pra isso que serve React Native, e foi por isso que a própria 37signals criou o [Hotwire Native](https://native.hotwired.dev/): você reaproveita código e aceita uma experiência um pouco pior.

Só que o custo dessa troca muda quando quem escreve o código é o agente. E não é só o DHH que tá pensando assim. A Shopify [publicou em 10 de setembro](https://shopify.engineering/back-to-native) que está saindo do React Native e voltando pra Swift e Kotlin. Segundo o texto, o Shop app foi da prova de conceito até as lojas em 12 semanas, com ajuda de IA, e o app principal da Shopify também está em reescrita.

Repara no que isso é. É uma empresa dizendo que uma decisão de 2020 dependia de uma premissa, e a premissa mudou.

## "Eu odeio Rust"

A parte que mais me chamou atenção foi o backend. O DHH disse que odeia Rust com paixão e que olhar o código dela é como jogar ácido nos olhos. Mas que, se ele nunca precisa olhar, o que sobra é aplicação de 30 a 100 vezes mais rápida, executável minúsculo e startup em submilissegundos. Aí ele ama Rust.

Pensa comigo. Por que alguém escolhia Ruby? Performance com certeza não era. Ruby foi feita pra deixar o programador feliz, é uma linguagem linda de ler.

Só que o agente não tá nem aí pra isso. Ele não sofre lendo Rust. Se quem lê e escreve o código é o agente, a beleza da linguagem virou um critério irrelevante, e sobra uma pergunta só: qual é a melhor ferramenta pra esse trabalho? Pro servidor de e-mail do HEY, ele concluiu que é Rust.

Os números que ele deu são de chamar atenção: 99% menos CPU, 95% menos memória, e o pico de tráfego do HEY cabendo, talvez, num Raspberry Pi. Mas precisa de ressalva. Ele mesmo chamou de conta de guardanapo. Não existe benchmark público, e reescrever um sistema que você já conhece sempre fica mais enxuto. A direção me parece certa. O número exato, eu trataria como alegação.

![Isso é normal](https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif)

Eu falo isso de um lugar meio estranho. Saí do Next, fui pro Rails, acabei no Elixir e amo Elixir. O argumento vale pro Elixir também. Mais pra frente na keynote, o DHH chega a dizer que achou uma linguagem melhor que o Ruby, o inglês.

## O pedaço que quase ninguém compartilhou

Se a linguagem não importa mais e o próprio DHH tá largando Ruby, o Rails morreu. Foi o que muita gente entendeu.

Só que ele não parou aí. Logo depois, ele separa dois tipos de app. O HEY é e-mail, você usa todo dia, então vale instalar um app e faz sentido ser nativo. O Basecamp recebe gente de fora, que só quer baixar um arquivo e ir embora, sem instalar nada. Esse continua na web, e pra web ele acha o Rails muito bem posicionado.

O argumento dele é que convenção sobre configuração, o que o Rails faz há 25 anos, leva direto a eficiência de tokens. Se todo projeto Rails tem a mesma estrutura, o agente lê menos arquivo, gasta menos token e erra menos.

Esse é o melhor argumento contra o que eu acabei de defender, e eu concordo com ele. Então deixa eu corrigir minha própria frase. Não é que a linguagem não importa. É que a beleza dela não importa mais. Convenção e performance continuam importando, e muito.

![Mic drop](https://media.giphy.com/media/DfbpTbQ9TvSX6/giphy.gif)

## Por que a reação foi tão forte

O DHH disse que escrever código na mão deixou de ser uma atividade economicamente produtiva pra grande maioria dos programadores, na grande maioria das empresas. Que isso vale hoje, e que até o fim do ano vai valer pra praticamente todos. E que a gente teve uma corrida maravilhosa esculpindo código na mão, e acabou.

Eu entendo a reação. Muita gente construiu a identidade em cima de ser dev Ruby. Ouvir o criador do Rails falar isso dói.

Mas vou ser direto: boa parte daquelas respostas é negação. E quem continuar nessa linha e não se adaptar vai perder o emprego. Eu já vi, com meus próprios olhos, funcionários serem demitidos por se recusarem a usar IA.

Pra ser justo com o outro lado, o DHH é dono de empresa, e pra dono código barato é lucro. Quando o time dele deixou os designers fazerem as últimas features do Basecamp 5 no vibe coding, a arquitetura virou uma gambiarra. Revisar código continua sendo trabalho.

## Meu veredito

O Rails não morreu. O que morreu foi a ideia de escolher stack pela beleza do código que um humano vai digitar. Convenção, performance e ecossistema continuam contando, e quem tá preso a essa estética vai precisar de outro motivo pra escolher a linguagem.

Conheça meu trabalho: https://bergholz.com.br/

Obrigado por ter lido até aqui. Me conta nos comentários: você ainda escreve código na mão toda semana?

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

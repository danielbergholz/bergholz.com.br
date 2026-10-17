---
title: "A OpenAI matou a matemática?"
description: "A OpenAI publicou centenas de trabalhos resolvendo problemas em aberto e uma associação de matemáticos respondeu que ninguém pediu. O que foi anunciado de fato, a briga que veio depois e por que eu acho que rigor é uma coisa e segurar descoberta é outra."
publishedAt: "[CONFIRMAR: horário de lançamento do vídeo, ex.: 2026-10-29T16:00:00Z]"
tags: [ai, math, openai]
videoId: "[CONFIRMAR: ID do vídeo no YouTube]"
estudioSource: canais/br/youtube/2026-10-14-openai-matou-matematica
---

A OpenAI publicou centenas de trabalhos com soluções para problemas de matemática que estavam em aberto. Aí uma associação da área soltou uma nota dizendo, basicamente: ninguém pediu pra vocês fazerem isso.

Como assim ninguém pediu? Agora precisa de autorização pra resolver um problema?

![Quem perguntou?](https://media.giphy.com/media/zN4gcLICxNiZYoN5K7/giphy.gif)

Eu fui ler a briga no Twitter e parecia que eu tava lendo dev reclamando de IA. A máquina faz uma coisa que antes precisava de anos de estudo e aí começa: "mas não tem o aspecto humano", "mas e a jornada?", "mas não pode ser assim". É impressionante como o discurso muda quando chega na nossa profissão.

Eu gravei um vídeo sobre isso. Aqui vai a versão escrita.

[embed](https://www.youtube.com/watch?v=[CONFIRMAR: ID do vídeo])

## Como isso começou

Pegou fogo com Navier–Stokes, em setembro de 2026. A OpenAI [apresentou uma prova](https://openai.com/pt-BR/index/navier-stokes-solution/) de que, com uma força externa suave, a velocidade de um fluido pode crescer sem limite num tempo finito. E publicou essa prova em [Lean](https://lean-lang.org/), pra ser conferida por computador. Sem a força externa, a pergunta continua aberta.

Aí, em [6 de outubro](https://openai.com/pt-BR/index/sharing-ai-progress-in-mathematics/), veio mais. Centenas de trabalhos de uma vez, em várias áreas. Acabou a conversa de que era um caso isolado, e o pessoal começou a discutir se ainda ia ter trabalho pra fazer.

## O que foi anunciado de fato

Antes da briga, os números, porque tem muito exagero rolando dos dois lados.

O [catálogo no GitHub](https://github.com/openai/math) lista 719 manuscritos, agrupados em 372 famílias. Tem trabalho que depende de outro, tem resultado relacionado, então não sai falando que são 719 problemas diferentes resolvidos. E cerca de 42% dos resultados principais têm prova formalizada. Ainda tem bastante coisa pra conferir.

Dois exemplos pra dar a escala:

- **Função zeta.** É a função ligada à distribuição dos números primos. Eles afirmam ter provado que ela não tem zeros numa região com parte real acima de 7/8. Pra Hipótese de Riemann completa, o limite relevante é 1/2, então ainda falta. Mas olha o tipo de problema que essa ferramenta tá atacando. Não é conta difícil de vestibular.
- **Multiplicação de matrizes.** Um [limite de 9/4 (2,25)](https://github.com/openai/math/blob/main/preprints/Matrix-Multiplication-Nine-Fourths-October-2-2026/paper.pdf) pro expoente. Pra quem é dev: é sobre quanto o custo cresce quando a matriz aumenta. É um resultado teórico, não um update que você instala e o seu programa fica mais rápido. Mas é uma proposta concreta pra estudar e conferir.

Segundo a OpenAI, cada resultado levou, em média, o equivalente a três horas de raciocínio do ChatGPT Pro, usando um modelo interno. Não é um modelo público que você abre no navegador. É a empresa falando do compute que gastou.

Se esses resultados se confirmarem, pensa na diferença de escala. O que antes rendia anos de trabalho agora aparece às centenas. Dá pra entender o susto.

![Cabeça explodindo](https://media.giphy.com/media/75ZaxapnyMp2w/giphy.gif)

## A reação conseguiu ser mais interessante que o anúncio

O [ThePrimeagen postou](https://x.com/ThePrimeagen/status/2108001825781580107) que a OpenAI resolveu a matemática de uma vez. Teve quem [chamou a reação de reserva de mercado](https://x.com/rohanpaul_ai/status/2108021673706615292). Do outro lado, o pessoal reclamando: vocês jogam esse monte de paper na internet e sobra pra nós conferir se tem erro. O Twitter virou aquela maravilha que você já conhece.

O [Le Monde contou](https://www.lemonde.fr/en/science/article/2026/10/12/openai-s-latest-blow-to-mathematicians-they-have-annihilated-my-field-of-research_6758515_10.html) que o Hugo Duminil-Copin, que ganhou a medalha Fields, chorou depois do anúncio e ficou preocupado com quem tá começando na área. Eu entendo. Você passou anos estudando, construiu a sua vida em volta disso e aparece uma máquina fazendo aquele trabalho. É um baque. Mas eu não vou defender que uma descoberta espere só porque ela deixou alguém mal, por mais competente que essa pessoa seja.

E também teve pesquisador animado. O [Ion Nechita](https://x.com/nechita_ion/status/2107679271108116880) foi listando os resultados que interessavam pra ele e falando que aquilo podia marcar uma mudança enorme na área. Nem todo mundo resolveu brigar com a ferramenta.

Agora, do lado empolgado também tem viagem. Circulou um [ranking dizendo que 81% das descobertas](https://x.com/willdepue/status/2107604920753070317) daquela comparação tinham saído naquele dia. Como o autor chegou nisso? Pediu pra duas IAs fazerem o ranking. Pronto, virou estatística, pode postar.

Calma. Resposta de chatbot não vira estudo só porque o número ficou bonito. Eu quero ver esses resultados confirmados, mas não preciso comprar todo post empolgado.

## "Ninguém pediu"

Voltando pra frase que me pegou. A nota é da [Association for Human Mathematics](https://www.ahmath.org/statements), e o Terence Tao [republicou no blog dele](https://terrytao.wordpress.com/2026/10/07/ahm-statement-on-openais-october-6-release-of-mathematical-documents/). Eles dizem que essa divulgação não é progresso e pedem pro pessoal parar de trabalhar com a OpenAI.

Não quer trabalhar com a empresa? Beleza. Agora, o problema tá aberto, alguém apresenta uma solução e a sua resposta é que não pediu? Eu não consigo levar esse argumento a sério. Desde quando eu preciso consultar quem trabalha na área antes de tentar resolver alguma coisa?

Tem uma reclamação que eu entendo muito mais. Um [grupo consultivo de matemáticos](https://agmai.org/general-sep29/) pediu pra parar de testar esses problemas em modelos fechados, que o resto dos pesquisadores não consegue usar. A empresa tem uma ferramenta que ninguém mais tem e sai competindo com todo mundo. Eu também quero mais acesso, quero ver as provas e quero que outros consigam conferir.

Inclusive, a OpenAI diz que seguiu recomendações desse grupo, só que o documento começa justamente pedindo pra parar esses testes. Então calma lá também: você conversou com o pessoal, não recebeu um cheque em branco. Prometer dinheiro pra conferência e workshop não resolve essa diferença.

Só que eu continuo querendo que os problemas sejam resolvidos. A resposta pra ferramenta fechada é a ferramenta chegar a mais pessoas, não segurar a descoberta pra todo mundo acompanhar no mesmo ritmo.

## E o Tao?

O Tao sabe que a IA resolve problema difícil. A discussão dele é outra: resolver por resolver pode fazer mal pra área se os humanos não entenderem o que aconteceu ali. Na palestra [Math 2.0](https://teorth.github.io/tao-web/slides/math-2-0-caltech-2026.pdf), ele fala em dar menos importância à resolução de problemas, e diz que uma solução automática que chega cedo demais pode até esterilizar o trabalho em volta daquele problema.

Eu li isso e fiquei: cedo demais pra quem? O problema ficou anos aberto. Se apareceu uma solução correta, eu quero saber. Depois nós estudamos, pedimos explicação, usamos a própria IA pra simplificar a prova. Por que precisa continuar sem resposta enquanto isso?

Pra mim, matemática é a linguagem do universo. Ela não tá nem aí se você fez doutorado ou levou 20 anos. A prova tá certa ou tá errada, e a sua experiência fazendo aquilo não muda o resultado.

"Ah, mas eu gosto de fazer matemática." Continua fazendo. Eu também gosto de programar. Isso não significa que o resto do mundo tem que esperar eu terminar. Dá pra gostar de fazer uma coisa sem exigir que ela só seja feita do seu jeito.

## Rigor sim, humano obrigatório não

Aí vem o argumento da revisão: precisa dar tempo pros humanos conferirem. Tá, e se uma máquina conseguir conferir melhor e mais rápido? Vai continuar esperando por quê?

É pra isso que existe o Lean. Você escreve a prova num formato que o computador consegue verificar pelas regras da lógica. Não é mandar pra outro chatbot e receber um "parece certo, parabéns". Tem um verificador conferindo cada passo.

Claro que isso não resolve tudo sozinho. Você precisa conferir se provou o problema certo, se não colocou uma hipótese que não podia, se não mudou uma definição, se não usou algo que não estava demonstrado. E o verificador também pode ter bug. O [Thomas Hales escreveu um texto ótimo](https://terrytao.wordpress.com/2026/10/09/what-mathematicians-should-know-about-the-lean-theorem-proverquestions-of-reliability-and-ai/) sobre exatamente esses cuidados.

E teve erro nesse anúncio. [Três trabalhos foram retirados](https://github.com/openai/math/blob/main/history.md), porque um erro num argumento afetava os outros também. Então não, eu não tô falando pra sair aceitando qualquer PDF que a OpenAI publicar. Encontrou erro? Aponta, corrige, retira o que não se sustenta. É assim que tem que funcionar.

O que eu não aceito é transformar o humano numa etapa obrigatória pra sempre. Se dá pra montar um sistema que verifica com mais rigor que uma pessoa lendo, usa esse sistema. A pessoa cansada também deixa passar erro, e ninguém ganhou garantia de qualidade só porque tem diploma. Se ainda falta uma checagem, vamos construir essa checagem. Conforme o volume aumenta, depender de alguém lendo tudo à mão fica cada vez mais absurdo.

## Crítica que dá pra ter, e ego

Olha o [Francesco Maggi](https://x.com/Frances01896069/status/2109010432350376344). Ele critica a OpenAI, mas também contou que, segundo os colegas que estão conferindo Navier–Stokes, a prova formal parece correta e tem ideias novas. E cobrou transparência e acesso à ferramenta. Beleza, essa é uma discussão que dá pra ter.

Agora, quando o problema é que foi uma máquina que fez, aí pra mim é ego.

É o dev vendo uma pessoa que não sabe programar criar um app e procurando motivo pra dizer que aquilo não vale. Você passou anos aprendendo, a outra pessoa abriu uma ferramenta e fez. Eu entendo que incomoda. Mas esses anos eram o que você precisava pra conseguir fazer aquilo, não uma dívida que o resto do mundo tem com você.

O app funciona? Resolve o problema? Dá pra testar? Então vamos falar disso. Se tem falha, mostra a falha. Exigir que o autor tenha passado pelo mesmo caminho que você é querer preservar a dificuldade porque ela te dava uma vantagem.

E é a mesma coisa aqui. Eu quero saber se o resultado tá certo, não quantos humanos precisaram sofrer antes dele aparecer.

## Então, a OpenAI matou a matemática?

Não. Pra mim, resolver um problema é motivo de celebração. Se isso bagunça a profissão, a profissão vai ter que mudar. Não faz sentido deixar um problema aberto só pra preservar o trabalho de quem tava tentando resolver.

![Comemoração](https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif)

Eu quero que humano e máquina resolvam o máximo possível, do jeito mais rápido e eficiente que der, com prova que dá pra conferir, crédito pra quem contribuiu e mais pessoas podendo usar a ferramenta. E se a IA também consegue explicar, simplificar e encontrar novas perguntas, melhor ainda: usa ela pra isso também.

O que não dá é exigir que tudo continue difícil e demorado porque foi assim com você.

Vídeo no YouTube: [A OpenAI matou a matemática?](https://www.youtube.com/watch?v=[CONFIRMAR: ID do vídeo])

Conheça meu trabalho: https://bergholz.com.br/

Obrigado por ler até aqui.

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

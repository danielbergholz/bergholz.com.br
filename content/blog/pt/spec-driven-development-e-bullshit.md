---
title: "Spec-Driven Development é bullshit"
description: "Planejar antes de pedir código pro agente é ótimo. O problema é transformar o plano numa fábrica de Markdown que precisa ficar sincronizada com o código pra sempre."
publishedAt: "2026-10-15T16:00:00Z"
tags: [ai, programming, productivity]
videoId: Boxi6nslTQM
estudioSource: canais/br/youtube/2026-09-18-spec-driven-development-bullshit
---

Spec-Driven Development é bullshit. Pronto, falei.

E antes que alguém fique bravo: eu não tô dizendo que pensar antes de programar é ruim. Muito pelo contrário. Meu problema é outro. Desenvolvedor adora pegar um processo simples, dar um nome bonito, criar quinze arquivos em volta dele e chamar isso de engenharia.

![facepalm](https://media.giphy.com/media/XD4qHZpkyUFfq/giphy.gif)

Na maioria das vezes, você não precisa de uma metodologia. Você só precisa conversar com o agente antes de pedir pra ele sair alterando o código. Eu gravei um vídeo curto sobre isso, meio desabafo, meio rant, e resolvi expandir aqui com os links que mostrei na tela.

[embed](https://youtu.be/Boxi6nslTQM)

## A promessa parece ótima

A ideia do SDD é assim: você começa com uma spec. Dessa spec sai um plano técnico. Do plano sai uma lista de tasks. Aí o agente implementa tudo, uma task de cada vez. No [post em que o GitHub apresentou o Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/), as fases são literalmente `Specify → Plan → Tasks → Implement`, e a spec vira a fonte da verdade compartilhada do projeto.

Isso parece muito organizado. E a parte boa é óbvia.

Um agente não consegue ler a sua mente. Se você pede uma feature vaga, ele vai preencher os buracos com suposições. Pensar nos requisitos, encontrar gaps e decidir o que você quer antes da implementação é uma excelente ideia. É exatamente o que eu prefiro fazer.

Só que nada disso exige transformar o planejamento numa segunda implementação do sistema, escrita em Markdown.

## O que eu vi na prática

Eu já trabalhei numa empresa que, em teoria, usava SDD. Na prática, a gente tinha uma spec dizendo uma coisa, os testes cobrindo outra e o código fazendo uma terceira.

Um desenvolvedor alterava uma feature e esquecia da spec. Às vezes o agente atualizava o documento, às vezes não. Aí outra pessoa chegava depois, lia o Markdown antigo e recebia uma descrição de um sistema que simplesmente não existia mais.

E aí começou a melhor parte: inventar mais processo pra manter o processo.

Eu já vi script de pre-commit obrigando a gente a verificar se uma mudança impactava alguma spec. Já vi validação no CI tentando descobrir se o código mudou e o Markdown não. Tudo isso pra manter sincronizado um documento que a própria metodologia colocou dentro do repositório.

A gente precisava de um plano. Terminou criando uma infraestrutura pra manter o plano.

![tudo bem, tá tudo pegando fogo](https://media.giphy.com/media/NTur7XlVDUdqM/giphy.gif)

## A documentação admite o problema

Eu poderia estar só amargurado por causa de uma experiência ruim. Uma empresa não prova que toda adoção de SDD dá errado, e eu não vou fingir que prova.

Mas não é um problema que eu inventei. A página do Spec Kit sobre [modelos de persistência de specs](https://github.github.com/spec-kit/concepts/spec-persistence.html) descreve três formas de lidar com a spec quando os requisitos mudam. Se você edita qualquer artefato e reconcilia depois, o risco documentado é divergência silenciosa. Se você guarda cada mudança como histórico numa pasta nova, o risco é contexto duplicado ou fragmentado. Se você trata a `spec.md` como fonte única e regenera o resto, perde o rationale que estava nos arquivos regenerados.

Nenhuma das opções é "de graça". O próprio projeto reconhece isso.

O [guia do Kiro sobre specs para trabalho complexo](https://kiro.dev/docs/guides/learn-by-playing/05-using-specs-for-complex-work/) recomenda commitar as specs junto com o código e avisa que, com o tempo, você vai acumular uma grande coleção desses documentos.

Ótimo. Agora me responde: quando cinco mudanças diferentes alterarem a autenticação, qual arquivo descreve a autenticação hoje?

A resposta do [OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md) é uma estrutura inteira pra isso. Cada mudança ganha `proposal.md`, delta specs com requisitos adicionados, modificados e removidos, `design.md` e `tasks.md`. No fim, um comando faz o merge dos deltas nas specs principais e move a pasta da mudança pra um arquivo morto.

Percebeu o que aconteceu? Agora a gente tem um sistema de gerenciamento de Markdown dentro do sistema que a gente realmente precisava construir.

Esse é o exemplo mais clássico possível de overengineering.

## Iniciante não precisa de PRD pra adicionar um botão

Isso fica ainda pior com quem tá começando agora por causa da IA.

A pessoa escuta um desenvolvedor sênior falando que precisa usar SDD e acha que tem que criar spec, PRD (o documento de requisitos de produto), design document e task list pra adicionar um botão.

Só que ela nem queria uma especificação rigorosa. Ela queria um companheiro de brainstorming. Queria que o agente fizesse perguntas, encontrasse gaps, analisasse o projeto e mostrasse os trade-offs antes de sair alterando os arquivos.

Dependendo da ferramenta, isso é literalmente entrar no plan mode, o modo em que o agente investiga e propõe um plano sem editar nada. Se a sua ferramenta não tem um modo assim, dá pra pedir direto:

```text
Não implemente ainda. Investigue o projeto, faça perguntas sobre o que
estiver ambíguo e proponha um plano.
```

Pronto. Você recebeu o benefício útil sem transformar o repositório num cemitério de documentos que ninguém vai ler.

Porque essa é outra realidade. A IA gera quinhentas linhas de spec, a pessoa lê o primeiro parágrafo, acha que parece profissional, responde "aprovado" e manda implementar.

Isso não é rigor. É vibe coding com burocracia.

![estressado pedindo ajuda](https://media.giphy.com/media/gfGdlu5WivKK2OWdVn/giphy.gif)

## Para ser justo

Existe, sim, ocasião pra uma spec persistente. Se outro time depende de um contrato, se você tem compliance, auditoria, uma API pública ou uma decisão que precisa sobreviver por anos, aquele documento tem um consumidor real. Ele vai ser lido depois. Vale o custo de manter.

E eu não sou o único cético aqui. Quando colocou SDD no [Technology Radar](https://www.thoughtworks.com/radar/techniques/spec-driven-development) em novembro de 2025, na categoria "Assess", a Thoughtworks achou a abordagem promissora, mas alertou que os workflows ainda eram elaborados e opinativos e que algumas ferramentas geravam specs longas e difíceis de revisar. Esse item não aparece na edição atual do Radar, então leia como a avaliação daquele momento, não como um veredito definitivo.

Então a pergunta é muito simples: quem vai usar essa spec depois do merge?

Se ninguém consegue responder, não transforma um plano temporário em patrimônio permanente do repositório.

## O que eu faço no lugar

Faz um brainstorm. Usa o plan mode. Encontra as ambiguidades. Implementa. Escreve testes bons. Revisa o código.

E deixa o plano morrer quando ele cumprir a função dele.

Persiste só aquilo que realmente precisa continuar vivo: um contrato, um teste ou uma documentação que alguém de fato vai consultar. Teste, inclusive, tem uma vantagem enorme sobre Markdown: quando ele fica desatualizado, ele quebra. A spec esquecida só fica lá, mentindo com cara de documento oficial.

Menos é mais. Você não precisa criar uma nova fonte da verdade pra cada tarefa, e muito menos scripts, hooks e agentes pra tentar manter essa suposta verdade sincronizada.

Planejar antes de programar não é inovação. É bom senso. Transformar isso numa fábrica de Markdown, dar um nome bonito e vender como o futuro da engenharia de software? Aí, pra mim, é bullshit.

Vídeo no YouTube: https://youtu.be/Boxi6nslTQM

Conheça meu trabalho: https://bergholz.com.br/

## Links

- [GitHub: Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Spec Kit: Spec Persistence Models](https://github.github.com/spec-kit/concepts/spec-persistence.html)
- [Kiro: Using specifications for complex work](https://kiro.dev/docs/guides/learn-by-playing/05-using-specs-for-complex-work/)
- [OpenSpec: Getting Started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md)
- [Thoughtworks Technology Radar: Spec-driven development](https://www.thoughtworks.com/radar/techniques/spec-driven-development)

Se você chegou até aqui, obrigado pelo seu tempo. Você usa specs de verdade no seu projeto, ou elas também viraram um cemitério de Markdown? Me conta nos comentários.

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

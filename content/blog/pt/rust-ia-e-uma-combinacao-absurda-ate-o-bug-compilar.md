---
title: "Rust + IA é uma combinação absurda. Até o bug compilar."
description: "Forcei erros no meu projeto web em Rust: o compilador pegou três, mas deixou passar o que os testes também não cobriam."
publishedAt: "2026-10-08T16:00:00Z"
tags: [rust, ai, programming, elixir]
videoId: ydQ7HhnXUZk
estudioSource: canais/br/youtube/2026-09-28-rust-melhor-linguagem-ai-agents
---

Compilou. O Clippy passou. Três testes verdes.

E o app tava errado.

Eu tinha trocado a forma de contar o tamanho de uma nota no meu projeto web em Rust. Uma mudança pequena, com cara de simplificação. O resultado foi um app que recusava texto em português dentro do limite permitido, enquanto as ferramentas diziam que tava tudo certo.

![Tudo verde enquanto o bug continua ali](https://media.giphy.com/media/9M5jK4GXmD5o1irGrF/giphy.gif)

Esse foi meu teste favorito pra uma pergunta que tá aparecendo por toda parte: Rust é a melhor linguagem pra agentes de IA?

Eu gosto muito do argumento a favor. Um compilador que encontra erros cedo e explica como corrigir é uma baita ajuda pra um agente. Só que eu queria ver onde essa ajuda termina. Peguei meu starter, forcei três erros que o compilador pega e um que ele deixa passar. Gravei a demo e a discussão aqui:

[embed](https://www.youtube.com/watch?v=ydQ7HhnXUZk)

## O compilador já entrega o próximo passo

O [rust-web-starter](https://github.com/danielbergholz/rust-web-starter) é um template que eu montei junto com um agente: Axum, SQLite e HTML renderizado no servidor com Askama. O exemplo é uma lista de notas. Pequeno o suficiente pra enxergar o que acontece sem se perder na arquitetura.

Na primeira mudança, eu passei uma `String` pra um campo que esperava `Option<String>`. Esse tipo representa uma mensagem que pode existir, com `Some`, ou estar ausente, com `None`.

O `cargo check` apontou a incompatibilidade e sugeriu embrulhar a expressão em `Some`. Pra um agente que lê a saída do terminal, isso já é o próximo passo da correção.

Depois, tentei usar o banco numa tarefa em background que podia continuar rodando depois que a função terminasse. O compilador reclamou do empréstimo de `db` e sugeriu `move`. O borrow checker, a parte que verifica essas relações de posse e empréstimo, impediu que a tarefa usasse uma referência com duração insuficiente.

Na terceira mudança, troquei `text` por `txt` no template HTML. O compilador pegou também: o Askama transforma o template em código Rust e o campo errado vira erro de compilação.

Aqui apareceu uma ressalva. A mensagem apontava pro `derive` no `main.rs`, não pra linha do HTML. Erro de macro pode ser confuso até quando identifica o problema certo.

Mesmo assim, dá pra entender a vantagem. O agente escreve, roda um comando, lê o resultado e tenta corrigir. Quanto mais claro for esse resultado, menos ele precisa adivinhar.

O [CRUST-Bench](https://arxiv.org/html/2504.15254v3), um benchmark de tradução de C pra Rust, mostra essa mecânica. Na Tabela 4, o o1 passou nos testes de 15% dos projetos de primeira. Com três rodadas de feedback do compilador, chegou a 28%. Com feedback dos testes, a 37%.

São modelos de 2025 e uma tarefa específica. Eu não usaria isso como ranking de linguagens. O que me interessa é o ganho ao devolver um erro útil pro modelo.

## A troca que passou em tudo

No starter, a validação original é esta:

```rust
fn validate_note(text: &str) -> Result<&str, &'static str> {
    let text = text.trim();

    if text.is_empty() {
        return Err("A note cannot be empty.");
    }

    if text.chars().count() > MAX_NOTE_LENGTH {
        return Err("A note can have at most 500 characters.");
    }

    Ok(text)
}
```

Trecho de [`src/main.rs`, linhas 143–155, no commit `83b1678`](https://github.com/danielbergholz/rust-web-starter/blob/83b16787923c9580d34099bc472382e82c538676/src/main.rs#L143-L155). `MAX_NOTE_LENGTH` vale 500.

Eu troquei `text.chars().count()` por `text.len()`. As duas chamadas devolvem um número que pode ser comparado com o limite. Pro sistema de tipos, a operação continua fazendo sentido.

Só que [`len()` conta bytes](https://doc.rust-lang.org/std/primitive.str.html#method.len). No exemplo, `ç` e `ã` ocupam dois bytes cada. Repetir `ção` 150 vezes dá 450 valores Unicode, mas 750 bytes. Com a mudança, uma nota que deveria ser aceita passa a ser recusada.

O compilador deixou passar. O Clippy deixou passar. Os três testes existentes cobriam espaços, nota vazia e o limite usando a letra `a`. Nenhum deles exercitava esse caso.

Quando adicionei o teste com o texto acentuado, ele falhou.

![Pera, mas os testes estavam verdes](https://media.giphy.com/media/tLql6mMHC6wvK/giphy.gif)

Tem mais um detalhe: [`chars()` conta valores escalares Unicode](https://doc.rust-lang.org/std/primitive.str.html#method.chars), que nem sempre correspondem aos caracteres que a pessoa enxerga. Emojis e acentos combinados podem exigir outra regra. No exemplo de `ção` isso não muda a conta, mas decidir o que o limite significa continua sendo trabalho nosso.

O compilador não sabe qual era a regra do produto. Ele aceita as duas versões. Se o teste também não expressa essa regra, tudo pode ficar verde com o comportamento errado.

## E aquela reescrita gigantesca do Bun?

Segundo [o relato do próprio Bun](https://bun.com/blog/bun-in-rust), o port de 535.496 linhas de Zig pra Rust levou onze dias, com até 64 agentes em paralelo. É um caso impressionante. Também é um relato de uma empresa que pertence à Anthropic e usou Claude.

O processo incluiu cerca de 1,4 milhão de asserções, execução em seis plataformas e agentes revisores procurando bugs. O post registra dezenove regressões, já corrigidas, e aproximadamente treze mil ocorrências de `unsafe` no momento da publicação.

[`unsafe` permite operações que exigem verificar certas garantias manualmente](https://doc.rust-lang.org/book/ch20-01-unsafe-rust.html); não desliga todas as checagens do Rust. Isso pesa numa base que interage com bibliotecas C e C++.

Minha leitura é que esse caso reforça a necessidade de testes e revisão junto com o compilador. A demonstração pequena do meu starter já mostra por quê.

O Codex também aparece nessa discussão, mas a [OpenAI justificou a migração do CLI pra Rust](https://github.com/openai/codex/discussions/1174) com distribuição sem depender de Node.js, integração nativa com sandbox e menor consumo de memória. São bons motivos pra construir aquela ferramenta. Eles não medem em qual linguagem um agente escreve melhor o nosso app.

## A espera e o código que sobra pra você

No teste do meu starter, compilar do zero levou cerca de treze segundos. Recompilar depois de uma mudança pequena levou menos de um. Pra esse projeto, tranquilo.

Na [pesquisa oficial do compilador Rust de 2025](https://blog.rust-lang.org/2025/09/10/rust-compiler-performance-survey-2025-results/), 55% dos participantes relataram rebuilds acima de dez segundos. A pergunta pedia que escolhessem o projeto em que mais sofriam com tempo de build, então não dá pra tratar isso como o tempo de todo projeto Rust.

Ainda assim, o custo existe. Se cada tentativa exige esperar, um agente repetindo esse ciclo acumula espera também.

Depois vem o código pra revisar. Lifetimes, traits, generics: essas ferramentas têm motivos pra existir. Mas, se o agente entrega mil linhas que eu não consigo ler, o compilador ter aprovado não resolve minha vida durante um incidente.

O [Armin Ronacher recomenda Go pra novos backends com agentes](https://lucumr.pocoo.org/2025/6/12/agentic-coding/), destacando coisas como execução dos testes e fluxo explícito. Não tomo isso como lei; acho útil justamente porque desloca a conversa pro trabalho que a gente precisa fazer.

## As perguntas que eu faço antes de escolher

Eu olho pra cinco coisas:

1. **Quando o agente erra, o erro aparece rápido e de forma clara?** Rust entrega mensagens úteis; a velocidade depende do projeto.
2. **Existe um jeito padrão de fazer as coisas?** Cargo concentra as ferramentas, mas montar uma stack web ainda exige escolher bibliotecas e combinar as peças.
3. **O que o modelo aprendeu ainda vale?** Estabilidade ajuda. Uma biblioteca que mudou a API pode exigir documentação atual no contexto.
4. **O modelo conhece bem essa linguagem e essa stack?** Código público e boas instruções ajudam, mas eu quero conferir o resultado no projeto.
5. **A linguagem resolve o problema que eu tenho?** Essa pesa mais. Performance, memória previsível e distribuição de uma CLI são necessidades diferentes das de um app web com login, jobs e tempo real.

Também desconfio dos rankings que prometem resolver tudo. O [Dan Luu questiona várias alegações de superioridade de linguagens pra LLMs](https://danluu.com/pl-tokens/), inclusive a de Elixir. Ele não testou Elixir no próprio eval, e seus resultados em duas tarefas não fecham a questão. É um bom motivo pra eu moderar uma alegação que gosto de repetir.

## Onde entra minha preferência por Elixir

Eu escolhi Elixir antes dos agentes. Não sou imparcial nessa conversa.

Pra um app web simples, Rust funciona bem pra mim. Pra um app complexo, eu prefiro Elixir com Phoenix: as convenções de Phoenix, Ecto e LiveView e a supervisão de processos da BEAM pesam na minha decisão. Essa supervisão permite reiniciar processos que falham; não elimina a necessidade de projetar recuperação e estado.

Na revisão, a imutabilidade ajuda bastante. O [José Valim explica essa vantagem como raciocínio local](https://dashbit.co/blog/why-elixir-best-language-for-ai): fica mais fácil entender uma função sem procurar quem alterou o mesmo objeto em outro lugar.

O [Elixir 1.20 trouxe inferência e checagem de tipos sem exigir anotações](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released/). Isso encontra mais problemas antes de rodar, mas não equivale às garantias de memória do Rust. E apps novos gerados com [Phoenix 1.8 já incluem `AGENTS.md`](https://www.phoenixframework.org/blog/phoenix-1-8-released), com instruções pra erros comuns dos modelos.

Essas são vantagens concretas que eu valorizo. Não provam que qualquer modelo vai escrever Elixir melhor que Rust.

Se o problema pede Rust, agente com Rust é uma combinação absurda. Eu só não vou dispensar o teste que expressa a regra do produto nem minha leitura do código porque o compilador aprovou. Uma nota em português foi suficiente pra mostrar o limite dessa confiança.

Vídeo no YouTube: [Rust e agentes de IA](https://www.youtube.com/watch?v=ydQ7HhnXUZk).

Conheça meu trabalho: https://bergholz.com.br/

Obrigado por ler até aqui! Você já deixou um agente escrever Rust? O compilador ajudou a corrigir o código ou a espera e a revisão pesaram mais?

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)

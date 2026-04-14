# Exercicio - DOM e eventos

## Conteudo da aula
Encontro 4 - DOM, selecao de elementos, eventos, delegacao e manipulacao de classes/atributos

## Objetivo pedagogico
Fazer a ponte entre a Aula 3 e a Aula 4.

Na Aula 3, voce trabalhou com:
- variaveis
- funcoes
- condicionais
- arrays e objetos

Agora, voce vai usar a mesma base para:
- ler valores do formulario
- validar dados digitados
- criar elementos HTML com JavaScript
- reagir a cliques
- atualizar uma lista dinamica na tela

## Objetivo pratico
Construir uma mini-interface com:
- formulario
- lista dinamica
- validacoes simples no DOM

Ao final, a interface deve permitir:
- adicionar atividade
- validar titulo vazio e titulo curto
- remover item

## Estrutura
```text
Aula4/
  EXERCICIO.md
  starter/
    index.html
    assets/
      css/style.css
      js/script.js
  gabarito/
    index.html
    assets/
      css/style.css
      js/script.js
```


## Importante
O `starter` desta aula nao entrega a logica JavaScript pronta.

A ideia e que a turma construa:
- seletores do DOM
- validacao
- criacao dos elementos
- renderizacao da lista
- delegacao de eventos para remover itens


### Etapa 1  - Selecionar e testar os elementos
Crie no `script.js` as referencias para:
- formulario
- input de atividade
- area de feedback
- lista
- estado vazio

Teste com `console.log(...)` para garantir que os seletores retornaram elementos validos.

### Etapa 2 - Submit e validacao simples
1. Crie uma funcao `validateTitle(title)`.
2. Regras:
- nao aceitar string vazia
- nao aceitar menos de 3 caracteres
3. Registre o evento `submit` do formulario.
4. Use `event.preventDefault()`.
5. Se houver erro:
- escreva a mensagem em `feedback`
- aplique a classe de erro
- interrompa o fluxo

### Etapa 3 - Criar o primeiro item da lista
1. Crie um array `items`.
2. Crie um contador `nextId`.
3. Monte uma funcao `createStudyItem(item)` usando:
- `document.createElement`
- `textContent`
- `classList`
- `dataset`
4. Cada item deve ter:
- titulo
- botao `Remover`
5. Ao submeter com sucesso:
- adicione o item no array
- limpe o formulario
- esconda o estado vazio
- mostre o novo item na lista

### Etapa 4 - Delegacao de eventos
1. Registre um unico `click` na lista.
2. Use `event.target.closest("button[data-action]")`.
3. Descubra qual item foi clicado com `closest(".study-item")`.
4. Trate a acao `remove`:
- remova o item do array
- renderize a lista novamente

## Checklist (Definition of Done)
- [ ] O formulario nao recarrega a pagina.
- [ ] Titulo vazio gera mensagem de erro.
- [ ] Titulo com menos de 3 caracteres gera mensagem de erro.
- [ ] Um item valido entra na lista.
- [ ] O botao `Remover` exclui o item.
- [ ] O clique nos botoes funciona por delegacao.

## Desafio extra (opcional)
1. Adicione um campo de prioridade ao formulario.
2. Permita marcar o item como concluido.
3. Salve os itens em `localStorage`.

---
Disciplina: Aplicacoes Front-End | Aula 4 | 2026/1

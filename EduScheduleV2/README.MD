# ACME - Projeto Didatico MVC

## Programacao Web II - Tecnico em Informatica

Projeto didatico para estudar o padrao MVC com:

- `PHP` no backend
- `HTML`, `CSS` e `JavaScript` no frontend
- `MySQL` como banco de dados

## Objetivo

Separar a aplicacao em tres camadas:

- `Model`: dados, consultas e regras de negocio
- `View`: telas, estilos e interacoes do usuario
- `Controller`: recebe requisicoes, organiza o fluxo e devolve a resposta

Fluxo resumido:

```text
Usuario -> View -> Controller -> Model -> Banco de Dados
```

## Estrutura de pastas

```text
acme-3am-g1/
|
|-- index.html          <- ponto de entrada publico
|-- README.MD
|
|-- api/                <- backend MVC em PHP
|   |-- index.php
|   |-- .htaccess
|   |-- composer.json
|   |-- vendor/
|   `-- source/
|       |-- Config/
|       |-- Controller/
|       |-- Core/
|       |-- Models/
|       `-- Support/
|
|-- data-base/          <- arquivos e scripts do banco
|
`-- views/              <- telas do sistema
    |-- public/         <- HTML da area publica
    |-- app/            <- HTML da area logada
    |-- admin/          <- HTML da area administrativa
    `-- assets/         <- CSS, JS e outros recursos estaticos
        |-- _common/
        |-- public/
        |-- app/
        `-- admin/
```

## Fluxo do projeto

1. O usuario acessa `index.html` ou outra view.
2. O JavaScript do frontend consome a API em `api/`.
3. O roteamento do backend envia a requisicao para o controller correto.
4. O controller conversa com os models.
5. Os models acessam o banco.
6. A API responde em `JSON`.
7. O frontend atualiza a interface.

## Tecnologias

- `PHP`
- `HTML`
- `CSS`
- `JavaScript`
- `MySQL`
- `Composer`
- `Apache`

Cada pasta possui um `README.MD` proprio com mais detalhes.

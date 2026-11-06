# views/

## O que esta pasta guarda

A pasta `views/` concentra tudo que pertence ao frontend do projeto:

- paginas HTML
- estilos CSS
- scripts JavaScript
- recursos visuais usados pelas telas

No MVC, esta e a camada de apresentacao. Ela mostra os dados e dispara interacoes, mas nao deve conter regra de negocio nem acesso direto ao banco.

## Estrutura interna

```text
views/
|-- public/         <- paginas HTML da area publica
|-- app/            <- paginas HTML da area logada
|-- admin/          <- paginas HTML da area administrativa
`-- assets/         <- recursos estaticos
    |-- _common/    <- arquivos compartilhados entre todas as areas
    |-- public/     <- recursos visuais da area publica
    |-- app/        <- recursos visuais da area logada
    `-- admin/      <- recursos visuais da area administrativa
```

## Areas do sistema

- `public`: visitante sem login
- `app`: usuario autenticado
- `admin`: painel administrativo

## Comunicacao com a API

As views usam JavaScript para consumir a API e atualizar o HTML.

```javascript
fetch("api/usuarios")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Erro:", error);
  });
```

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

## JavaScript orientado a objetos

As classes usadas nesta etapa ficam em `views/_common/classes/` (essa é a pasta de classes que já existia no projeto).

- `User`, `Faq`, `School` e `Plan` representam os dados recebidos ou enviados pela API. Os campos ficam privados, e os getters e setters fazem conversões e validações simples. `fromAPI`, `toPayload` e `toJSON` ajudam a converter os dados.
- `Users`, `Faqs`, `Schools` e `Plans` são serviços. Eles estendem `HttpClientBase`, que concentra a URL da API, os cabeçalhos, o token de autenticação e as chamadas HTTP. Os serviços convertem os dados da API em objetos das entidades.
- O serviço `Users` usa as rotas de cadastro/login, consulta do próprio perfil, atualização e CRUD administrativo. `GET /users/me` e `PUT /users/update` atuam sobre a conta do token; listagem, consulta por ID, edição administrativa e exclusão lógica exigem administrador global. A tela `views/admin/global-usuarios.html` integra essas rotas e permite listar, consultar, editar nome/e-mail/telefone e desativar contas. Ela não oferece alteração de perfil de acesso. Rotas e exemplos estão em [api/README.MD](api/README.MD).
- A tela `views/admin/global-faq.html` usa as rotas de listar, cadastrar, editar, ativar/inativar e excluir FAQs.
- A tela `views/admin/global-escolas.html` usa as rotas de listar, cadastrar, editar, inativar/ativar e excluir escolas. Os planos vêm da API; o cadastro oferece planos ativos e a edição preserva o plano já vinculado.
- Existe herança quando os serviços estendem `HttpClientBase`. Existe composição quando um serviço cria entidades (`Faq`, `School`, `Plan` ou `User`) para organizar os dados das requisições e respostas.

### Protótipos

O `ui.js` tem o `ToastPrototype`, e as telas públicas e administrativas criam objetos com `Object.create(ToastPrototype)`. Os dois objetos compartilham o método `show` definido no protótipo.

Exemplo para mostrar no console do navegador, com a página aberta:

```js
const exemplo = window.EduUI.toastPrototypeDemo;
Object.getPrototypeOf(exemplo.publicToast) === exemplo.prototype;
Object.getPrototypeOf(exemplo.adminToast) === exemplo.prototype;
```

O resultado é `true`, pois os dois objetos foram criados com `Object.create(ToastPrototype)`.

`FormController.js` também exporta um protótipo com métodos para ler e limpar formulários e mostrar o estado de carregamento. A tela de FAQ, a tela de escolas e os formulários de acesso usam objetos criados com `Object.create(FormControllerPrototype)`, compartilhando esses métodos.

No formulário, a fábrica faz `Object.create(FormControllerPrototype)` e guarda o formulário em cada objeto; os métodos `read`, `setLoading` e `clear` continuam no protótipo.

As mensagens de API mostram apenas o campo `message`; o conteúdo de `data` não é exibido como texto. Os tipos visuais disponíveis são `success`, `warning` e `error`.

### Como executar e roteiro de testes manuais no Firefox

1. Inicie o Apache e o MySQL pelo XAMPP. Para uma instalação nova, abra `http://localhost/phpmyadmin` e importe `data-base/EduScheduleC.sql`; ele cria o banco `db-acme-tarde`, mas também apaga e recria as tabelas (`DROP TABLE`). Se esse banco já existe ou contém dados, **não importe novamente** o arquivo.
2. Confira `api/source/Config/Config.php` e ajuste a configuração do banco para o ambiente local, se necessário. O banco configurado neste projeto é `db-acme-tarde`, em `localhost:3306`; consulte o próprio XAMPP para as credenciais locais.
3. As dependências PHP já estão em `api/vendor/`. Se essa pasta estiver ausente, execute `composer install` dentro de `api/`, usando a versão PHP declarada em `api/composer.json`.
4. Abra `http://localhost/ProjectPW-main/` no Firefox. A URL base da API configurada no cliente é `http://localhost/ProjectPW-main/api`.
5. Use contas e registros de teste autorizados. Não registre credenciais nem tokens nas capturas. As páginas administrativas exigem autenticação e as rotas aplicam as permissões no backend.

#### Login, cadastro e perfil

1. Abra `views/public/login.html` (ou a página inicial e escolha entrar). Faça login com uma conta de teste ativa e confirme que a área correspondente ao perfil abre.
2. Abra `views/public/cadastro.html`, cadastre uma conta descartável com código escolar válido e dados próprios para teste. Confirme a mensagem de sucesso e tente entrar com essa conta.
3. Abra `views/app/perfil.html`, altere um campo de perfil permitido e salve. Confira a confirmação e, após recarregar a página ou entrar novamente, confirme o valor atualizado.
4. Tente enviar campos obrigatórios vazios ou um e-mail inválido. Observe a validação do formulário ou a mensagem de erro; não use uma conta real para esses ensaios.

#### CRUD de FAQ

1. Entre com administrador global e abra `views/admin/global-faq.html`.
2. Crie uma pergunta de teste, edite sua pergunta/resposta, alterne o status, use Subir/Descer quando houver mais itens e exclua somente o registro criado para o teste.
3. Observe a listagem recarregar, os estados de carregamento e as mensagens de sucesso, aviso e erro. Não exclua FAQs existentes.

#### CRUD de escolas e planos

1. Ainda autenticado como administrador global, abra `views/admin/global-escolas.html`.
2. Abra o formulário de nova escola e aguarde o seletor de planos. Confirme que os nomes e valores vêm da API, escolha um plano ativo e preencha nome, e-mail e código de teste.
3. Salve, edite a mesma escola e confira que o plano anteriormente escolhido continua selecionado. Teste também ativar/inativar e exclua apenas a escola descartável quando terminar.
4. Para validar os erros, deixe um campo obrigatório inválido ou use uma entrada descartável que a API rejeite. Observe a mensagem e se o botão volta ao estado normal. Não altere os planos existentes para provocar erro.
5. Se a API não responder ou não houver plano ativo, observe a mensagem de erro/estado sem opções; o cadastro deve permanecer desabilitado quando não existe plano ativo disponível.

#### CRUD administrativo de usuários

1. Entre com administrador global e abra `views/admin/global-usuarios.html`.
2. Localize uma conta descartável e use Consultar; depois edite nome, e-mail ou telefone e confira a mensagem e a lista atualizada.
3. Desative somente a conta descartável, confirme a pergunta do navegador e observe que ela aparece inativa. Não desative a conta usada na sessão nem contas reais.
4. Confira que o formulário não oferece alteração de perfil de acesso. Como teste separado, com uma conta comum, tente abrir a página e observe o redirecionamento; as rotas também devem rejeitar operações administrativas.

#### Toast e FormController

1. Em uma das telas de FAQ, escola ou usuário, faça uma operação válida e observe a mensagem de sucesso; use a confirmação de exclusão/desativação para ver o aviso; provoque uma rejeição controlada com dados de teste para observar o erro.
2. Durante o envio, observe o texto/estado do botão e que ele é restaurado após sucesso ou erro. Não considere os estados visuais verificados até executar estes passos no navegador.

#### Demonstração de classes e protótipos

1. Abra uma página que carrega `views/assets/_common/scripts/ui.js` e abra o console do Firefox. Execute:

   ```js
   const exemplo = window.EduUI.toastPrototypeDemo;
   Object.getPrototypeOf(exemplo.publicToast) === exemplo.prototype;
   Object.getPrototypeOf(exemplo.adminToast) === exemplo.prototype;
   ```

   As duas expressões devem resultar em `true`, demonstrando que os objetos de Toast compartilham o mesmo protótipo.
2. Na mesma origem, execute no console:

   ```js
   const { FormControllerPrototype, createFormController } = await import("/ProjectPW-main/views/_common/classes/FormController.js");
   const formulario = document.createElement("form");
   const primeiro = createFormController(formulario);
   const segundo = createFormController(formulario);
   Object.getPrototypeOf(primeiro) === FormControllerPrototype;
   Object.getPrototypeOf(segundo) === FormControllerPrototype;
   primeiro.read === segundo.read;
   ```

   As três expressões devem resultar em `true`. Para explicar a POO, mostre também os campos privados e acessores de `User`, `Faq`, `School` e `Plan`, e os serviços que estendem `HttpClientBase`.

### Checklist dos testes locais reportados anteriormente (15/10/2026)

Os itens abaixo registram resultados reais de testes anteriores no XAMPP e os separam do que foi conferido somente no código nesta revisão. Não foram salvas capturas de tela.

Para este projeto, `User` é a entidade principal; os dois CRUDs adicionais integrados às rotas reais são FAQ (`Faq`) e escolas (`School`). `Plan` também tem classe e serviço e é consultado para preencher o formulário de escola.

- **Concluído e testado em verificações anteriores:** conexão da API ao banco local; cadastro, login, consulta e atualização do perfil de uma conta de teste; tentativa de alterar o próprio `type_id` rejeitada; operações administrativas de listagem, consulta, edição e exclusão tentadas com token de aluno e rejeitadas com `401`.
- **Concluído e testado em verificações anteriores:** CRUD de FAQ com registro de teste, incluindo edição, ativação/inativação, ordenação e exclusão lógica; o registro de teste terminou inativo. `GET /plans/active` respondeu `200` e retornou três planos.
- **Concluído e testado:** em cadastro com código escolar inválido, a interface mostrou o erro e restaurou o botão após o carregamento.
- **Concluído e testado em verificações anteriores:** logins de um administrador global e de um administrador escolar de teste responderam pela API; a conta escolar ficou vinculada a uma escola fictícia de teste. As credenciais temporárias foram entregues ao responsável fora deste arquivo.
- **Concluído e testado em verificações anteriores:** com o administrador global, listagem, consulta, edição e exclusão lógica de um usuário de teste passaram; o login do usuário depois da desativação foi recusado com `401`. Um aluno recebeu `401` ao tentar listar, consultar, editar ou excluir usuários e `400` ao tentar alterar o próprio `type_id`.
- **Concluído e testado em verificações anteriores:** com o administrador global, CRUD de uma escola de teste passou pela API: listar, cadastrar, consultar, editar e excluir logicamente. A consulta direta confirmou `active = 0` para o registro excluído. O administrador escolar de teste consultou somente a escola vinculada a ele.
- **Concluído e testado em verificações anteriores:** `GET /plans/list` autenticado respondeu `200` e retornou três planos; a escola de teste usada para o CRUD foi vinculada a um plano ativo.
- **Concluído e testado:** as contas seed e os usuários de teste anteriores foram desativados logicamente por solicitação do responsável. Os registros continuam no banco; nenhum usuário foi apagado fisicamente. A escola seed permaneceu ativa.
- **Implementado, mas não testado completamente:** `User`, `Faq`, `School` e `Plan` usam campos privados, acessores, validações e conversões entre dados da API e objetos; `Users`, `Faqs`, `Schools` e `Plans` estendem `HttpClientBase`; as telas usam esses serviços. A revisão foi estática, salvo os fluxos identificados acima.
- **Implementado, mas não testado completamente:** Toast e `FormController` usam objetos `Object.create` e compartilham métodos via protótipos. O fluxo de erro do formulário foi executado; sucesso visual e limpeza após envio válido não foram exercitados nesta revisão.
- **Implementado, mas não testado completamente:** a tela administrativa de escolas busca escolas e planos pelos serviços. O código preenche o seletor com planos ativos, preserva o plano da escola em edição e impede cadastro sem plano ativo; as mensagens e estados de carregamento/erro estão implementados. Foi conferido no código, mas o seletor e os estados visuais ainda precisam de teste manual no Firefox.
- **Implementado, mas não testado completamente:** `views/admin/global-usuarios.html` integra listagem, consulta, edição de dados básicos e desativação lógica pelo serviço `Users`. O acesso à página exige sessão global e a API continua responsável por validar autorização. A implementação foi conferida no código e os scripts passaram em `node --check`; a tela ainda não foi exercitada no navegador.
- **Implementado, mas não testado completamente:** requisitos das classes, serviços, protótipos, Toast, FormController e estados de interface foram conferidos estaticamente, com os testes de API descritos acima. Não foi feita nova automação visual nesta revisão.
- **Concluído e verificado automaticamente nesta revisão:** `node --check` passou para todos os arquivos `.js`/`.mjs`; `php -l` passou para os 56 arquivos PHP; os caminhos relativos `href`/`src` encontrados nos arquivos HTML apontam para arquivos existentes. Essas verificações não executam a interface nem substituem o teste manual no Firefox.
- **Pendente:** capturas de evidência ainda não foram produzidas, inclusive para os fluxos administrativos recém-testados.
- **Pendente:** a pasta do projeto e seus diretórios pais verificados não contêm repositório Git. Por isso, a branch `javascript-poo` não foi criada; continue a partir do repositório original, se ele estiver disponível. Não inicialize um repositório artificial nesta cópia.

### Evidências para a entrega

- Salve as capturas feitas manualmente em uma pasta `evidencias-etapa06/`; não inclua dados de autenticação. Sugestões de nomes e conteúdo:
  - `01-login-cadastro-perfil.png` — confirmação do login e perfil depois de salvar uma alteração de teste.
  - `02-faq-lista-crud.png` — lista de FAQ e confirmação de criação/edição de um item de teste.
  - `03-faq-toast-estados.png` — exemplos de sucesso, aviso e erro em operações de teste.
  - `04-escola-planos-carregados.png` — formulário de escola com opções de planos recebidas da API.
  - `05-escola-edicao-plano-preservado.png` — edição mostrando o plano atual selecionado.
  - `06-escolas-lista-crud.png` — lista após cadastrar/editar e estado da escola de teste.
  - `07-usuarios-crud-global.png` — tela global com consulta/edição e uma conta de teste inativa; oculte e-mails pessoais.
  - `08-prototipos-console.png` — console mostrando `true` para objetos Toast e FormController compartilhando protótipos/métodos.
- As capturas ainda não foram feitas; os nomes acima são sugestões, não arquivos existentes. Não use registros ou contas reais nas evidências.

As capturas devem ser feitas durante a execução local. Os itens marcados como testados refletem as verificações anteriores registradas acima; não houve teste visual automatizado nesta revisão.

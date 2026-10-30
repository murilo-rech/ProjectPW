# EduSchedule — Projeto didático MVC

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
ProjectPW-main/
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
|-- storage/            <- imagens privadas de perfil e agendamentos
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

## Funcionalidades das etapas 06 e 07

As etapas conectam as áreas administrativas à API e cobrem matérias, disponibilidades, agendamentos e envio protegido de imagens.

- **Área pública:** consulta de planos ativos, cadastro e login. Alunos e professores podem se vincular a uma escola informando o código institucional ativo.
- **Administrador global:** gerencia escolas, planos, FAQs, usuários e administradores globais. O painel e os relatórios usam dados cadastrados; a estimativa mensal considera o plano atual de cada escola, pois não há histórico de faturamento.
- **Administrador escolar:** consulta e atualiza os dados básicos da própria escola e gerencia alunos, professores e outros administradores somente dentro dela. O painel, os relatórios e a lista de professores também respeitam esse escopo.
- **Professor:** associa matérias à própria conta, gerencia essas matérias e publica, edita ou desativa suas disponibilidades. Também acompanha e atualiza os agendamentos que recebe.
- **Aluno:** consulta horários livres da própria escola, agenda atendimentos, acompanha o status e pode cancelar a própria reserva.
- **Atendimentos e notificações:** os agendamentos começam pendentes; professores e administradores autorizados podem aprovar ou recusar, e atendimentos aprovados podem ser concluídos. Cada usuário pode listar as notificações da própria conta e marcá-las como lidas; agendamentos não geram notificações automaticamente.
- **Imagens:** qualquer usuário pode atualizar a própria foto de perfil; alunos podem anexar até 20 imagens por envio ao agendamento. Cada arquivo deve ser JPEG, PNG, GIF ou WebP e ter até 5 MB. O conteúdo é validado no servidor e os arquivos são servidos somente por rotas autenticadas com verificação de acesso.

Os serviços JavaScript em `views/_common/classes/` consomem a API MVC em `api/`; as regras de acesso e os dados persistidos ficam no backend e no MySQL. Consulte [api/README.MD](api/README.MD) para detalhes das rotas.

## Configurar no XAMPP

1. Coloque o projeto em `C:\xampp\htdocs\ProjectPW-main` e inicie **Apache** e **MySQL** no painel do XAMPP. O Apache precisa aplicar `api/.htaccess` (módulo `mod_rewrite`) para encaminhar as rotas da API.
2. Para um banco novo, importe `data-base/EduScheduleC.sql` pelo phpMyAdmin. **Esse arquivo apaga e recria as tabelas; não o importe sobre um banco que contenha dados que deseja manter.** Depois, aplique `data-base/migrations/20261029_etapa07_uploads.sql`.
3. Para um banco existente com o schema do projeto, não importe o arquivo completo; aplique somente a migração da etapa 07. Ela é aditiva e pode ser executada novamente. O projeto usa `db-acme-tarde`; se escolher outro nome, atualize o nome do banco nos arquivos SQL e em `Config.php`.
4. Confira `api/source/Config/Config.php`: o padrão é `db-acme-tarde`, MySQL em `localhost:3306` e URL `http://localhost/ProjectPW-main`. Ajuste a conexão e as URLs se seu XAMPP usar outros valores.
5. O projeto requer PHP 8.1 ou superior, PDO MySQL e `fileinfo`. Se `api/vendor/` não existir, execute `composer install` dentro da pasta `api/`.
6. Abra `http://localhost/ProjectPW-main/` no navegador. A API fica em `http://localhost/ProjectPW-main/api`.

## Roteiro rápido de teste

1. Entre como administrador global e confira os cadastros de escolas, planos, FAQs e usuários em `views/admin/`. Crie dados descartáveis para testar criação, edição e desativação.
2. Entre como administrador escolar e confira `views/admin/alunos.html`, `views/admin/professores.html`, `views/admin/administradores.html` e `views/admin/configuracoes.html`. Teste a gestão de usuários da escola e confirme que dados de outra escola não aparecem.
3. Entre como professor da escola. Em `views/app/disponibilidades.html`, associe uma matéria e publique um horário; edite ou desative um horário de teste.
4. Entre como aluno da mesma escola, abra `views/app/agendar.html`, reserve o horário e anexe imagens de teste. Confira o agendamento em `views/app/agendamentos.html`; como professor, aprove ou recuse em `views/app/atendimentos.html`. Em `views/app/notificacoes.html`, liste as notificações existentes e marque-as como lidas.
5. Em `views/app/perfil.html`, envie uma imagem válida como foto de perfil. Também é possível testar a rejeição de arquivo inválido ou maior que o limite informado.

Use contas e dados descartáveis durante os testes. A desativação feita por algumas telas é lógica; exclua somente os registros de teste ao terminar.

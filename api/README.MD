# API REST — EduSchedule

API em PHP responsável pela autenticação, gestão das instituições e agendamento de atendimentos acadêmicos do EduSchedule. As respostas de dados são enviadas em JSON; as rotas de consulta de imagem transmitem o conteúdo binário após autorização.

## URL base

Nos exemplos, `BASE_URL` representa a pasta `api` da instalação:

```text
http://localhost/ProjectPW-main/api
```

O backend requer PHP `^8.1`, PDO e `fileinfo`. As dependências são instaladas com `composer install` dentro de `api/`. A biblioteca de upload obrigatória é `sorfabiosantos/uploader`; sua chamada real é `Uploader::Image($file)`. O projeto valida o conteúdo da imagem antes de encaminhá-la à biblioteca.

## Autenticação JWT

O token é obtido pelas rotas de login e expira após 90 minutos. Nas rotas protegidas, envie:

```http
Authorization: Bearer TOKEN
```

O backend também reconhece o cabeçalho `token`, mas o padrão recomendado é `Authorization: Bearer`.

### Perfis de usuário

| `type_id` | Perfil |
|---:|---|
| `1` | Administrador global |
| `2` | Administrador escolar |
| `3` | Professor |
| `4` | Aluno |

## Formato das respostas

Resposta de sucesso:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Operacao realizada com sucesso",
  "data": {}
}
```

Em criações, a implementação atual retorna `type: "created"` e `status: "success"`.

Resposta de erro:

```json
{
  "code": 400,
  "type": "error",
  "status": "bad_request",
  "message": "Dados invalidos"
}
```

O campo `data` só é incluído quando o Controller envia dados não vazios para `back()`.

| Código | Status | Significado |
|---:|---|---|
| `200` | `success` | Consulta, atualização ou exclusão concluída |
| `201` | `success` | Registro criado; `type` recebe `created` |
| `400` | `bad_request` | Parâmetros ou corpo inválidos |
| `401` | `unauthorized` | JWT ausente, inválido, expirado ou perfil não autorizado |
| `403` | `forbidden` | Usuário autenticado sem acesso ao registro |
| `404` | `not_found` | Rota, registro ou disponibilidade não encontrada |
| `500` | `internal_server_error` | Falha de persistência ou banco de dados |

## 1. Autenticação e usuários

Gerencia cadastro, login, validação do JWT e atualização do perfil. O Controller utilizado é `Source\Controller\Users` e o Model é `Source\Models\User`.

### Rotas

| Método | URL | Controller | JWT | Perfis | Códigos possíveis |
|---|---|---|---|---|---|
| `POST` | `/login` | `Users::auth()` | Não | `1`, `2`, `3`, `4` ativos | `200`, `400`, `401` |
| `GET` | `/auth/{type_id}` | `Users::checkAuth()` | Sim | Deve coincidir com `type_id` | `200`, `400`, `401` |
| `POST` | `/users/register` | `Users::register()` | Não | Cria `3` ou `4`; padrão `4` | `201`, `400`, `500` |
| `POST` | `/users/login` | `Users::auth()` | Não | `1`, `2`, `3`, `4` ativos | `200`, `400`, `401` |
| `GET` | `/users/me` | `Users::me()` | Sim | O próprio usuário (`1` a `4`) | `200`, `401`, `404`, `500` |
| `GET` | `/users/photo` | `Users::showPhoto()` | Sim | A foto do próprio usuário | `200`, `401`, `404` |
| `POST` | `/users/photo` | `Users::uploadPhoto()` | Sim | A foto do próprio usuário; multipart field `photo` | `200`, `400`, `401`, `404`, `500` |
| `GET` | `/users/list` | `Users::listAll()` | Sim | `1` vê todos; `2` vê somente a própria escola | `200`, `401`, `500` |
| `GET` | `/users/list/{user_id}` | `Users::listById()` | Sim | Somente `1`; consulta qualquer usuário | `200`, `400`, `401`, `404`, `500` |
| `PUT` | `/users/update` | `Users::update()` | Sim | `1`, `2`, `3`, `4` | `200`, `400`, `401`, `500` |
| `PUT` | `/users/password` | `Users::changePassword()` | Sim | `1`, `2`, `3`, `4`; própria senha e senha atual | `200`, `400`, `401`, `500` |
| `PUT` | `/users/admin/{user_id}` | `Users::updateById()` | Sim | `1`; qualquer usuário. `2`; usuário da própria escola, sem alterar perfil ou escola | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/users/admin/{user_id}` | `Users::delete()` | Sim | `1`; usuários. `2`; usuário da própria escola. Não permite excluir a própria conta | `200`, `400`, `401`, `404`, `500` |
| `POST` | `/users/register-admin` | `Users::registerAdmin()` | Sim | Somente `1`; cria `1` ou `2`, padrão `2` | `201`, `400`, `401`, `500` |
| `POST` | `/users/register-school` | `Users::registerSchool()` | Sim | Somente `2`; cria `2`, `3` ou `4` na escola do token | `201`, `400`, `401`, `500` |
| `POST` | `/users/login-admin` | `Users::authAdmin()` | Não | Login restrito a `1` e `2` | `200`, `400`, `401` |
| `PUT` | `/users/update-admin` | `Users::updateAdmin()` | Sim | Somente `1` | `200`, `400`, `401`, `500` |

### Parâmetros e corpos JSON

`GET /auth/{type_id}` recebe na URL um inteiro entre `1` e `4` e não possui corpo.

Cadastro de professor ou aluno:

```json
{
  "type_id": 4,
  "name": "Aluno Exemplo",
  "email": "aluno@escola.edu.br",
  "password": "senha",
  "phone": "(53) 99999-0000",
  "school_code": "CODIGO-DA-ESCOLA",
  "registration_number": "20260001",
  "specialization": null,
  "office_room": null
}
```

Obrigatórios: `name`, `email` válido e `password` com pelo menos 6 caracteres. `type_id` aceita `3` ou `4`; também é aceito o alias `user_type`. Para vincular à escola, envie `school_code`: a API procura um código ativo e define o `school_id`. O cadastro público ignora `school_id` enviado diretamente e não permite definir `active`.

`POST /users/register-admin` exige JWT global e aceita `type_id` `1` ou `2`. `POST /users/register-school` exige JWT de administrador escolar, aceita `type_id` `2`, `3` ou `4` e sempre usa a escola do token; os campos `school_id`, `active` e `photo` enviados pelo cliente são ignorados.

Login:

```json
{
  "email": "aluno@escola.edu.br",
  "password": "senha"
}
```

Atualização de perfil aceita pelo menos um dos campos abaixo:

```json
{
  "name": "Novo Nome",
  "email": "novo@escola.edu.br",
  "password": "nova-senha",
  "phone": "(53) 99999-1111",
  "registration_number": "20260001",
  "specialization": "Programacao Web",
  "office_room": "Sala 10"
}
```

Esse endpoint também aceita `password` com pelo menos seis caracteres. A interface usa `PUT /users/password` para essa operação e exige a senha atual.

A foto não é atualizada por JSON nem por caminho de arquivo. Envie `POST /users/photo` como `multipart/form-data`, com o campo `photo`. O servidor aceita JPEG, PNG, GIF ou WebP de 32 bytes a 5 MB, valida o conteúdo, armazena a imagem e associa o nome gerado ao usuário autenticado. `GET /users/photo` transmite somente a foto da própria conta e exige JWT.

### Rotas de leitura, edição e exclusão administrativa

O usuário autenticado consulta os próprios dados em `GET /users/me`. A listagem (`GET /users/list`) está disponível para administrador global e escolar; o administrador escolar recebe somente usuários da própria escola. A consulta por ID (`GET /users/list/{user_id}`) continua restrita ao administrador global.

A atualização comum (`PUT /users/update`) sempre altera apenas o usuário do token e recusa campos de privilégio como `type_id`, `school_id` e `active`. `PUT /users/password` altera a senha após validar `current_password` e `new_password` (mínimo de seis caracteres). Para editar outro usuário, `PUT /users/admin/{user_id}` aceita administrador global ou escolar: o administrador escolar só altera usuários da própria escola e não pode mudar o perfil nem a escola do alvo. A exclusão por `DELETE /users/admin/{user_id}` é lógica e também fica restrita à escola para o administrador escolar. Nenhum perfil pode excluir a própria conta.

```bash
curl -H "Authorization: Bearer TOKEN" "BASE_URL/users/list"
curl -H "Authorization: Bearer TOKEN" "BASE_URL/users/list/10"
curl -X DELETE -H "Authorization: Bearer TOKEN" "BASE_URL/users/admin/10"
```

O administrador global lista, consulta e edita usuários de qualquer escola. O administrador escolar lista, edita e desativa somente usuários da própria escola; não pode alterar um administrador global nem os campos `school_id` e `type_id` de um usuário.

O serviço JavaScript `Users` oferece cadastro, login, consulta, atualização, operações administrativas e upload/consulta autenticada da foto. `views/admin/global-usuarios.html` integra o CRUD global; as páginas de alunos, professores e administradores escolares usam o escopo do administrador da escola.

As respostas de cadastro, consulta, atualização e exclusão omitem senha e hash. Login retorna o JWT e `PUT /users/update` também retorna um JWT novo para a sessão quando atualiza o perfil.

### Resposta JSON

Login concluído — `200`:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Usuario logado com sucesso",
  "data": {
    "id": 10,
    "school_id": 1,
    "type_id": 4,
    "name": "Aluno Exemplo",
    "email": "aluno@escola.edu.br",
    "phone": null,
    "has_photo": true,
    "registration_number": "20260001",
    "specialization": null,
    "office_room": null,
    "active": 1,
    "token": "TOKEN"
  }
}
```

### Exemplo de uso

```bash
curl -X POST "BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@escola.edu.br","password":"senha"}'
```

Upload de foto, usando um arquivo local `perfil.png`:

```bash
curl -X POST "BASE_URL/users/photo" \
  -H "Authorization: Bearer TOKEN" \
  -F "photo=@perfil.png"
curl -H "Authorization: Bearer TOKEN" "BASE_URL/users/photo" --output foto-atual.png
```

## 2. Endereços

Gerencia os endereços do administrador escolar autenticado. O Controller é `Source\Controller\Addresses` e o Model é `Source\Models\Address`. Todas as rotas exigem JWT de `type_id = 2`, e cada administrador acessa somente seus próprios registros.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/addresses/list/{address_id}` | `Addresses::listById()` | `address_id`: inteiro positivo | Sim, tipo `2` | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/addresses/list` | `Addresses::listAll()` | Nenhum | Sim, tipo `2` | `200`, `401` |
| `GET` | `/addresses/list/paginator/{page}/{per_page}` | `Addresses::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipo `2` | `200`, `400`, `401` |
| `POST` | `/addresses` | `Addresses::insert()` | Corpo JSON | Sim, tipo `2` | `201`, `400`, `401`, `500` |
| `PUT` | `/addresses/{address_id}` | `Addresses::update()` | `address_id` e corpo JSON | Sim, tipo `2` | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/addresses/{address_id}` | `Addresses::delete()` | `address_id`: inteiro positivo | Sim, tipo `2` | `200`, `400`, `401`, `403`, `404` |

### Corpo JSON

Usado em `POST` e `PUT`:

```json
{
  "street": "Rua Andrade Neves",
  "number": "123",
  "active": 1
}
```

`street` e `number` são obrigatórios. `active` é opcional e aceita `0` ou `1`. O `user_id` é obtido do JWT e não é aceito como identificador do proprietário no corpo.

As rotas `GET` e `DELETE` não possuem corpo JSON.

### Resposta JSON

Endereço criado — `201`:

```json
{
  "code": 201,
  "type": "created",
  "status": "success",
  "message": "Endereco inserido com sucesso",
  "data": {
    "id": 3,
    "user_id": 2,
    "street": "Rua Andrade Neves",
    "number": "123",
    "active": 1
  }
}
```

### Exemplo de uso

```bash
curl -X POST "BASE_URL/addresses" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"street":"Rua Andrade Neves","number":"123","active":1}'
```

## 3. FAQs

Gerencia as perguntas frequentes do EduSchedule. O Controller é `Source\Controller\Faqs` e o Model é `Source\Models\Faqs\Faq`. As consultas são públicas para permitir a exibição das perguntas no site. Todas as mutações exigem JWT válido de administrador global (`type_id=1`).

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/faqs/active` | `Faqs::listActive()` | Nenhum | Não | `200` |
| `GET` | `/faqs/list/{faq_id}` | `Faqs::listById()` | `faq_id`: inteiro positivo | Não | `200`, `400`, `404` |
| `GET` | `/faqs/list` | `Faqs::listAll()` | Nenhum | Não | `200` |
| `GET` | `/faqs/list/paginator/{page}/{per_page}` | `Faqs::listPaginator()` | `page` e `per_page`: inteiros positivos | Não | `200`, `400` |
| `POST` | `/faqs` | `Faqs::insert()` | Corpo JSON | Sim, tipo `1` | `201`, `400`, `401`, `500` |
| `PUT` | `/faqs/{faq_id}` | `Faqs::update()` | `faq_id` e corpo JSON | Sim, tipo `1` | `200`, `400`, `401`, `404`, `500` |
| `PUT` | `/faqs/{faq_id}/status` | `Faqs::updateStatus()` | `faq_id`; corpo com `status` | Sim, tipo `1` | `200`, `400`, `401`, `404`, `500` |
| `PUT` | `/faqs/{faq_id}/order` | `Faqs::updateOrder()` | `faq_id`; corpo com `sort_order` | Sim, tipo `1` | `200`, `400`, `401`, `404`, `500` |
| `DELETE` | `/faqs/{faq_id}` | `Faqs::delete()` | `faq_id`: inteiro positivo | Sim, tipo `1` | `200`, `400`, `401`, `404` |

Nas cinco rotas de mutação, a ausência de JWT, um token inválido/expirado ou um perfil diferente do administrador global são rejeitados com `401`.

### Corpos JSON

Cadastro e atualização completa:

```json
{
  "question": "Como agendar um atendimento?",
  "answer": "Escolha uma disciplina, um professor e um horario disponivel.",
  "status": 1,
  "sort_order": 1
}
```

`question` e `answer` são obrigatórios. O estado pode ser enviado como `status` ou `active`; no cadastro, o padrão é `1`. `sort_order` é opcional.

Atualização de estado:

```json
{
  "status": 0
}
```

Atualização de ordem:

```json
{
  "sort_order": 2
}
```

As rotas `GET` e `DELETE` não possuem corpo JSON.

### Resposta JSON

FAQ encontrado — `200`:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "FAQ encontrado",
  "data": {
    "id": 1,
    "question": "Como agendar um atendimento?",
    "answer": "Escolha uma disciplina, um professor e um horario disponivel.",
    "status": 1,
    "sort_order": 1
  }
}
```

Na listagem paginada, os registros são retornados diretamente da tabela e usam o campo `active`; nas demais listagens, o estado é apresentado como `status`.

### Exemplo de uso

```bash
curl -X GET "BASE_URL/faqs/active"
```

## 4. Planos

Gerencia os planos comerciais disponíveis para as escolas. O Controller é `Source\Controller\Plans` e o Model é `Source\Models\Plan`. A listagem de planos ativos é pública; as demais rotas exigem administrador global.

O serviço JavaScript `Plans` estende `HttpClientBase`, converte respostas em objetos `Plan` e implementa consulta, criação, edição e inativação. A página pública `views/public/planos.html` lê os planos ativos; `views/admin/global-planos.html` usa o CRUD autenticado.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/plans/active` | `Plans::listActive()` | Nenhum | Não | `200` |
| `GET` | `/plans/list/{plan_id}` | `Plans::listById()` | `plan_id`: inteiro positivo | Sim, tipo `1` | `200`, `400`, `401`, `404` |
| `GET` | `/plans/list` | `Plans::listAll()` | Nenhum | Sim, tipo `1` | `200`, `401` |
| `GET` | `/plans/list/paginator/{page}/{per_page}` | `Plans::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipo `1` | `200`, `400`, `401` |
| `POST` | `/plans` | `Plans::insert()` | Corpo JSON | Sim, tipo `1` | `201`, `400`, `401`, `500` |
| `PUT` | `/plans/{plan_id}` | `Plans::update()` | `plan_id` e corpo JSON | Sim, tipo `1` | `200`, `400`, `401`, `404`, `500` |
| `DELETE` | `/plans/{plan_id}` | `Plans::delete()` | `plan_id`: inteiro positivo | Sim, tipo `1` | `200`, `400`, `401`, `404` |

### Corpo JSON

Usado em `POST` e `PUT`:

```json
{
  "name": "Intermediario",
  "description": "Plano para escolas de medio porte.",
  "price": 119.0,
  "max_students": 200,
  "max_teachers": 20,
  "active": 1
}
```

Obrigatórios: `name`, `price`, `max_students` e `max_teachers`. Também são aceitos os aliases `limit_students` e `limit_teachers`. `description` e `active` são opcionais.

As rotas `GET` e `DELETE` não possuem corpo JSON.

### Resposta JSON

Plano criado — `201`:

```json
{
  "code": 201,
  "type": "created",
  "status": "success",
  "message": "Plano inserido com sucesso",
  "data": {
    "id": 2,
    "name": "Intermediario",
    "description": "Plano para escolas de medio porte.",
    "price": 119.0,
    "max_students": 200,
    "max_teachers": 20,
    "active": 1
  }
}
```

### Exemplo de uso

```bash
curl -X GET "BASE_URL/plans/active"
```

## 5. Escolas

Gerencia as instituições cadastradas no EduSchedule. O Controller é `Source\Controller\Schools` e o Model é `Source\Models\School`. O administrador global gerencia todas as escolas; o administrador escolar consulta e atualiza os dados básicos somente da instituição à qual está vinculado.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/schools/mine` | `Schools::listMine()` | Nenhum | Sim, tipo `2` | `200`, `401` |
| `PUT` | `/schools/mine/update` | `Schools::updateMine()` | Nome, código, e-mail e telefone opcional | Sim, tipo `2`; escola do token | `200`, `400`, `401`, `404` |
| `GET` | `/schools/list/{school_id}` | `Schools::listById()` | `school_id`: inteiro positivo | Sim, tipos `1` ou `2` | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/schools/list` | `Schools::listAll()` | Nenhum | Sim, tipos `1` ou `2` | `200`, `401` |
| `GET` | `/schools/list/paginator/{page}/{per_page}` | `Schools::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipo `1` | `200`, `400`, `401` |
| `POST` | `/schools` | `Schools::insert()` | Corpo JSON | Sim, tipo `1` | `201`, `400`, `401`, `500` |
| `PUT` | `/schools/{school_id}` | `Schools::update()` | `school_id` e corpo JSON | Sim, tipo `1` | `200`, `400`, `401`, `404`, `500` |
| `DELETE` | `/schools/{school_id}` | `Schools::delete()` | `school_id`: inteiro positivo | Sim, tipo `1` | `200`, `400`, `401`, `404` |

### Corpo JSON

Usado em `POST` e `PUT`:

```json
{
  "plan_id": 2,
  "name": "Instituto Federal Sul-rio-grandense",
  "code": "IFSUL-PEL-2026",
  "email": "contato@ifsul.edu.br",
  "phone": "(53) 3212-0000",
  "city": "Pelotas",
  "state": "RS",
  "active": 1
}
```

Obrigatórios: `plan_id` inteiro, `name`, `code` e `email` válido. `phone`, `city`, `state` e `active` são opcionais.

`PUT /schools/mine/update` recebe `name`, `code`, `email` e `phone` opcional. A rota não permite trocar o plano, a cidade, o estado ou o status da escola.

As rotas `GET` e `DELETE` não possuem corpo JSON.

### Resposta JSON

Escola encontrada — `200`:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Escola encontrada",
  "data": {
    "id": 1,
    "plan_id": 2,
    "name": "Instituto Federal Sul-rio-grandense",
    "code": "IFSUL-PEL-2026",
    "email": "contato@ifsul.edu.br",
    "phone": "(53) 3212-0000",
    "city": "Pelotas",
    "state": "RS",
    "active": 1
  }
}
```

### Exemplo de uso

```bash
curl -X GET "BASE_URL/schools/mine" \
  -H "Authorization: Bearer TOKEN"
```

## 6. Disciplinas

Gerencia as disciplinas vinculadas às escolas. O Controller é `Source\Controller\Subjects` e o Model é `Source\Models\Subject`. O administrador global consulta todas; administradores escolares e alunos consultam as disciplinas da própria escola; professores veem somente as disciplinas associadas à própria conta. Administradores escolares gerenciam o catálogo da escola. Professores podem criar uma matéria própria ou associar uma existente, editar as matérias associadas e remover a associação quando não houver disponibilidade ativa para ela.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/subjects/list/{subject_id}` | `Subjects::listById()` | `subject_id`: inteiro positivo | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/subjects/list` | `Subjects::listAll()` | Nenhum | Sim, tipos `1`, `2`, `3`, `4` | `200`, `401` |
| `GET` | `/subjects/list/paginator/{page}/{per_page}` | `Subjects::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401` |
| `POST` | `/subjects` | `Subjects::insert()` | Corpo JSON | Sim, tipo `2` ou `3` | `200`, `201`, `400`, `401`, `403`, `500` |
| `PUT` | `/subjects/{subject_id}` | `Subjects::update()` | `subject_id` e corpo JSON | Sim, tipo `2` ou `3`, conforme escola/associação | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/subjects/{subject_id}` | `Subjects::delete()` | `subject_id`: inteiro positivo | Sim, tipo `2` ou `3`, conforme escola/associação | `200`, `400`, `401`, `403`, `404`, `500` |

### Corpo JSON

Usado em `POST` e `PUT`:

```json
{
  "name": "Programacao Web II",
  "active": 1
}
```

`name` é obrigatório. `active` é opcional e aceita `0` ou `1` para administrador escolar; professores não podem alterar esse campo. O `school_id` é obtido do JWT: o administrador escolar cria ou reativa matérias da escola, enquanto o professor cria uma matéria ou associa uma existente à própria conta.

O exemplo com `active` abaixo é para administrador escolar; para professor, envie somente `name`.

No `PUT`, o administrador escolar pode atualizar nome e status; o professor pode alterar somente o nome de uma matéria associada à sua conta. No `DELETE`, o administrador escolar inativa a matéria; o professor remove somente a própria associação e precisa remover antes as disponibilidades ativas dessa matéria.

As rotas `GET` e `DELETE` não possuem corpo JSON.

### Resposta JSON

Disciplina criada — `201`:

```json
{
  "code": 201,
  "type": "created",
  "status": "success",
  "message": "Disciplina inserida com sucesso",
  "data": {
    "id": 5,
    "school_id": 1,
    "name": "Programacao Web II",
    "active": 1
  }
}
```

### Exemplo de uso

```bash
curl -X GET "BASE_URL/subjects/list/paginator/1/10" \
  -H "Authorization: Bearer TOKEN"
```

## 7. Agendamentos

Gerencia a reserva de disponibilidades por alunos. O Controller é `Source\Controller\Appointments` e o Model é `Source\Models\Appointment`. O acesso às consultas é limitado conforme o perfil:

- administrador global: todos os agendamentos;
- administrador escolar: agendamentos das disciplinas de sua escola;
- professor: agendamentos de suas disponibilidades;
- aluno: somente seus próprios agendamentos.

Cada agendamento inicia com o status `pending`. Um administrador global, administrador escolar autorizado ou professor com acesso ao agendamento pode aprovar/recusar uma solicitação pendente; um agendamento aprovado pode ser concluído. O aluno pode cancelar sua reserva. As imagens associadas são consultáveis apenas por perfis que tenham acesso ao agendamento.

Somente alunos podem criar, atualizar ou inativar agendamentos, sempre em seu próprio nome.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/appointments/list/{appointment_id}` | `Appointments::listById()` | `appointment_id`: inteiro positivo | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/appointments/list` | `Appointments::listAll()` | Nenhum | Sim, tipos `1`, `2`, `3`, `4` | `200`, `401` |
| `GET` | `/appointments/list/paginator/{page}/{per_page}` | `Appointments::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401` |
| `PUT` | `/appointments/{appointment_id}/status` | `Appointments::updateStatus()` | Corpo JSON com `status` | Sim; administrador global, administrador escolar autorizado ou professor com acesso | `200`, `400`, `401`, `403`, `404`, `500` |
| `POST` | `/appointments` | `Appointments::insert()` | Corpo JSON | Sim, tipo `4` | `201`, `400`, `401`, `404`, `500` |
| `PUT` | `/appointments/{appointment_id}` | `Appointments::update()` | `appointment_id` e corpo JSON | Sim, tipo `4` | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/appointments/{appointment_id}` | `Appointments::delete()` | `appointment_id`: inteiro positivo | Sim, tipo `4` | `200`, `400`, `401`, `403`, `404` |
| `POST` | `/appointments/{appointment_id}/images` | `Appointments::uploadImages()` | multipart field `images[]`, 1–20 arquivos por envio | Sim, tipo `4`, autor do agendamento ativo | `201`, `400`, `401`, `403`, `404`, `500` |
| `GET` | `/appointments/{appointment_id}/images` | `Appointments::listImages()` | `appointment_id` | Sim, acesso ao agendamento | `200`, `401`, `403`, `404` |
| `GET` | `/appointments/images/{image_id}` | `Appointments::showImage()` | `image_id` | Sim, acesso ao agendamento | `200`, `401`, `403`, `404` |
| `DELETE` | `/appointments/images/{image_id}` | `Appointments::deleteImage()` | `image_id` | Sim, aluno autor ou administrador global | `200`, `401`, `403`, `404`, `500` |

### Corpo JSON

Usado em `POST` e `PUT`:

```json
{
  "availability_id": 8,
  "notes": "Preciso revisar a atividade final."
}
```

`availability_id` é obrigatório e deve ser inteiro positivo. A disponibilidade precisa estar ativa, pertencer a uma disciplina ativa da escola do aluno e estar associada a um professor ativo dessa mesma escola. `notes` é opcional. O `student_id` é obtido do JWT.

As rotas `GET` e `DELETE` não possuem corpo JSON.

### Resposta JSON

Agendamento criado — `201`:

```json
{
  "code": 201,
  "type": "created",
  "status": "success",
  "message": "Agendamento inserido com sucesso",
  "data": {
    "id": 12,
    "availability_id": 8,
    "student_id": 15,
    "notes": "Preciso revisar a atividade final.",
    "active": 1,
    "created_at": "2026-06-29 14:30:00"
  }
}
```

### Exemplo de uso

```bash
curl -X POST "BASE_URL/appointments" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"availability_id":8,"notes":"Preciso revisar a atividade final."}'
```

`PUT /appointments/{id}/status` recebe, conforme o status atual, `{"status":"approved"}`, `{"status":"rejected"}` ou `{"status":"completed"}`. O aluno cancela pelo `DELETE /appointments/{id}`.

As imagens são enviadas como `multipart/form-data` no campo `images[]`. O lote aceita de 1 a 20 JPEG, PNG, GIF ou WebP, cada um entre 32 bytes e 5 MB; o aluno pode enviar mais imagens em lotes adicionais. Tipo e conteúdo são verificados no servidor com `fileinfo` e `getimagesize`, e nomes aleatórios substituem os nomes enviados pelo navegador.

## 8. Disponibilidades

Professores autenticados criam, editam e removem logicamente os próprios horários. Alunos consultam os horários da própria escola com vagas disponíveis.

| Método | URL | Permissão |
|---|---|---|
| `GET` | `/availabilities/booking` | Aluno; horários livres da escola |
| `GET` | `/availabilities/list` | Perfis `1` a `4`; escopo conforme perfil e escola |
| `GET` | `/availabilities/list/{availability_id}` | Qualquer perfil autenticado autorizado |
| `POST` | `/availabilities` | Professor da escola da disciplina |
| `PUT` | `/availabilities/{availability_id}` | Professor proprietário |
| `DELETE` | `/availabilities/{availability_id}` | Professor proprietário; exclusão lógica |

O corpo de criação/edição usa `subject_id`, `modality` (`1` online, `2` presencial), `weekday` (`1` segunda a `7` domingo), `start_time`, `end_time`, `max_students` (1–20) e `meeting_link` para online ou `location` para presencial.

## 9. Notificações

`GET /notifications/list` lista as notificações do próprio usuário; `PUT /notifications/{notification_id}/read` marca uma notificação como lida e `PUT /notifications/read-all` marca todas como lidas. As três rotas exigem JWT. Atualmente, a API não cria notificações automaticamente ao cadastrar ou atualizar um agendamento.

## Banco e arquivos enviados

Em uma instalação nova, importe `data-base/EduScheduleC.sql` e depois aplique `data-base/migrations/20261029_etapa07_uploads.sql`. O script base recria as tabelas, portanto não deve ser importado sobre dados que precisam ser mantidos. Em banco existente com o schema do projeto, aplique somente a migração. Ela adiciona `appointments.status` com padrão `pending` e a tabela `appointment_images` com chave estrangeira para `appointments`; a coluna `users.photo` já existe e armazena o nome gerado da imagem.

As imagens ficam em `storage/images/`, no diretório raiz do projeto. `storage/.htaccess` nega acesso direto; as rotas autenticadas verificam o usuário e o vínculo ao registro antes de transmitir o conteúdo. Os uploads em `/storage/images/` estão ignorados pelo Git, enquanto `.htaccess` permanece versionável. A biblioteca `sorfabiosantos/uploader` grava os arquivos após a validação; o sistema não aplica redimensionamento ou corte.

## Paginação

As rotas `/list/paginator/{page}/{per_page}` retornam a estrutura abaixo. Exemplo da paginação de endereços:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Lista de Enderecos com Paginacao",
  "data": {
    "page": 1,
    "perPage": 10,
    "total": 25,
    "data": []
  }
}
```

`page` e `per_page` devem ser inteiros maiores que zero.

## Exclusão lógica

As rotas `DELETE` de endereços, FAQs, planos, escolas e agendamentos usam exclusão lógica: o registro permanece no banco e recebe `active = 0`. Para administrador escolar, `DELETE /subjects/{subject_id}` também inativa a matéria; para professor, remove somente a associação da matéria à própria conta.

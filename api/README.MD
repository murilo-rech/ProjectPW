# API REST — EduSchedule

API em PHP responsável pela autenticação, gestão das instituições e agendamento de atendimentos acadêmicos do EduSchedule. Todas as respostas são enviadas em JSON.

## URL base

Nos exemplos, `BASE_URL` representa a pasta `api` da instalação:

```text
http://localhost/EduScheduleV2/api
```

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
| `PUT` | `/users/update` | `Users::update()` | Sim | `1`, `2`, `3`, `4` | `200`, `400`, `401`, `500` |
| `POST` | `/users/register-admin` | `Users::registerAdmin()` | Sim | Somente `1`; cria `1` ou `2`, padrão `2` | `201`, `400`, `401`, `500` |
| `POST` | `/users/login-admin` | `Users::authAdmin()` | Não | Login restrito a `1` e `2` | `200`, `400`, `401` |
| `PUT` | `/users/update-admin` | `Users::updateAdmin()` | Sim | Somente `1` | `200`, `400`, `401`, `500` |

### Parâmetros e corpos JSON

`GET /auth/{type_id}` recebe na URL um inteiro entre `1` e `4` e não possui corpo.

Cadastro de professor ou aluno:

```json
{
  "school_id": 1,
  "type_id": 4,
  "name": "Aluno Exemplo",
  "email": "aluno@escola.edu.br",
  "password": "senha",
  "phone": "(53) 99999-0000",
  "photo": null,
  "registration_number": "20260001",
  "specialization": null,
  "office_room": null,
  "active": 1
}
```

Obrigatórios: `name`, `email` válido e `password`. `school_id` deve ser inteiro positivo quando informado. `type_id` aceita `3` ou `4`; também é aceito o alias `user_type`. `active` aceita `0` ou `1`; também é aceito o alias `status`.

Cadastro de administrador usa a mesma estrutura, mas `type_id` aceita `1` ou `2` e exige JWT de administrador global.

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
  "photo": "avatar.jpg",
  "registration_number": "20260001",
  "specialization": "Programacao Web",
  "office_room": "Sala 10"
}
```

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
    "photo": null,
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

Gerencia as perguntas frequentes do EduSchedule. O Controller é `Source\Controller\Faqs` e o Model é `Source\Models\Faqs\Faq`. Nenhuma rota deste módulo exige JWT na implementação atual.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/faqs/active` | `Faqs::listActive()` | Nenhum | Não | `200` |
| `GET` | `/faqs/list/{faq_id}` | `Faqs::listById()` | `faq_id`: inteiro positivo | Não | `200`, `400`, `404` |
| `GET` | `/faqs/list` | `Faqs::listAll()` | Nenhum | Não | `200` |
| `GET` | `/faqs/list/paginator/{page}/{per_page}` | `Faqs::listPaginator()` | `page` e `per_page`: inteiros positivos | Não | `200`, `400` |
| `POST` | `/faqs` | `Faqs::insert()` | Corpo JSON | Não | `201`, `400`, `500` |
| `PUT` | `/faqs/{faq_id}` | `Faqs::update()` | `faq_id` e corpo JSON | Não | `200`, `400`, `404`, `500` |
| `PUT` | `/faqs/{faq_id}/status` | `Faqs::updateStatus()` | `faq_id`; corpo com `status` | Não | `200`, `400`, `404`, `500` |
| `PUT` | `/faqs/{faq_id}/order` | `Faqs::updateOrder()` | `faq_id`; corpo com `sort_order` | Não | `200`, `400`, `404`, `500` |
| `DELETE` | `/faqs/{faq_id}` | `Faqs::delete()` | `faq_id`: inteiro positivo | Não | `200`, `400`, `404` |

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

Gerencia as instituições cadastradas no EduSchedule. O Controller é `Source\Controller\Schools` e o Model é `Source\Models\School`. O administrador global gerencia todas as escolas; o administrador escolar consulta somente a instituição à qual está vinculado.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/schools/mine` | `Schools::listMine()` | Nenhum | Sim, tipo `2` | `200`, `401` |
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

Gerencia as disciplinas vinculadas às escolas. O Controller é `Source\Controller\Subjects` e o Model é `Source\Models\Subject`. O administrador global consulta todas; os demais perfis consultam apenas as disciplinas de sua escola. Somente o administrador escolar cria, atualiza ou inativa disciplinas da própria instituição.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/subjects/list/{subject_id}` | `Subjects::listById()` | `subject_id`: inteiro positivo | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/subjects/list` | `Subjects::listAll()` | Nenhum | Sim, tipos `1`, `2`, `3`, `4` | `200`, `401` |
| `GET` | `/subjects/list/paginator/{page}/{per_page}` | `Subjects::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401` |
| `POST` | `/subjects` | `Subjects::insert()` | Corpo JSON | Sim, tipo `2` | `201`, `400`, `401`, `500` |
| `PUT` | `/subjects/{subject_id}` | `Subjects::update()` | `subject_id` e corpo JSON | Sim, tipo `2` | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/subjects/{subject_id}` | `Subjects::delete()` | `subject_id`: inteiro positivo | Sim, tipo `2` | `200`, `400`, `401`, `403`, `404` |

### Corpo JSON

Usado em `POST` e `PUT`:

```json
{
  "name": "Programacao Web II",
  "active": 1
}
```

`name` é obrigatório. `active` é opcional e aceita `0` ou `1`. O `school_id` é obtido do JWT do administrador escolar.

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

Somente alunos podem criar, atualizar ou inativar agendamentos, sempre em seu próprio nome.

### Rotas

| Método | URL | Controller | Parâmetros | JWT | Códigos possíveis |
|---|---|---|---|---|---|
| `GET` | `/appointments/list/{appointment_id}` | `Appointments::listById()` | `appointment_id`: inteiro positivo | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401`, `403`, `404` |
| `GET` | `/appointments/list` | `Appointments::listAll()` | Nenhum | Sim, tipos `1`, `2`, `3`, `4` | `200`, `401` |
| `GET` | `/appointments/list/paginator/{page}/{per_page}` | `Appointments::listPaginator()` | `page` e `per_page`: inteiros positivos | Sim, tipos `1`, `2`, `3`, `4` | `200`, `400`, `401` |
| `POST` | `/appointments` | `Appointments::insert()` | Corpo JSON | Sim, tipo `4` | `201`, `400`, `401`, `404`, `500` |
| `PUT` | `/appointments/{appointment_id}` | `Appointments::update()` | `appointment_id` e corpo JSON | Sim, tipo `4` | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/appointments/{appointment_id}` | `Appointments::delete()` | `appointment_id`: inteiro positivo | Sim, tipo `4` | `200`, `400`, `401`, `403`, `404` |

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

As rotas `DELETE` de endereços, FAQs, planos, escolas, disciplinas e agendamentos usam exclusão lógica: o registro permanece no banco e recebe `active = 0`.

# Criação de Rotas da API 

## Utilizando a `coffeecode/router`

## No script `api/index.php`
Preferencialmente criar um grupo para as rotas da API conforme a entidade, por exemplo, Usuários:

```php
/* USERS */
$route->group("/users");
$route->get("/login", "Users:login");
$route->post("/add", "Users:createUser");
$route->put("/update", "Users:updateUser");
$route->group("null");
```
## Na classe `source/WebService/Users.php`
Criar os métodos para cada rota.



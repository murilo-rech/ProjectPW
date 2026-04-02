# Rotas Individuais para o projeto
## Banco de Dados
No banco de dados na tabela `users` adicionar o atributo `link`.
## Classe `Models\User.php`
Atualizar a classe `User.php` adicionando o `get` e o `set`do atributo `link` e também adicionar  método `findLink`
````PHP
public function findLink (string $link): bool
    {
        $sql = "SELECT * FROM users WHERE link = :link";
        $stmt = Connect::getInstance()->prepare($sql);
        $stmt->bindValue(":link", $link);
        $stmt->execute();
        $result = $stmt->fetch();
        if (!$result) {
            return false;
        }
        return true;
    }
````
## No script `index.php`
Adicionar o seguinte código
```PHP
// Rotas da área individual, uma para cada cliente do SaaS
// var_dump($_GET["route"]);
$linkRaw = $_GET['route'] ?? '';
if (preg_match('~^/?([^/]+)~', $linkRaw, $m)) {
    $link = $m[1]; // ex.: "loja-fabio", "loja-maria", "loja-joao"
} else {
    $link = '';
}
//var_dump($link);
$user = new User();
if($user->findLink($link)){
    $route->group("/{$link}");
    $route->get("/", "Customer:home");
    $route->get("/catalogo", "Customer:catalog");
    // Demais rotas
    // $route->get("/carrinho-compras", "Customer:cart");
    $route->group(null);
}
```
## Classe `source\Web\Customer.php`
Criar a classe `Customer.php` que extende a classe `Controller.php`, que realizará o controle da renderização dos scripts na pasta `views\web`.
```PHP
namespace Source\Web;

class Customer extends Controller
{
    public function __construct()
    {
        parent::__construct("web");
    }

    public function home(): void
    {
        echo $this->view->render("customer-home",[]);
    }

    public function catalog(): void
    {
        echo $this->view->render("customer-catalog",[]);
    }
}
```
## No frontend
No perfil do usuário (cliente do SaaS), dar a possibilidade de alterar o link do cliente, com as regras:
- sem acento;
- sem espaços;
- sem caracteres especiais.
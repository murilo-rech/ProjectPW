# Uploader PHP

Esta biblioteca fornece uma solução simples para upload de arquivos em projetos PHP.

## Instalação

1. Clone ou baixe este repositório.
2. Certifique-se de ter o [Composer](https://getcomposer.org/) instalado para gerenciar as dependências.

## Estrutura dos Arquivos

- `src/Uploader.php`: Classe principal responsável pelo upload de arquivos.
- `src/Config.php`: Arquivo de configuração que deve conter as constantes necessárias para o funcionamento da biblioteca (exemplo: diretório de upload, tamanhos máximos, tipos permitidos, etc).

## Exemplo de Uso

```php
require 'vendor/autoload.php';
use Sorfabiosantos\Uploader;

// Certifique-se de definir as constantes em src/Config.php antes de usar
$uploader = new Uploader();
$result = $uploader->upload($_FILES['arquivo']);

if ($result['success']) {
    echo 'Upload realizado com sucesso!';
} else {
    echo 'Erro: ' . $result['error'];
}
```

## Configuração

O arquivo `src/Config.php` **deve conter as constantes necessárias** para o funcionamento da biblioteca, como por exemplo:

```php
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/png']);
```

Adapte as constantes conforme a necessidade do seu projeto.

## Licença

Consulte o arquivo LICENSE para mais informações.

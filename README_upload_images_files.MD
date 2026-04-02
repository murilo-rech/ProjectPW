# Upload Images

## No script `composer.json`
Incluir a biblioteca `sorfabiosantos/uploader` na versão mais recente.

## No script `api/index.php`
Criar uma rota para update de imagem do usuário
```PHP
$route->post("/photo", "Users:updatePhoto");
```

## No script `source\Core\Config.php`
Incluir as seguintes constantes
```PHP
/*
 * Configuração de constantes para upload de arquivos e imagens.
 */

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_MIN_SIZE = 10 * 1024; // 10KB

//const IMAGE_DIR = __DIR__ . '/../../storage/images';
const IMAGE_DIR = '/storage/images';
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif'
];

const FILE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const FILE_MIN_SIZE = 10 * 1024; // 10KB

const FILE_DIR = '/storage/files';
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
];

// Mensagens configuráveis
const IMAGE_SIZE_ERROR_MESSAGE = 'Tamanho inválido para a imagem. Deve ser entre ' . IMAGE_MIN_SIZE . ' e ' . IMAGE_MAX_SIZE . '.';
const IMAGE_TYPE_ERROR_MESSAGE = 'Tipo de imagem inválido. Apenas JPG, PNG e GIF são permitidos.';
const IMAGE_MOVE_ERROR_MESSAGE = 'Erro ao mover o arquivo para o diretório de destino.';

const FILE_SIZE_ERROR_MESSAGE = 'Tamanho inválido para o arquivo. Deve ser até ' . FILE_MAX_SIZE . '.';
const FILE_TYPE_ERROR_MESSAGE = 'Tipo de arquivo inválido. Apenas PDF, DOC, DOCX, XLS, XLSX e TXT são permitidos.';
const FILE_MOVE_ERROR_MESSAGE = 'Erro ao mover o arquivo para o diretório de destino.';
```

## Na classe `source\WebService\Users.php`
Incluir o método `updatePhoto`
```PHP
public function updatePhoto (): void
    {
        $this->auth();

        $photo = (!empty($_FILES["photo"]["name"]) ? $_FILES["photo"] : null);

        $upload = new Uploader();
        // /storage/images/091da97a9aec86fe9905ecf532508cd4.png
        $path = $upload->Image($photo);
        if(!$path) {
            $this->call(400, "bad_request", $upload->getMessage(), "error")->back();
            return;
        }

        $user = new User();
        $user->findByEmail($this->userAuth->email);
        // Deletar a foto antiga
        if(file_exists(__DIR__ . "/../../storage/images/" . "{$user->getPhoto()}")){
            unlink(__DIR__ . "/../../storage/images/" . "{$user->getPhoto()}");
        }

        $user->setPhoto($path);
        if(!$user->updateById()){
            $this->call(500, "internal_server_error", $user->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Foto atualizada com sucesso", "success")->back();

    }
```
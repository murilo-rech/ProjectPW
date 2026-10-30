<?php

// A biblioteca do professor usa constantes globais para configurar o destino
// e as regras do metodo Uploader::Image(). O caminho parte de api/vendor/.../src.
define('IMAGE_DIR', '/../storage/images');
define('FILE_DIR', '/../storage/images');
define('IMAGE_MIN_SIZE', 32);
define('IMAGE_MAX_SIZE', 5 * 1024 * 1024);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('IMAGE_SIZE_ERROR_MESSAGE', 'A imagem deve ter entre 32 bytes e 5 MB.');
define('IMAGE_TYPE_ERROR_MESSAGE', 'Envie uma imagem JPEG, PNG, GIF ou WebP valida.');
define('IMAGE_MOVE_ERROR_MESSAGE', 'Nao foi possivel armazenar a imagem.');

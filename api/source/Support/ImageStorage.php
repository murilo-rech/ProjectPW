<?php

namespace Source\Support;

use RuntimeException;
use SorFabioSantos\Uploader\Uploader;

class ImageStorage
{
    private const EXTENSIONS_BY_MIME = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];

    public function store(array $uploadedFile): array
    {
        if (!isset($uploadedFile['error'], $uploadedFile['tmp_name'], $uploadedFile['size'])) {
            throw new RuntimeException('Selecione uma imagem para enviar.');
        }

        if ((int)$uploadedFile['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($uploadedFile['tmp_name'])) {
            throw new RuntimeException('O arquivo enviado nao pode ser processado.');
        }

        $size = (int)$uploadedFile['size'];
        if ($size < IMAGE_MIN_SIZE || $size > IMAGE_MAX_SIZE) {
            throw new RuntimeException('A imagem deve ter entre 32 bytes e 5 MB.');
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($uploadedFile['tmp_name']);
        $imageInfo = @getimagesize($uploadedFile['tmp_name']);
        if (
            !isset(self::EXTENSIONS_BY_MIME[$mime])
            || !is_array($imageInfo)
            || ($imageInfo['mime'] ?? null) !== $mime
        ) {
            throw new RuntimeException('O arquivo nao contem uma imagem JPEG, PNG, GIF ou WebP valida.');
        }

        // O uploader usa o MIME e a extensao do array recebido. Substituimos
        // ambos pelos valores verificados no conteudo real do arquivo.
        $safeUpload = $uploadedFile;
        $safeUpload['type'] = $mime;
        $safeUpload['name'] = 'upload.' . self::EXTENSIONS_BY_MIME[$mime];
        $safeUpload['size'] = $size;

        $uploader = new Uploader();
        $result = $uploader->Image($safeUpload);
        if ($result === false) {
            throw new RuntimeException($uploader->getMessage() ?: 'Nao foi possivel armazenar a imagem.');
        }

        $directory = $this->storageDirectory();
        $libraryFilename = basename($result);
        $libraryPath = $directory . DIRECTORY_SEPARATOR . $libraryFilename;
        if (!is_file($libraryPath)) {
            throw new RuntimeException('O uploader nao encontrou a imagem armazenada.');
        }

        // A biblioteca cria um nome aleatorio. Renomeamos para um nome
        // criptograficamente aleatorio e aceito somente pelo leitor abaixo.
        $filename = bin2hex(random_bytes(16)) . '.' . self::EXTENSIONS_BY_MIME[$mime];
        if (!rename($libraryPath, $directory . DIRECTORY_SEPARATOR . $filename)) {
            @unlink($libraryPath);
            throw new RuntimeException('Nao foi possivel finalizar o armazenamento da imagem.');
        }

        return ['filename' => $filename, 'mime_type' => $mime];
    }

    public function pathFor(string $filename): ?string
    {
        if (!preg_match('/\A[a-f0-9]{32}\.(jpg|png|gif|webp)\z/D', $filename)) {
            return null;
        }

        $path = $this->storageDirectory() . DIRECTORY_SEPARATOR . $filename;
        return is_file($path) ? $path : null;
    }

    public function delete(string $filename): void
    {
        $path = $this->pathFor($filename);
        if ($path !== null) {
            @unlink($path);
        }
    }

    private function storageDirectory(): string
    {
        return dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'images';
    }
}

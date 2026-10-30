<?php

namespace SorFabioSantos\Uploader;
/*
 * Class Uploader
 * @author Fábio Santos <fabiosantos@ifsul.edu.br>
 * @package SorFabioSantos\Uploader
 * @version 1.0.8
 */
class Uploader {
    /**
     * @var
     */
    private $message;

    /**
     *
     */
    public function __construct()
    {

        $this->createDirectory("/../../../.." . IMAGE_DIR);
        $this->createDirectory("/../../../.." . FILE_DIR);
    }

    /**
     * @return string
     */
    public function getMessage(): string
    {
        return $this->message;
    }

    /**
     * @param $dir
     * @return void
     */
    private function createDirectory($dir)
    {
        if (!is_dir(__DIR__ . $dir)) {
            mkdir(__DIR__ . $dir, 0777, true);
        }
    }

    /**
     * @param $bytes
     * @return string
     */
    private function formatSize($bytes)
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        }
        return number_format($bytes / 1024, 2) . ' KB';
    }

    /**
     * @param $file
     * @return bool|string
     */
    public function Image($file): bool|string
    {
        if ($file['size'] > IMAGE_MAX_SIZE || $file['size'] < IMAGE_MIN_SIZE) {
            $this->message = str_replace([
                IMAGE_MIN_SIZE, IMAGE_MAX_SIZE
            ], [
                $this->formatSize(IMAGE_MIN_SIZE),
                $this->formatSize(IMAGE_MAX_SIZE)
            ], IMAGE_SIZE_ERROR_MESSAGE);
            return false;
        }

        if (!in_array($file['type'], ALLOWED_IMAGE_TYPES)) {
            $this->message = IMAGE_TYPE_ERROR_MESSAGE;
            return false;
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $imageName = md5(uniqid(rand())) . "." . $extension;
        $target = "/../../../.." . IMAGE_DIR . '/' . $imageName;

        if(!move_uploaded_file($file['tmp_name'], __DIR__ . $target)) {
            $this->message = IMAGE_MOVE_ERROR_MESSAGE;
            return false;
        }

        return IMAGE_DIR . '/' . $imageName;

    }

    /**
     * @param $file
     * @return bool|string
     */
    public function File($file): bool|string
    {
        if ($file['size'] > FILE_MAX_SIZE || $file['size'] < FILE_MIN_SIZE) {
            $this->message = str_replace(
                FILE_MAX_SIZE,
                $this->formatSize(FILE_MAX_SIZE),
                FILE_SIZE_ERROR_MESSAGE
            );
            return false;
        }

        if (!in_array($file['type'], ALLOWED_FILE_TYPES)) {
            $this->message = FILE_TYPE_ERROR_MESSAGE;
            return false;
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = md5(uniqid(rand())) . "." . $extension;
        $target = "/../../../.." . FILE_DIR . '/' . $fileName;

        if (!move_uploaded_file($file['tmp_name'], __DIR__ . $target)) {
            $this->message = FILE_MOVE_ERROR_MESSAGE;
            return false;
        }

        return FILE_DIR . '/' . $fileName;
    }
}
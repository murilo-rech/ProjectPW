<?php

namespace Source\Controller;

class Api
{
    protected array $response = [];

    public function hello(): void
    {
        echo "Ola, mundo! Estamos com a API funcionando!";
    }

    protected function call(int $code, ?string $status = null, ?string $message = null, ?string $type = null): Api
    {
        http_response_code($code);

        if (!empty($status)) {
            $this->response = [
                "code" => $code,
                "type" => $type,
                "status" => $status,
                "message" => (!empty($message) ? $message : null)
            ];
        }

        return $this;
    }

    protected function back(array|object|null $data = null): Api
    {
        header('Content-Type: application/json; charset=UTF-8');
        $this->response["data"] = $data;

        echo json_encode($this->response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $this;
    }

}

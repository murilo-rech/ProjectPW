<?php

namespace Source\Controller;

class Api
{
    protected array $response = [];

    protected function call(int $code, ?string $status = null, ?string $message = null, ?string $type = null): Api
    {
        http_response_code($code);

        $this->response = [
            "code" => $code,
            "type" => $type,
            "status" => $status,
            "message" => $message
        ];

        return $this;
    }

    protected function back(array | object | null $data = null): Api
    {
        header('Content-Type: application/json; charset=UTF-8');
        $this->response["data"] = $data;
        echo json_encode($this->response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return $this;
    }

    protected function getJsonInput(): array
    {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        return is_array($data) ? $data : [];
    }
}

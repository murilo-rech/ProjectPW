<?php

/**
 * Configutação do endereço base do site.
 */

const CONF_URL_BASE = "http://localhost:8080/acme-manha/"; // URL base do site, geralmente localhost em desenvolvimento

/**
 * Configuração de constantes do banco de dados.
 */

const CONF_DB_HOST = "mysqllocal"; // localhost
const CONF_DB_NAME = "db-inf-3am"; // Nome do banco de dados
const CONF_DB_USER = "root"; // Usuário do banco de dados
const CONF_DB_PASS = "asdf1234"; // Senha do banco de dados, geralmente vazia em ambientes de desenvolvimento
const CONF_DB_PORT = "33068"; // Porta do banco de dados, geralmente 3306 para MySQL


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
<?php

const CONF_URL_BASE = "http://localhost/ProjectPW-main"; // URL base do site, geralmente localhost em desenvolvimento
const CONF_URL_TEST = "http://localhost/ProjectPW-main"; // URL base do site, geralmente localhost em desenvolvimento

// XAMPP local: o MySQL está disponível na própria máquina. Em Docker, use o
// nome do serviço (por exemplo, "mysql") nesta constante.
const CONF_DB_HOST = "localhost";
const CONF_DB_NAME = "db-acme-tarde";
const CONF_DB_USER = "root";
const CONF_DB_PORT = "3306";
const CONF_DB_PASS = "";

const JWT_SECRET_KEY = "e17851db9fee8e49f728550fc2f82111c4374f426c9cadda9403390ef638073ff21fd7a7e35d025861e175b0fb93609d838fba3185c859c13b9f43cf92ecbd48";

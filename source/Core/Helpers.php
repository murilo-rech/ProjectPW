<?php

/**
 * Funções comuns de ajuda para o sistema.
 */

function url(string $path = null): string
{
    return CONF_URL_BASE . $path;
}
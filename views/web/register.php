<?php

echo "Página de Cadastro<br>";

?>

<!--Formulário de cadastro-->

<form id="formRegister">
    <input type="hidden" name="idType" value="1">
    <label>
        <span>Nome:</span>
        <input type="text" name="name" value="Fábio Santos">
    </label>
    <label>
        <span>Email:</span>
        <input type="text" name="email" value="fabiosantos@ifsul.edu.br">
    </label>
    <label>
        <span>Senha:</span>
        <input type="password" name="password" value="1234567">
    </label>
    <button>Cadastrar</button>
</form>

<script type="module" src="<?= url("assets/web/js/register.js"); ?>"></script>

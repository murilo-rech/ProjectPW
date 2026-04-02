<?php
 $this->layout("_theme", []);
?>
<?php
    $this->start("specific-style");
?>
<link rel="stylesheet" href="<?= url("assets/web/css/login.css"); ?>"></link>
<?php
    $this->end();
?>

<!-- Formulário de login -->

<form id="formLogin">
    <label>
        <span>Email:</span>
        <input type="text" name="email" value="fabiosantos@ifsul.edu.br">
    </label>
    <label>
        <span>Senha:</span>
        <input type="password" name="password" value="12345678">
    </label>
    <button>Entrar</button>
</form>

<script type="module" src="<?= url("assets/web/js/login.js"); ?>"></script>
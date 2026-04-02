<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Área App</title>
    <link rel="stylesheet" href="<?= url("assets/app/css/theme.css") ?>">
    <?php if ($this->section("specific-style")): ?>
        <?= $this->section("specific-style"); ?>
    <?php endif; ?>
</head>
<body>
<header>
    Área do Aplicativo
</header>
<nav>
    <a href="<?= url ("app/perfil") ?>">Perfil do Usuário</a>
    <a href="<?= url ("app/salas") ?>">Salas</a>
    <a href="<?= url ("app/usuarios") ?>">Usuários</a>
    <a href="<?= url ("app/espacos") ?>">Reservar Espaços</a>
</nav>
<main>
    <?= $this->section("content") ?>
</main>
<?php if ($this->section("specific-script")): ?>
    <?= $this->section("specific-script"); ?>
<?php endif; ?>
</body>
</html>
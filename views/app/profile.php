<?php
    $this->layout("_theme", []);
?>
<?php  $this->start("specific-style"); ?>
<link rel="stylesheet" href="<?= url("assets/app/css/profile.css"); ?>"></link>
<?php $this->end(); ?>

<section id="profile">
    <h2>Perfil do Usuário</h2>
    <p>Informações estáticas sobre o perfil do usuário.</p>
    <form id="formEditProfile">
        <label for="name">
            <span>Nome:</span>
            <input type="text" name="name" id="name" value="">
        </label>
        <label for="email">
            <span>Email:</span>
            <input type="email" name="email" id="email" value="">
        </label>
        <label for="document">
            <span>CPF:</span>
            <input type="text" name="document" id="document" value="">
        </label>
        <label for="buttonUpdate">
            <span>&nbsp;</span>
            <button type="submit" id="buttonUpdate">Atualizar Perfil</button>
        </label>
    </form>
    <h2>Atualizar Senha</h2>
    <form id="formEditPassword">
        <label for="currentPassword">
            <span>Senha Atual:</span>
            <input type="password" name="currentPassword" id="currentPassword" value="">
        </label>
        <label for="newPassword">
            <span>Nova Senha:</span>
            <input type="password" name="newPassword" id="newPassword" value="">
        </label>
        <label for="confirmNewPassword">
            <span>Confirmar Nova Senha:</span>
            <input type="password" name="confirmNewPassword" id="confirmNewPassword" value="">
        </label>
        <label for="buttonUpdatePassword">
            <span>&nbsp;</span>
            <button type="submit" id="buttonUpdatePassword">Atualizar Senha</button>
        </label>
    </form>
    <h2>Atualizar foto</h2>
    <form id="formEditPhoto">
        <label for="photo">
            <span>Foto de Perfil:</span>
            <input type="file" name="photo" id="photo" accept="image/*">
        </label>
        <label for="buttonUpdatePhoto">
            <span>&nbsp;</span>
            <button type="submit" id="buttonUpdatePhoto">Atualizar Foto</button>
        </label>
    </form>
        <img src="" alt="" id="photoPreview">
</section>

<?php  $this->start("specific-script"); ?>
<script src="<?= url("assets/app/js/profile.js"); ?>"></script>
<?php $this->end(); ?>

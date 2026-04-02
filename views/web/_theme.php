<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? 'RoomManager - Gestão de Salas de Reunião' ?></title>
    <meta name="description" content="<?= $description ?? 'Sistema completo para gerenciamento e agendamento de salas de reunião para pequenas e médias empresas' ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?= url("assets/web/css/theme.css") ?>">
    <?php if ($this->section("specific-style")): ?>
        <?= $this->section("specific-style"); ?>
    <?php endif; ?>
</head>
<body>
    <header>
        <nav>
            <a href="/" class="logo">
                <i class="fas fa-door-open"></i>
                RoomManager
            </a>
            
            <ul class="nav-menu">
                <li><a href="<?= url() ?>" class="active">Home</a></li>
                <li><a href="<?= url("sobre") ?>">Sobre Nós...</a></li>
                <li><a href="<?= url("contato") ?>">Contato</a></li>
            </ul>
            
            <section class="nav-actions">
                <a href="/login" class="btn btn-outline">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                </a>
            </section>
            
            <section class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </section>
        </nav>
    </header>

    <main>
        <?= $this->section("content") ?>
    </main>

    <footer>
        <section class="footer-container">
            <section class="footer-content">
                <section class="footer-section">
                    <h3>RoomManager</h3>
                    <p>Simplificamos o gerenciamento de salas de reunião para pequenas e médias empresas, oferecendo uma solução completa e intuitiva.</p>
                </section>
                
                <section class="footer-section">
                    <h3>Produto</h3>
                    <ul>
                        <li><a href="#funcionalidades">Funcionalidades</a></li>
                        <li><a href="#planos">Planos</a></li>
                        <li><a href="#integracao">Integração</a></li>
                        <li><a href="#api">API</a></li>
                    </ul>
                </section>
                
                <section class="footer-section">
                    <h3>Empresa</h3>
                    <ul>
                        <li><a href="/sobre">Sobre Nós...</a></li>
                        <li><a href="/contato">Contato</a></li>
                        <li><a href="/blog">Blog</a></li>
                        <li><a href="/suporte">Suporte</a></li>
                    </ul>
                </section>
                
                <section class="footer-section">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/privacidade">Privacidade</a></li>
                        <li><a href="/termos">Termos de Uso</a></li>
                        <li><a href="/cookies">Cookies</a></li>
                    </ul>
                </section>
            </section>
            
            <section class="footer-bottom">
                <p>&copy; 2024 RoomManager. Todos os direitos reservados.</p>
            </section>
        </section>
    </footer>

    <script type="application/javascript" src="<?= url("assets/web/js/theme.js") ?>"> </script>
    <?php if ($this->section("specific-script")): ?>
        <?= $this->section("specific-script"); ?>
    <?php endif; ?>
</body>
</html>
<?php
$this->layout("_theme", [
    "title" => "RoomManager - Gestão Inteligente de Salas de Reunião",
    "description" => "Transforme a gestão das suas salas de reunião com nossa plataforma completa. Agendamento inteligente, controle de disponibilidade e relatórios detalhados para pequenas e médias empresas."
]);
?>

<style>
    /* Hero Section */
    .hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 5rem 0;
        text-align: center;
    }

    .hero-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .hero h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        line-height: 1.2;
    }

    .hero p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    .hero-cta {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .btn-large {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border-radius: 0.5rem;
    }

    .btn-white {
        background-color: white;
        color: var(--primary-color);
    }

    .btn-white:hover {
        background-color: #f8fafc;
        transform: translateY(-2px);
    }

    /* Features Section */
    .features {
        padding: 5rem 0;
        background-color: var(--bg-light);
    }

    .section-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .section-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .section-header h2 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .section-header p {
        font-size: 1.1rem;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }

    .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: var(--shadow-md);
        text-align: center;
        transition: transform 0.3s ease;
    }

    .feature-card:hover {
        transform: translateY(-5px);
    }

    .feature-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 2rem;
        color: white;
    }

    .feature-card h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .feature-card p {
        color: var(--text-secondary);
        line-height: 1.6;
    }

    /* Pricing Section */
    .pricing {
        padding: 5rem 0;
        background-color: white;
    }

    .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 3rem;
    }

    .pricing-card {
        background: white;
        border: 2px solid var(--border-color);
        border-radius: 1rem;
        padding: 2rem;
        text-align: center;
        position: relative;
        transition: all 0.3s ease;
    }

    .pricing-card:hover {
        border-color: var(--primary-color);
        transform: translateY(-5px);
    }

    .pricing-card.featured {
        border-color: var(--primary-color);
        transform: scale(1.05);
    }

    .pricing-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .pricing-card h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .pricing-card .price {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .pricing-card .period {
        color: var(--text-secondary);
        margin-bottom: 2rem;
    }

    .pricing-features {
        list-style: none;
        margin-bottom: 2rem;
    }

    .pricing-features li {
        padding: 0.5rem 0;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .pricing-features li i {
        color: var(--accent-color);
    }

    /* CTA Section */
    .cta {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        color: white;
        padding: 4rem 0;
        text-align: center;
    }

    .cta h2 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    .cta p {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        opacity: 0.9;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .hero h1 {
            font-size: 2rem;
        }

        .hero-cta {
            flex-direction: column;
            align-items: center;
        }

        .section-header h2 {
            font-size: 2rem;
        }

        .pricing-card.featured {
            transform: none;
        }
    }
</style>

<!-- Hero Section -->
<section class="hero">
    <article class="hero-container">
        <h1>Gerencie suas salas de reunião com eficiência</h1>
        <p>Simplifique o agendamento e controle de salas de reunião na sua empresa com nossa plataforma intuitiva e completa.</p>
        <nav class="hero-cta">
            <a href="/cadastro" class="btn btn-white btn-large">
                <i class="fas fa-rocket"></i>
                Começar Gratuitamente
            </a>
            <a href="#funcionalidades" class="btn btn-outline btn-large" style="color: white; border-color: white;">
                <i class="fas fa-play"></i>
                Ver Demonstração
            </a>
        </nav>
    </article>
</section>

<!-- Features Section -->
<section class="features" id="funcionalidades">
    <article class="section-container">
        <header class="section-header">
            <h2>Funcionalidades Poderosas</h2>
            <p>Tudo que você precisa para gerenciar suas salas de reunião de forma eficiente e profissional.</p>
        </header>
        
        <main class="features-grid">
            <article class="feature-card">
                <figure class="feature-icon">
                    <i class="fas fa-calendar-alt"></i>
                </figure>
                <h3>Agendamento Inteligente</h3>
                <p>Sistema de reservas avançado com verificação automática de disponibilidade e prevenção de conflitos.</p>
            </article>
            
            <article class="feature-card">
                <figure class="feature-icon">
                    <i class="fas fa-users"></i>
                </figure>
                <h3>Gestão de Usuários</h3>
                <p>Controle completo de permissões, departamentos e hierarquias para diferentes níveis de acesso.</p>
            </article>
            
            <article class="feature-card">
                <figure class="feature-icon">
                    <i class="fas fa-chart-bar"></i>
                </figure>
                <h3>Relatórios Detalhados</h3>
                <p>Análises completas de uso, ocupação e estatísticas para otimizar o aproveitamento dos espaços.</p>
            </article>
            
            <article class="feature-card">
                <figure class="feature-icon">
                    <i class="fas fa-mobile-alt"></i>
                </figure>
                <h3>Acesso Mobile</h3>
                <p>Interface responsiva e aplicativo mobile para gerenciar reservas em qualquer lugar e momento.</p>
            </article>
            
            <article class="feature-card">
                <figure class="feature-icon">
                    <i class="fas fa-bell"></i>
                </figure>
                <h3>Notificações</h3>
                <p>Alertas automáticos por email e SMS para confirmações, lembretes e mudanças de agendamento.</p>
            </article>
            
            <article class="feature-card">
                <figure class="feature-icon">
                    <i class="fas fa-cog"></i>
                </figure>
                <h3>Integrações</h3>
                <p>Conecte com Google Calendar, Outlook, Slack e outras ferramentas que sua empresa já utiliza.</p>
            </article>
        </main>
    </article>
</section>

<!-- Pricing Section -->
<section class="pricing" id="planos">
    <article class="section-container">
        <header class="section-header">
            <h2>Planos para Todo Tamanho de Empresa</h2>
            <p>Escolha o plano ideal para suas necessidades e comece a transformar a gestão das suas salas hoje mesmo.</p>
        </header>
        
        <main class="pricing-grid">
            <article class="pricing-card">
                <h3>Free</h3>
                <span class="price">Grátis</span>
                <small class="period">Para sempre</small>
                <ul class="pricing-features">
                    <li><i class="fas fa-check"></i> Até 2 salas</li>
                    <li><i class="fas fa-check"></i> 5 usuários</li>
                    <li><i class="fas fa-check"></i> Agendamento básico</li>
                    <li><i class="fas fa-check"></i> Suporte por email</li>
                    <li><i class="fas fa-check"></i> Relatórios básicos</li>
                </ul>
                <a href="/cadastro?plano=free" class="btn btn-outline" style="width: 100%;">Começar Grátis</a>
            </article>
            
            <article class="pricing-card featured">
                <span class="pricing-badge">Mais Popular</span>
                <h3>Plus</h3>
                <span class="price">R$ 29</span>
                <small class="period">por mês</small>
                <ul class="pricing-features">
                    <li><i class="fas fa-check"></i> Até 10 salas</li>
                    <li><i class="fas fa-check"></i> 25 usuários</li>
                    <li><i class="fas fa-check"></i> Agendamento avançado</li>
                    <li><i class="fas fa-check"></i> Notificações SMS/Email</li>
                    <li><i class="fas fa-check"></i> Relatórios detalhados</li>
                    <li><i class="fas fa-check"></i> Integrações básicas</li>
                    <li><i class="fas fa-check"></i> Suporte prioritário</li>
                </ul>
                <a href="/cadastro?plano=plus" class="btn btn-primary" style="width: 100%;">Escolher Plus</a>
            </article>
            
            <article class="pricing-card">
                <h3>Premium</h3>
                <span class="price">R$ 79</span>
                <small class="period">por mês</small>
                <ul class="pricing-features">
                    <li><i class="fas fa-check"></i> Salas ilimitadas</li>
                    <li><i class="fas fa-check"></i> Usuários ilimitados</li>
                    <li><i class="fas fa-check"></i> Recursos avançados</li>
                    <li><i class="fas fa-check"></i> API completa</li>
                    <li><i class="fas fa-check"></i> Todas as integrações</li>
                    <li><i class="fas fa-check"></i> Suporte 24/7</li>
                    <li><i class="fas fa-check"></i> Consultoria personalizada</li>
                </ul>
                <a href="/cadastro?plano=premium" class="btn btn-outline" style="width: 100%;">Escolher Premium</a>
            </article>
        </main>
    </article>
</section>

<!-- CTA Section -->
<section class="cta">
    <article class="section-container">
        <h2>Pronto para transformar sua gestão de salas?</h2>
        <p>Junte-se a centenas de empresas que já otimizaram seus espaços de reunião com o RoomManager.</p>
        <a href="/cadastro" class="btn btn-white btn-large">
            <i class="fas fa-rocket"></i>
            Começar Agora - É Grátis
        </a>
    </article>
</section>
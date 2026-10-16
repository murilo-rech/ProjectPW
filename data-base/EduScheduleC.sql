CREATE SCHEMA IF NOT EXISTS `db-acme-tarde`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `db-acme-tarde`;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS availabilities;
DROP TABLE IF EXISTS teacher_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS faqs;

-- =====================================================
-- PLANS
-- =====================================================

CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    max_students INT NOT NULL,
    max_teachers INT NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO plans (name, description, price, max_students, max_teachers, active) VALUES
('Basico', 'Perfeito para pequenas escolas tecnicas ou projetos pilotos.', 49.00, 50, 5, 1),
('Intermediario', 'O ideal para a maioria das escolas e institutos tecnicos.', 119.00, 200, 20, 1),
('Premium', 'Para grandes escolas, universidades ou multiplos campi.', 249.00, 0, 0, 1);

-- =====================================================
-- SCHOOLS
-- =====================================================

CREATE TABLE schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(50),
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_school_plan
        FOREIGN KEY (plan_id)
        REFERENCES plans(id)
);

INSERT INTO schools (plan_id, name, code, email, phone, city, state, active) VALUES
(2, 'Instituto Federal Sul-rio-grandense', 'IFSUL-PEL-2026', 'contato@ifsul.edu.br', '(53) 3212-0000', 'Pelotas', 'RS', 1);

-- =====================================================
-- USERS
-- type_id: 1 = Global Admin, 2 = School Admin
-- =====================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NULL,
    type_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    photo VARCHAR(255),
    registration_number VARCHAR(50),
    specialization VARCHAR(100),
    office_room VARCHAR(100),
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);

INSERT INTO users (school_id, type_id, name, email, password, active) VALUES
(NULL, 1, 'Administrador Global', 'global@eduschedule.test', '$2y$10$RH1I9yfdKsP7ZtITJ1VcSefxmOzwolnbvj52ufMWKKDXELr9ylA8e', 1),
(1, 2, 'Administrador Escolar', 'admin@ifsul.edu.br', '$2y$10$RH1I9yfdKsP7ZtITJ1VcSefxmOzwolnbvj52ufMWKKDXELr9ylA8e', 1);

-- =====================================================
-- ADDRESSES
-- =====================================================

CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(150) NOT NULL,
    number VARCHAR(20) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- =====================================================
-- SUBJECTS
-- =====================================================

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subject_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);

-- =====================================================
-- TEACHER SUBJECTS
-- =====================================================

CREATE TABLE teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    CONSTRAINT fk_teacher_subject_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id),
    CONSTRAINT fk_teacher_subject_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id),
    UNIQUE (teacher_id, subject_id)
);

-- =====================================================
-- AVAILABILITIES
-- =====================================================

CREATE TABLE availabilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    modality INT NOT NULL,
    weekday INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_students INT NOT NULL,
    location VARCHAR(150),
    meeting_link VARCHAR(255),
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_availability_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id),
    CONSTRAINT fk_availability_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    availability_id INT NOT NULL,
    student_id INT NOT NULL,
    notes TEXT,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_availability
        FOREIGN KEY (availability_id)
        REFERENCES availabilities(id),
    CONSTRAINT fk_appointment_student
        FOREIGN KEY (student_id)
        REFERENCES users(id)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- =====================================================
-- FAQS
-- =====================================================

CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO faqs (question, answer, active, sort_order) VALUES
('O que e o EduSchedule?', 'O EduSchedule e uma plataforma SaaS voltada para instituicoes de ensino que desejam organizar e automatizar o processo de agendamento de atendimentos entre alunos e professores.', 1, 1),
('Como minha escola pode comecar a usar o EduSchedule?', 'Escolha um dos planos disponiveis, preencha os dados da instituicao e crie a conta do administrador. Em minutos o ambiente estara pronto.', 1, 2),
('Professores precisam de aprovacao para entrar no sistema?', 'Sim. Professores se cadastram, solicitam vinculo com a instituicao e aguardam a aprovacao do administrador escolar.', 1, 3),
('Como os alunos entram na plataforma?', 'Alunos se cadastram com nome, e-mail e senha. Para se vincular a uma escola, utilizam o codigo institucional fornecido pela instituicao.', 1, 4),
('E possivel ter atendimentos presenciais e online na mesma semana?', 'Sim. O professor escolhe a modalidade de cada disponibilidade e informa local presencial ou link da reuniao online.', 1, 5),
('O que acontece quando um horario fica lotado?', 'O sistema exibe as vagas disponiveis e bloqueia automaticamente novos agendamentos quando todas as vagas forem preenchidas.', 1, 6),
('Posso cancelar um agendamento?', 'Sim. Alunos podem cancelar agendamentos futuros pela plataforma, liberando a vaga para outros alunos.', 1, 7),
('O professor recebe notificacao quando edita ou cancela um horario?', 'Sim. Os alunos inscritos naquele horario recebem uma notificacao informando a alteracao.', 1, 8),
('Os planos tem limite de usuarios?', 'Sim. Cada plano possui seus proprios limites de alunos e professores. Consulte a pagina de Planos para ver os detalhes.', 1, 9),
('Posso ter mais de um administrador na minha escola?', 'Sim. O administrador da escola pode criar outros administradores para ajudar na gestao da instituicao.', 1, 10);

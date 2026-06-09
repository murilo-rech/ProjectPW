drop database EduSchedule;
CREATE SCHEMA IF NOT EXISTS `EdusShedule`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `EduShedule`;

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

    status INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

    status INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_school_plan
        FOREIGN KEY (plan_id)
        REFERENCES plans(id)
);

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    school_id INT NULL,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    photo VARCHAR(255),

    registration_number VARCHAR(50),

    specialization VARCHAR(100),

    office_room VARCHAR(100),

    user_type INT NOT NULL,

    status INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);

-- =====================================================
-- SUBJECTS
-- =====================================================

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,

    school_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,

    status INT NOT NULL,

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

    status INT NOT NULL,

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

    status INT NOT NULL,

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

    is_published TINYINT(1) DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
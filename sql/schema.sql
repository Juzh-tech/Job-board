-- =============================================================================
-- schema.sql — structure complète de la base Job Board
-- =============================================================================
--
-- But
--   Si quelqu’un récupère le projet SANS ma base, il doit pouvoir en recréer
--   une à l’identique juste en lançant ce fichier, puis seed.sql.
--
-- Comment l’utiliser
--   1) mysql --default-character-set=utf8mb4 -u root < schema.sql
--   2) mysql --default-character-set=utf8mb4 -u root jobboard < seed.sql
--
-- Attention
--   DROP DATABASE : ça écrase tout. Sur une base déjà en prod, préfère les
--   scripts migration_*.sql plutôt que de tout casser.
--
-- Encodage
--   utf8mb4 obligatoire. Sans ça les accents et le € partent en "???" en base,
--   même si le front affiche bien.
--
-- =============================================================================

DROP DATABASE IF EXISTS jobboard;
CREATE DATABASE jobboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobboard;

-- -----------------------------------------------------------------------------
-- TABLE: companies
-- Une boîte qui veut publier des offres. Tant qu’elle est "en_attente", elle
-- voit son espace mais elle publie pas encore sur le board public. "validee"
-- = OK admin. "refusee" = bloquée, avec un motif qu’on lui montre.
-- -----------------------------------------------------------------------------
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    -- Secteur métier (liste côté front dans lib/secteurs.ts), pas un sous-domaine
    secteur VARCHAR(191) DEFAULT '',
    city VARCHAR(100) DEFAULT '',

    -- Code pays ISO (FR, ES, GB…). Sert à : langue UI du marché + filtre des offres
    country_code CHAR(2) NOT NULL DEFAULT 'FR',

    website VARCHAR(255) DEFAULT '',
    -- Identifiant local selon le pays (SIRET FR, NIF ES, Company number GB…)
    company_reg_id VARCHAR(64) DEFAULT '',

    -- Nom de fichier du logo uploadé (dossier uploads/logos). NULL = pas de logo
    logo_filename VARCHAR(255) DEFAULT NULL,

    presentation TEXT,

    verification_status ENUM('en_attente', 'validee', 'refusee')
        NOT NULL DEFAULT 'en_attente',
    -- Rempli par l’admin quand il refuse (sinon souvent vide)
    motif_refus TEXT,

    contact_nom VARCHAR(255) DEFAULT '',
    contact_email VARCHAR(255) DEFAULT '',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: people
-- Les comptes. Trois rôles : candidat, entreprise, admin.
-- company_id est rempli UNIQUEMENT si role = 'entreprise' (lien vers companies).
-- password = hash bcrypt, JAMAIS le mot de passe en clair. Si tu vois du clair
-- ici, c’est une erreur grave.
-- -----------------------------------------------------------------------------
CREATE TABLE people (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    -- 191 car. : limite d’index InnoDB en utf8mb4 (255×4 > 1000 octets)
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20) DEFAULT '',
    -- Pays du compte (téléphone / parcours inscription). Peut différer du pays marché
    country_code CHAR(2) NULL DEFAULT NULL,
    city VARCHAR(100) DEFAULT '',

    role ENUM('candidat', 'entreprise', 'admin') NOT NULL DEFAULT 'candidat',
    company_id INT NULL,

    -- CV du profil candidat (préremplit les candidatures). NULL si pas uploadé
    cv_filename VARCHAR(255) DEFAULT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- TABLE: advertisement
-- Une offre. salary est en VARCHAR exprès : on affiche des fourchettes du genre
-- "32 000 – 36 000 €" ou "25 € / heure", pas juste un nombre.
-- Sur le board public on ne montre que status = published + is_active +
-- entreprise validee (voir la vue plus bas).
-- -----------------------------------------------------------------------------
CREATE TABLE advertisement (
    id INT AUTO_INCREMENT PRIMARY KEY,

    company_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    full_description TEXT NOT NULL,

    salary VARCHAR(120) NOT NULL DEFAULT '',
    location VARCHAR(255) NOT NULL,
    -- Ex. "35 h / semaine", "Temps plein" — sert aussi aux estimations horaires
    working_time VARCHAR(100) DEFAULT '',
    contract_type ENUM('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance') NOT NULL,

    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- false = retirée du marché sans forcément tout archiver
    is_active BOOLEAN DEFAULT TRUE,
    status ENUM('draft', 'published', 'closed', 'archived') DEFAULT 'published',

    -- Qui a créé l’annonce (people.id). NULL si compte supprimé
    created_by INT NULL,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES people(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- TABLE: applications
-- Une candidature = un people sur une advertisement.
-- UNIQUE (people_id, advertisement_id) : on postule qu’une fois à la même offre
-- (le front affiche "Déjà postulé").
-- Statuts = le pipeline recruteur : envoyee → en_etude → entretien → acceptee
-- (ou refusee à tout moment).
-- -----------------------------------------------------------------------------
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    advertisement_id INT NOT NULL,
    people_id INT NOT NULL,
    message TEXT,
    cv_filename VARCHAR(255) DEFAULT '',

    status ENUM('envoyee', 'en_etude', 'entretien', 'acceptee', 'refusee')
        NOT NULL DEFAULT 'envoyee',
    motif_refus TEXT,

    -- Remplis quand status passe à entretien
    entretien_date DATE NULL,
    entretien_heure VARCHAR(10) DEFAULT '',
    entretien_modalite ENUM('visio', 'telephone', 'presentiel') NULL,
    entretien_note TEXT,

    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (advertisement_id) REFERENCES advertisement(id) ON DELETE CASCADE,
    FOREIGN KEY (people_id) REFERENCES people(id) ON DELETE CASCADE,
    UNIQUE KEY uq_people_advertisement (people_id, advertisement_id)
);

-- -----------------------------------------------------------------------------
-- TABLE: application_comments
-- Notes internes du recruteur sur une candidature. Le candidat les voit PAS.
-- -----------------------------------------------------------------------------
CREATE TABLE application_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    texte TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- TABLE: audit_log
-- Petit journal d’actions sensibles (admin / CDC). Pas un SIEM, juste une trace
-- pour savoir qui a touché quoi.
-- -----------------------------------------------------------------------------
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    record_id INT NOT NULL,
    detail TEXT,
    changed_by INT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (changed_by) REFERENCES people(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- INDEX
-- Pour que les filtres board + listes admin / entreprise restent raisonnables
-- quand y’a beaucoup d’offres ou de candidatures.
-- -----------------------------------------------------------------------------
CREATE INDEX idx_adv_company ON advertisement(company_id);
CREATE INDEX idx_adv_status ON advertisement(status);
CREATE INDEX idx_adv_location ON advertisement(location);
CREATE INDEX idx_adv_contract ON advertisement(contract_type);
CREATE INDEX idx_app_people ON applications(people_id);
CREATE INDEX idx_app_adv ON applications(advertisement_id);
CREATE INDEX idx_app_status ON applications(status);
CREATE INDEX idx_people_role ON people(role);
CREATE INDEX idx_people_company ON people(company_id);
CREATE INDEX idx_companies_verif ON companies(verification_status);
CREATE INDEX idx_companies_country ON companies(country_code);

-- -----------------------------------------------------------------------------
-- VUE: v_annonces_publiees
-- Raccourci "ce qui doit apparaître sur le board public".
-- Si tu changes la règle de visibilité, change ICI + les requêtes API offres.
-- -----------------------------------------------------------------------------
CREATE VIEW v_annonces_publiees AS
SELECT
    a.id,
    a.title,
    a.short_description,
    a.full_description,
    a.salary,
    a.location,
    a.working_time,
    a.contract_type,
    a.published_at,
    c.id AS company_id,
    c.name AS company_name,
    c.secteur AS company_secteur,
    c.city AS company_city,
    c.country_code AS company_country_code,
    c.presentation AS company_presentation,
    c.logo_filename AS company_logo_filename
FROM advertisement a
JOIN companies c ON c.id = a.company_id
WHERE a.status = 'published'
  AND a.is_active = TRUE
  AND c.verification_status = 'validee';

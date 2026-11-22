-- =============================================================================
-- migration_pays.sql — EXEMPLE de migration (base déjà créée, sans tout DROP)
-- =============================================================================
--
-- Quand l’utiliser
--   Ta base existait AVANT l’ajout du pays / identifiant entreprise.
--   Tu veux ajouter les colonnes SANS détruire les données.
--
-- Quand NE PAS l’utiliser
--   Install neuve → schema.sql suffit (les colonnes y sont déjà).
--
-- Si une colonne existe déjà, MySQL peut râler : c’est normal, ignore ou
-- vérifie avec DESCRIBE companies / DESCRIBE people.
--
-- =============================================================================

USE jobboard;

-- Pays + identifiant légal côté entreprise
ALTER TABLE companies
  ADD COLUMN country_code CHAR(2) NOT NULL DEFAULT 'FR' AFTER city,
  ADD COLUMN company_reg_id VARCHAR(64) DEFAULT '' AFTER website,
  MODIFY COLUMN secteur VARCHAR(191) DEFAULT '';

-- Pays / ville côté compte (inscription, téléphone)
ALTER TABLE people
  ADD COLUMN country_code CHAR(2) NULL DEFAULT NULL AFTER phone,
  ADD COLUMN city VARCHAR(100) DEFAULT '' AFTER country_code;

-- Index utile pour filtrer le board par marché
CREATE INDEX idx_companies_country ON companies(country_code);

-- =============================================================================
-- migration_logo.sql — EXEMPLE de migration (ajout logo entreprise)
-- =============================================================================
--
-- Quand l’utiliser
--   Base déjà en place, sans colonne logo_filename sur companies.
--
-- Quand NE PAS l’utiliser
--   Tu viens de lancer un schema.sql à jour → la colonne est déjà là.
--
-- Le fichier image lui-même vit dans uploads/logos/ (pas dans MySQL).
-- Ici on stocke juste le nom de fichier.
--
-- =============================================================================

USE jobboard;

ALTER TABLE companies
  ADD COLUMN logo_filename VARCHAR(255) DEFAULT NULL AFTER company_reg_id;

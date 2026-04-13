ALTER TABLE users
    ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL' AFTER password_hash,
    ADD COLUMN auth_provider_subject VARCHAR(191) NULL AFTER auth_provider;

CREATE UNIQUE INDEX uk_users_auth_provider_subject ON users(auth_provider_subject);

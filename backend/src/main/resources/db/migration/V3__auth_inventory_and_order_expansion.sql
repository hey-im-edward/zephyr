CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(40) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL
);

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(120) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE shoe_sizes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    shoe_id BIGINT NOT NULL,
    size_label VARCHAR(20) NOT NULL,
    stock_quantity INT NOT NULL,
    CONSTRAINT fk_shoe_sizes_shoe FOREIGN KEY (shoe_id) REFERENCES shoes(id),
    CONSTRAINT uk_shoe_sizes_shoe_and_size UNIQUE (shoe_id, size_label)
);

ALTER TABLE orders
    ADD COLUMN user_id BIGINT NULL AFTER id,
    ADD COLUMN payment_method VARCHAR(30) NOT NULL DEFAULT 'COD' AFTER status,
    ADD COLUMN total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER payment_method,
    ADD COLUMN updated_at DATETIME NULL AFTER created_at,
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id);

UPDATE orders o
SET total_amount = (
    SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
    FROM order_items oi
    WHERE oi.order_id = o.id
);

UPDATE orders
SET updated_at = created_at
WHERE updated_at IS NULL;

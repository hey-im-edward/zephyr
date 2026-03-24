CREATE TABLE categories (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    hero_tone VARCHAR(40) NOT NULL
);

CREATE TABLE shoes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(140) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    brand VARCHAR(80) NOT NULL,
    silhouette VARCHAR(80) NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    primary_image VARCHAR(255) NOT NULL,
    secondary_image VARCHAR(255) NOT NULL,
    available_sizes VARCHAR(120) NOT NULL,
    accent_colors VARCHAR(255) NOT NULL,
    highlights TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
    best_seller BOOLEAN NOT NULL DEFAULT FALSE,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_shoes_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(24) NOT NULL UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    notes TEXT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE order_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    shoe_slug VARCHAR(160) NOT NULL,
    shoe_name VARCHAR(160) NOT NULL,
    size_label VARCHAR(20) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

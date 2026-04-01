ALTER TABLE shoes
    ADD COLUMN gallery_images TEXT NULL AFTER secondary_image,
    ADD COLUMN video_url VARCHAR(255) NULL AFTER gallery_images,
    ADD COLUMN fit_note VARCHAR(255) NULL AFTER highlights,
    ADD COLUMN delivery_note VARCHAR(255) NULL AFTER fit_note,
    ADD COLUMN campaign_badge VARCHAR(80) NULL AFTER delivery_note;

CREATE TABLE shipping_methods (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    fee DECIMAL(12, 2) NOT NULL,
    eta_label VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 0
);

CREATE TABLE promotions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    badge VARCHAR(80) NOT NULL,
    discount_label VARCHAR(80) NOT NULL,
    hero_tone VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE orders
    ADD COLUMN shipping_method_id BIGINT NULL AFTER payment_method,
    ADD COLUMN promotion_id BIGINT NULL AFTER shipping_method_id,
    ADD COLUMN shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER total_amount,
    ADD COLUMN discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER shipping_fee,
    ADD COLUMN delivery_window VARCHAR(80) NULL AFTER discount_amount,
    ADD CONSTRAINT fk_orders_shipping_method FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id),
    ADD CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id);

CREATE TABLE order_status_history (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE user_addresses (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    label VARCHAR(60) NOT NULL,
    recipient_name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE wishlist_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shoe_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_wishlist_items_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_wishlist_items_shoe FOREIGN KEY (shoe_id) REFERENCES shoes(id),
    CONSTRAINT uk_wishlist_items_user_and_shoe UNIQUE (user_id, shoe_id)
);

CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shoe_id BIGINT NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(120) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_shoe FOREIGN KEY (shoe_id) REFERENCES shoes(id),
    CONSTRAINT uk_reviews_user_and_shoe UNIQUE (user_id, shoe_id)
);

CREATE TABLE campaigns (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    placement VARCHAR(40) NOT NULL,
    eyebrow VARCHAR(80) NOT NULL,
    headline VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    cta_label VARCHAR(80) NOT NULL,
    cta_href VARCHAR(255) NOT NULL,
    background_image VARCHAR(255) NOT NULL,
    focal_image VARCHAR(255) NOT NULL,
    hero_tone VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE banner_slots (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slot_key VARCHAR(80) NOT NULL UNIQUE,
    badge VARCHAR(80) NOT NULL,
    title VARCHAR(140) NOT NULL,
    description VARCHAR(255) NOT NULL,
    cta_label VARCHAR(80) NOT NULL,
    cta_href VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    tone VARCHAR(40) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE media_assets (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    media_kind VARCHAR(30) NOT NULL,
    url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    dominant_tone VARCHAR(40) NOT NULL,
    tags VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE collections (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    feature_label VARCHAR(80) NOT NULL,
    hero_tone VARCHAR(40) NOT NULL,
    cover_image VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE collection_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    collection_id BIGINT NOT NULL,
    shoe_id BIGINT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_collection_items_collection FOREIGN KEY (collection_id) REFERENCES collections(id),
    CONSTRAINT fk_collection_items_shoe FOREIGN KEY (shoe_id) REFERENCES shoes(id),
    CONSTRAINT uk_collection_items_collection_and_shoe UNIQUE (collection_id, shoe_id)
);

CREATE TABLE shoe_recommendations (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    source_shoe_id BIGINT NOT NULL,
    target_shoe_id BIGINT NOT NULL,
    reason_label VARCHAR(80) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_shoe_recommendations_source FOREIGN KEY (source_shoe_id) REFERENCES shoes(id),
    CONSTRAINT fk_shoe_recommendations_target FOREIGN KEY (target_shoe_id) REFERENCES shoes(id),
    CONSTRAINT uk_shoe_recommendations_pair UNIQUE (source_shoe_id, target_shoe_id)
);

CREATE TABLE admin_roles (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_admin_roles (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    admin_role_id BIGINT NOT NULL,
    CONSTRAINT fk_user_admin_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_admin_roles_role FOREIGN KEY (admin_role_id) REFERENCES admin_roles(id),
    CONSTRAINT uk_user_admin_roles_user_and_role UNIQUE (user_id, admin_role_id)
);

CREATE TABLE audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT NULL,
    action_type VARCHAR(80) NOT NULL,
    resource_type VARCHAR(80) NOT NULL,
    resource_id VARCHAR(120) NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_audit_logs_actor_user FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

UPDATE shoes
SET gallery_images = CONCAT(primary_image, '|', secondary_image),
    fit_note = CASE
        WHEN category_id = 2 THEN 'Form chạy hiệu năng tiêu chuẩn, nên đi đúng size thường dùng.'
        WHEN category_id = 4 THEN 'Thân giày ôm chắc để giữ ổn định trên địa hình hỗn hợp.'
        ELSE 'Phom mang hằng ngày cân bằng, ưu tiên chọn true-to-size.'
    END,
    delivery_note = 'Miễn phí giao nhanh nội thành cho đơn flagship và hỗ trợ đổi size còn tồn.',
    campaign_badge = CASE
        WHEN featured = TRUE THEN 'Zephyr Select'
        WHEN new_arrival = TRUE THEN 'New Season'
        WHEN best_seller = TRUE THEN 'Top Seller'
        ELSE 'Curated Pair'
    END;

INSERT INTO shipping_methods (name, slug, description, fee, eta_label, active, priority) VALUES
    ('Giao tiêu chuẩn', 'standard', 'Giao hàng toàn quốc trong nhịp ổn định cho phần lớn đơn hàng.', 30000, '2-4 ngày', TRUE, 1),
    ('Giao nhanh nội thành', 'express', 'Ưu tiên nội thành với thời gian rút ngắn cho các đôi flagship.', 60000, 'Trong ngày', TRUE, 2),
    ('Nhận tại studio', 'pickup', 'Đặt trước online và nhận tại điểm trải nghiệm của ZEPHYR.', 0, 'Đặt lịch nhận', TRUE, 3);

INSERT INTO promotions (code, title, description, badge, discount_label, hero_tone, active, featured) VALUES
    ('AIRYDROP', 'Airy Glass Launch', 'Ưu đãi cho đợt tái thiết kế storefront với trải nghiệm kính sáng cao cấp.', 'Launch benefit', 'Giảm 8% cho đơn đầu', '#d9c6f5', TRUE, TRUE),
    ('RUNCLUB', 'Runner Session', 'Ưu đãi riêng cho nhóm running cùng dịch vụ giao nhanh nội thành.', 'Runner perk', 'Giảm 120.000đ', '#bfe7ff', TRUE, FALSE);

INSERT INTO campaigns (
    title, slug, placement, eyebrow, headline, description, cta_label, cta_href,
    background_image, focal_image, hero_tone, active, sort_order
) VALUES
    (
        'Spring Light Campaign',
        'spring-light-campaign',
        'HOME_HERO',
        'Glass season 01',
        'Bộ sưu tập giày được đặt trong những lớp kính sáng, thoáng và đủ cao cấp để chốt đơn ngay ở nhịp đầu.',
        'Kết hợp mặt kính mờ chọn lọc, typography editorial và cụm sản phẩm có chủ đích để storefront đọc như một campaign thật thay vì một catalog xếp card.',
        'Khám phá campaign',
        '/catalog?featured=true',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
        '#e9d9ff',
        TRUE,
        1
    ),
    (
        'Performance Light',
        'performance-light',
        'CATALOG_HERO',
        'Athletic clarity',
        'Lọc nhanh theo nhu cầu chạy, lifestyle, court hay trail nhưng vẫn giữ cảm giác mua sắm cao cấp.',
        'Catalog mới được thiết kế để faceted filtering và merchandising cùng tồn tại trên một layout nhẹ, thoáng và dễ đọc.',
        'Mở bộ lọc',
        '/catalog',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80',
        '#bee7ff',
        TRUE,
        2
    );

INSERT INTO banner_slots (slot_key, badge, title, description, cta_label, cta_href, image_url, tone, active, sort_order) VALUES
    ('PROMO_STRIP', 'Airy benefit', 'Ưu đãi launch storefront', 'Đặt hàng từ campaign mới để nhận ưu đãi launch và gói giao nhanh ưu tiên.', 'Xem ưu đãi', '/checkout', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80', '#f5d4e8', TRUE, 1),
    ('CHECKOUT_TRUST', 'Trust layer', 'Flow thanh toán rõ ràng', 'Thanh toán mới gom vận chuyển, khuyến mãi và địa chỉ lưu sẵn vào một flow rõ ràng.', 'Mở checkout', '/checkout', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80', '#d8efff', TRUE, 2),
    ('ACCOUNT_SPOTLIGHT', 'Member frame', 'Tài khoản gọn và hữu ích', 'Tài khoản nay có wishlist, sổ địa chỉ và khu vực theo dõi các tín hiệu mua sắm cá nhân.', 'Mở tài khoản', '/tai-khoan', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80', '#efe5d8', TRUE, 3);

INSERT INTO media_assets (name, media_kind, url, alt_text, dominant_tone, tags, created_at) VALUES
    ('NB 9060 Drift Sand Hero', 'IMAGE', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', 'New Balance 9060 Drift Sand hero asset', '#f0d5bd', 'lifestyle|hero|neutral', NOW()),
    ('Salomon XA Pro Trail', 'IMAGE', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80', 'Salomon XA Pro Ridge trail asset', '#d0e4d3', 'trail|campaign|green', NOW()),
    ('Airy campaign background', 'IMAGE', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80', 'Spring airy campaign background', '#eadbff', 'campaign|background|airy', NOW());

INSERT INTO collections (name, slug, description, feature_label, hero_tone, cover_image, active, sort_order) VALUES
    ('Airy Lifestyle Stack', 'airy-lifestyle-stack', 'Các đôi lifestyle có chất liệu sạch, phom đẹp và đủ nhẹ để làm hero cho season mới.', 'Lifestyle edit', '#f1ddd5', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80', TRUE, 1),
    ('Pace Builder Running', 'pace-builder-running', 'Nhóm running được chọn theo trải nghiệm êm, trợ lực và độ sẵn sàng cho lịch tập tuần.', 'Running edit', '#d2f0ff', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80', TRUE, 2);

INSERT INTO collection_items (collection_id, shoe_id, sort_order)
SELECT c.id, s.id, 1
FROM collections c
JOIN shoes s ON s.slug = 'new-balance-9060-drift-sand'
WHERE c.slug = 'airy-lifestyle-stack';

INSERT INTO collection_items (collection_id, shoe_id, sort_order)
SELECT c.id, s.id, 2
FROM collections c
JOIN shoes s ON s.slug = 'adidas-samba-og-pearl'
WHERE c.slug = 'airy-lifestyle-stack';

INSERT INTO collection_items (collection_id, shoe_id, sort_order)
SELECT c.id, s.id, 1
FROM collections c
JOIN shoes s ON s.slug = 'nike-vomero-18-ember'
WHERE c.slug = 'pace-builder-running';

INSERT INTO collection_items (collection_id, shoe_id, sort_order)
SELECT c.id, s.id, 2
FROM collections c
JOIN shoes s ON s.slug = 'asics-gel-kayano-skyline'
WHERE c.slug = 'pace-builder-running';

INSERT INTO shoe_recommendations (source_shoe_id, target_shoe_id, reason_label, sort_order)
SELECT s1.id, s2.id, 'Đi cùng nhịp lifestyle', 1
FROM shoes s1
JOIN shoes s2 ON s2.slug = 'adidas-samba-og-pearl'
WHERE s1.slug = 'new-balance-9060-drift-sand';

INSERT INTO shoe_recommendations (source_shoe_id, target_shoe_id, reason_label, sort_order)
SELECT s1.id, s2.id, 'Thêm lựa chọn đệm dày', 2
FROM shoes s1
JOIN shoes s2 ON s2.slug = 'on-cloudmonster-mist'
WHERE s1.slug = 'nike-vomero-18-ember';

INSERT INTO shoe_recommendations (source_shoe_id, target_shoe_id, reason_label, sort_order)
SELECT s1.id, s2.id, 'Bổ sung nhịp trail', 3
FROM shoes s1
JOIN shoes s2 ON s2.slug = 'salomon-xa-pro-ridge'
WHERE s1.slug = 'asics-gel-kayano-skyline';

INSERT INTO admin_roles (code, name, description, active) VALUES
    ('CONTENT_MANAGER', 'Content Manager', 'Quản lý campaign, banner, collection và media.', TRUE),
    ('OPERATIONS_MANAGER', 'Operations Manager', 'Quản lý vận hành đơn, kho và tín hiệu phục vụ khách hàng.', TRUE),
    ('MERCHANDISER', 'Merchandiser', 'Sắp xếp sản phẩm, ưu tiên hiển thị và các luật đề xuất.', TRUE);

INSERT INTO audit_logs (actor_user_id, action_type, resource_type, resource_id, message, created_at) VALUES
    (NULL, 'SYSTEM_BOOTSTRAP', 'campaign', 'spring-light-campaign', 'Khởi tạo campaign hero mặc định cho storefront redesign.', NOW()),
    (NULL, 'SYSTEM_BOOTSTRAP', 'collection', 'airy-lifestyle-stack', 'Khởi tạo collection lifestyle edit cho homepage và catalog.', NOW());

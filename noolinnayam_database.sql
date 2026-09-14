-- Noolin Nayam by Divya - Complete Database Export
-- Generated: 2026-09-14T10:45:24.021Z

SET FOREIGN_KEY_CHECKS = 0;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'customer',
    `reset_password_token` VARCHAR(191) NULL,
    `reset_password_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `is_default` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `product_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `material` VARCHAR(191) NULL,
    `care` VARCHAR(191) NULL,
    `customizable` BOOLEAN NOT NULL DEFAULT false,
    `show_in_design_gallery` BOOLEAN NOT NULL DEFAULT false,
    `design_gallery_category` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `new_arrival` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `size` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `out_of_stock` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `filters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `range_min` DOUBLE NULL,
    `range_max` DOUBLE NULL,
    `range_unit` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `filters_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `filter_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filter_id` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `hex` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_filter_values` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `filter_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `navigation_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `link_type` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NULL,
    `page_slug` VARCHAR(191) NULL,
    `external_url` VARCHAR(191) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `navigation_item_filters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `navigation_item_id` INTEGER NOT NULL,
    `filter_id` INTEGER NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `shipping` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `shipping_address_line1` VARCHAR(191) NOT NULL,
    `shipping_address_line2` VARCHAR(191) NULL,
    `shipping_city` VARCHAR(191) NOT NULL,
    `shipping_state` VARCHAR(191) NOT NULL,
    `shipping_pincode` VARCHAR(191) NOT NULL,
    `shipping_country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `contact_email` VARCHAR(191) NOT NULL,
    `contact_phone` VARCHAR(191) NOT NULL,
    `payment_status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `razorpay_order_id` VARCHAR(191) NULL,
    `razorpay_payment_id` VARCHAR(191) NULL,
    `razorpay_signature` VARCHAR(191) NULL,
    `payment_verified_at` DATETIME(3) NULL,
    `return_policy_agreed` BOOLEAN NOT NULL DEFAULT false,
    `return_policy_agreed_at` DATETIME(3) NULL,
    `return_requested` BOOLEAN NOT NULL DEFAULT false,
    `return_requested_at` DATETIME(3) NULL,
    `coupon_code` VARCHAR(191) NULL,
    `discount_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `orders_razorpay_order_id_key`(`razorpay_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NULL,
    `product_name_snapshot` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `price_snapshot` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_order_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `base_product_id` INTEGER NULL,
    `base_product_name_snapshot` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `product_type` VARCHAR(191) NOT NULL,
    `age` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `preferred_color` VARCHAR(191) NULL,
    `occasion` VARCHAR(191) NULL,
    `desired_date` VARCHAR(191) NULL,
    `custom_requirements` TEXT NOT NULL,
    `reference_image_url` VARCHAR(191) NULL,
    `additional_notes` TEXT NULL,
    `owner_response` TEXT NULL,
    `quoted_price` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `status` VARCHAR(191) NOT NULL DEFAULT 'New',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_order_request_gallery_selections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `custom_order_request_id` INTEGER NOT NULL,
    `design_gallery_image_id` INTEGER NULL,
    `image_url_snapshot` VARCHAR(191) NOT NULL,
    `caption_snapshot` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `design_gallery_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `design_gallery_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workshops` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `cover_image` VARCHAR(191) NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NULL,
    `location` VARCHAR(191) NOT NULL,
    `is_online` BOOLEAN NOT NULL DEFAULT false,
    `meeting_link` VARCHAR(191) NULL,
    `seats_total` INTEGER NOT NULL,
    `seats_filled` INTEGER NOT NULL DEFAULT 0,
    `price` DECIMAL(10, 2) NOT NULL,
    `is_free` BOOLEAN NOT NULL DEFAULT false,
    `skill_level` VARCHAR(191) NOT NULL DEFAULT 'All Levels',
    `registration_deadline` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Upcoming',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `workshops_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workshop_registrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workshop_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `seats_booked` INTEGER NOT NULL DEFAULT 1,
    `notes` VARCHAR(191) NULL,
    `payment_status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Confirmed',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'Newsletter',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `community_members_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL DEFAULT 'General Inquiry',
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'New',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NULL,
    `product_slug` VARCHAR(191) NOT NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_email` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `headline` VARCHAR(191) NOT NULL,
    `comment` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'approved',
    `verified_purchase` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revoked_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL DEFAULT 'logout',
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `revoked_tokens_token_id_key`(`token_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `discount_type` VARCHAR(191) NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `max_discount` DECIMAL(10, 2) NULL,
    `min_order_value` DECIMAL(10, 2) NULL,
    `valid_from` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valid_until` DATETIME(3) NOT NULL,
    `usage_limit` INTEGER NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `per_customer_limit` INTEGER NULL DEFAULT 1,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `internal_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupons_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `filter_options` ADD CONSTRAINT `filter_options_filter_id_fkey` FOREIGN KEY (`filter_id`) REFERENCES `filters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_filter_values` ADD CONSTRAINT `product_filter_values_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_filter_values` ADD CONSTRAINT `product_filter_values_filter_id_fkey` FOREIGN KEY (`filter_id`) REFERENCES `filters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `navigation_items` ADD CONSTRAINT `navigation_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `navigation_item_filters` ADD CONSTRAINT `navigation_item_filters_navigation_item_id_fkey` FOREIGN KEY (`navigation_item_id`) REFERENCES `navigation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `navigation_item_filters` ADD CONSTRAINT `navigation_item_filters_filter_id_fkey` FOREIGN KEY (`filter_id`) REFERENCES `filters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `custom_order_requests` ADD CONSTRAINT `custom_order_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `custom_order_requests` ADD CONSTRAINT `custom_order_requests_base_product_id_fkey` FOREIGN KEY (`base_product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `custom_order_request_gallery_selections` ADD CONSTRAINT `custom_order_request_gallery_selections_custom_order_reques_fkey` FOREIGN KEY (`custom_order_request_id`) REFERENCES `custom_order_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `custom_order_request_gallery_selections` ADD CONSTRAINT `custom_order_request_gallery_selections_design_gallery_imag_fkey` FOREIGN KEY (`design_gallery_image_id`) REFERENCES `design_gallery_images`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `design_gallery_images` ADD CONSTRAINT `design_gallery_images_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `design_gallery_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workshop_registrations` ADD CONSTRAINT `workshop_registrations_workshop_id_fkey` FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workshop_registrations` ADD CONSTRAINT `workshop_registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;



SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
-- SEED DATA INSERTS
-- ─────────────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

-- Data for table `users`
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `reset_password_token`, `reset_password_expires`, `created_at`, `updated_at`) VALUES (4, 'Madhan Kumar G', 'madhankumargcr7@gmail.com', '8925311803', '$2b$12$HPM0DNTft/vSWI5uF.5A6O4DWcQ11S8/FLJGn5QMVD0ixEy1z6IeC', 'customer', NULL, NULL, '2026-08-21 06:43:45', '2026-09-13 11:07:03');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `reset_password_token`, `reset_password_expires`, `created_at`, `updated_at`) VALUES (5, 'Divya (Owner)', 'divya@noolinnaayambydivya.com', '+91 00000 00000', '$2b$12$MhKf.LiNu2THf3pMYl2Q9OMwzi5bCBMe84Is594WBdfdxaadKCEjm', 'owner', NULL, NULL, '2026-08-21 07:00:08', '2026-09-14 10:41:01');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `reset_password_token`, `reset_password_expires`, `created_at`, `updated_at`) VALUES (6, 'Priya Sharma [DEMO]', 'priya.demo@example.com', '+91 98765 43210', '$2b$12$WxCFhq8f7bls.QH4oMlH5.mbIdKTUra1wv2HxMi/R1JEeDTFvJvO.', 'customer', NULL, NULL, '2026-08-21 07:00:31', '2026-09-14 10:41:34');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `reset_password_token`, `reset_password_expires`, `created_at`, `updated_at`) VALUES (7, 'Anita Menon [DEMO]', 'anita.demo@example.com', '+91 87654 32109', '$2b$12$WxCFhq8f7bls.QH4oMlH5.mbIdKTUra1wv2HxMi/R1JEeDTFvJvO.', 'customer', NULL, NULL, '2026-08-21 07:00:31', '2026-09-14 10:41:34');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `reset_password_token`, `reset_password_expires`, `created_at`, `updated_at`) VALUES (8, 'Lakshmi Iyer [DEMO]', 'lakshmi.demo@example.com', '+91 76543 21098', '$2b$12$klIWCldtRR.RTiyiv7lmROUUJL.Y3E6ljAzdpw0RleAl3yAEyrUWy', 'customer', NULL, NULL, '2026-08-21 07:00:31', '2026-09-13 11:07:03');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `reset_password_token`, `reset_password_expires`, `created_at`, `updated_at`) VALUES (9, 'Meera Krishnan [DEMO]', 'meera.demo@example.com', '+91 65432 10987', '$2b$12$klIWCldtRR.RTiyiv7lmROUUJL.Y3E6ljAzdpw0RleAl3yAEyrUWy', 'customer', NULL, NULL, '2026-08-21 07:00:31', '2026-09-13 11:07:03');

-- Data for table `addresses`
INSERT INTO `addresses` (`id`, `user_id`, `line1`, `line2`, `city`, `state`, `pincode`, `country`, `is_default`) VALUES (1, 6, '123 Demo Street', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', 0);
INSERT INTO `addresses` (`id`, `user_id`, `line1`, `line2`, `city`, `state`, `pincode`, `country`, `is_default`) VALUES (2, 7, '123 Demo Street', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', 0);
INSERT INTO `addresses` (`id`, `user_id`, `line1`, `line2`, `city`, `state`, `pincode`, `country`, `is_default`) VALUES (3, 8, '123 Demo Street', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', 0);
INSERT INTO `addresses` (`id`, `user_id`, `line1`, `line2`, `city`, `state`, `pincode`, `country`, `is_default`) VALUES (4, 9, '123 Demo Street', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', 0);

-- Data for table `product_categories`
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (8, 'Crochet', 'crochet');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (9, 'Kidswear', 'kidswear');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (10, 'Kids Dresses', 'kids-dresses');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (11, 'Kids Crochet', 'kids-crochet');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (12, 'Floral Crochet', 'floral-crochet');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (13, 'Handmade Gifts', 'gifts');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (14, 'New Arrivals', 'new-arrivals');
INSERT INTO `product_categories` (`id`, `name`, `slug`) VALUES (15, 'Custom', 'custom');

-- Data for table `products`
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (9, 'Elara - Crochet Hair Clip', 'elara', 'A delicate crochet hair clip finished with tiny pearls, warm terracotta tones and an ivory border, handcrafted to add a little timeless charm to every hairstyle.

“A little glow, held in every stitch.” 🤍', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-09 18:40:39', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (10, 'Veyil - Crochet Lily Bouquet', 'veyil', 'A little sunshine, forever in bloom.

Veyil is a handcrafted crochet lily bouquet inspired by the warmth and radiance of golden sunlight. Each lily is carefully crocheted in vibrant yellow yarn, finished with delicate white-edged petals and paired with softly textured green stems and leaves.

Unlike fresh flowers, Veyil is made to stay—bringing a little warmth, colour and handmade beauty into your space for years to come.

Every flower is lovingly crafted by hand, making each bouquet unique and filled with the quiet charm of slow-made artistry.', '"1000"', 8, 'Quality yarn', 'Keep away from moisture and dust gently when requireed', 0, 0, NULL, 0, 1, 'active', '2026-09-09 18:49:45', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (11, 'Mazhai - Crochet Puppy', 'mazhai', 'A little bundle of colour, comfort and childhood joy. Mazhai is a lovingly handcrafted crochet puppy, designed with cheerful shades of pink, yellow and aqua blue. Its playful expression and soft, textured stitches make it a charming companion for little ones and a beautiful keepsake to treasure.

Every stitch is thoughtfully handmade, giving each Mazhai its own unique character—because handmade pieces are never meant to be perfectly identical; they’re meant to be special.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-09 18:58:21', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (12, 'Soorian - Crochet Sunflower Hair Band', 'soorian', 'Soorian is a delicate handmade crochet hair accessory featuring a cheerful sunflower in warm golden yellow and earthy brown tones. Designed to add a subtle touch of nature and warmth to everyday hairstyles, this little piece brings together the charm of handmade crochet and the timeless beauty of a sunflower.

Each petal is carefully crocheted by hand, making Soorian a sweet little accessory filled with the warmth of slow craftsmanship.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-09 19:04:12', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (13, 'Lilia - Crochet Flower Bouquet', 'lilia', 'A bouquet that blooms forever.

Lilia is a handcrafted crochet flower bouquet featuring a graceful white lily surrounded by vibrant, multicoloured blossoms and delicate green leaves. Each flower is individually crocheted and carefully arranged to create a natural, whimsical composition.

Unlike fresh flowers, Lilia doesn’t wilt with time. It is designed to be kept, cherished and remembered — making it a beautiful expression of love, gratitude and celebration.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-09 19:09:28', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (14, 'Malar - Crochet Baby Shoes', 'malar', 'A tiny bloom made for tiny steps.

Malar is a lovingly handcrafted crochet baby shoe designed to bring a touch of warmth, softness, and charm to little moments. Featuring a delicate floral-inspired crochet embellishment in charcoal grey, paired with gentle blush pink and warm ivory tones, this piece has a beautifully nostalgic, heirloom feel.

Each stitch is thoughtfully handmade, making every pair a little different and truly special.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-09 19:15:29', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (15, 'Poonthendral - Crochet Flower Bouquet', 'poonthendral', 'Poonthendral is a vibrant handmade crochet bouquet inspired by the simple beauty of a garden in bloom.

A cheerful sunflower takes centre stage, surrounded by delicate white and yellow blooms and tiny multicoloured flowers. Curled crochet stems and leafy details add movement and character, creating a bouquet that feels playful, warm and beautifully everlasting.

Unlike fresh flowers, Poonthendral is made to remain a keepsake — carrying the warmth of a thoughtful gesture long after the moment has passed.

Each flower is individually handcrafted with yarn, making every bouquet unique and filled with the charm of slow, thoughtful craftsmanship.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-09 19:21:06', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (16, 'Iniya - Crochet Rabbit', 'iniya', 'Iniya is a charming handmade crochet bunny, created with soft, comforting textures and a gentle palette of cream and pastel mint.

With her long floppy ears, tiny embroidered expression and sweet little outfit adorned with a delicate butterfly, Iniya carries the innocence and warmth of childhood in every stitch.

Handcrafted slowly and thoughtfully, she makes a beautiful keepsake for little ones, a thoughtful handmade gift, or a charming addition to a nursery or playroom.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 05:42:21', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (17, 'Anbu - Crochet Elephant', 'anbu', 'Anbu is a sweet little crochet elephant, handcrafted with soft blue yarn and delicate pink accents.

With its oversized ears, tiny trunk, gentle expression and charming little feet, Anbu is designed to feel like a comforting little companion. Every stitch is made by hand, giving this elephant its own warmth, character and individuality.

A beautiful keepsake for little ones, a thoughtful handmade gift, or a charming addition to a nursery, Anbu brings the simple joy of handmade craftsmanship into everyday moments.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 05:51:36', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (18, 'Poongodi - Crochet Parandi', 'poongodi', 'Poongodi is a delicate crochet parandi inspired by the beauty of flowers winding through a traditional braid.

Handcrafted with tiny crochet blooms, leafy details and a soft pink tassel, it brings together the charm of traditional Indian hair adornment with the warmth of handmade craft. Each flower is carefully placed along the braid-like design, creating the feeling of a little flowering vine gently trailing through the hair.

Perfect for festive occasions, traditional celebrations, photoshoots, birthdays, and little moments when you want her hairstyle to feel extra special.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 05:55:57', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (19, 'Gul - Crohect Wallet', 'gul', 'A little bloom, made to be carried.

Handcrafted with love and patience, the Gul Crochet Wallet brings together the warmth of handmade crochet with the timeless beauty of a blooming rose. Its rich red base is delicately detailed with tiny cream stitches, fresh green edging and a dimensional crochet rose that adds a charming, feminine touch.

Designed for everyday little essentials, Gul is more than just a wallet — it is a small piece of handmade beauty that stays with you.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 06:05:44', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (20, 'Aranya - Crochet Sunflower Phone Case', 'aranya', 'Carry a little sunshine wherever you go.

The Aranya Crochet Phone Case brings together the warmth of golden sunflowers and the richness of forest green in a beautifully handcrafted design.

Featuring two dimensional crochet sunflowers framed by lush green crochet work, the case is finished with a delicate floral button detail that adds an unexpected little touch of charm.

Handcrafted stitch by stitch, Aranya celebrates the beauty of slow-made pieces — where texture, colour and thoughtful details come together to make something wonderfully personal.

Earthy. Cheerful. Handmade.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 06:15:59', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (21, 'Swarna - Crochet Floral Dress', 'swarna', 'Swarna is a celebration of warmth, colour and handmade charm.

Designed with a beautifully handcrafted crochet floral bodice, this dress brings together earthy cream, golden yellow and rich brown tones. The mustard skirt falls softly from the crochet waist, creating a comfortable, flowing silhouette made for little moments of joy.

The floral crochet squares are carefully joined to create a statement bodice, while the matching golden shoulder straps complete the look with a delicate handcrafted touch.

Every stitch carries the warmth of something made slowly, thoughtfully and with love.

Swarna — where golden sunshine meets the beauty of handmade.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 06:18:59', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (22, 'Nilaya - Crochet Tortoise', 'nilaya', 'A little home, stitched with love.

Meet Nilaya, a gentle little tortoise handmade entirely in crochet. With its soft earthy tones and charming blush-pink shell, Nilaya brings a sense of warmth, comfort and quiet companionship wherever it rests.

Inspired by the tortoise’s beautiful relationship with home, this piece is a reminder that sometimes, home isn’t a place — it’s something we carry within us.

Each stitch is thoughtfully handcrafted, giving Nilaya its own little character and making every piece beautifully unique.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 07:05:15', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (23, 'Poo - Crochet Flower', 'poo', 'Malar is a delicate crochet flower, lovingly handcrafted one stitch at a time. Inspired by the simple beauty of flowers in bloom, its soft pink petals and warm golden centre bring a gentle touch of colour and joy to any space.

Unlike fresh flowers, Malar is made to stay — a little bloom that can be treasured, gifted and enjoyed for a long time. Each piece carries the warmth of handmade craftsmanship and the quiet beauty of something created slowly by hand.

A flower that never fades, made with threads of love.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 07:07:14', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (24, 'Thaalam - Hand Crocheted Baby Rattle', 'thaalam', 'A tiny world of wonder, created for little hands and little dreams. ✨

Thaalam is a charming hand-crocheted baby piece inspired by the gentle rhythm of childhood. Thoughtfully crafted with playful celestial characters, each little element brings softness, warmth and a touch of wonder to a baby’s space.

From the cheerful sun and dreamy star to the soft cloud-inspired details, every piece is carefully crocheted by hand, making Thaalam a keepsake filled with character and warmth.

Made slowly, stitch by stitch, it is designed to become part of those precious early moments — the little smiles, curious eyes and quiet nursery hours that stay in our hearts.', '"1000"', 8, 'Crochet Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-10 07:10:57', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (25, 'Thulir - Hand-Crocheted Tulip', 'thulir', 'A little bloom that never fades. 🌷

Thulir is a delicately hand-crocheted tulip, inspired by the quiet beauty of flowers in their first bloom. With its soft pink petals, slender green stem and graceful leaf, every stitch is thoughtfully crafted to capture the tenderness of a fresh flower.

Unlike a fleeting bloom, Thulir is made to stay — a tiny reminder of new beginnings, gentle moments and the beauty found in things made slowly by hand.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 04:42:02', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (26, 'Nesam- Crochet Heart Keychain', 'nesam', 'A little heart, made with a lot of love.

Handcrafted in soft yarn, Nesam is a charming crochet heart keychain designed to carry a little warmth wherever you go. With its playful expression, delicate details and handmade character, it makes a sweet everyday accessory or a thoughtful little gift for someone special.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 09:11:16', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (27, 'Poovizhi - Crochet Garden Bouquet', 'poovizhi', 'A little garden of everlasting blooms, with a tiny friend nestled among them.

Product Description

Poovizhi is a whimsical crochet bouquet created to feel like a little garden captured in time.

A playful white bunny peeks through a gathering of soft crochet blooms — delicate pink blossoms, warm peach tulips and a cheerful daisy-inspired flower — all brought together with hand-wrapped green stems.

Each flower is carefully crocheted and shaped by hand, giving the bouquet its own gentle character and texture. The little bunny adds an unexpected touch of innocence, making Poovizhi feel less like an ordinary bouquet and more like a tiny story woven in yarn.

Unlike fresh flowers, this bouquet is made to last. It makes a thoughtful gift for birthdays, celebrations, baby showers, festive occasions, or simply for someone who deserves a little piece of joy.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 09:16:49', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (28, 'Arul - Crochet Vel', 'arul', 'Arul is a handcrafted crochet Vel, created with delicate stitches and thoughtful detailing. Inspired by the timeless symbolism of the Vel, this little piece represents grace, strength and protection.

The warm golden-yellow crochet body is finished with subtle red and white detailing and a delicate red thread accent, giving it a charming traditional touch while keeping its appearance minimal and elegant.

Made completely by hand, every stitch carries the warmth and individuality of handmade craft — making Arul a beautiful little keepsake for your home, festive spaces, pooja corner, gifting, or as a meaningful token for someone special.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 09:30:07', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (29, 'Maitri - Strawberry Crochet Keychain', 'maitri', 'Maitri is a charming handmade crochet keychain inspired by the sweetness of strawberries and the warmth of togetherness.

Designed as a pair of adorable strawberry characters, each little fruit is carefully crocheted with soft yarn and finished with tiny green leaves, playful details and delicate dangling limbs. Their cheerful expressions and hand-in-hand design make Maitri a beautiful little symbol of friendship, affection and connection.

Attach it to your handbag, backpack, keys or gift it to someone special — a tiny reminder that the sweetest things are meant to be shared.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 09:40:44', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (30, 'Kani - Crochet Cherry Hair Tie', 'kani', 'Kani is a playful little touch of sweetness, handcrafted stitch by stitch.

Designed with two adorable crochet cherries and a delicate leafy bow, this hair accessory brings a charming, nostalgic touch to everyday hairstyles. The soft crochet texture and vibrant cherry-red details make it a beautiful little accent for a child’s wardrobe.

Light, cheerful and lovingly handmade, Kani turns a simple hairstyle into something special.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 09:44:54', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (31, 'Roselle - Crochet Baby Hair Band', 'roselle', 'A little rose, woven with love.

Delicately handcrafted for little ones, Roselle is a soft crochet baby hair band featuring a petite red rose resting on a warm ivory band. Its gentle texture and timeless floral detail make it a beautiful little accessory for everyday sweetness, special occasions and treasured photographs.

Every stitch is made with care, bringing together the simplicity of crochet and the quiet beauty of a flower that never fades.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 09:48:41', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (32, 'Nivelle - Crochet Cloud', 'nivelle', 'A little piece of softness, made to stay.

Handcrafted with gentle stitches and a sweet little smile, Nivelle brings the softness of a cloud into a tiny keepsake. Its warm ivory tone and plush crochet texture make it a charming little companion for a child’s everyday world.

Made slowly, stitch by stitch, Nivelle carries the warmth of handmade craftsmanship—soft, simple and full of character.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 10:22:23', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (33, 'Aurelia - Crochet Sun', 'aurelia', 'A little piece of sunshine, made by hand.

Bring warmth and joy to little outfits with Aurelia, a lovingly handcrafted crochet sun. With its cheerful golden centre, soft textured stitches and playful rays, this tiny sunshine is designed to add a happy handmade touch to everyday moments.

Each stitch is carefully crocheted by hand, making Aurelia more than just an accessory—it is a little keepsake filled with warmth, care and the beauty of slow craftsmanship.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 10:25:25', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (34, 'Luna - Crochet Moon', 'luna', 'Meet Luna, our little crochet moon with a heart full of dreams.

Carefully handcrafted stitch by stitch, Luna takes the gentle shape of a crescent moon in a soft, dreamy blue. Its tiny eyes and embroidered smile give it a playful personality, making it feel less like a décor piece and more like a little companion.

Perfect for a child’s room, nursery, play corner or as a thoughtful handmade gift, Luna brings a soft touch of whimsy and wonder to everyday spaces.

A tiny moon to keep close, wherever little dreams may take you.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 10:31:16', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (35, 'Jolie - Crochet letter J', 'jolie', 'Meet Jolie, a tiny celebration of personality and handmade charm.

Carefully crocheted stitch by stitch, this adorable letter J is given a playful character with its bright eyes and gentle smile. Its soft texture and handcrafted details make it more than just an initial—it becomes a little keepsake with its own personality.

Perfect for children who want something that feels uniquely theirs, Jolie can be gifted as an initial, used as a charming décor accent, or paired with other personalised crochet letters.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 1, 0, NULL, 0, 1, 'active', '2026-09-11 10:35:15', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (36, 'Rosalie - Crochet Rose Stems', 'rosalie', 'Rosalie captures the timeless charm of roses in a form that never fades.

Two richly textured red roses bloom gracefully from slender green stems, complemented by delicate crocheted leaves. Every element is thoughtfully handcrafted, stitch by stitch, bringing the warmth and imperfection of handmade artistry to life.

Designed to be cherished beyond a single season, Rosalie makes a beautiful addition to a bedside table, work desk, bookshelf or a thoughtful gift for someone special.

Because some flowers are meant to stay.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 10:39:36', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (37, 'Amara - Crochet Rose Bouquet', 'amara', 'Amara is our interpretation of an everlasting rose bouquet—where the softness of yarn meets the timeless beauty of flowers.

Featuring two richly textured red crochet roses, delicate green leaves and stems, the bouquet is finished with elegant black wrapping and a soft red ribbon bow. Every element is handmade stitch by stitch, giving each bouquet its own unique character.

Unlike fresh flowers, Amara doesn’t wilt or fade. It is designed to remain as a beautiful reminder of love, appreciation and cherished moments.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 10:43:18', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (38, 'Inai — Crochet Cherry Keychain', 'inai', 'Inai is a tiny expression of togetherness, handcrafted one stitch at a time.

Inspired by the charm of paired cherries, this crochet keychain features two plump red cherries suspended beneath a delicate green bow. Its playful silhouette and rich colours bring a little warmth and personality to your everyday essentials.

Attach it to your handbag, backpack, keys or gifting box — a tiny handmade detail that carries a feeling of connection wherever it goes.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:28:35', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (39, 'Idhazh — Crochet Tulip', 'idhazh', 'A little bloom, held in every stitch.

Handcrafted with delicate crochet stitches, Idhazh recreates the graceful form of a blooming tulip in a soft pink hue. Its gently curved petals and wrapped green stem bring the charm of a fresh flower into a lasting keepsake.

Made slowly, stitch by stitch, this everlasting tulip is designed to bring warmth and a quiet touch of nature to your space.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:32:02', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (40, 'Idhayaa — Crochet Heart', 'idhayaa', 'A little heart, made with love.

Handcrafted stitch by stitch, Idhayaa is a charming crochet heart with a playful personality. Its rich red colour captures the warmth of love, while the tiny expressive details give it a sweet, joyful character.

A tiny keepsake with a big feeling, Idhayaa makes a thoughtful little gift, bag charm or decorative accent for anyone who loves handmade treasures.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:33:57', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (41, 'Liora — a bloom woven in colour', 'liora', 'Handcrafted stitch by stitch, Liora is a vibrant crochet lily inspired by the beauty of flowers in full bloom. Its playful blend of pink, blue and violet hues creates a joyful, artistic statement, while the softly curved petals and delicate floral details bring a charming handmade touch.

A timeless little bloom that adds colour and warmth to a room, gifting moment, or special corner—made slowly, with yarn, patience and love.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:49:31', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (42, 'Maris - Handcrafted Crochet Floral Hair Clip', 'maris', 'A little piece of the sea, captured in thread. 

The Maris Clip features two delicate crochet flowers in serene shades of aqua and turquoise, each finished with a lustrous pearl centre. The floral arrangement is framed with dainty pearl detailing, creating a soft, elegant accent with a touch of ocean-inspired charm.

Handcrafted stitch by stitch, Maris brings together the warmth of handmade crochet with the delicate beauty of pearls—perfect for adding a graceful little detail to everyday hairstyles and special occasions.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:53:02', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (43, 'Fraise - Handcrafted Crochet Strawberry', 'fraise', 'A tiny strawberry, lovingly shaped one stitch at a time. 
The Fraise is a charming crochet strawberry with a rich berry-red body and a delicate green leafy crown. Its soft, tactile texture and playful silhouette make it a sweet little accent for gifting, styling or adding a touch of handmade joy to everyday spaces.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:55:49', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (44, 'Willow - Handcrafted Crochet Baby Set', 'willow', 'A little set made for little moments. 🤍
The Willow Set brings together soft, earthy shades of blush pink, sage green, cream and misty grey in a beautifully textured crochet design. Thoughtfully handmade with love, it includes a cosy bear-ear bonnet, dungaree-style romper and matching bow-detail booties.

The gentle colour palette and playful bear-inspired details give this set a nostalgic, woodland charm — perfect for keeping little ones cosy while looking effortlessly adorable.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 15:57:59', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (45, 'Celeste - Handmade Crochet Bow Keychain', 'celeste', 'A little charm made to brighten the everyday.

Celeste is a delicate handmade crochet bow in dreamy shades of powder blue and soft mint green, finished with a neat centre and attached to a gold-toned keychain clasp.

Carefully crocheted stitch by stitch, this tiny accessory brings a soft, playful touch to handbags, totes, keys and everyday essentials. More than just a keychain, Celeste is a little handmade keepsake—made to be carried, gifted and cherished.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:02:18', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (46, 'Aquarelle - Handmade Crochet Bow Clip', 'aquarelle', 'A little touch of colour, carefully woven into something beautiful. Aquarelle is a handmade crochet bow clip in dreamy shades of soft mint green and powder blue.

Each loop is carefully crocheted and shaped by hand, creating a delicate, textured bow that adds a playful yet graceful finishing touch to little hairstyles.

Designed for everyday sweetness and special moments alike, Aquarelle is a tiny handmade detail made to be cherished.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:05:06', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (47, 'Lavelle - Crochet Lavender Stem', 'lavelle', 'Handcrafted with love, Lavelle is a delicate crochet lavender stem brought to life in layered shades of lilac, pink-purple and deep violet. Each tiny textured bloom is carefully crocheted and finished with a softly wrapped green stem, capturing the natural charm of a lavender sprig.

A timeless handmade keepsake, Lavelle brings a gentle touch of colour and warmth to any space—a flower that never fades.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:15:13', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (48, 'Nuzzle - A little cuddle woven in warm honey.', 'nuzzle', 'Inspired by the comforting warmth of a childhood teddy, Nuzzle is a hand-crocheted teddy basket made to hold little treasures with a touch of sweetness.

The warm honey-brown body is carefully shaped with textured crochet stitches, while the playful teddy face, soft ivory details and tiny bow bring the piece to life. Every stitch adds to its cosy, handcrafted character, making Nuzzle more than just a basket — it is a little companion for everyday moments.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:21:04', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (49, 'Lunelle - A little lily touched by moonlight', 'lunelle', 'Inspired by the quiet elegance of a lily, Lunelle is a hand-crocheted bloom shaped petal by petal. Its soft ivory petals open gracefully around delicate lavender stamens, creating a gentle contrast that brings the flower to life.

Carefully crafted by hand, Lunelle captures the beauty of a flower at its most tender — soft, serene and everlasting. A little piece of nature, held together by thread and made to be treasured.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 1, 'Necklines', 0, 1, 'active', '2026-09-11 16:26:39', '2026-09-13 17:26:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (50, 'Veloura - A velvety bloom in deep plum.', 'veloura', 'Veloura is a hand-crocheted rose created to capture the timeless beauty of a bloom that never fades. Its rich plum-purple petals are carefully layered to create a softly curled, full-bodied rose, finished with a delicately wrapped green stem.

Made slowly, stitch by stitch, Veloura brings together the warmth of handmade craft and the elegance of a classic rose — a little bloom meant to be treasured.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:30:07', '2026-09-13 11:07:03');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (51, 'Mélodie - Crochet Wildflower Stem', 'melodie', 'A little melody, woven flower by flower.

Mélodie is a delicate handmade crochet floral stem inspired by the quiet beauty of a wildflower garden. A beautiful gathering of deep plum, rich violet, soft lavender and ivory blooms comes together naturally along a hand-wrapped green stem.

Each flower is individually crocheted, giving the arrangement its own little character and texture. The contrast between the deeper purple blooms and gentle ivory flowers creates a soft yet elegant composition—like a tiny garden captured in thread.

Made slowly and thoughtfully by hand, Mélodie is a bloom that doesn''t fade, carrying the warmth and charm of handmade craftsmanship wherever it is placed.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:33:37', '2026-09-13 11:07:04');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (52, 'Cottelle - Crochet Bunny Bloom', 'cottelle', 'A little bunny, blooming with love. 🤍

Cottelle is a whimsical handmade crochet bunny nestled on a slender, hand-wrapped floral stem. Carefully crocheted in a soft ivory shade, this little bunny features delicate blush-pink ears and cheeks and a tiny golden embroidered nose, giving it an irresistibly gentle expression.

Designed like a flower growing from a garden, Cottelle brings together the sweetness of a little bunny with the timeless charm of a handmade bloom. A keepsake made to be held, gifted and treasured long after the moment has passed.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 1, 'Necklines', 0, 1, 'active', '2026-09-11 16:37:13', '2026-09-13 17:26:01');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (53, 'Muguet — Crochet Lily of the Valley', 'muguet', 'A little whisper of a garden, captured in thread. 🌿

Muguet is a delicate handmade crochet interpretation of Lily of the Valley, thoughtfully crafted with clusters of soft blooms in deep violet, rich purple, lavender and ivory. Each tiny flower is individually shaped and arranged along a slender, hand-wrapped green stem, creating a graceful branch inspired by the quiet beauty of a woodland garden.

Made to last far beyond the fleeting life of fresh flowers, Muguet brings a gentle touch of nature into any space—a small keepsake woven slowly, stitch by stitch.', '"1000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 16:41:41', '2026-09-13 11:07:04');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (54, 'Violetta - Crochet Flower Bouquet', 'violetta', 'A little garden, lovingly woven by hand. 💜

Violetta is a whimsical crochet bouquet brought to life in enchanting shades of lavender, lilac, violet and deep plum, delicately paired with ivory blooms and soft green foliage. At its heart sits an adorable crochet bunny, surrounded by a playful collection of handcrafted flowers and textured blooms.

Wrapped in rich purple with a soft golden ribbon, Violetta makes a thoughtful keepsake that captures the beauty of flowers without ever fading.', '"3000"', 8, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 1, 'Necklines', 0, 1, 'active', '2026-09-11 16:45:08', '2026-09-14 08:40:45');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (55, 'Mridula Frock', 'mridula', 'Mridula is a little expression of softness and grace, crafted in a beautiful muted rose-pink fabric with delicate ivory motifs scattered across the silhouette. The sleeveless bodice features a gentle round neckline, while the softly gathered waist opens into a graceful pleated skirt for an easy, playful fall.

The back adds a charming little surprise with an open detail and delicate ivory tie, finished with handmade fabric petal accents. Thoughtfully designed for little ones who love to move, twirl and simply be themselves.', '"10"', 9, '100% Soft Cotton Yarn', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 0, 1, 'active', '2026-09-11 17:04:31', '2026-09-14 09:06:38');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (57, 'Ivory Bloom Crochet Dress', 'ivory-bloom-crochet-dress', 'A delicate, hand-crocheted dress in warm ivory, designed for little ones who deserve something truly special. Each bloom motif is lovingly stitched by hand — no two pieces are identical.', '"2499"', 8, '100% cotton yarn, soft-spun for sensitive skin', 'Hand wash cold · Lay flat to dry · Do not bleach', 1, 0, NULL, 1, 1, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (58, 'Sandy Smock Kidswear Set', 'sandy-smock-kidswear-set', 'A beautifully smocked two-piece set in warm sand tones. Soft, breathable, and made for little personalities to shine. Comes with a matching hair bow.', '"1899"', 8, 'Premium cotton fabric with hand-smocking', 'Machine wash gentle · Warm iron if needed', 1, 0, NULL, 1, 0, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (59, 'Blush Petal Baby Romper', 'blush-petal-baby-romper', 'A soft, petal-detailed crochet romper for little ones. Gentle on sensitive skin, gentle on the eyes.', '"1599"', 8, 'Organic cotton yarn, hypoallergenic', 'Hand wash cold · Lay flat to dry', 0, 0, NULL, 1, 1, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (60, 'Sage Garden Crochet Top', 'sage-garden-crochet-top', 'A lightweight crochet top in muted sage, perfect for layering on warm days. Features a delicate open-stitch pattern across the back.', '"1299"', 8, 'Cotton-linen blend yarn', 'Hand wash cold · Air dry', 1, 0, NULL, 0, 0, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (61, 'Warm Brown Birthday Frock', 'warm-brown-birthday-frock', 'A show-stopping birthday frock in warm brown and ivory, with layered crochet skirt and a satin sash. Made to order — designed to be remembered.', '"3499"', 8, 'Crochet cotton top with layered tulle/satin base skirt', 'Dry clean recommended · Store in garment bag', 1, 0, NULL, 1, 1, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (62, 'Oatmeal Sibling Matching Set', 'oatmeal-sibling-matching-set', 'A coordinated set for brothers and sisters — because little moments are sweeter when shared. Available in mixed sizing for different-aged siblings.', '"3199"', 8, 'Soft cotton, hand-finished details', 'Machine wash gentle · Cool iron', 1, 0, NULL, 0, 0, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (63, 'Cream Lace Crochet Dress', 'cream-lace-crochet-dress', 'An heirloom-quality crochet dress with a fine lace pattern, made for christenings, naming ceremonies, and first portraits.', '"2899"', 8, 'Fine cotton yarn, hand-knotted lace detail', 'Hand wash cold · Dry flat · Do not wring', 1, 0, NULL, 0, 0, 'active', '2026-09-14 10:41:33', '2026-09-14 10:41:33');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `category_id`, `material`, `care`, `customizable`, `show_in_design_gallery`, `design_gallery_category`, `featured`, `new_arrival`, `status`, `created_at`, `updated_at`) VALUES (64, 'Sand & Blush Photoshoot Set', 'sand-blush-photoshoot-set', 'Designed for milestone photography sessions. A coordinated crochet and fabric set that photographs beautifully in natural light.', '"2199"', 8, 'Mixed: crochet cotton + soft muslin fabric', 'Hand wash cold · Air dry', 0, 0, NULL, 0, 1, 'active', '2026-09-14 10:41:34', '2026-09-14 10:41:34');

-- Data for table `product_images`
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (22, 9, '/assets/uploads/products/1788978842899-pxmy8685.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (23, 9, '/assets/uploads/products/1788978869179-kxvy2351.png', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (24, 9, '/assets/uploads/products/1788978937890-nzmx6636.png', 2);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (25, 10, '/assets/uploads/products/1788979381182-aikt1336.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (26, 11, '/assets/uploads/products/1788980004636-wvwh0082.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (27, 12, '/assets/uploads/products/1788980399916-xtar0156.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (28, 13, '/assets/uploads/products/1788980831452-crmg0267.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (29, 14, '/assets/uploads/products/1788981110175-mpun7522.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (30, 15, '/assets/uploads/products/1788981384353-wfyf5136.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (31, 16, '/assets/uploads/products/1789018777575-yjdr1370.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (32, 17, '/assets/uploads/products/1789018975671-ivqx6874.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (33, 18, '/assets/uploads/products/1789019628631-sjup3548.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (34, 19, '/assets/uploads/products/1789019848736-buyn2673.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (35, 20, '/assets/uploads/products/1789020604352-ocok6900.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (36, 21, '/assets/uploads/products/1789021014976-iyzm5304.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (37, 22, '/assets/uploads/products/1789023773014-oekc6992.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (38, 23, '/assets/uploads/products/1789023998430-iuia2566.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (39, 24, '/assets/uploads/products/1789024207304-kjvs1862.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (40, 25, '/assets/uploads/products/1789101706320-unxi3656.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (41, 26, '/assets/uploads/products/1789117496873-wajr9073.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (42, 27, '/assets/uploads/products/1789117935518-vaxl6793.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (43, 28, '/assets/uploads/products/1789118960168-uiyh7702.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (44, 29, '/assets/uploads/products/1789119635395-bnnb3326.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (45, 29, '/assets/uploads/products/1789119595901-pewe6007.png', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (46, 30, '/assets/uploads/products/1789119801141-kecy7746.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (47, 31, '/assets/uploads/products/1789120100872-kuki9954.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (48, 32, '/assets/uploads/products/1789122114734-gpbi7483.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (49, 33, '/assets/uploads/products/1789122288524-owjs8362.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (50, 34, '/assets/uploads/products/1789122620614-offq3448.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (51, 35, '/assets/uploads/products/1789122780767-iqwd8292.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (52, 36, '/assets/uploads/products/1789123151443-wgyx2150.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (53, 37, '/assets/uploads/products/1789123479507-ncyf1179.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (54, 38, '/assets/uploads/products/1789140493214-gbiw2852.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (55, 39, '/assets/uploads/products/1789140696413-snta2479.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (56, 40, '/assets/uploads/products/1789140792900-jqhl1964.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (57, 41, '/assets/uploads/products/1789141688733-pxuz3193.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (58, 42, '/assets/uploads/products/1789141952300-aaht5425.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (59, 43, '/assets/uploads/products/1789142103602-qfhx3407.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (60, 44, '/assets/uploads/products/1789142252831-fusb8386.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (61, 45, '/assets/uploads/products/1789142392741-priu7307.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (62, 46, '/assets/uploads/products/1789142668697-wdin1474.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (63, 46, '/assets/uploads/products/1789143174038-xmpj6019.png', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (64, 47, '/assets/uploads/products/1789143301095-fsdq2236.png', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (65, 48, '/assets/uploads/products/1789143611963-whatsapp_image_2026-09-11_at_9.49.27_pm.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (66, 49, '/assets/uploads/products/1789143913690-whatsapp_image_2026-09-11_at_9.54.30_pm.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (67, 50, '/assets/uploads/products/1789144180160-31.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (68, 51, '/assets/uploads/products/1789144395290-whatsapp_image_2026-09-11_at_10.02.41_pm.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (69, 52, '/assets/uploads/products/1789144618051-f4fc4943-5b51-4c68-ac2c-aba59eb1d9e0.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (70, 53, '/assets/uploads/products/1789144771681-915b62a2-717c-4273-97de-9deac789d4fb.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (92, 54, '/assets/uploads/products/1789145045551-4e03daf7-f691-428d-a9e7-edb46487b495.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (95, 55, '/assets/uploads/products/1789146115334-img_9388.jpeg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (96, 55, '/assets/uploads/products/1789146141075-img_9377.jpeg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (97, 57, '/assets/products/ivory-bloom-crochet-dress/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (98, 57, '/assets/products/ivory-bloom-crochet-dress/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (99, 57, '/assets/products/ivory-bloom-crochet-dress/3.jpg', 2);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (100, 58, '/assets/products/sandy-smock-kidswear-set/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (101, 58, '/assets/products/sandy-smock-kidswear-set/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (102, 59, '/assets/products/blush-petal-baby-romper/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (103, 59, '/assets/products/blush-petal-baby-romper/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (104, 59, '/assets/products/blush-petal-baby-romper/3.jpg', 2);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (105, 60, '/assets/products/sage-garden-crochet-top/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (106, 60, '/assets/products/sage-garden-crochet-top/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (107, 61, '/assets/products/warm-brown-birthday-frock/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (108, 61, '/assets/products/warm-brown-birthday-frock/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (109, 61, '/assets/products/warm-brown-birthday-frock/3.jpg', 2);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (110, 61, '/assets/products/warm-brown-birthday-frock/4.jpg', 3);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (111, 62, '/assets/products/oatmeal-sibling-matching-set/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (112, 62, '/assets/products/oatmeal-sibling-matching-set/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (113, 63, '/assets/products/cream-lace-crochet-dress/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (114, 63, '/assets/products/cream-lace-crochet-dress/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (115, 64, '/assets/products/sand-blush-photoshoot-set/1.jpg', 0);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (116, 64, '/assets/products/sand-blush-photoshoot-set/2.jpg', 1);
INSERT INTO `product_images` (`id`, `product_id`, `url`, `display_order`) VALUES (117, 64, '/assets/products/sand-blush-photoshoot-set/3.jpg', 2);

-- Data for table `product_variants`
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (98, 9, '1Y', 'Terracotta', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (99, 9, '1Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (100, 9, '2Y', 'Terracotta', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (101, 9, '2Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (102, 9, '3Y', 'Terracotta', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (103, 9, '3Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (104, 10, '1Y', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (105, 10, '1Y', 'Soft White', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (106, 10, '1Y', 'Green', 0, 1);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (107, 10, '2Y', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (108, 10, '2Y', 'Soft White', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (109, 10, '2Y', 'Green', 0, 1);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (110, 10, '3Y', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (111, 10, '3Y', 'Soft White', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (112, 10, '3Y', 'Green', 0, 1);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (113, 11, '1Y', 'Aqua Blue', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (114, 11, '1Y', 'Sunshine Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (115, 11, '1Y', 'Playful Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (116, 11, '2Y', 'Aqua Blue', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (117, 11, '2Y', 'Sunshine Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (118, 11, '2Y', 'Playful Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (119, 11, '3Y', 'Aqua Blue', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (120, 11, '3Y', 'Sunshine Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (121, 11, '3Y', 'Playful Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (122, 12, '1Y', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (123, 12, '1Y', 'Earthy brown', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (124, 12, '2Y', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (125, 12, '2Y', 'Earthy brown', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (126, 12, '3Y', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (127, 12, '3Y', 'Earthy brown', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (128, 13, '1Y', 'Default', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (129, 13, '2Y', 'Default', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (130, 13, '3Y', 'Default', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (131, 14, '1Y', 'Warm Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (132, 14, '1Y', 'Soft Blush Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (133, 14, '1Y', 'Charcoal Grey', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (134, 15, 'One Size', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (135, 15, 'One Size', 'Mustard Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (136, 15, 'One Size', 'Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (137, 16, 'One Size', 'Soft cream with Pastel Mint', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (138, 17, 'One Size', 'Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (139, 17, 'One Size', 'Soft Blue', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (140, 18, 'One Size', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (141, 18, 'One Size', 'Blush', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (142, 18, 'One Size', 'Soft Pink', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (143, 19, 'One Size', 'Rich Red', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (144, 19, 'One Size', 'Lime Green', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (145, 20, 'One Size', 'Deep Forest Green', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (146, 20, 'One Size', 'Golden Yellow', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (147, 21, 'One Size', 'Default', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (148, 22, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (149, 23, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (150, 24, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (151, 25, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (152, 26, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (153, 27, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (154, 28, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (155, 29, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (156, 30, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (157, 31, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (158, 32, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (159, 33, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (160, 34, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (161, 35, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (162, 36, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (163, 37, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (164, 38, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (165, 39, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (166, 40, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (167, 41, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (168, 42, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (169, 43, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (170, 44, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (171, 45, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (172, 46, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (173, 47, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (174, 48, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (175, 49, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (176, 50, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (177, 51, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (178, 52, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (179, 53, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (189, 54, 'One Size', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (193, 55, '1Y', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (194, 55, '2Y', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (195, 55, '3Y', NULL, 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (196, 57, '1Y', 'Ivory', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (197, 57, '1Y', 'Blush', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (198, 57, '1Y', 'Cream', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (199, 57, '2Y', 'Ivory', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (200, 57, '2Y', 'Blush', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (201, 57, '2Y', 'Cream', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (202, 57, '3Y', 'Ivory', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (203, 57, '3Y', 'Blush', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (204, 57, '3Y', 'Cream', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (205, 57, '4Y', 'Ivory', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (206, 57, '4Y', 'Blush', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (207, 57, '4Y', 'Cream', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (208, 57, '5Y', 'Ivory', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (209, 57, '5Y', 'Blush', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (210, 57, '5Y', 'Cream', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (211, 57, '6Y', 'Ivory', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (212, 57, '6Y', 'Blush', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (213, 57, '6Y', 'Cream', 8, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (214, 58, '1Y', 'Sand', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (215, 58, '1Y', 'Oatmeal', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (216, 58, '2Y', 'Sand', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (217, 58, '2Y', 'Oatmeal', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (218, 58, '3Y', 'Sand', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (219, 58, '3Y', 'Oatmeal', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (220, 58, '4Y', 'Sand', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (221, 58, '4Y', 'Oatmeal', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (222, 58, '5Y', 'Sand', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (223, 58, '5Y', 'Oatmeal', 12, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (224, 59, '1Y', 'Blush', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (225, 59, '1Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (226, 59, '2Y', 'Blush', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (227, 59, '2Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (228, 59, '3Y', 'Blush', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (229, 59, '3Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (230, 59, '4Y', 'Blush', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (231, 59, '4Y', 'Ivory', 5, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (232, 60, '1Y', 'Sage', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (233, 60, '1Y', 'Oatmeal', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (234, 60, '2Y', 'Sage', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (235, 60, '2Y', 'Oatmeal', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (236, 60, '3Y', 'Sage', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (237, 60, '3Y', 'Oatmeal', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (238, 60, '4Y', 'Sage', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (239, 60, '4Y', 'Oatmeal', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (240, 60, '5Y', 'Sage', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (241, 60, '5Y', 'Oatmeal', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (242, 60, '6Y', 'Sage', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (243, 60, '6Y', 'Oatmeal', 15, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (244, 61, '1Y', 'Warm Brown', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (245, 61, '1Y', 'Ivory', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (246, 61, '2Y', 'Warm Brown', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (247, 61, '2Y', 'Ivory', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (248, 61, '3Y', 'Warm Brown', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (249, 61, '3Y', 'Ivory', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (250, 61, '4Y', 'Warm Brown', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (251, 61, '4Y', 'Ivory', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (252, 61, '5Y', 'Warm Brown', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (253, 61, '5Y', 'Ivory', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (254, 61, '6Y', 'Warm Brown', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (255, 61, '6Y', 'Ivory', 3, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (256, 62, '1Y', 'Oatmeal', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (257, 62, '1Y', 'Cream', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (258, 62, '2Y', 'Oatmeal', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (259, 62, '2Y', 'Cream', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (260, 62, '3Y', 'Oatmeal', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (261, 62, '3Y', 'Cream', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (262, 62, '4Y', 'Oatmeal', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (263, 62, '4Y', 'Cream', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (264, 62, '5Y', 'Oatmeal', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (265, 62, '5Y', 'Cream', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (266, 62, '6Y', 'Oatmeal', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (267, 62, '6Y', 'Cream', 7, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (268, 63, '1Y', 'Cream', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (269, 63, '1Y', 'Ivory', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (270, 63, '1Y', 'White', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (271, 63, '2Y', 'Cream', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (272, 63, '2Y', 'Ivory', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (273, 63, '2Y', 'White', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (274, 63, '3Y', 'Cream', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (275, 63, '3Y', 'Ivory', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (276, 63, '3Y', 'White', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (277, 63, '4Y', 'Cream', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (278, 63, '4Y', 'Ivory', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (279, 63, '4Y', 'White', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (280, 63, '5Y', 'Cream', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (281, 63, '5Y', 'Ivory', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (282, 63, '5Y', 'White', 4, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (283, 64, '1Y', 'Sand', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (284, 64, '1Y', 'Blush', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (285, 64, '2Y', 'Sand', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (286, 64, '2Y', 'Blush', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (287, 64, '3Y', 'Sand', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (288, 64, '3Y', 'Blush', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (289, 64, '4Y', 'Sand', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (290, 64, '4Y', 'Blush', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (291, 64, '5Y', 'Sand', 6, 0);
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `color`, `stock`, `out_of_stock`) VALUES (292, 64, '5Y', 'Blush', 6, 0);

-- Data for table `filters`
INSERT INTO `filters` (`id`, `name`, `slug`, `type`, `range_min`, `range_max`, `range_unit`, `active`) VALUES (1, 'Size', 'size', 'multi-select', 0, 10000, '₹', 1);
INSERT INTO `filters` (`id`, `name`, `slug`, `type`, `range_min`, `range_max`, `range_unit`, `active`) VALUES (2, 'Age Group', 'age-group', 'multi-select', 0, 10000, '₹', 1);
INSERT INTO `filters` (`id`, `name`, `slug`, `type`, `range_min`, `range_max`, `range_unit`, `active`) VALUES (3, 'Occasion', 'occasion', 'multi-select', 0, 10000, '₹', 1);
INSERT INTO `filters` (`id`, `name`, `slug`, `type`, `range_min`, `range_max`, `range_unit`, `active`) VALUES (4, 'Material', 'material', 'single-select', 0, 10000, '₹', 1);

-- Data for table `filter_options`
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (9, 2, 'Toddler (1-3Y)', 'Toddler (1-3Y)', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (10, 2, 'Little Kids (4-6Y)', 'Little Kids (4-6Y)', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (11, 2, 'Big Kids (7-8Y)', 'Big Kids (7-8Y)', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (12, 3, 'Birthday', 'Birthday', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (13, 3, 'Festive', 'Festive', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (14, 3, 'Everyday', 'Everyday', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (15, 3, 'Photoshoot', 'Photoshoot', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (16, 4, '100% Organic Cotton Yarn', '100% Organic Cotton Yarn', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (17, 4, 'Bamboo Cotton Blend', 'Bamboo Cotton Blend', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (18, 4, 'Soft Linen Yarn', 'Soft Linen Yarn', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (19, 1, '1Y', '1Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (20, 1, '2Y', '2Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (21, 1, '3Y', '3Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (22, 1, '4Y', '4Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (23, 1, '5Y', '5Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (24, 1, '6Y', '6Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (25, 1, '7Y', '7Y', NULL);
INSERT INTO `filter_options` (`id`, `filter_id`, `label`, `value`, `hex`) VALUES (26, 1, '8Y', '8Y', NULL);

-- Data for table `product_filter_values`
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (1, 9, 4, '100% Organic Cotton Yarn');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (2, 9, 4, 'Soft Linen Yarn');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (3, 11, 4, '100% Organic Cotton Yarn');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (4, 13, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (5, 13, 3, 'Festive');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (6, 14, 3, 'Photoshoot');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (7, 14, 3, 'Everyday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (8, 14, 4, '100% Organic Cotton Yarn');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (9, 14, 2, 'Toddler (1-3Y)');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (10, 15, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (11, 15, 3, 'Festive');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (12, 15, 4, '100% Organic Cotton Yarn');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (13, 16, 3, 'Festive');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (14, 16, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (15, 17, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (16, 17, 3, 'Festive');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (17, 17, 4, '100% Organic Cotton Yarn');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (18, 18, 3, 'Festive');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (19, 18, 3, 'Photoshoot');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (20, 20, 3, 'Everyday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (21, 21, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (22, 21, 3, 'Festive');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (23, 21, 3, 'Photoshoot');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (24, 22, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (25, 22, 2, 'Little Kids (4-6Y)');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (26, 24, 2, 'Toddler (1-3Y)');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (27, 24, 3, 'Birthday');
INSERT INTO `product_filter_values` (`id`, `product_id`, `filter_id`, `value`) VALUES (28, 24, 4, '100% Organic Cotton Yarn');

-- Data for table `navigation_items`
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (1, 'Home', 'page', NULL, '/', NULL, 0, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (2, 'Shop', 'page', NULL, '/shop', NULL, 1, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (3, 'Crochet', 'category', 8, NULL, NULL, 2, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (4, 'Kidswear', 'category', 9, NULL, NULL, 3, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (5, 'Custom Orders', 'page', NULL, '/custom-orders', NULL, 4, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (6, 'Workshops', 'page', NULL, '/workshops', NULL, 6, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (7, 'Our Story', 'page', NULL, '/our-story', NULL, 7, 1);
INSERT INTO `navigation_items` (`id`, `label`, `link_type`, `category_id`, `page_slug`, `external_url`, `display_order`, `visible`) VALUES (8, 'Contact', 'page', NULL, '/contact', NULL, 8, 1);

-- Data for table `navigation_item_filters`
INSERT INTO `navigation_item_filters` (`id`, `navigation_item_id`, `filter_id`, `display_order`) VALUES (1, 3, 4, 0);
INSERT INTO `navigation_item_filters` (`id`, `navigation_item_id`, `filter_id`, `display_order`) VALUES (2, 3, 3, 1);
INSERT INTO `navigation_item_filters` (`id`, `navigation_item_id`, `filter_id`, `display_order`) VALUES (3, 4, 1, 0);
INSERT INTO `navigation_item_filters` (`id`, `navigation_item_id`, `filter_id`, `display_order`) VALUES (4, 4, 2, 2);
INSERT INTO `navigation_item_filters` (`id`, `navigation_item_id`, `filter_id`, `display_order`) VALUES (5, 4, 3, 3);

-- Data for table `design_gallery_categories`
INSERT INTO `design_gallery_categories` (`id`, `name`, `display_order`) VALUES (1, 'Necklines', 1);
INSERT INTO `design_gallery_categories` (`id`, `name`, `display_order`) VALUES (2, 'Sleeves', 2);
INSERT INTO `design_gallery_categories` (`id`, `name`, `display_order`) VALUES (3, 'Patterns & Motifs', 3);
INSERT INTO `design_gallery_categories` (`id`, `name`, `display_order`) VALUES (4, 'Color Palettes', 4);
INSERT INTO `design_gallery_categories` (`id`, `name`, `display_order`) VALUES (5, 'Finished Garments', 5);
INSERT INTO `design_gallery_categories` (`id`, `name`, `display_order`) VALUES (6, 'Yarn Textures', 6);

-- Data for table `community_members`
INSERT INTO `community_members` (`id`, `name`, `email`, `phone`, `source`, `status`, `created_at`) VALUES (1, 'Member', 'madhankumargcr7@gmail.com', NULL, 'homepage', 'requested', '2026-08-23 09:13:16');
INSERT INTO `community_members` (`id`, `name`, `email`, `phone`, `source`, `status`, `created_at`) VALUES (2, 'Member', 'madhankumarcricket@gmail.com', NULL, 'workshop_page', 'Active', '2026-09-13 11:36:32');

-- Data for table `coupons`
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `max_discount`, `min_order_value`, `valid_from`, `valid_until`, `usage_limit`, `usage_count`, `per_customer_limit`, `active`, `internal_note`, `created_at`, `updated_at`) VALUES (1, 'WELCOME10', 'percentage', '"10"', '"387"', '"999"', '2026-09-14 00:00:00', '2026-09-21 00:00:00', 10, 0, 1, 1, NULL, '2026-09-14 10:14:05', '2026-09-14 10:14:05');

-- Data for table `orders`
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (2, 6, '"2499"', '"0"', '"2499"', 'Delivered', '123 Demo Street', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', 'priya.demo@example.com', '+91 98765 43210', 'paid', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-18 17:37:46');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (3, 7, '"5098"', '"0"', '"5098"', 'Processing', '456 Demo Avenue', NULL, 'Kochi', 'Kerala', '682001', 'India', 'anita.demo@example.com', '+91 87654 32109', 'paid', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-17 11:38:09');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (4, 8, '"1899"', '"0"', '"1899"', 'Pending', '789 Demo Road', NULL, 'Bangalore', 'Karnataka', '560001', 'India', 'lakshmi.demo@example.com', '+91 76543 21098', 'pending', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-19 06:48:00');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (5, NULL, '"2199"', '"0"', '"2199"', 'Shipped', '101 Guest Lane', NULL, 'Mumbai', 'Maharashtra', '400001', 'India', 'guest.demo@example.com', '+91 54321 09876', 'paid', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-15 12:22:41');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (6, 4, '"3499"', '"0"', '"3499"', 'Shipped', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '8925311803', 'paid', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-21 07:06:51');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (7, 4, '"2499"', '"0"', '"2499"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'pending', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-21 11:46:45');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (8, NULL, '"4998"', '"0"', '"4998"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'pending', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-22 17:55:46');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (9, 4, '"2499"', '"0"', '"2499"', 'Shipped', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'paid', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-23 06:03:52');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (10, 4, '"4998"', '"0"', '"4998"', 'Shipped', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'pending', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-08-23 06:20:58');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (11, 4, '"7497"', '"0"', '"7497"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'pending', NULL, NULL, NULL, NULL, 1, '2026-08-23 08:22:23', 0, NULL, NULL, '"0"', '2026-08-23 08:22:23');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (12, 4, '"2499"', '"0"', '"2499"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'pending', NULL, NULL, NULL, NULL, 1, '2026-08-23 09:00:38', 0, NULL, NULL, '"0"', '2026-08-23 09:00:38');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (13, 4, '"1000"', '"150"', '"1150"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'Pending', 'order_Tbpz20KfnwRpVa', NULL, NULL, NULL, 1, '2026-09-14 07:39:23', 0, NULL, NULL, '"0"', '2026-09-14 07:39:23');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (14, 4, '"10"', '"150"', '"160"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'Pending', 'order_Tbq0HH4YbqOhVf', NULL, NULL, NULL, 1, '2026-09-14 07:40:34', 0, NULL, NULL, '"0"', '2026-09-14 07:40:34');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (15, 4, '"10"', '"0"', '"10"', 'Delivered', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'paid', 'order_Tbq71dltWVxBbQ', 'pay_Tbq7NSZ03dMJpC', '866eda59586db06a407b18452c0975ceec767c28270f2660225e00f9abb62040', '2026-09-14 07:47:33', 1, '2026-09-14 07:46:57', 0, NULL, NULL, '"0"', '2026-09-14 07:46:57');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (16, 4, '"10"', '"0"', '"10"', 'Processing', 'F4,Ruby builders,Ashok Manor,Thollkappiar Street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'Paid', 'order_TbqnxUHYoqThk6', 'pay_TbqoFdKFf2qyaU', '5944a7a849730f540dc80e66a43a143a32524cd1e6d9fc67e84ccae3ae6a56fb', '2026-09-14 08:28:09', 1, '2026-09-14 08:27:36', 0, NULL, NULL, '"0"', '2026-09-14 08:27:36');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (17, 4, '"10"', '"0"', '"10"', 'Pending', 'Tholkappiar street', NULL, 'Perungalathur,Chennai', 'Tamil Nadu', '600063', 'India', 'madhankumargcr7@gmail.com', '+918925311803', 'Pending', 'order_TbrWIyJJ0txfEQ', NULL, NULL, NULL, 1, '2026-09-14 09:09:35', 0, NULL, NULL, '"0"', '2026-09-14 09:09:35');
INSERT INTO `orders` (`id`, `user_id`, `subtotal`, `shipping`, `total`, `status`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_country`, `contact_email`, `contact_phone`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `payment_verified_at`, `return_policy_agreed`, `return_policy_agreed_at`, `return_requested`, `return_requested_at`, `coupon_code`, `discount_amount`, `created_at`) VALUES (18, 6, '"1000"', '"0"', '"1000"', 'Delivered', '123 Demo Street', NULL, 'Chennai', 'Tamil Nadu', '600001', 'India', 'priya.demo@example.com', '+91 98765 43210', 'Paid', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, '"0"', '2026-09-14 10:41:34');

-- Data for table `order_items`
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (2, 2, NULL, 'Ivory Bloom Crochet Dress', '12M', 'Ivory', 1, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (3, 3, NULL, 'Warm Brown Birthday Frock', '2Y', 'Warm Brown', 1, '"3499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (4, 3, NULL, 'Blush Petal Baby Romper', '6M', 'Blush', 1, '"1599"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (5, 4, NULL, 'Sandy Smock Kidswear Set', '3Y', 'Sand', 1, '"1899"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (6, 5, NULL, 'Sand & Blush Photoshoot Set', 'Newborn', 'Sand', 1, '"2199"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (7, 6, NULL, 'Warm Brown Birthday Frock', '1Y', 'Warm Brown', 1, '"3499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (8, 7, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 1, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (9, 8, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 1, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (10, 8, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 1, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (11, 9, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 1, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (12, 10, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 2, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (13, 11, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 3, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (14, 12, NULL, 'ivory bloom crochet dress', '1Y', 'Ivory', 1, '"2499"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (15, 13, 55, 'Mridula Frock', '1Y', '', 1, '"1000"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (16, 14, 55, 'Mridula Frock', '1Y', '', 1, '"10"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (17, 15, 55, 'Mridula Frock', '1Y', '', 1, '"10"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (18, 16, 55, 'Mridula Frock', '1Y', '', 1, '"10"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (19, 17, 55, 'Mridula Frock', '1Y', '', 1, '"10"');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name_snapshot`, `size`, `color`, `quantity`, `price_snapshot`) VALUES (20, 18, 9, 'Elara - Crochet Hair Clip', '1Y', 'Ivory', 1, '"1000"');

-- Data for table `custom_order_requests`
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (1, 9, NULL, NULL, 'Meera Krishnan [DEMO]', 'meera.demo@example.com', '+91 65432 10987', 'birthday-frock', '1y-2y', NULL, 'Dusty Rose & Ivory', '1st Birthday photoshoot', '2024-04-15', 'Looking for a layered crochet dress with tulle underskirt. Would love a matching flower headband if possible. She is a petite baby so please use 9-12M sizing.', NULL, 'Happy to discuss on WhatsApp for reference images.', NULL, '"0"', 'Declined', '2026-08-20 17:25:39');
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (2, NULL, NULL, NULL, 'Sneha Reddy [DEMO]', 'sneha.demo@example.com', '+91 43210 98765', 'sibling-set', '2y-4y', NULL, 'Sage green and cream', 'Family photoshoot', '2024-05-01', 'Need matching outfits for my two kids: boy (3Y) and girl (18M). Crochet top for the girl, simple kurta style for the boy in coordinating colors.', NULL, NULL, NULL, '"0"', 'Declined', '2026-08-20 06:46:13');
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (3, NULL, NULL, NULL, 'Madhan Kumar G', 'madhankumargcr7@gmail.com', '+918925311803', 'other', 'custom-measurements', 'Length 18 inches', 'Green', 'Naming ceremony', '2026-09-24', 'hhxbsbxbdbhbdk', '/assets/uploads/gallery/1788257718733-gemini_generated_image_67b79367b79367b7.png', NULL, NULL, '"0"', 'Reviewed', '2026-09-01 10:15:19');
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (4, NULL, NULL, NULL, 'Madhan Kumar G', 'madhankumargcr7@gmail.com', '+918925311803', 'crochet-top', '2y-4y', 'Length 18 inches', 'Green', 'birthday', '2026-09-19', 'hjbdjhcbhdsb', NULL, NULL, NULL, '"0"', 'In Progress', '2026-09-01 11:31:50');
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (5, NULL, NULL, NULL, 'Madhan Kumar G', 'madhankumargcr7@gmail.com', '+918925311803', 'crochet-dress', '1y-2y', 'Length 18 inches', 'Green', 'birthday', '2026-10-02', 'jchskefkj', NULL, NULL, NULL, '"0"', 'New', '2026-09-06 06:58:05');
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (6, NULL, NULL, NULL, 'Madhan Kumar G', 'madhankumargcr7@gmail.com', '+918925311803', 'sibling-set', '6y-8y', NULL, 'Green', 'birthday', '2026-10-09', '', NULL, NULL, '', '"542"', 'In Progress', '2026-09-06 07:06:58');
INSERT INTO `custom_order_requests` (`id`, `user_id`, `base_product_id`, `base_product_name_snapshot`, `name`, `email`, `phone`, `product_type`, `age`, `size`, `preferred_color`, `occasion`, `desired_date`, `custom_requirements`, `reference_image_url`, `additional_notes`, `owner_response`, `quoted_price`, `status`, `created_at`) VALUES (7, NULL, NULL, NULL, 'Madhan Kumar G', 'madhankumargcr7@gmail.com', '+918925311803', 'baby-shower-set', '1y-2y', '', 'Yellow', 'birthday', '2026-10-03', 'gr', NULL, '', '', '"2499"', 'In Progress', '2026-09-13 15:30:58');

-- Data for table `custom_order_request_gallery_selections`
INSERT INTO `custom_order_request_gallery_selections` (`id`, `custom_order_request_id`, `design_gallery_image_id`, `image_url_snapshot`, `caption_snapshot`, `note`) VALUES (1, 7, NULL, '/assets/products/sandy-smock-kidswear-set/1.jpg', 'Puff Sleeve with Delicate Frill', NULL);
SET FOREIGN_KEY_CHECKS = 1;

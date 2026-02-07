-- CreateTable
CREATE TABLE `tl_businesses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_account_id` VARCHAR(50) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `map` VARCHAR(100) NOT NULL,
    `owner` VARCHAR(50) NULL,
    `is_owned` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tl_businesses_bank_account_id_key`(`bank_account_id`),
    INDEX `tl_businesses_category_idx`(`category`),
    INDEX `tl_businesses_map_idx`(`map`),
    INDEX `tl_businesses_owner_idx`(`owner`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tl_businesses`
ADD CONSTRAINT `tl_businesses_bank_account_id_fkey`
FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts_new`(`id`)
ON DELETE CASCADE ON UPDATE RESTRICT;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_number` VARCHAR(128) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `channel` VARCHAR(50) NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'IDR',
    `status` VARCHAR(50) NOT NULL,
    `checkout_url` VARCHAR(512) NULL,
    `payer_account_id` INTEGER NULL,
    `purpose_type` VARCHAR(100) NOT NULL,
    `purpose_ref` VARCHAR(191) NULL,
    `metadata_json` JSON NULL,
    `provider_payload_json` JSON NULL,
    `paid_at` TIMESTAMP(0) NULL,
    `expired_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `payments_invoice_number_key`(`invoice_number`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_purpose_type_idx`(`purpose_type`),
    INDEX `payments_purpose_lookup_idx`(`purpose_type`, `purpose_ref`),
    INDEX `payments_payer_account_id_idx`(`payer_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_id` INTEGER NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `status_before` VARCHAR(50) NULL,
    `status_after` VARCHAR(50) NULL,
    `payload_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `payment_events_payment_id_idx`(`payment_id`),
    INDEX `payment_events_event_type_idx`(`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_events`
ADD CONSTRAINT `payment_events_payment_id_fkey`
FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`)
ON DELETE CASCADE ON UPDATE RESTRICT;

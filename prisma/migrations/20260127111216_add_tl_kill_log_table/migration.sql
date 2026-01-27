-- CreateTable
CREATE TABLE `tl_kill_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `killer_citizenid` VARCHAR(50) NULL,
    `killer_name` VARCHAR(255) NULL,
    `victim_citizenid` VARCHAR(50) NULL,
    `victim_name` VARCHAR(255) NULL,
    `weapon` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `killer_citizenid_idx`(`killer_citizenid`),
    INDEX `victim_citizenid_idx`(`victim_citizenid`),
    INDEX `created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

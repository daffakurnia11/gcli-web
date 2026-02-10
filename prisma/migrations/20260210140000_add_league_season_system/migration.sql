-- CreateTable
CREATE TABLE `leagues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `start_at` TIMESTAMP(0) NULL,
    `end_at` TIMESTAMP(0) NULL,
    `creator` VARCHAR(100) NOT NULL,
    `price` INTEGER NOT NULL,
    `max_team` INTEGER NOT NULL DEFAULT 0,
    `rules_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `leagues_status_idx`(`status`),
    INDEX `leagues_creator_idx`(`creator`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `league_teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `league_id` INTEGER NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `joined_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `league_teams_league_id_idx`(`league_id`),
    INDEX `league_teams_code_idx`(`code`),
    INDEX `league_teams_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `league_matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `league_id` INTEGER NOT NULL,
    `home_team_id` INTEGER NOT NULL,
    `away_team_id` INTEGER NOT NULL,
    `scheduled_at` TIMESTAMP(0) NULL,
    `round` INTEGER NULL,
    `stage` VARCHAR(50) NULL,
    `zone` VARCHAR(100) NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `league_matches_league_id_idx`(`league_id`),
    INDEX `league_matches_home_team_id_idx`(`home_team_id`),
    INDEX `league_matches_away_team_id_idx`(`away_team_id`),
    INDEX `league_matches_status_idx`(`status`),
    INDEX `league_matches_round_idx`(`round`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `league_match_roster_players` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `match_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `citizenid` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `league_match_roster_players_match_id_idx`(`match_id`),
    INDEX `league_match_roster_players_team_id_idx`(`team_id`),
    INDEX `league_match_roster_players_citizenid_idx`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `league_match_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `match_id` INTEGER NOT NULL,
    `home_score` INTEGER NOT NULL DEFAULT 0,
    `away_score` INTEGER NOT NULL DEFAULT 0,
    `result_status` VARCHAR(50) NOT NULL,
    `winner_team_id` INTEGER NULL,
    `kill_logs_json` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `league_match_results_match_id_key`(`match_id`),
    INDEX `league_match_results_winner_team_id_idx`(`winner_team_id`),
    INDEX `league_match_results_result_status_idx`(`result_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `league_teams`
ADD CONSTRAINT `league_teams_league_id_fkey`
FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`)
ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_matches`
ADD CONSTRAINT `league_matches_league_id_fkey`
FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`)
ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_matches`
ADD CONSTRAINT `league_matches_home_team_id_fkey`
FOREIGN KEY (`home_team_id`) REFERENCES `league_teams`(`id`)
ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_matches`
ADD CONSTRAINT `league_matches_away_team_id_fkey`
FOREIGN KEY (`away_team_id`) REFERENCES `league_teams`(`id`)
ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_match_roster_players`
ADD CONSTRAINT `league_match_roster_players_match_id_fkey`
FOREIGN KEY (`match_id`) REFERENCES `league_matches`(`id`)
ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_match_roster_players`
ADD CONSTRAINT `league_match_roster_players_team_id_fkey`
FOREIGN KEY (`team_id`) REFERENCES `league_teams`(`id`)
ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_match_results`
ADD CONSTRAINT `league_match_results_match_id_fkey`
FOREIGN KEY (`match_id`) REFERENCES `league_matches`(`id`)
ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `league_match_results`
ADD CONSTRAINT `league_match_results_winner_team_id_fkey`
FOREIGN KEY (`winner_team_id`) REFERENCES `league_teams`(`id`)
ON DELETE SET NULL ON UPDATE RESTRICT;

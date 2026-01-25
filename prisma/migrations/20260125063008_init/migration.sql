-- CreateTable
CREATE TABLE `bank_accounts_new` (
    `id` VARCHAR(50) NOT NULL,
    `amount` INTEGER NULL DEFAULT 0,
    `transactions` LONGTEXT NULL,
    `auth` LONGTEXT NULL,
    `isFrozen` INTEGER NULL DEFAULT 0,
    `creator` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `license` VARCHAR(50) NULL,
    `discord` VARCHAR(50) NULL,
    `ip` VARCHAR(50) NULL,
    `reason` TEXT NULL,
    `expire` INTEGER NULL,
    `bannedby` VARCHAR(255) NOT NULL DEFAULT 'LeBanhammer',

    INDEX `discord`(`discord`),
    INDEX `ip`(`ip`),
    INDEX `license`(`license`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `management_outfits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_name` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `minrank` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(50) NOT NULL DEFAULT 'Cool Outfit',
    `gender` VARCHAR(50) NOT NULL DEFAULT 'male',
    `model` VARCHAR(50) NULL,
    `props` TEXT NULL,
    `components` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_calls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NULL,
    `transmitter` VARCHAR(255) NOT NULL,
    `receiver` VARCHAR(255) NOT NULL,
    `is_accepted` TINYINT NULL DEFAULT 0,
    `isAnonymous` TINYINT NOT NULL DEFAULT 0,
    `start` VARCHAR(255) NULL,
    `end` VARCHAR(255) NULL,

    INDEX `identifier`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_darkchat_channel_members` (
    `channel_id` INTEGER NOT NULL,
    `user_identifier` VARCHAR(255) NOT NULL,
    `is_owner` TINYINT NOT NULL DEFAULT 0,

    INDEX `npwd_darkchat_channel_members_npwd_darkchat_channels_id_fk`(`channel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_darkchat_channels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channel_identifier` VARCHAR(191) NOT NULL,
    `label` VARCHAR(255) NULL DEFAULT '',

    UNIQUE INDEX `darkchat_channels_channel_identifier_uindex`(`channel_identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_darkchat_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channel_id` INTEGER NOT NULL,
    `message` VARCHAR(255) NOT NULL,
    `user_identifier` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_image` TINYINT NOT NULL DEFAULT 0,

    INDEX `darkchat_messages_darkchat_channels_id_fk`(`channel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_marketplace_listings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NULL,
    `username` VARCHAR(255) NULL,
    `name` VARCHAR(50) NULL,
    `number` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NULL,
    `url` VARCHAR(255) NULL,
    `description` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reported` TINYINT NOT NULL DEFAULT 0,

    INDEX `identifier`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_match_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NOT NULL,
    `name` VARCHAR(90) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `bio` VARCHAR(512) NULL,
    `location` VARCHAR(45) NULL,
    `job` VARCHAR(45) NULL,
    `tags` VARCHAR(255) NOT NULL DEFAULT '',
    `voiceMessage` VARCHAR(512) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `identifier_UNIQUE`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_match_views` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NOT NULL,
    `profile` INTEGER NOT NULL,
    `liked` TINYINT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `identifier`(`identifier`),
    INDEX `match_profile_idx`(`profile`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(512) NOT NULL,
    `user_identifier` VARCHAR(48) NOT NULL,
    `conversation_id` VARCHAR(512) NOT NULL,
    `isRead` TINYINT NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `visible` TINYINT NOT NULL DEFAULT 1,
    `author` VARCHAR(255) NOT NULL,
    `is_embed` TINYINT NOT NULL DEFAULT 0,
    `embed` VARCHAR(512) NOT NULL DEFAULT '',

    INDEX `user_identifier`(`user_identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_messages_conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_list` VARCHAR(225) NOT NULL,
    `label` VARCHAR(60) NULL DEFAULT '',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_message_id` INTEGER NULL,
    `is_group_chat` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_messages_participants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `participant` VARCHAR(225) NOT NULL,
    `unread_count` INTEGER NULL DEFAULT 0,

    INDEX `message_participants_npwd_messages_conversations_id_fk`(`conversation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` VARCHAR(255) NOT NULL,

    INDEX `identifier`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_phone_contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NULL,
    `avatar` VARCHAR(255) NULL,
    `number` VARCHAR(20) NULL,
    `display` VARCHAR(255) NOT NULL DEFAULT '',

    INDEX `identifier`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_phone_gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identifier` VARCHAR(48) NULL,
    `image` VARCHAR(255) NOT NULL,

    INDEX `identifier`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_twitter_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profile_id` INTEGER NOT NULL,
    `tweet_id` INTEGER NOT NULL,

    INDEX `profile_idx`(`profile_id`),
    INDEX `tweet_idx`(`tweet_id`),
    UNIQUE INDEX `unique_combination`(`profile_id`, `tweet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_twitter_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profile_name` VARCHAR(90) NOT NULL,
    `identifier` VARCHAR(48) NOT NULL,
    `avatar_url` VARCHAR(255) NULL DEFAULT 'https://i.fivemanage.com/images/3ClWwmpwkFhL.png',
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `profile_name_UNIQUE`(`profile_name`),
    INDEX `identifier`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_twitter_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profile_id` INTEGER NOT NULL,
    `tweet_id` INTEGER NOT NULL,

    INDEX `profile_idx`(`profile_id`),
    INDEX `tweet_idx`(`tweet_id`),
    UNIQUE INDEX `unique_combination`(`profile_id`, `tweet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npwd_twitter_tweets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(1000) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `likes` INTEGER NOT NULL DEFAULT 0,
    `identifier` VARCHAR(48) NOT NULL,
    `visible` TINYINT NOT NULL DEFAULT 1,
    `images` VARCHAR(1000) NULL DEFAULT '',
    `retweet` INTEGER NULL,
    `profile_id` INTEGER NOT NULL,

    INDEX `npwd_twitter_tweets_npwd_twitter_profiles_id_fk`(`profile_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ox_doorlock` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `data` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ox_inventory` (
    `owner` VARCHAR(60) NULL,
    `name` VARCHAR(100) NOT NULL,
    `data` LONGTEXT NULL,
    `lastupdated` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `owner`(`owner`, `name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_groups` (
    `citizenid` VARCHAR(50) NOT NULL,
    `group` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `grade` TINYINT UNSIGNED NOT NULL,

    PRIMARY KEY (`citizenid`, `type`, `group`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_jobs_activity` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(50) NULL,
    `job` VARCHAR(255) NOT NULL,
    `last_checkin` INTEGER NOT NULL,
    `last_checkout` INTEGER NULL,

    INDEX `citizenid_job`(`citizenid`, `job`),
    INDEX `id`(`id` DESC),
    INDEX `last_checkout`(`last_checkout`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_mails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(50) NULL,
    `sender` VARCHAR(50) NULL,
    `subject` VARCHAR(50) NULL,
    `message` TEXT NULL,
    `read` TINYINT NULL DEFAULT 0,
    `mailid` INTEGER NULL,
    `date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `button` TEXT NULL,

    INDEX `citizenid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_outfit_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `outfitid` INTEGER NOT NULL,
    `code` VARCHAR(50) NOT NULL DEFAULT '',

    INDEX `FK_player_outfit_codes_player_outfits`(`outfitid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_outfits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(50) NULL,
    `outfitname` VARCHAR(50) NOT NULL DEFAULT '0',
    `model` VARCHAR(50) NULL,
    `props` TEXT NULL,
    `components` TEXT NULL,

    INDEX `citizenid`(`citizenid`),
    UNIQUE INDEX `citizenid_outfitname_model`(`citizenid`, `outfitname`, `model`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_transactions` (
    `id` VARCHAR(50) NOT NULL,
    `isFrozen` INTEGER NULL DEFAULT 0,
    `transactions` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `license` VARCHAR(50) NULL,
    `citizenid` VARCHAR(50) NULL,
    `vehicle` VARCHAR(50) NULL,
    `hash` VARCHAR(50) NULL,
    `mods` LONGTEXT NULL,
    `plate` VARCHAR(15) NOT NULL,
    `fakeplate` VARCHAR(50) NULL,
    `garage` VARCHAR(50) NULL,
    `fuel` INTEGER NULL DEFAULT 100,
    `engine` FLOAT NULL DEFAULT 1000,
    `body` FLOAT NULL DEFAULT 1000,
    `state` INTEGER NULL DEFAULT 1,
    `depotprice` INTEGER NOT NULL DEFAULT 0,
    `drivingdistance` INTEGER NULL,
    `status` TEXT NULL,
    `coords` TEXT NULL,
    `glovebox` LONGTEXT NULL,
    `trunk` LONGTEXT NULL,

    UNIQUE INDEX `plate`(`plate`),
    INDEX `citizenid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `players` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NULL,
    `citizenid` VARCHAR(50) NOT NULL,
    `cid` INTEGER NULL,
    `license` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `money` TEXT NOT NULL,
    `charinfo` TEXT NULL,
    `job` TEXT NOT NULL,
    `gang` TEXT NULL,
    `position` TEXT NOT NULL,
    `metadata` TEXT NOT NULL,
    `inventory` LONGTEXT NULL,
    `phone_number` VARCHAR(20) NULL,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_logged_out` TIMESTAMP(0) NULL,

    INDEX `id`(`id`),
    INDEX `last_updated`(`last_updated`),
    INDEX `license`(`license`),
    PRIMARY KEY (`citizenid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playerskins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` VARCHAR(255) NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `skin` TEXT NOT NULL,
    `active` TINYINT NOT NULL DEFAULT 1,

    INDEX `active`(`active`),
    INDEX `citizenid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `real_vehicleshop` (
    `id` INTEGER NULL,
    `information` LONGTEXT NULL,
    `vehicles` LONGTEXT NULL,
    `categories` LONGTEXT NULL,
    `feedbacks` LONGTEXT NULL,
    `complaints` LONGTEXT NULL,
    `preorders` LONGTEXT NULL,
    `employees` LONGTEXT NULL,
    `soldvehicles` LONGTEXT NULL,
    `transactions` LONGTEXT NULL,
    `perms` LONGTEXT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tl_crafting_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `x` DOUBLE NOT NULL,
    `y` DOUBLE NOT NULL,
    `z` DOUBLE NOT NULL,
    `heading` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tl_gangstash_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `x` DOUBLE NOT NULL,
    `y` DOUBLE NOT NULL,
    `z` DOUBLE NOT NULL,
    `heading` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userId` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NULL,
    `license` VARCHAR(50) NULL,
    `license2` VARCHAR(50) NULL,
    `fivem` VARCHAR(20) NULL,
    `discord` VARCHAR(30) NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER UNSIGNED NULL,
    `discord_id` VARCHAR(30) NULL,
    `fivem_id` VARCHAR(20) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `web_accounts_email_key`(`email`),
    UNIQUE INDEX `web_accounts_discord_id_key`(`discord_id`),
    INDEX `web_accounts_user_id_idx`(`user_id`),
    INDEX `web_accounts_discord_id_idx`(`discord_id`),
    INDEX `web_accounts_fivem_id_idx`(`fivem_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_discord_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_id` INTEGER NOT NULL,
    `discord_id` VARCHAR(30) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `global_name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `web_discord_accounts_account_id_key`(`account_id`),
    UNIQUE INDEX `web_discord_accounts_discord_id_key`(`discord_id`),
    INDEX `web_discord_accounts_account_id_idx`(`account_id`),
    INDEX `web_discord_accounts_discord_id_idx`(`discord_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `account_id` INTEGER NOT NULL,
    `real_name` VARCHAR(255) NULL,
    `fivem_name` VARCHAR(255) NULL,
    `age` TINYINT UNSIGNED NULL,
    `birth_date` TIMESTAMP(0) NULL,
    `province_id` VARCHAR(50) NULL,
    `province_name` VARCHAR(100) NULL,
    `city_id` VARCHAR(50) NULL,
    `city_name` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `web_profiles_account_id_key`(`account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_token` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `expires` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `web_sessions_session_token_key`(`session_token`),
    INDEX `web_sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `npwd_darkchat_channel_members` ADD CONSTRAINT `npwd_darkchat_channel_members_npwd_darkchat_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `npwd_darkchat_channels`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_darkchat_messages` ADD CONSTRAINT `darkchat_messages_darkchat_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `npwd_darkchat_channels`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_match_views` ADD CONSTRAINT `match_profile` FOREIGN KEY (`profile`) REFERENCES `npwd_match_profiles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_messages_participants` ADD CONSTRAINT `message_participants_npwd_messages_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `npwd_messages_conversations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_twitter_likes` ADD CONSTRAINT `profile` FOREIGN KEY (`profile_id`) REFERENCES `npwd_twitter_profiles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_twitter_likes` ADD CONSTRAINT `tweet` FOREIGN KEY (`tweet_id`) REFERENCES `npwd_twitter_tweets`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_twitter_reports` ADD CONSTRAINT `report_profile` FOREIGN KEY (`profile_id`) REFERENCES `npwd_twitter_profiles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_twitter_reports` ADD CONSTRAINT `report_tweet` FOREIGN KEY (`tweet_id`) REFERENCES `npwd_twitter_tweets`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `npwd_twitter_tweets` ADD CONSTRAINT `npwd_twitter_tweets_npwd_twitter_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `npwd_twitter_profiles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `player_groups` ADD CONSTRAINT `fk_citizenid` FOREIGN KEY (`citizenid`) REFERENCES `players`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_jobs_activity` ADD CONSTRAINT `player_jobs_activity_ibfk_1` FOREIGN KEY (`citizenid`) REFERENCES `players`(`citizenid`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `player_vehicles` ADD CONSTRAINT `player_vehicles_ibfk_1` FOREIGN KEY (`citizenid`) REFERENCES `players`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_accounts` ADD CONSTRAINT `web_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_discord_accounts` ADD CONSTRAINT `web_discord_accounts_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `web_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_profiles` ADD CONSTRAINT `web_profiles_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `web_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_sessions` ADD CONSTRAINT `web_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `web_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

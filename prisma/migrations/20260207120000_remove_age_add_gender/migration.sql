ALTER TABLE `web_profiles`
  DROP COLUMN `age`,
  ADD COLUMN `gender` ENUM('male', 'female') NULL;

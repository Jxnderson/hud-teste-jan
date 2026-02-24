CREATE TABLE IF NOT EXISTS `nn_hud_themes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(50) NOT NULL COMMENT 'Player citizenid from ESX',
  `theme_data` longtext NOT NULL COMMENT 'JSON string containing theme color settings',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_citizenid` (`citizenid`)
) ENGINE=InnoDB 

-- Example of how the theme_data column data looks:
-- {"health":"#25d489","armor":"#7ec8f7","hunger":"#f59e0b","thirst":"#06b6d4","stamina":"#10b981","oxygen":"#8b5cf6","ammo":"#f97316","stress":"#8b5cf6"}

SET
    FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Project_Report`;

DROP TABLE IF EXISTS `Team_Report`;

DROP TABLE IF EXISTS `User_Report`;

DROP TABLE IF EXISTS `Report_Standup`;

DROP TABLE IF EXISTS `Standup_Project`;

DROP TABLE IF EXISTS `Report`;

DROP TABLE IF EXISTS `Standup`;

DROP TABLE IF EXISTS `Highlights`;

DROP TABLE IF EXISTS `Project`;

DROP TABLE IF EXISTS `User_Team`;

DROP TABLE IF EXISTS `User_Role`;

DROP TABLE IF EXISTS `Role_Privilege`;

DROP TABLE IF EXISTS `Team`;

DROP TABLE IF EXISTS `User`;

DROP TABLE IF EXISTS `Role`;

DROP TABLE IF EXISTS `Privilege`;

SET
    FOREIGN_KEY_CHECKS = 1;

CREATE TABLE
    `Privilege` (
        `privilege_id` int (11) NOT NULL AUTO_INCREMENT,
        `privilege_name` varchar(100) COLLATE utf8_spanish2_ci NOT NULL,
        PRIMARY KEY (`privilege_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Role` (
        `role_id` int (11) NOT NULL AUTO_INCREMENT,
        `role_name` varchar(100) COLLATE utf8_spanish2_ci NOT NULL,
        PRIMARY KEY (`role_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User` (
        `user_id` int (11) NOT NULL AUTO_INCREMENT,
        `username` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
        `password` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
        `full_name` varchar(150) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `slack_handle` varchar(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `slack_id` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
        `deleted_at` DATETIME DEFAULT NULL,
        PRIMARY KEY (`user_id`),
        UNIQUE KEY `username` (`username`),
        UNIQUE KEY `slack_id` (`slack_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `team` (
        `team_id` int (11) NOT NULL AUTO_INCREMENT,
        `team_name` varchar(100) NOT NULL,
        `team_start_date` date DEFAULT current_timestamp(),
        `deleted_at` datetime DEFAULT NULL,
        UNIQUE KEY `team_id` (`team_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Standup` (
        `standup_id` INT NOT NULL AUTO_INCREMENT,
        `date` DATE NOT NULL,
        `did_today` TEXT COLLATE utf8_spanish2_ci NOT NULL,
        `do_tomorrow` TEXT COLLATE utf8_spanish2_ci NOT NULL,
        `blockers` TEXT COLLATE utf8_spanish2_ci NOT NULL,
        `user_id` INT (11) NOT NULL,
        PRIMARY KEY (`standup_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Project` (
        `project_id` int (11) NOT NULL AUTO_INCREMENT,
        `name` varchar(150) COLLATE utf8_spanish2_ci NOT NULL,
        `description` text COLLATE utf8_spanish2_ci DEFAULT NULL,
        `start_date` date DEFAULT NULL,
        `end_date` date DEFAULT NULL,
        `status` varchar(20) COLLATE utf8_spanish2_ci DEFAULT 'active',
        `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
        `project_state` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `team_id` int (11) DEFAULT NULL,
        PRIMARY KEY (`project_id`),
        UNIQUE KEY `uq_project_name_team` (`name`, `team_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Highlights` (
        `highlights_id` int (11) NOT NULL AUTO_INCREMENT,
        `description` text COLLATE utf8_spanish2_ci DEFAULT NULL,
        `start_date` date DEFAULT NULL,
        `project_id` int (11) DEFAULT NULL,
        `deleted_at` DATETIME DEFAULT NULL,
        PRIMARY KEY (`highlights_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Report` (
        `report_id` int (11) NOT NULL AUTO_INCREMENT,
        `date_beginning` date DEFAULT NULL,
        `date_end` date DEFAULT NULL,
        `date_generated` timestamp NOT NULL DEFAULT current_timestamp(),
        `ai_content` text COLLATE utf8_spanish2_ci DEFAULT NULL,
        `user_id` int (11) DEFAULT NULL,
        `deleted_at` DATETIME DEFAULT NULL,
        PRIMARY KEY (`report_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Role_Privilege` (
        `role_id` int (11) NOT NULL,
        `privilege_id` int (11) NOT NULL,
        PRIMARY KEY (`role_id`, `privilege_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Role` (
        `user_id` int (11) NOT NULL,
        `role_id` int (11) NOT NULL,
        `start_date` date DEFAULT NULL,
        `end_date` date DEFAULT NULL,
        PRIMARY KEY (`user_id`, `role_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Team` (
        `user_id` int (11) NOT NULL,
        `team_id` int (11) NOT NULL,
        `date_start` date DEFAULT NULL,
        `date_end` date DEFAULT NULL,
        PRIMARY KEY (`user_id`, `team_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Standup_Project` (
        `standup_id` INT NOT NULL,
        `project_id` INT NOT NULL,
        PRIMARY KEY (`standup_id`, `project_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Report_Standup` (
        `report_id` INT NOT NULL,
        `standup_id` INT NOT NULL,
        PRIMARY KEY (`report_id`, `standup_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Report` (
        `report_id` int (11) NOT NULL,
        `user_about` int (11) NOT NULL,
        PRIMARY KEY (`report_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Team_Report` (
        `report_id` int (11) NOT NULL,
        `team_about` int (11) NOT NULL,
        PRIMARY KEY (`report_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Project_Report` (
        `report_id` int (11) NOT NULL,
        `project_about` int (11) NOT NULL,
        PRIMARY KEY (`report_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

ALTER TABLE `Role_Privilege` ADD CONSTRAINT `role_privilege_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `role_privilege_ibfk_2` FOREIGN KEY (`privilege_id`) REFERENCES `Privilege` (`privilege_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `User_Role` ADD CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `User_Team` ADD CONSTRAINT `user_team_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `user_team_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Standup` ADD CONSTRAINT `standup_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Project` ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Highlights` ADD CONSTRAINT `highlights_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `Project` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Report` ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Standup_Project` ADD CONSTRAINT `sp_ibfk_1` FOREIGN KEY (`standup_id`) REFERENCES `Standup` (`standup_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `sp_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `Project` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Report_Standup` ADD CONSTRAINT `rs_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `rs_ibfk_2` FOREIGN KEY (`standup_id`) REFERENCES `Standup` (`standup_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `User_Report` ADD CONSTRAINT `user_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE,
ADD CONSTRAINT `user_report_ibfk_2` FOREIGN KEY (`user_about`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Team_Report` ADD CONSTRAINT `team_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE,
ADD CONSTRAINT `team_report_ibfk_2` FOREIGN KEY (`team_about`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE;

ALTER TABLE `Project_Report` ADD CONSTRAINT `project_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE,
ADD CONSTRAINT `project_report_ibfk_2` FOREIGN KEY (`project_about`) REFERENCES `Project` (`project_id`) ON DELETE CASCADE;

COMMIT;
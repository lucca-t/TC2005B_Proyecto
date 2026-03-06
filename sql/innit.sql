CREATE TABLE
    `Role` (
        `role_id` int (11) NOT NULL,
        `role_name` varchar(50) COLLATE utf8_spanish2_ci NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Privilege` (
        `privilege_id` int (11) NOT NULL,
        `privilege_name` varchar(50) COLLATE utf8_spanish2_ci NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Role_Privilege` (
        `role_privilege_id` int (11) NOT NULL,
        `role_id` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
        `privilege_id` varchar(50) COLLATE utf8_spanish2_ci NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User` (
        `user_id` int (11) NOT NULL,
        `username` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
        `password` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
        `full_name` varchar(100) COLLATE utf8_spanish2_ci NOT NULL,
        `is_active` BOOLEAN COLLATE utf8_spanish2_ci NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Privilege` (
        `privilege_id` int (11) NOT NULL,
        `privilege_name` varchar(100) COLLATE utf8_spanish2_ci NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Role` (
        `role_id` int (11) NOT NULL,
        `role_name` varchar(100) COLLATE utf8_spanish2_ci NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User` (
        `user_id` int (11) NOT NULL,
        `username` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
        `password` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
        `full_name` varchar(150) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `user_state` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `slack_handle` varchar(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `slack_id` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Team` (
        `team_id` int (11) NOT NULL,
        `team_name` varchar(100) COLLATE utf8_spanish2_ci NOT NULL,
        `team_start_date` date DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Role_Privilege` (
        `role_id` int (11) NOT NULL,
        `privilege_id` int (11) NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Role` (
        `user_id` int (11) NOT NULL,
        `role_id` int (11) NOT NULL,
        `start_date` date DEFAULT NULL,
        `end_date` date DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Team` (
        `user_id` int (11) NOT NULL,
        `team_id` int (11) NOT NULL,
        `date_start` date DEFAULT NULL,
        `date_end` date DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Project` (
        `project_id` int (11) NOT NULL,
        `description` text COLLATE utf8_spanish2_ci DEFAULT NULL,
        `start_date` date DEFAULT NULL,
        `end_date` date DEFAULT NULL,
        `project_state` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
        `team_id` int (11) DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Achievement` (
        `achievement_id` int (11) NOT NULL,
        `description` text COLLATE utf8_spanish2_ci DEFAULT NULL,
        `start_date` date DEFAULT NULL,
        `project_id` int (11) DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Achievement` (
        `user_id` int (11) NOT NULL,
        `achievement_id` int (11) NOT NULL,
        `date_achieved` date DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Report` (
        `report_id` int (11) NOT NULL,
        `date_beginning` date DEFAULT NULL,
        `date_end` date DEFAULT NULL,
        `date_generated` timestamp NOT NULL DEFAULT current_timestamp(),
        `ai_content` text COLLATE utf8_spanish2_ci DEFAULT NULL,
        `user_id` int (11) DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `User_Report` (
        `report_id` int (11) NOT NULL,
        `user_about` int (11) NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Team_Report` (
        `report_id` int (11) NOT NULL,
        `team_about` int (11) NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

CREATE TABLE
    `Project_Report` (
        `report_id` int (11) NOT NULL,
        `project_about` int (11) NOT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

ALTER TABLE `Privilege` ADD PRIMARY KEY (`privilege_id`);

ALTER TABLE `Role` ADD PRIMARY KEY (`role_id`);

ALTER TABLE `User` ADD PRIMARY KEY (`user_id`),
ADD UNIQUE KEY `username` (`username`),
ADD UNIQUE KEY `slack_id` (`slack_id`);


--Adding the keys of the tables
ALTER TABLE `Team` ADD PRIMARY KEY (`team_id`);

ALTER TABLE `Role_Privilege` ADD PRIMARY KEY (`role_id`, `privilege_id`),
ADD KEY `privilege_id` (`privilege_id`);

ALTER TABLE `User_Role` ADD PRIMARY KEY (`user_id`, `role_id`),
ADD KEY `role_id` (`role_id`);

ALTER TABLE `User_Team` ADD PRIMARY KEY (`user_id`, `team_id`),
ADD KEY `team_id` (`team_id`);

ALTER TABLE `Project` ADD PRIMARY KEY (`project_id`),
ADD KEY `team_id` (`team_id`);

ALTER TABLE `Achievement` ADD PRIMARY KEY (`achievement_id`),
ADD KEY `project_id` (`project_id`);

ALTER TABLE `User_Achievement` ADD PRIMARY KEY (`user_id`, `achievement_id`),
ADD KEY `achievement_id` (`achievement_id`);

ALTER TABLE `Report` ADD PRIMARY KEY (`report_id`),
ADD KEY `user_id` (`user_id`);

ALTER TABLE `User_Report` ADD PRIMARY KEY (`report_id`),
ADD KEY `user_about` (`user_about`);

ALTER TABLE `Team_Report` ADD PRIMARY KEY (`report_id`),
ADD KEY `team_about` (`team_about`);

ALTER TABLE `Project_Report` ADD PRIMARY KEY (`report_id`),
ADD KEY `project_about` (`project_about`);

--Adding the key references to the tables

ALTER TABLE `Role_Privilege` ADD CONSTRAINT `role_privilege_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `role_privilege_ibfk_2` FOREIGN KEY (`privilege_id`) REFERENCES `Privilege` (`privilege_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `User_Role` ADD CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `User_Team` ADD CONSTRAINT `user_team_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `user_team_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Project` ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Achievement` ADD CONSTRAINT `achievement_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `Project` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `User_Achievement` ADD CONSTRAINT `user_achievement_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `user_achievement_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `Achievement` (`achievement_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Report` ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `User_Report` ADD CONSTRAINT `user_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE,
ADD CONSTRAINT `user_report_ibfk_2` FOREIGN KEY (`user_about`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Team_Report` ADD CONSTRAINT `team_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE,
ADD CONSTRAINT `team_report_ibfk_2` FOREIGN KEY (`team_about`) REFERENCES `Team` (`team_id`) ON DELETE CASCADE;

ALTER TABLE `Project_Report` ADD CONSTRAINT `project_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `Report` (`report_id`) ON DELETE CASCADE,
ADD CONSTRAINT `project_report_ibfk_2` FOREIGN KEY (`project_about`) REFERENCES `Project` (`project_id`) ON DELETE CASCADE;

COMMIT;
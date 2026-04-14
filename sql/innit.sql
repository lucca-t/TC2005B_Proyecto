SET
    FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `project_report`;

DROP TABLE IF EXISTS `team_report`;

DROP TABLE IF EXISTS `user_report`;

DROP TABLE IF EXISTS `report_standup`;

DROP TABLE IF EXISTS `standup_project`;

DROP TABLE IF EXISTS `report`;

DROP TABLE IF EXISTS `standup`;

DROP TABLE IF EXISTS `highlights`;

DROP TABLE IF EXISTS `project`;

DROP TABLE IF EXISTS `user_team`;

DROP TABLE IF EXISTS `user_role`;

DROP TABLE IF EXISTS `role_privilege`;

DROP TABLE IF EXISTS `team`;

DROP TABLE IF EXISTS `user`;

DROP TABLE IF EXISTS `role`;

DROP TABLE IF EXISTS `privilege`;

DROP PROCEDURE IF EXISTS `getTeamDetails`;

DROP PROCEDURE IF EXISTS `updateTeamMembers`;

SET
    FOREIGN_KEY_CHECKS = 1;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getTeamDetails` (IN `p_team_id` INT)   BEGIN
    SELECT 
        t.team_name,
        u.user_id,
        u.full_name,
        u.email,
        u.slack_handle
    FROM team t
      LEFT JOIN user_team ut ON t.team_id = ut.team_id AND ut.date_end IS NULL
      LEFT JOIN user u ON ut.user_id = u.user_id
    WHERE t.team_id = p_team_id AND t.deleted_at IS NULL;
END$$

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `getProjectDetails` (IN `p_project_id` INT)   BEGIN
    SELECT 
        p.project_id,
        p.name,
        p.description,
        p.start_date,
        p.end_date,
        p.status,
        p.team_id,
        t.team_name
    FROM project p
      INNER JOIN team t ON p.team_id = t.team_id
    WHERE p.project_id = p_project_id AND t.deleted_at IS NULL;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateTeamMembers` (IN `p_team_id` INT, IN `p_user_ids_json` JSON)   BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE v_user_id INT;
    DECLARE v_array_length INT;

    START TRANSACTION;

    -- 1. Marcar como "finalizados" a los miembros activos actuales de este equipo
    UPDATE user_team 
    SET date_end = CURRENT_DATE() 
    WHERE team_id = p_team_id AND date_end IS NULL;

    -- 2. Recorrer el arreglo JSON que llega por parámetro
    SET v_array_length = JSON_LENGTH(p_user_ids_json);

    WHILE i < v_array_length DO
        -- Extraer el ID actual del arreglo
        SET v_user_id = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_user_ids_json, CONCAT('$[', i, ']'))) AS UNSIGNED);

        -- 3. Insertar el nuevo miembro. Si el registro ya existía (por la Primary Key compuesta user_id + team_id), 
        -- se actualiza su fecha de inicio y se borra su fecha de fin para reactivarlo.
        INSERT INTO user_team (user_id, team_id, date_start, date_end)
        VALUES (v_user_id, p_team_id, CURRENT_DATE(), NULL)
        ON DUPLICATE KEY UPDATE 
            date_start = CURRENT_DATE(),
            date_end = NULL;

        SET i = i + 1;
    END WHILE;

    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `highlights`
--

CREATE TABLE `highlights` (
  `highlights_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `privilege`
--

CREATE TABLE `privilege` (
  `privilege_id` int(11) NOT NULL,
  `privilege_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `project_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `project_state` varchar(20) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_report`
--

CREATE TABLE `project_report` (
  `report_id` int(11) NOT NULL,
  `project_about` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `report_id` int(11) NOT NULL,
  `date_beginning` date DEFAULT NULL,
  `date_end` date DEFAULT NULL,
  `date_generated` timestamp NOT NULL DEFAULT current_timestamp(),
  `ai_content` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_standup`
--

CREATE TABLE `report_standup` (
  `report_id` int(11) NOT NULL,
  `standup_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_privilege`
--

CREATE TABLE `role_privilege` (
  `role_id` int(11) NOT NULL,
  `privilege_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `standup`
--

CREATE TABLE `standup` (
  `standup_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `did_today` text NOT NULL,
  `do_tomorrow` text NOT NULL,
  `blockers` text NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `standup_project`
--

CREATE TABLE `standup_project` (
  `standup_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

CREATE TABLE `team` (
  `team_id` int(11) NOT NULL,
  `team_name` varchar(100) NOT NULL,
  `team_start_date` date DEFAULT current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_report`
--

CREATE TABLE `team_report` (
  `report_id` int(11) NOT NULL,
  `team_about` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `slack_handle` varchar(100) DEFAULT NULL,
  `slack_id` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `email`, `password`, `full_name`, `slack_handle`, `slack_id`, `created_at`, `deleted_at`) VALUES
(1, 'admin@gmail.com', '$2b$12$GfBKWs2krI3TVUMGw75oeuXLg03ZRg1Is2TsmAvtT/YL4lozTXUje', 'administrador', '@elpepe', 'Eso Thai Ling', '2026-03-26 20:15:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_report`
--

CREATE TABLE `user_report` (
  `report_id` int(11) NOT NULL,
  `user_about` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_team`
--

CREATE TABLE `user_team` (
  `user_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `date_start` date DEFAULT NULL,
  `date_end` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `highlights`
--
ALTER TABLE `highlights`
  ADD PRIMARY KEY (`highlights_id`),
  ADD KEY `highlights_ibfk_1` (`project_id`);

--
-- Indexes for table `privilege`
--
ALTER TABLE `privilege`
  ADD PRIMARY KEY (`privilege_id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`project_id`),
  ADD UNIQUE KEY `uq_project_name_team` (`name`,`team_id`),
  ADD KEY `project_ibfk_1` (`team_id`);

--
-- Indexes for table `project_report`
--
ALTER TABLE `project_report`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `project_report_ibfk_2` (`project_about`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `report_ibfk_1` (`user_id`);

--
-- Indexes for table `report_standup`
--
ALTER TABLE `report_standup`
  ADD PRIMARY KEY (`report_id`,`standup_id`),
  ADD KEY `rs_ibfk_2` (`standup_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `role_privilege`
--
ALTER TABLE `role_privilege`
  ADD PRIMARY KEY (`role_id`,`privilege_id`),
  ADD KEY `role_privilege_ibfk_2` (`privilege_id`);

--
-- Indexes for table `standup`
--
ALTER TABLE `standup`
  ADD PRIMARY KEY (`standup_id`),
  ADD KEY `standup_ibfk_1` (`user_id`);

--
-- Indexes for table `standup_project`
--
ALTER TABLE `standup_project`
  ADD PRIMARY KEY (`standup_id`,`project_id`),
  ADD KEY `sp_ibfk_2` (`project_id`);

--
-- Indexes for table `team`
--
ALTER TABLE `team`
  ADD UNIQUE KEY `team_id` (`team_id`);

--
-- Indexes for table `team_report`
--
ALTER TABLE `team_report`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `team_report_ibfk_2` (`team_about`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `slack_id` (`slack_id`);

--
-- Indexes for table `user_report`
--
ALTER TABLE `user_report`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `user_report_ibfk_2` (`user_about`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `user_role_ibfk_2` (`role_id`);

--
-- Indexes for table `user_team`
--
ALTER TABLE `user_team`
  ADD PRIMARY KEY (`user_id`,`team_id`),
  ADD KEY `user_team_ibfk_2` (`team_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `highlights`
--
ALTER TABLE `highlights`
  MODIFY `highlights_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `privilege`
--
ALTER TABLE `privilege`
  MODIFY `privilege_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `standup`
--
ALTER TABLE `standup`
  MODIFY `standup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `team`
--
ALTER TABLE `team`
  MODIFY `team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `highlights`
--
ALTER TABLE `highlights`
  ADD CONSTRAINT `highlights_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_report`
--
ALTER TABLE `project_report`
  ADD CONSTRAINT `project_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_report_ibfk_2` FOREIGN KEY (`project_about`) REFERENCES `project` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `report_standup`
--
ALTER TABLE `report_standup`
  ADD CONSTRAINT `rs_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rs_ibfk_2` FOREIGN KEY (`standup_id`) REFERENCES `standup` (`standup_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `role_privilege`
--
ALTER TABLE `role_privilege`
  ADD CONSTRAINT `role_privilege_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_privilege_ibfk_2` FOREIGN KEY (`privilege_id`) REFERENCES `privilege` (`privilege_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `standup`
--
ALTER TABLE `standup`
  ADD CONSTRAINT `standup_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `standup_project`
--
ALTER TABLE `standup_project`
  ADD CONSTRAINT `sp_ibfk_1` FOREIGN KEY (`standup_id`) REFERENCES `standup` (`standup_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sp_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `team_report`
--
ALTER TABLE `team_report`
  ADD CONSTRAINT `team_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_report_ibfk_2` FOREIGN KEY (`team_about`) REFERENCES `team` (`team_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_report`
--
ALTER TABLE `user_report`
  ADD CONSTRAINT `user_report_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_report_ibfk_2` FOREIGN KEY (`user_about`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_team`
--
ALTER TABLE `user_team`
  ADD CONSTRAINT `user_team_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_team_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

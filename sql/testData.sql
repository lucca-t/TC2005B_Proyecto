-- Insert all of the teams
INSERT INTO `team` (`team_id`, `team_name`, `team_start_date`, `deleted_at`) VALUES
(1, 'Vaquita', '2026-04-21', NULL),
(2, 'Sea Lion', '2026-04-21', NULL),
(3, 'Axolotl', '2026-04-21', NULL),
(4, 'Horse', '2026-04-21', NULL),
(5, 'Anemone', '2026-04-21', NULL),
(6, 'Capybara', '2026-04-21', NULL),
(7, 'Starfish', '2026-04-21', NULL);

ALTER TABLE `team`
  MODIFY `team_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

-- Insert all of the users
INSERT INTO `user` (`user_id`, `email`, `password`, `full_name`, `slack_handle`, `slack_id`, `created_at`, `deleted_at`) VALUES
(2, 'alice.smith@example.com', '$2b$12$dummyhash...', 'Alice Smith', '@alices', 'U1000000002', '2026-04-21 20:30:00', NULL),
(3, 'bob.johnson@example.com', '$2b$12$dummyhash...', 'Bob Johnson', '@bobj', 'U1000000003', '2026-04-21 20:30:00', NULL),
(4, 'charlie.brown@example.com', '$2b$12$dummyhash...', 'Charlie Brown', '@charlieb', 'U1000000004', '2026-04-21 20:30:00', NULL),
(5, 'diana.prince@example.com', '$2b$12$dummyhash...', 'Diana Prince', '@dianap', 'U1000000005', '2026-04-21 20:30:00', NULL),
(6, 'evan.davis@example.com', '$2b$12$dummyhash...', 'Evan Davis', '@evand', 'U1000000006', '2026-04-21 20:30:00', NULL),
(7, 'fiona.gallagher@example.com', '$2b$12$dummyhash...', 'Fiona Gallagher', '@fionag', 'U1000000007', '2026-04-21 20:30:00', NULL),
(8, 'george.costanza@example.com', '$2b$12$dummyhash...', 'George Costanza', '@georgec', 'U1000000008', '2026-04-21 20:30:00', NULL),
(9, 'hannah.abbott@example.com', '$2b$12$dummyhash...', 'Hannah Abbott', '@hannaha', 'U1000000009', '2026-04-21 20:30:00', NULL),
(10, 'ian.malcolm@example.com', '$2b$12$dummyhash...', 'Ian Malcolm', '@ianm', 'U1000000010', '2026-04-21 20:30:00', NULL),
(11, 'jane.doe@example.com', '$2b$12$dummyhash...', 'Jane Doe', '@janed', 'U1000000011', '2026-04-21 20:30:00', NULL),
(12, 'kevin.flynn@example.com', '$2b$12$dummyhash...', 'Kevin Flynn', '@kevinf', 'U1000000012', '2026-04-21 20:30:00', NULL),
(13, 'laura.roslin@example.com', '$2b$12$dummyhash...', 'Laura Roslin', '@laurar', 'U1000000013', '2026-04-21 20:30:00', NULL),
(14, 'mike.ehrmantraut@example.com', '$2b$12$dummyhash...', 'Mike Ehrmantraut', '@mikee', 'U1000000014', '2026-04-21 20:30:00', NULL),
(15, 'nina.zenik@example.com', '$2b$12$dummyhash...', 'Nina Zenik', '@ninaz', 'U1000000015', '2026-04-21 20:30:00', NULL),
(16, 'oscar.martinez@example.com', '$2b$12$dummyhash...', 'Oscar Martinez', '@oscarm', 'U1000000016', '2026-04-21 20:30:00', NULL),
(17, 'pam.beesly@example.com', '$2b$12$dummyhash...', 'Pam Beesly', '@pamb', 'U1000000017', '2026-04-21 20:30:00', NULL),
(18, 'quinn.fabray@example.com', '$2b$12$dummyhash...', 'Quinn Fabray', '@quinnf', 'U1000000018', '2026-04-21 20:30:00', NULL),
(19, 'ross.geller@example.com', '$2b$12$dummyhash...', 'Ross Geller', '@rossg', 'U1000000019', '2026-04-21 20:30:00', NULL),
(20, 'sarah.connor@example.com', '$2b$12$dummyhash...', 'Sarah Connor', '@sarahc', 'U1000000020', '2026-04-21 20:30:00', NULL),
(21, 'tom.hardy@example.com', '$2b$12$dummyhash...', 'Tom Hardy', '@tomh', 'U1000000021', '2026-04-21 20:30:00', NULL),
(22, 'ursula.buffay@example.com', '$2b$12$dummyhash...', 'Ursula Buffay', '@ursulab', 'U1000000022', '2026-04-21 20:30:00', NULL),
(23, 'victor.stone@example.com', '$2b$12$dummyhash...', 'Victor Stone', '@victors', 'U1000000023', '2026-04-21 20:30:00', NULL),
(24, 'wanda.maximoff@example.com', '$2b$12$dummyhash...', 'Wanda Maximoff', '@wandam', 'U1000000024', '2026-04-21 20:30:00', NULL),
(25, 'xander.harris@example.com', '$2b$12$dummyhash...', 'Xander Harris', '@xanderh', 'U1000000025', '2026-04-21 20:30:00', NULL),
(26, 'yelena.belova@example.com', '$2b$12$dummyhash...', 'Yelena Belova', '@yelenab', 'U1000000026', '2026-04-21 20:30:00', NULL),
(27, 'zack.morris@example.com', '$2b$12$dummyhash...', 'Zack Morris', '@zackm', 'U1000000027', '2026-04-21 20:30:00', NULL),
(28, 'amy.santiago@example.com', '$2b$12$dummyhash...', 'Amy Santiago', '@amys', 'U1000000028', '2026-04-21 20:30:00', NULL),
(29, 'bruce.wayne@example.com', '$2b$12$dummyhash...', 'Bruce Wayne', '@brucew', 'U1000000029', '2026-04-21 20:30:00', NULL),
(30, 'clark.kent@example.com', '$2b$12$dummyhash...', 'Clark Kent', '@clarkk', 'U1000000030', '2026-04-21 20:30:00', NULL),
(31, 'daisy.johnson@example.com', '$2b$12$dummyhash...', 'Daisy Johnson', '@daisyj', 'U1000000031', '2026-04-21 20:30:00', NULL),
(32, 'ethan.hunt@example.com', '$2b$12$dummyhash...', 'Ethan Hunt', '@ethanh', 'U1000000032', '2026-04-21 20:30:00', NULL),
(33, 'fox.mulder@example.com', '$2b$12$dummyhash...', 'Fox Mulder', '@foxm', 'U1000000033', '2026-04-21 20:30:00', NULL),
(34, 'gwen.stacy@example.com', '$2b$12$dummyhash...', 'Gwen Stacy', '@gwens', 'U1000000034', '2026-04-21 20:30:00', NULL),
(35, 'harry.potter@example.com', '$2b$12$dummyhash...', 'Harry Potter', '@harryp', 'U1000000035', '2026-04-21 20:30:00', NULL),
(36, 'iris.west@example.com', '$2b$12$dummyhash...', 'Iris West', '@irisw', 'U1000000036', '2026-04-21 20:30:00', NULL),
(37, 'jack.bauer@example.com', '$2b$12$dummyhash...', 'Jack Bauer', '@jackb', 'U1000000037', '2026-04-21 20:30:00', NULL),
(38, 'kate.austen@example.com', '$2b$12$dummyhash...', 'Kate Austen', '@katea', 'U1000000038', '2026-04-21 20:30:00', NULL),
(39, 'luke.skywalker@example.com', '$2b$12$dummyhash...', 'Luke Skywalker', '@lukes', 'U1000000039', '2026-04-21 20:30:00', NULL),
(40, 'mary.jane@example.com', '$2b$12$dummyhash...', 'Mary Jane', '@maryj', 'U1000000040', '2026-04-21 20:30:00', NULL),
(41, 'ned.stark@example.com', '$2b$12$dummyhash...', 'Ned Stark', '@neds', 'U1000000041', '2026-04-21 20:30:00', NULL);

-- Assign the role to the users
INSERT INTO `user_role` (`user_id`, `role_id`, `start_date`, `end_date`) VALUES
(2, 3, '2026-04-21 20:30:00.000000', NULL), (3, 3, '2026-04-21 20:30:00.000000', NULL),
(4, 3, '2026-04-21 20:30:00.000000', NULL), (5, 3, '2026-04-21 20:30:00.000000', NULL),
(6, 3, '2026-04-21 20:30:00.000000', NULL), (7, 3, '2026-04-21 20:30:00.000000', NULL),
(8, 3, '2026-04-21 20:30:00.000000', NULL), (9, 3, '2026-04-21 20:30:00.000000', NULL),
(10, 3, '2026-04-21 20:30:00.000000', NULL), (11, 3, '2026-04-21 20:30:00.000000', NULL),
(12, 3, '2026-04-21 20:30:00.000000', NULL), (13, 3, '2026-04-21 20:30:00.000000', NULL),
(14, 3, '2026-04-21 20:30:00.000000', NULL), (15, 3, '2026-04-21 20:30:00.000000', NULL),
(16, 3, '2026-04-21 20:30:00.000000', NULL), (17, 3, '2026-04-21 20:30:00.000000', NULL),
(18, 3, '2026-04-21 20:30:00.000000', NULL), (19, 3, '2026-04-21 20:30:00.000000', NULL),
(20, 3, '2026-04-21 20:30:00.000000', NULL), (21, 3, '2026-04-21 20:30:00.000000', NULL),
(22, 3, '2026-04-21 20:30:00.000000', NULL), (23, 3, '2026-04-21 20:30:00.000000', NULL),
(24, 3, '2026-04-21 20:30:00.000000', NULL), (25, 3, '2026-04-21 20:30:00.000000', NULL),
(26, 3, '2026-04-21 20:30:00.000000', NULL), (27, 3, '2026-04-21 20:30:00.000000', NULL),
(28, 3, '2026-04-21 20:30:00.000000', NULL), (29, 3, '2026-04-21 20:30:00.000000', NULL),
(30, 3, '2026-04-21 20:30:00.000000', NULL), (31, 3, '2026-04-21 20:30:00.000000', NULL),
(32, 3, '2026-04-21 20:30:00.000000', NULL), (33, 3, '2026-04-21 20:30:00.000000', NULL),
(34, 3, '2026-04-21 20:30:00.000000', NULL), (35, 3, '2026-04-21 20:30:00.000000', NULL),
(36, 3, '2026-04-21 20:30:00.000000', NULL), (37, 3, '2026-04-21 20:30:00.000000', NULL),
(38, 3, '2026-04-21 20:30:00.000000', NULL), (39, 3, '2026-04-21 20:30:00.000000', NULL),
(40, 3, '2026-04-21 20:30:00.000000', NULL), (41, 3, '2026-04-21 20:30:00.000000', NULL);

-- Add users to the teams
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(2, 1, '2026-04-21', NULL), (3, 1, '2026-04-21', NULL), (4, 1, '2026-04-21', NULL), 
(5, 1, '2026-04-21', NULL), (6, 1, '2026-04-21', NULL), (7, 1, '2026-04-21', NULL);

-- Team 2: Sea Lion (6 users)
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(8, 2, '2026-04-21', NULL), (9, 2, '2026-04-21', NULL), (10, 2, '2026-04-21', NULL), 
(11, 2, '2026-04-21', NULL), (12, 2, '2026-04-21', NULL), (13, 2, '2026-04-21', NULL);

-- Team 3: Axolotl (6 users)
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(14, 3, '2026-04-21', NULL), (15, 3, '2026-04-21', NULL), (16, 3, '2026-04-21', NULL), 
(17, 3, '2026-04-21', NULL), (18, 3, '2026-04-21', NULL), (19, 3, '2026-04-21', NULL);

-- Team 4: Horse (6 users)
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(20, 4, '2026-04-21', NULL), (21, 4, '2026-04-21', NULL), (22, 4, '2026-04-21', NULL), 
(23, 4, '2026-04-21', NULL), (24, 4, '2026-04-21', NULL), (25, 4, '2026-04-21', NULL);

-- Team 5: Anemone (6 users)
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(26, 5, '2026-04-21', NULL), (27, 5, '2026-04-21', NULL), (28, 5, '2026-04-21', NULL), 
(29, 5, '2026-04-21', NULL), (30, 5, '2026-04-21', NULL), (31, 5, '2026-04-21', NULL);

-- Team 6: Capybara (5 users)
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(32, 6, '2026-04-21', NULL), (33, 6, '2026-04-21', NULL), (34, 6, '2026-04-21', NULL), 
(35, 6, '2026-04-21', NULL), (36, 6, '2026-04-21', NULL);

-- Team 7: Starfish (5 users)
INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
(37, 7, '2026-04-21', NULL), (38, 7, '2026-04-21', NULL), (39, 7, '2026-04-21', NULL), 
(40, 7, '2026-04-21', NULL), (41, 7, '2026-04-21', NULL);
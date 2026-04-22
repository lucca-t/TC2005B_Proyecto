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

-- Insert representative data for the standups for many users
INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
-- User 2
('2026-02-02', 'Built shared button component.', 'Writing Storybook docs.', 'None', 2),
('2026-02-03', 'Wrote Storybook docs.', 'Reviewing Figma for navbar.', 'None', 2),
('2026-02-04', 'Reviewed navbar Figma.', 'Implementing navbar CSS.', 'None', 2),
('2026-02-05', 'Implemented navbar CSS.', 'PR reviews.', 'None', 2),
-- User 3
('2026-02-02', 'Fixing dark mode CSS bugs.', 'Testing across browsers.', 'None', 3),
('2026-02-03', 'Browser testing complete.', 'Starting on the dropdown component.', 'None', 3),
('2026-02-04', 'Dropdown logic written.', 'Adding animations to dropdown.', 'None', 3),
('2026-02-05', 'Animations added, PR open.', 'Picking up next Jira ticket.', 'Waiting on CI build.', 3),
-- User 4
('2026-02-02', 'Updated styling on the login page.', 'Adding form validation.', 'None', 4),
('2026-02-03', 'Added Zod validation to login.', 'Writing unit tests.', 'None', 4),
('2026-02-04', 'Unit tests passing.', 'Syncing with backend on API spec.', 'None', 4),
('2026-02-05', 'API sync complete.', 'Connecting login to real endpoint.', 'None', 4),
-- User 5
('2026-02-02', 'Refactored the sidebar menu.', 'Adding accessibility tags.', 'None', 5),
('2026-02-03', 'Accessibility audit passing.', 'Merging sidebar PR.', 'None', 5),
('2026-02-04', 'Working on user profile layout.', 'Uploading mock images.', 'None', 5),
('2026-02-05', 'Profile layout done.', 'Fixing image crop bug.', 'None', 5),
-- User 6
('2026-02-02', 'Triaging frontend bugs.', 'Fixing tooltip clipping.', 'None', 6),
('2026-02-03', 'Tooltip fixed.', 'Updating typography scale.', 'None', 6),
('2026-02-04', 'Typography updated.', 'Checking mobile responsiveness.', 'None', 6),
('2026-02-05', 'Fixed mobile padding issues.', 'Sprint demo prep.', 'None', 6),
-- User 7
('2026-02-02', 'Upgraded React version.', 'Checking for deprecation warnings.', 'None', 7),
('2026-02-03', 'Fixed legacy ref warnings.', 'Testing critical paths.', 'None', 7),
('2026-02-04', 'Writing end-to-end tests for core flow.', 'Finishing E2E tests.', 'None', 7),
('2026-02-05', 'E2E tests passing in CI.', 'Helping User 2 with navbar.', 'None', 7);

INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
-- User 8
('2026-02-02', 'Optimizing Postgres queries.', 'Adding database indexes.', 'None', 8),
('2026-02-03', 'Indexes added, performance improved.', 'Reviewing Knex migrations.', 'None', 8),
('2026-02-04', 'Merged migrations.', 'Updating API documentation.', 'None', 8),
('2026-02-05', 'API docs updated.', 'Load testing the new endpoint.', 'None', 8),
-- User 9
('2026-02-02', 'Fixing GraphQL N+1 issues.', 'Implementing DataLoader.', 'None', 9),
('2026-02-03', 'DataLoader setup complete.', 'Testing nested queries.', 'None', 9),
('2026-02-04', 'Nested queries optimized.', 'Opening PR.', 'None', 9),
('2026-02-05', 'Addressed PR feedback.', 'Merging to staging.', 'None', 9),
-- User 10
('2026-02-02', 'Refactoring auth middleware.', 'Writing JWT tests.', 'None', 10),
('2026-02-03', 'JWT tests passing.', 'Adding token refresh logic.', 'None', 10),
('2026-02-04', 'Refresh logic working locally.', 'Deploying to dev environment.', 'None', 10),
('2026-02-05', 'Dev deployment verified.', 'Updating postman collection.', 'None', 10),
-- User 11
('2026-02-02', 'Building the new reporting endpoint.', 'Adding date range filters.', 'None', 11),
('2026-02-03', 'Filters implemented.', 'Adding CSV export format.', 'None', 11),
('2026-02-04', 'CSV export streaming correctly.', 'Writing unit tests.', 'None', 11),
('2026-02-05', 'Tests written.', 'Code review.', 'None', 11),
-- User 12
('2026-02-02', 'Investigating memory leak on staging.', 'Running heap snapshot.', 'None', 12),
('2026-02-03', 'Found memory leak in background job.', 'Patching the job runner.', 'None', 12),
('2026-02-04', 'Patch deployed.', 'Monitoring staging metrics.', 'None', 12),
('2026-02-05', 'Metrics look stable.', 'Closing incident ticket.', 'None', 12),
-- User 13
('2026-02-02', 'Setting up email notification service.', 'Integrating SendGrid SDK.', 'None', 13),
('2026-02-03', 'SendGrid integrated.', 'Designing HTML email templates.', 'None', 13),
('2026-02-04', 'Templates ready.', 'Testing email delivery.', 'Waiting on DNS verification.', 13),
('2026-02-05', 'DNS verified, emails sending.', 'Wrapping up PR.', 'None', 13);


INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
('2026-02-02', 'Testing AI prompt edge cases.', 'Tuning temperature settings.', 'None', 19),
('2026-02-03', 'Tuned settings for better JSON output.', 'Adding fallback logic.', 'None', 19),
('2026-02-04', 'Fallback logic handles API timeouts.', 'Syncing with Laing on workflows.', 'None', 19),
('2026-02-05', 'Workflow sync complete.', 'Prepping for ATR.', 'None', 19);
INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
('2026-02-02', '• Started mapping out the Add Endorsement Form copies to match Figma designs.', '• Sync with design team to confirm copy changes.', 'None', 14),
('2026-02-03', '• Updated copies on confirmation modal (CHANGE-86286).\n• Addressed initial PR feedback on Add endorsement input validations (CHANGE-86283).', '• Finish input validations and get PR approvals.', 'Waiting on a quick design approval for the modal.', 14),
('2026-02-04', '• Got PR approvals for input validations.\n• Started working on design feedback document.', '• Integrating shared preview component from Vaquita Squad.', 'None', 14),
('2026-02-05', '• Worked on updating our preview to use shared component developed by Vaquita Squad (CHANGE-86288).\n• Added more progress to the design feedback doc.', '• Finalize UI tasks for the sprint and prep for demos.', 'None', 14),
('2026-02-06', '• Internal Demos & Sprint retro.\n• Finalized design feedback docs.', '• Looking forward to see you all in the ATR', '', 14);
INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
('2026-02-02', '• PR reviews.\n• Planning the implementation for upload endorsement profile image (CHANGE-86382).', '• Start writing the image upload handler and validations.', 'None', 15),
('2026-02-03', '• Implemented base upload endorsement profile image.\n• Opened a bug to handle image upload errors properly and improve img preview quality.', '• Fix the preview bug and add error boundaries.', 'None', 15),
('2026-02-04', '• Started working on the fix for the image upload bug, almost done.\n• Going through testing and nits.', '• Merge the fix and check travel documents.', 'Intermittent test failures on the CI pipeline.', 15),
('2026-02-05', '• Fix merged successfully.\n• Checking travel documents for the ATR.\n• PR reviews.', '• Prep for Internal Demos and Sprint Retro.', 'None', 15),
('2026-02-06', '• Internal Demos & Sprint retro 👩‍💻.\n• Cleaned up remaining PRs.', '• Pack for the ATR ', '', 15);
INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
('2026-02-02', '• Reviewed the elections teams AI Workflow infra.\n• Set up the AI workflow environment locally.', '• Talk with Boris and Luigi to get their take on AI Workflows.', 'Local environment was dropping Ngrok connections, testing workarounds.', 16),
('2026-02-03', '• Talk with Boris and Luigi about AI Workflows.\n• Started mapping out different approaches to prompting.', '• Jam with Jen G on approaches.', 'None', 16),
('2026-02-04', '• Jam with @Jen G on current approaches, different ways to test, and next steps for AI guidance.', '• Improve documentation on prompting approaches.', 'None', 16),
('2026-02-05', '• Improved docs on different approaches to prompting.\n• Prepped notes for Sprint Retro.', '• Internal demos and wrap up sprint.', 'None', 16),
('2026-02-06', '• Internal Demos, Sprint Retro.\n• Finalized AI Guidance docs for the week.', ' ATR', 'None', 16);
INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
('2026-02-02', '• Kicked off the new AI guidance designs.\n• Gathered requirements from product.', '• Refine designs and prep for 1:1.', 'Need clarification on some edge cases for empty states.', 17),
('2026-02-03', '• 1:1 with Jen.\n• Applied feedback to the AI guidance designs.', '• Finalize v1 of the design prototypes.', 'None', 17),
('2026-02-04', '• AI guidance designs are mostly finalized.\n• Shared prototypes with the squad for async feedback.', '• Start prepping for the ATR workshop.', 'None', 17),
('2026-02-05', '• Addressed async feedback on designs.\n• Prep for ATR workshop (working on the slide deck).', '• Finish workshop prep and attend demos.', 'None', 17),
('2026-02-06', '• AI guidance designs.\n• 1:1 with Jen.\n• Prep for ATR workshop.', '• ATR next week!', 'None', 17);
INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
('2026-02-02', '• Scaffolding the initial GraphQL schema (Queries for getDailyStandups and getUserHistory).', '• Writing the GraphQL resolvers and connecting them to Postgres using DataLoader.', 'None', 18),
('2026-02-03', '• Deployed the mocked GraphQL endpoint. Frontend is unblocked.', '• Finalizing the actual database resolvers and optimizing date-range queries.', 'None', 18),
('2026-02-04', '• Resolvers are wired up and querying efficiently.\n• Zod validation is catching errors beautifully.', '• Handling edge cases in the data pipeline.', 'Need a product decision on whether to flag missing formats as "Missed" or exclude them.', 18),
('2026-02-05', '• Product decided we should flag them as "Missed". Implemented the fallback logic.\n• Writing the parsing logic to extract user IDs.', '• Moving into testing mode. Writing unit tests using Jest.', 'None', 18),
('2026-02-06', '• Redis batching is up and running. Verified it flushes correctly to the worker queue.', '• Integrating the OpenAI Node SDK for batched messages.', 'Still waiting on SecOps to securely inject the production OpenAI API keys into Kubernetes.', 18);

INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
-- User 20
('2026-02-02', 'Writing Cypress tests for login.', 'Writing tests for dashboard.', 'None', 20),
('2026-02-03', 'Dashboard tests done.', 'Adding tests to CI pipeline.', 'None', 20),
('2026-02-04', 'CI pipeline updated.', 'Triaging flaky tests.', 'None', 20),
('2026-02-05', 'Fixed flaky timing issues.', 'Reviewing PRs.', 'None', 20),
-- User 21
('2026-02-02', 'Setting up GitHub Actions.', 'Configuring build caching.', 'None', 21),
('2026-02-03', 'Build caching cut time by 30%.', 'Adding security scans to PRs.', 'None', 21),
('2026-02-04', 'Security scans active.', 'Fixing vulnerabilities found.', 'None', 21),
('2026-02-05', 'Vulnerabilities patched.', 'Documenting new CI flow.', 'None', 21),
-- User 22
('2026-02-02', 'Manual QA on the new release.', 'Filing bug reports.', 'None', 22),
('2026-02-03', 'Retesting fixed bugs.', 'Approving release candidate.', 'None', 22),
('2026-02-04', 'Release deployed.', 'Smoke testing production.', 'None', 22),
('2026-02-05', 'Production looks good.', 'Updating test plans.', 'None', 22),
-- User 23
('2026-02-02', 'Creating mock data for staging.', 'Seeding the database.', 'None', 23),
('2026-02-03', 'Staging seeded.', 'Testing edge cases with bad data.', 'None', 23),
('2026-02-04', 'Found validation holes.', 'Pairing with backend to fix.', 'None', 23),
('2026-02-05', 'Fixes merged.', 'Verifying data integrity.', 'None', 23),
-- User 24
('2026-02-02', 'Updating Dockerfiles.', 'Reducing image size.', 'None', 24),
('2026-02-03', 'Image size reduced by 40%.', 'Testing multi-stage builds.', 'None', 24),
('2026-02-04', 'Multi-stage builds working.', 'Updating deployment scripts.', 'None', 24),
('2026-02-05', 'Scripts updated.', 'Merging infrastructure PR.', 'None', 24),
-- User 25
('2026-02-02', 'Auditing API response times.', 'Creating performance dashboard.', 'None', 25),
('2026-02-03', 'Dashboard created.', 'Setting up Datadog alerts.', 'None', 25),
('2026-02-04', 'Alerts configured.', 'Simulating high traffic.', 'None', 25),
('2026-02-05', 'Traffic simulation successful.', 'Sharing results with team.', 'None', 25);

INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
-- User 26
('2026-02-02', 'Setting up Redis caching layer.', 'Testing cache hits/misses.', 'None', 26),
('2026-02-03', 'Cache hit rate at 85%.', 'Adding TTL logic.', 'None', 26),
('2026-02-04', 'TTL logic implemented.', 'Deploying to staging.', 'None', 26),
('2026-02-05', 'Monitoring staging Redis memory.', 'Fine-tuning eviction policies.', 'None', 26),
-- User 27
('2026-02-02', 'Writing data migration script.', 'Testing migration locally.', 'None', 27),
('2026-02-03', 'Local migration successful.', 'Running on staging DB.', 'None', 27),
('2026-02-04', 'Staging migration verified.', 'Prepping runbook for production.', 'None', 27),
('2026-02-05', 'Runbook approved.', 'Executing prod migration tonight.', 'None', 27),
-- User 28
('2026-02-02', 'Refactoring Node SDK for OpenAI.', 'Handling rate limits.', 'None', 28),
('2026-02-03', 'Implemented exponential backoff.', 'Testing with mock 429s.', 'None', 28),
('2026-02-04', 'Backoff working as expected.', 'Integrating with worker queue.', 'None', 28),
('2026-02-05', 'Worker queue integration done.', 'Opening PR.', 'None', 28),
-- User 29
('2026-02-02', 'Building admin analytics dashboard.', 'Writing aggregations.', 'None', 29),
('2026-02-03', 'Aggregations finished.', 'Connecting charts to API.', 'None', 29),
('2026-02-04', 'Charts rendering correctly.', 'Adding date filters to UI.', 'None', 29),
('2026-02-05', 'Date filters working.', 'Demoing to product.', 'None', 29),
-- User 30
('2026-02-02', 'Investigating slow search queries.', 'Reindexing ElasticSearch.', 'None', 30),
('2026-02-03', 'Reindexing complete.', 'Query times dropped by half.', 'None', 30),
('2026-02-04', 'Updating search mapping.', 'Adding synonym support.', 'None', 30),
('2026-02-05', 'Synonyms added.', 'Testing search accuracy.', 'None', 30),
-- User 31
('2026-02-02', 'Syncing data warehouse.', 'Fixing broken ETL pipeline.', 'None', 31),
('2026-02-03', 'Pipeline fixed.', 'Backfilling missing data.', 'None', 31),
('2026-02-04', 'Backfill 50% complete.', 'Monitoring job progress.', 'None', 31),
('2026-02-05', 'Backfill finished.', 'Validating reports.', 'None', 31);

INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
-- User 32
('2026-02-02', 'Configuring Kubernetes secrets.', 'Injecting API keys to pods.', 'None', 32),
('2026-02-03', 'API keys injected securely.', 'Testing application startup.', 'None', 32),
('2026-02-04', 'App starting correctly.', 'Updating terraform scripts.', 'None', 32),
('2026-02-05', 'Terraform applied.', 'Reviewing access logs.', 'None', 32),
-- User 33
('2026-02-02', 'IAM role audits.', 'Removing stale permissions.', 'None', 33),
('2026-02-03', 'Permissions cleaned up.', 'Implementing least privilege policies.', 'None', 33),
('2026-02-04', 'Policies applied to dev.', 'Testing dev access.', 'None', 33),
('2026-02-05', 'Applying policies to staging.', 'Monitoring for denied requests.', 'None', 33),
-- User 34
('2026-02-02', 'Setting up Cloudflare Tunnels.', 'Routing internal traffic.', 'None', 34),
('2026-02-03', 'Traffic routing successful.', 'Securing tunnel endpoints.', 'None', 34),
('2026-02-04', 'Endpoints secured with WAF.', 'Load testing tunnels.', 'None', 34),
('2026-02-05', 'Tunnels holding up well.', 'Documenting setup.', 'None', 34),
-- User 35
('2026-02-02', 'Fixing auth token expiration issue.', 'Updating middleware.', 'None', 35),
('2026-02-03', 'Middleware updated.', 'Testing token rotation.', 'None', 35),
('2026-02-04', 'Token rotation working.', 'Deploying fix.', 'None', 35),
('2026-02-05', 'Fix deployed.', 'Monitoring error rates.', 'None', 35),
-- User 36
('2026-02-02', 'Auditing third-party dependencies.', 'Updating vulnerable packages.', 'None', 36),
('2026-02-03', 'Packages updated.', 'Fixing breaking changes from major bumps.', 'None', 36),
('2026-02-04', 'Tests passing with new packages.', 'Merging PR.', 'None', 36),
('2026-02-05', 'Scanning registry for new CVEs.', 'Clear for now.', 'None', 36);

INSERT INTO `standup` (`date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
-- User 37
('2026-02-02', 'Parsing Slack payload events.', 'Extracting user mentions.', 'None', 37),
('2026-02-03', 'Mentions extracted.', 'Saving raw text to database.', 'None', 37),
('2026-02-04', 'Database insertion working.', 'Handling duplicate events.', 'None', 37),
('2026-02-05', 'Idempotency keys added.', 'Ready for staging.', 'None', 37),
-- User 38
('2026-02-02', 'Handling Slack webhook events.', 'Setting up Express route.', 'None', 38),
('2026-02-03', 'Route configured.', 'Passing URL verification challenge.', 'None', 38),
('2026-02-04', 'Challenge passed.', 'Logging incoming data.', 'None', 38),
('2026-02-05', 'Logs looking clean.', 'Connecting to worker queue.', 'None', 38),
-- User 39
('2026-02-02', 'Writing Slack UI blocks for messages.', 'Testing block kit builder.', 'None', 39),
('2026-02-03', 'Interactive buttons added.', 'Handling button click payloads.', 'None', 39),
('2026-02-04', 'Payloads routing correctly.', 'Updating UI based on action.', 'None', 39),
('2026-02-05', 'UI updates smoothly.', 'Finalizing user flows.', 'None', 39),
-- User 40
('2026-02-02', 'Testing local dev environment.', 'Setting up Ngrok.', 'None', 40),
('2026-02-03', 'Ngrok dropping connections.', 'Upgrading tunnel setup.', 'Ngrok issues.', 40),
('2026-02-04', 'Switched to Cloudflare.', 'Stable connection achieved.', 'None', 40),
('2026-02-05', 'Testing webhook delivery locally.', 'Working perfectly.', 'None', 40),
-- User 41
('2026-02-02', 'Researching Slack API limits.', 'Documenting rate limits.', 'None', 41),
('2026-02-03', 'Limits documented.', 'Comparing Events API vs Webhooks.', 'None', 41),
('2026-02-04', 'Decided on Events API.', 'Writing architecture decision record.', 'None', 41),
('2026-02-05', 'ADR submitted for review.', 'Starting implementation skeleton.', 'None', 41);

-- Test data for projects
INSERT INTO `project` (`name`, `description`, `start_date`, `end_date`, `status`, `project_state`, `team_id`) VALUES
('Shared UI Component Library', 'Building and documenting reusable React components (Buttons, Navbars, Dropdowns) in Storybook.', '2026-01-10', '2026-03-15', 'active', 'in_progress', 1),
('Auth Frontend Revamp', 'Updating the login page layout, dark mode support, and adding Zod client-side validations.', '2026-01-20', '2026-02-28', 'active', 'in_progress', 1),

('GraphQL Performance Optimization', 'Resolving N+1 query issues using DataLoader and optimizing core Postgres indexes.', '2026-01-15', '2026-02-20', 'active', 'in_progress', 2),
('Core Reporting API', 'Developing the new data reporting endpoints with CSV export streaming and date range filters.', '2026-01-25', '2026-03-01', 'active', 'in_progress', 2),

('AI Standup Guidance', 'Prototyping and implementing AI workflows to guide users in writing better standups based on Slack history.', '2026-01-05', '2026-04-01', 'active', 'in_progress', 3),
('User Endorsement System', 'Building the Add Endorsement Form, including UI, validations, and profile image upload handling.', '2026-01-15', '2026-02-15', 'active', 'in_progress', 3),

('Automated E2E Testing', 'Implementing comprehensive Cypress tests for core flows and integrating them into the GitHub Actions CI pipeline.', '2026-01-10', '2026-03-10', 'active', 'in_progress', 4),
('Docker Infrastructure Overhaul', 'Reducing image sizes via multi-stage builds and updating deployment scripts for staging and production.', '2026-01-20', '2026-02-28', 'active', 'in_progress', 4),

('Redis Caching Layer', 'Implementing a centralized Redis cache to reduce database load and buffer OpenAI API requests to avoid rate limits.', '2026-01-15', '2026-02-28', 'active', 'in_progress', 5),
('Admin Analytics Dashboard', 'Building complex data aggregations and ETL pipelines to power the new internal admin charts.', '2026-01-20', '2026-03-15', 'active', 'in_progress', 5),

('Zero Trust Security Audit', 'Auditing IAM roles, enforcing least privilege policies, and securing Kubernetes secrets for API keys.', '2026-01-05', '2026-03-01', 'active', 'in_progress', 6),
('Secure Tunneling Migration', 'Replacing local dev tunnels with secure Cloudflare Tunnels and setting up WAF rules for inbound traffic.', '2026-01-25', '2026-02-20', 'active', 'in_progress', 6),

('Slack Real-time Ingestion', 'Setting up the Slack Events API to capture, parse, and securely store user message payloads in real-time.', '2026-01-10', '2026-03-15', 'active', 'in_progress', 7),
('Slack Interactive UI', 'Building out the Block Kit interfaces, handling webhook challenges, and routing button click payloads.', '2026-01-15', '2026-03-01', 'active', 'in_progress', 7);
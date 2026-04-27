    -- phpMyAdmin SQL Dump
    -- version 5.2.1
    -- https://www.phpmyadmin.net/
    --
    -- Host: 127.0.0.1
    -- Generation Time: Apr 22, 2026 at 07:52 PM
    -- Server version: 10.4.32-MariaDB
    -- PHP Version: 8.2.12

    SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
    START TRANSACTION;
    SET time_zone = "+00:00";

    -- Truncate tables to avoid duplicate key errors on re-run
    SET FOREIGN_KEY_CHECKS = 0;

    DELETE FROM project_report;
    DELETE FROM report;
    DELETE FROM report_standup;
    DELETE FROM highlights;
    DELETE FROM standup_project;
    DELETE FROM user_team;
    DELETE FROM user_role;
    DELETE FROM standup;
    DELETE FROM project;
    DELETE FROM user;
    DELETE FROM team;

    SET FOREIGN_KEY_CHECKS = 1;

    --
    -- Dumping data for table `team`
    --

    INSERT INTO `team` (`team_id`, `team_name`, `team_start_date`, `deleted_at`) VALUES
    (1, 'Vaquita', '2026-04-21', NULL),
    (2, 'Sea Lion', '2026-04-21', NULL),
    (3, 'Axolotl', '2026-04-21', NULL),
    (4, 'Horse', '2026-04-21', NULL),
    (5, 'Anemone', '2026-04-21', NULL),
    (6, 'Capybara', '2026-04-21', NULL),
    (7, 'Starfish', '2026-04-21', NULL);
    --
    -- Dumping data for table `user`
    --

    INSERT INTO `user` (`user_id`, `email`, `password`, `full_name`, `slack_handle`, `slack_id`, `created_at`, `deleted_at`) VALUES
    (1, 'sd@example.com', '$2b$12$GfBKWs2krI3TVUMGw75oeuXLg03ZRg1Is2TsmAvtT/YL4lozTXUje', 'sd User', '@sd', 'U1000000001', NOW(), NULL),
    (44, 'admin', '$2b$12$GfBKWs2krI3TVUMGw75oeuXLg03ZRg1Is2TsmAvtT/YL4lozTXUje', 'Administrator', '@admin', 'U0000000000', NOW(), NULL),
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
    (41, 'ned.stark@example.com', '$2b$12$dummyhash...', 'Ned Stark', '@neds', 'U1000000041', '2026-04-21 20:30:00', NULL),
    (42, 'leadmember@gmail.com', '$2b$12$xDMNiDBOfb0Sax.C5WOOaeAmpYUx0PthvL2/nVOsEZxncAt57BmwW', 'Lead Member', '@leadmember', '89641981968', '2026-04-22 11:44:30', NULL),
    (43, 'member@gmail.com', '$2b$12$4SUpjQWfQLYklC.H.NgnV.Sgw8m/.cUOZQIHPxmgl0aRMpe1L0Pfy', 'John Appleseed', '@applejohn', '15665165165', '2026-04-22 11:45:27', NULL);

    --
    -- Dumping data for table `project`
    --

    INSERT INTO `project` (`project_id`, `name`, `description`, `start_date`, `end_date`, `status`, `created_at`, `project_state`, `team_id`) VALUES
    (1, 'Shared UI Component Library', 'Building and documenting reusable React components (Buttons, Navbars, Dropdowns) in Storybook.', '2026-01-10', '2026-03-15', 'active', '2026-04-22 11:43:23', 'in_progress', 1),
    (2, 'Auth Frontend Revamp', 'Updating the login page layout, dark mode support, and adding Zod client-side validations.', '2026-01-20', '2026-02-28', 'active', '2026-04-22 11:43:23', 'in_progress', 1),
    (3, 'GraphQL Performance Optimization', 'Resolving N+1 query issues using DataLoader and optimizing core Postgres indexes.', '2026-01-15', '2026-02-20', 'active', '2026-04-22 11:43:23', 'in_progress', 2),
    (4, 'Core Reporting API', 'Developing the new data reporting endpoints with CSV export streaming and date range filters.', '2026-01-25', '2026-03-01', 'active', '2026-04-22 11:43:23', 'in_progress', 2),
    (5, 'AI Standup Guidance', 'Prototyping and implementing AI workflows to guide users in writing better standups based on Slack history.', '2026-01-05', '2026-04-01', 'active', '2026-04-22 11:43:23', 'in_progress', 3),
    (6, 'User Endorsement System', 'Building the Add Endorsement Form, including UI, validations, and profile image upload handling.', '2026-01-15', '2026-02-15', 'active', '2026-04-22 11:43:23', 'in_progress', 3),
    (7, 'Automated E2E Testing', 'Implementing comprehensive Cypress tests for core flows and integrating them into the GitHub Actions CI pipeline.', '2026-01-10', '2026-03-10', 'active', '2026-04-22 11:43:23', 'in_progress', 4),
    (8, 'Docker Infrastructure Overhaul', 'Reducing image sizes via multi-stage builds and updating deployment scripts for staging and production.', '2026-01-20', '2026-02-28', 'active', '2026-04-22 11:43:23', 'in_progress', 4),
    (9, 'Redis Caching Layer', 'Implementing a centralized Redis cache to reduce database load and buffer OpenAI API requests to avoid rate limits.', '2026-01-15', '2026-02-28', 'active', '2026-04-22 11:43:23', 'in_progress', 5),
    (10, 'Admin Analytics Dashboard', 'Building complex data aggregations and ETL pipelines to power the new internal admin charts.', '2026-01-20', '2026-03-15', 'active', '2026-04-22 11:43:23', 'in_progress', 5),
    (11, 'Zero Trust Security Audit', 'Auditing IAM roles, enforcing least privilege policies, and securing Kubernetes secrets for API keys.', '2026-01-05', '2026-03-01', 'active', '2026-04-22 11:43:23', 'in_progress', 6),
    (12, 'Secure Tunneling Migration', 'Replacing local dev tunnels with secure Cloudflare Tunnels and setting up WAF rules for inbound traffic.', '2026-01-25', '2026-02-20', 'active', '2026-04-22 11:43:23', 'in_progress', 6),
    (13, 'Slack Real-time Ingestion', 'Setting up the Slack Events API to capture, parse, and securely store user message payloads in real-time.', '2026-01-10', '2026-03-15', 'active', '2026-04-22 11:43:23', 'in_progress', 7),
    (14, 'Slack Interactive UI', 'Building out the Block Kit interfaces, handling webhook challenges, and routing button click payloads.', '2026-01-15', '2026-03-01', 'active', '2026-04-22 11:43:23', 'in_progress', 7);


    --
    -- Dumping data for table `standup`
    --

    INSERT INTO `standup` (`standup_id`, `date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
    (1, '2026-02-02', 'Built shared button component.', 'Writing Storybook docs.', 'None', 2),
    (2, '2026-02-03', 'Wrote Storybook docs.', 'Reviewing Figma for navbar.', 'None', 2),
    (3, '2026-02-04', 'Reviewed navbar Figma.', 'Implementing navbar CSS.', 'None', 2),
    (4, '2026-02-05', 'Implemented navbar CSS.', 'PR reviews.', 'None', 2),
    (5, '2026-02-02', 'Fixing dark mode CSS bugs.', 'Testing across browsers.', 'None', 3),
    (6, '2026-02-03', 'Browser testing complete.', 'Starting on the dropdown component.', 'None', 3),
    (7, '2026-02-04', 'Dropdown logic written.', 'Adding animations to dropdown.', 'None', 3),
    (8, '2026-02-05', 'Animations added, PR open.', 'Picking up next Jira ticket.', 'Waiting on CI build.', 3),
    (9, '2026-02-02', 'Updated styling on the login page.', 'Adding form validation.', 'None', 4),
    (10, '2026-02-03', 'Added Zod validation to login.', 'Writing unit tests.', 'None', 4),
    (11, '2026-02-04', 'Unit tests passing.', 'Syncing with backend on API spec.', 'None', 4),
    (12, '2026-02-05', 'API sync complete.', 'Connecting login to real endpoint.', 'None', 4),
    (13, '2026-02-02', 'Refactored the sidebar menu.', 'Adding accessibility tags.', 'None', 5),
    (14, '2026-02-03', 'Accessibility audit passing.', 'Merging sidebar PR.', 'None', 5),
    (15, '2026-02-04', 'Working on user profile layout.', 'Uploading mock images.', 'None', 5),
    (16, '2026-02-05', 'Profile layout done.', 'Fixing image crop bug.', 'None', 5),
    (17, '2026-02-02', 'Triaging frontend bugs.', 'Fixing tooltip clipping.', 'None', 6),
    (18, '2026-02-03', 'Tooltip fixed.', 'Updating typography scale.', 'None', 6),
    (19, '2026-02-04', 'Typography updated.', 'Checking mobile responsiveness.', 'None', 6),
    (20, '2026-02-05', 'Fixed mobile padding issues.', 'Sprint demo prep.', 'None', 6),
    (21, '2026-02-02', 'Upgraded React version.', 'Checking for deprecation warnings.', 'None', 7),
    (22, '2026-02-03', 'Fixed legacy ref warnings.', 'Testing critical paths.', 'None', 7),
    (23, '2026-02-04', 'Writing end-to-end tests for core flow.', 'Finishing E2E tests.', 'None', 7),
    (24, '2026-02-05', 'E2E tests passing in CI.', 'Helping User 2 with navbar.', 'None', 7),
    (25, '2026-02-02', 'Optimizing Postgres queries.', 'Adding database indexes.', 'None', 8),
    (26, '2026-02-03', 'Indexes added, performance improved.', 'Reviewing Knex migrations.', 'None', 8),
    (27, '2026-02-04', 'Merged migrations.', 'Updating API documentation.', 'None', 8),
    (28, '2026-02-05', 'API docs updated.', 'Load testing the new endpoint.', 'None', 8),
    (29, '2026-02-02', 'Fixing GraphQL N+1 issues.', 'Implementing DataLoader.', 'None', 9),
    (30, '2026-02-03', 'DataLoader setup complete.', 'Testing nested queries.', 'None', 9),
    (31, '2026-02-04', 'Nested queries optimized.', 'Opening PR.', 'None', 9),
    (32, '2026-02-05', 'Addressed PR feedback.', 'Merging to staging.', 'None', 9),
    (33, '2026-02-02', 'Refactoring auth middleware.', 'Writing JWT tests.', 'None', 10),
    (34, '2026-02-03', 'JWT tests passing.', 'Adding token refresh logic.', 'None', 10),
    (35, '2026-02-04', 'Refresh logic working locally.', 'Deploying to dev environment.', 'None', 10),
    (36, '2026-02-05', 'Dev deployment verified.', 'Updating postman collection.', 'None', 10),
    (37, '2026-02-02', 'Building the new reporting endpoint.', 'Adding date range filters.', 'None', 11),
    (38, '2026-02-03', 'Filters implemented.', 'Adding CSV export format.', 'None', 11),
    (39, '2026-02-04', 'CSV export streaming correctly.', 'Writing unit tests.', 'None', 11),
    (40, '2026-02-05', 'Tests written.', 'Code review.', 'None', 11),
    (41, '2026-02-02', 'Investigating memory leak on staging.', 'Running heap snapshot.', 'None', 12),
    (42, '2026-02-03', 'Found memory leak in background job.', 'Patching the job runner.', 'None', 12),
    (43, '2026-02-04', 'Patch deployed.', 'Monitoring staging metrics.', 'None', 12),
    (44, '2026-02-05', 'Metrics look stable.', 'Closing incident ticket.', 'None', 12),
    (45, '2026-02-02', 'Setting up email notification service.', 'Integrating SendGrid SDK.', 'None', 13),
    (46, '2026-02-03', 'SendGrid integrated.', 'Designing HTML email templates.', 'None', 13),
    (47, '2026-02-04', 'Templates ready.', 'Testing email delivery.', 'Waiting on DNS verification.', 13),
    (48, '2026-02-05', 'DNS verified, emails sending.', 'Wrapping up PR.', 'None', 13),
    (49, '2026-02-02', 'Testing AI prompt edge cases.', 'Tuning temperature settings.', 'None', 19),
    (50, '2026-02-03', 'Tuned settings for better JSON output.', 'Adding fallback logic.', 'None', 19),
    (51, '2026-02-04', 'Fallback logic handles API timeouts.', 'Syncing with Laing on workflows.', 'None', 19),
    (52, '2026-02-05', 'Workflow sync complete.', 'Prepping for ATR.', 'None', 19),
    (53, '2026-02-02', '• Started mapping out the Add Endorsement Form copies to match Figma designs.', '• Sync with design team to confirm copy changes.', 'None', 14),
    (54, '2026-02-03', '• Updated copies on confirmation modal (CHANGE-86286).\n• Addressed initial PR feedback on Add endorsement input validations (CHANGE-86283).', '• Finish input validations and get PR approvals.', 'Waiting on a quick design approval for the modal.', 14),
    (55, '2026-02-04', '• Got PR approvals for input validations.\n• Started working on design feedback document.', '• Integrating shared preview component from Vaquita Squad.', 'None', 14),
    (56, '2026-02-05', '• Worked on updating our preview to use shared component developed by Vaquita Squad (CHANGE-86288).\n• Added more progress to the design feedback doc.', '• Finalize UI tasks for the sprint and prep for demos.', 'None', 14),
    (57, '2026-02-06', '• Internal Demos & Sprint retro.\n• Finalized design feedback docs.', '• Looking forward to see you all in the ATR', '', 14),
    (58, '2026-02-02', '• PR reviews.\n• Planning the implementation for upload endorsement profile image (CHANGE-86382).', '• Start writing the image upload handler and validations.', 'None', 15),
    (59, '2026-02-03', '• Implemented base upload endorsement profile image.\n• Opened a bug to handle image upload errors properly and improve img preview quality.', '• Fix the preview bug and add error boundaries.', 'None', 15),
    (60, '2026-02-04', '• Started working on the fix for the image upload bug, almost done.\n• Going through testing and nits.', '• Merge the fix and check travel documents.', 'Intermittent test failures on the CI pipeline.', 15),
    (61, '2026-02-05', '• Fix merged successfully.\n• Checking travel documents for the ATR.\n• PR reviews.', '• Prep for Internal Demos and Sprint Retro.', 'None', 15),
    (62, '2026-02-06', '• Internal Demos & Sprint retro ?‍?.\n• Cleaned up remaining PRs.', '• Pack for the ATR ', '', 15),
    (63, '2026-02-02', '• Reviewed the elections teams AI Workflow infra.\n• Set up the AI workflow environment locally.', '• Talk with Boris and Luigi to get their take on AI Workflows.', 'Local environment was dropping Ngrok connections, testing workarounds.', 16),
    (64, '2026-02-03', '• Talk with Boris and Luigi about AI Workflows.\n• Started mapping out different approaches to prompting.', '• Jam with Jen G on approaches.', 'None', 16),
    (65, '2026-02-04', '• Jam with @Jen G on current approaches, different ways to test, and next steps for AI guidance.', '• Improve documentation on prompting approaches.', 'None', 16),
    (66, '2026-02-05', '• Improved docs on different approaches to prompting.\n• Prepped notes for Sprint Retro.', '• Internal demos and wrap up sprint.', 'None', 16),
    (67, '2026-02-06', '• Internal Demos, Sprint Retro.\n• Finalized AI Guidance docs for the week.', ' ATR', 'None', 16),
    (68, '2026-02-02', '• Kicked off the new AI guidance designs.\n• Gathered requirements from product.', '• Refine designs and prep for 1:1.', 'Need clarification on some edge cases for empty states.', 17),
    (69, '2026-02-03', '• 1:1 with Jen.\n• Applied feedback to the AI guidance designs.', '• Finalize v1 of the design prototypes.', 'None', 17),
    (70, '2026-02-04', '• AI guidance designs are mostly finalized.\n• Shared prototypes with the squad for async feedback.', '• Start prepping for the ATR workshop.', 'None', 17),
    (71, '2026-02-05', '• Addressed async feedback on designs.\n• Prep for ATR workshop (working on the slide deck).', '• Finish workshop prep and attend demos.', 'None', 17),
    (72, '2026-02-06', '• AI guidance designs.\n• 1:1 with Jen.\n• Prep for ATR workshop.', '• ATR next week!', 'None', 17),
    (73, '2026-02-02', '• Scaffolding the initial GraphQL schema (Queries for getDailyStandups and getUserHistory).', '• Writing the GraphQL resolvers and connecting them to Postgres using DataLoader.', 'None', 18),
    (74, '2026-02-03', '• Deployed the mocked GraphQL endpoint. Frontend is unblocked.', '• Finalizing the actual database resolvers and optimizing date-range queries.', 'None', 18),
    (75, '2026-02-04', '• Resolvers are wired up and querying efficiently.\n• Zod validation is catching errors beautifully.', '• Handling edge cases in the data pipeline.', 'Need a product decision on whether to flag missing formats as \"Missed\" or exclude them.', 18),
    (76, '2026-02-05', '• Product decided we should flag them as \"Missed\". Implemented the fallback logic.\n• Writing the parsing logic to extract user IDs.', '• Moving into testing mode. Writing unit tests using Jest.', 'None', 18),
    (77, '2026-02-06', '• Redis batching is up and running. Verified it flushes correctly to the worker queue.', '• Integrating the OpenAI Node SDK for batched messages.', 'Still waiting on SecOps to securely inject the production OpenAI API keys into Kubernetes.', 18),
    (78, '2026-02-02', 'Writing Cypress tests for login.', 'Writing tests for dashboard.', 'None', 20),
    (79, '2026-02-03', 'Dashboard tests done.', 'Adding tests to CI pipeline.', 'None', 20),
    (80, '2026-02-04', 'CI pipeline updated.', 'Triaging flaky tests.', 'None', 20),
    (81, '2026-02-05', 'Fixed flaky timing issues.', 'Reviewing PRs.', 'None', 20),
    (82, '2026-02-02', 'Setting up GitHub Actions.', 'Configuring build caching.', 'None', 21),
    (83, '2026-02-03', 'Build caching cut time by 30%.', 'Adding security scans to PRs.', 'None', 21),
    (84, '2026-02-04', 'Security scans active.', 'Fixing vulnerabilities found.', 'None', 21),
    (85, '2026-02-05', 'Vulnerabilities patched.', 'Documenting new CI flow.', 'None', 21),
    (86, '2026-02-02', 'Manual QA on the new release.', 'Filing bug reports.', 'None', 22),
    (87, '2026-02-03', 'Retesting fixed bugs.', 'Approving release candidate.', 'None', 22),
    (88, '2026-02-04', 'Release deployed.', 'Smoke testing production.', 'None', 22),
    (89, '2026-02-05', 'Production looks good.', 'Updating test plans.', 'None', 22),
    (90, '2026-02-02', 'Creating mock data for staging.', 'Seeding the database.', 'None', 23),
    (91, '2026-02-03', 'Staging seeded.', 'Testing edge cases with bad data.', 'None', 23),
    (92, '2026-02-04', 'Found validation holes.', 'Pairing with backend to fix.', 'None', 23),
    (93, '2026-02-05', 'Fixes merged.', 'Verifying data integrity.', 'None', 23),
    (94, '2026-02-02', 'Updating Dockerfiles.', 'Reducing image size.', 'None', 24),
    (95, '2026-02-03', 'Image size reduced by 40%.', 'Testing multi-stage builds.', 'None', 24),
    (96, '2026-02-04', 'Multi-stage builds working.', 'Updating deployment scripts.', 'None', 24),
    (97, '2026-02-05', 'Scripts updated.', 'Merging infrastructure PR.', 'None', 24),
    (98, '2026-02-02', 'Auditing API response times.', 'Creating performance dashboard.', 'None', 25),
    (99, '2026-02-03', 'Dashboard created.', 'Setting up Datadog alerts.', 'None', 25),
    (100, '2026-02-04', 'Alerts configured.', 'Simulating high traffic.', 'None', 25),
    (101, '2026-02-05', 'Traffic simulation successful.', 'Sharing results with team.', 'None', 25),
    (102, '2026-02-02', 'Setting up Redis caching layer.', 'Testing cache hits/misses.', 'None', 26),
    (103, '2026-02-03', 'Cache hit rate at 85%.', 'Adding TTL logic.', 'None', 26),
    (104, '2026-02-04', 'TTL logic implemented.', 'Deploying to staging.', 'None', 26),
    (105, '2026-02-05', 'Monitoring staging Redis memory.', 'Fine-tuning eviction policies.', 'None', 26),
    (106, '2026-02-02', 'Writing data migration script.', 'Testing migration locally.', 'None', 27),
    (107, '2026-02-03', 'Local migration successful.', 'Running on staging DB.', 'None', 27),
    (108, '2026-02-04', 'Staging migration verified.', 'Prepping runbook for production.', 'None', 27),
    (109, '2026-02-05', 'Runbook approved.', 'Executing prod migration tonight.', 'None', 27),
    (110, '2026-02-02', 'Refactoring Node SDK for OpenAI.', 'Handling rate limits.', 'None', 28),
    (111, '2026-02-03', 'Implemented exponential backoff.', 'Testing with mock 429s.', 'None', 28),
    (112, '2026-02-04', 'Backoff working as expected.', 'Integrating with worker queue.', 'None', 28),
    (113, '2026-02-05', 'Worker queue integration done.', 'Opening PR.', 'None', 28),
    (114, '2026-02-02', 'Building admin analytics dashboard.', 'Writing aggregations.', 'None', 29),
    (115, '2026-02-03', 'Aggregations finished.', 'Connecting charts to API.', 'None', 29),
    (116, '2026-02-04', 'Charts rendering correctly.', 'Adding date filters to UI.', 'None', 29),
    (117, '2026-02-05', 'Date filters working.', 'Demoing to product.', 'None', 29),
    (118, '2026-02-02', 'Investigating slow search queries.', 'Reindexing ElasticSearch.', 'None', 30),
    (119, '2026-02-03', 'Reindexing complete.', 'Query times dropped by half.', 'None', 30),
    (120, '2026-02-04', 'Updating search mapping.', 'Adding synonym support.', 'None', 30),
    (121, '2026-02-05', 'Synonyms added.', 'Testing search accuracy.', 'None', 30),
    (122, '2026-02-02', 'Syncing data warehouse.', 'Fixing broken ETL pipeline.', 'None', 31),
    (123, '2026-02-03', 'Pipeline fixed.', 'Backfilling missing data.', 'None', 31),
    (124, '2026-02-04', 'Backfill 50% complete.', 'Monitoring job progress.', 'None', 31),
    (125, '2026-02-05', 'Backfill finished.', 'Validating reports.', 'None', 31),
    (126, '2026-02-02', 'Configuring Kubernetes secrets.', 'Injecting API keys to pods.', 'None', 32),
    (127, '2026-02-03', 'API keys injected securely.', 'Testing application startup.', 'None', 32),
    (128, '2026-02-04', 'App starting correctly.', 'Updating terraform scripts.', 'None', 32),
    (129, '2026-02-05', 'Terraform applied.', 'Reviewing access logs.', 'None', 32),
    (130, '2026-02-02', 'IAM role audits.', 'Removing stale permissions.', 'None', 33),
    (131, '2026-02-03', 'Permissions cleaned up.', 'Implementing least privilege policies.', 'None', 33),
    (132, '2026-02-04', 'Policies applied to dev.', 'Testing dev access.', 'None', 33),
    (133, '2026-02-05', 'Applying policies to staging.', 'Monitoring for denied requests.', 'None', 33),
    (134, '2026-02-02', 'Setting up Cloudflare Tunnels.', 'Routing internal traffic.', 'None', 34),
    (135, '2026-02-03', 'Traffic routing successful.', 'Securing tunnel endpoints.', 'None', 34),
    (136, '2026-02-04', 'Endpoints secured with WAF.', 'Load testing tunnels.', 'None', 34),
    (137, '2026-02-05', 'Tunnels holding up well.', 'Documenting setup.', 'None', 34),
    (138, '2026-02-02', 'Fixing auth token expiration issue.', 'Updating middleware.', 'None', 35),
    (139, '2026-02-03', 'Middleware updated.', 'Testing token rotation.', 'None', 35),
    (140, '2026-02-04', 'Token rotation working.', 'Deploying fix.', 'None', 35),
    (141, '2026-02-05', 'Fix deployed.', 'Monitoring error rates.', 'None', 35),
    (142, '2026-02-02', 'Auditing third-party dependencies.', 'Updating vulnerable packages.', 'None', 36),
    (143, '2026-02-03', 'Packages updated.', 'Fixing breaking changes from major bumps.', 'None', 36),
    (144, '2026-02-04', 'Tests passing with new packages.', 'Merging PR.', 'None', 36),
    (145, '2026-02-05', 'Scanning registry for new CVEs.', 'Clear for now.', 'None', 36),
    (146, '2026-02-02', 'Parsing Slack payload events.', 'Extracting user mentions.', 'None', 37),
    (147, '2026-02-03', 'Mentions extracted.', 'Saving raw text to database.', 'None', 37),
    (148, '2026-02-04', 'Database insertion working.', 'Handling duplicate events.', 'None', 37),
    (149, '2026-02-05', 'Idempotency keys added.', 'Ready for staging.', 'None', 37),
    (150, '2026-02-02', 'Handling Slack webhook events.', 'Setting up Express route.', 'None', 38),
    (151, '2026-02-03', 'Route configured.', 'Passing URL verification challenge.', 'None', 38),
    (152, '2026-02-04', 'Challenge passed.', 'Logging incoming data.', 'None', 38),
    (153, '2026-02-05', 'Logs looking clean.', 'Connecting to worker queue.', 'None', 38),
    (154, '2026-02-02', 'Writing Slack UI blocks for messages.', 'Testing block kit builder.', 'None', 39),
    (155, '2026-02-03', 'Interactive buttons added.', 'Handling button click payloads.', 'None', 39),
    (156, '2026-02-04', 'Payloads routing correctly.', 'Updating UI based on action.', 'None', 39),
    (157, '2026-02-05', 'UI updates smoothly.', 'Finalizing user flows.', 'None', 39),
    (158, '2026-02-02', 'Testing local dev environment.', 'Setting up Ngrok.', 'None', 40),
    (159, '2026-02-03', 'Ngrok dropping connections.', 'Upgrading tunnel setup.', 'Ngrok issues.', 40),
    (160, '2026-02-04', 'Switched to Cloudflare.', 'Stable connection achieved.', 'None', 40),
    (161, '2026-02-05', 'Testing webhook delivery locally.', 'Working perfectly.', 'None', 40),
    (162, '2026-02-02', 'Researching Slack API limits.', 'Documenting rate limits.', 'None', 41),
    (163, '2026-02-03', 'Limits documented.', 'Comparing Events API vs Webhooks.', 'None', 41),
    (164, '2026-02-04', 'Decided on Events API.', 'Writing architecture decision record.', 'None', 41),
    (165, '2026-02-05', 'ADR submitted for review.', 'Starting implementation skeleton.', 'None', 41),
    (166, '2026-02-02', '• Architected the fallback mechanism for the Daily Standup+ AI pipeline when the LLM hallucinates block structure.\n• Pair programmed with Jordan to review the AST traversal logic for Slack payloads.', '• Syncing with the Sea Lion team to ensure our GraphQL resolvers can handle the new nested AI metadata.\n• Reviewing PRs for the endorsement system.', 'Waiting on DevOps to increase our dev environment memory limits; the local Redis cluster is OOM crashing.', 42),
    (167, '2026-02-03', '• Resolved the OOM crashes by implementing a sliding window cache eviction policy in Redis.\n• Cross-team sync with backend on GraphQL performance under load.', '• Deep diving into Node.js memory profiling. We have a suspected memory leak in the worker queue consumer when processing large image uploads for the Endorsement Form.', 'None', 42),
    (168, '2026-02-04', '• Traced the memory leak to an unclosed buffer stream in the image parsing middleware; patched and deployed to staging.\n• Led the architectural review for the new AI Prompt Pipeline to handle larger context windows without token truncation.', '• Load testing the patched worker queue.\n• Drafting the technical roadmap slides for the ATR workshop.', 'None', 42),
    (169, '2026-02-05', '• Analyzed load test results: processing throughput increased by 40% with the memory patch.\n• Finalized the ATR technical roadmap slides.\n• 1:1s with squad members.', '• Wrap up sprint, Internal Demos, and Retro.', 'Need product clarification on how we handle GDPR deletion requests within the cached LLM summaries.', 42),
    (170, '2026-02-06', '• Internal Demos & Sprint retro.\n• Drafted an ADR (Architecture Decision Record) for our PII sanitization strategy before sending data to OpenAI.', '• Packing and traveling for the ATR ✈️', 'None', 42),
    (171, '2026-02-02', '• Rewrote the AST traversal logic that strips PII (Personally Identifiable Information) from raw Slack messages before sending them to the LLM.\n• Wrote a custom streaming parser for the OpenAI response to improve perceived latency on the UI.', '• Testing the streaming parser against edge cases where the LLM sends malformed JSON chunks.', 'Regex for identifying internal project codes as PII is catching false positives; need to refine the pattern.', 43),
    (172, '2026-02-03', '• Refined the PII regex engine using a trie-based lookup instead of raw regex, cutting sanitization time by 60%.\n• Investigated a race condition in the Redis batching logic where concurrent worker nodes were duplicating standup summaries.', '• Implement a distributed lock using Redlock to fix the worker queue race condition.', 'None', 43),
    (173, '2026-02-04', '• Distributed locking implemented. Simulated heavy concurrent load locally and verified zero duplicate summaries.\n• Load testing the Express webhook endpoints using Artillery. Found a bottleneck in JSON serialization.', '• Replacing native JSON.stringify with fast-json-stringify for our hottest webhook endpoints.', 'None', 43),
    (174, '2026-02-05', '• Implemented fast-json-stringify, endpoint p99 latency dropped from 120ms to 45ms.\n• Discovered and fixed a critical bug where the Endorsement System was attaching the wrong `user_id` foreign keys due to an async closure trap.', '• Write regression tests for the async closure bug.\n• Demo prep.', 'None', 43),
    (175, '2026-02-06', '• Merged regression tests.\n• Presented the latency optimization metrics during the Internal Demo.\n• Handled a few minor bug tickets from the backlog.', '• Out of office for ATR next week!', 'None', 43),
    (176, '2026-02-02', '• Provisioned the isolated VPC for the new OpenAI proxy service to ensure SOC2 compliance.\n• Configured cross-account IAM roles to unblock the backend team\'s staging deployments.', '• Reviewing the database scaling strategy for the Redis batching logic.\n• Sync with Legal regarding data retention policies for AI-generated summaries.', 'Waiting on Legal to approve the 30-day retention window for raw Slack payloads.', 1),
    (177, '2026-02-03', '• Legal approved the retention policy. Wrote a PostgreSQL stored procedure to automatically purge raw Slack messages older than 30 days.\n• Assisted Alex (@alexl) with the Redis OOM crashes by allocating a larger memory tier and tweaking the maxmemory-policy at the cluster level.', '• Auditing the PostgreSQL logs to ensure PII isn\'t persisting past the intended window.\n• Setting up Datadog monitors for the new GraphQL resolvers.', 'None', 1),
    (178, '2026-02-04', '• Datadog monitors are live and alerting correctly.\n• Paired with Jordan (@jordanc) to validate that the async closure bug wasn\'t causing data corruption at the database level. Ran integrity checks on the `user_team` foreign keys.', '• Prepping the admin deployment pipelines and establishing the code freeze protocol for the All Team Retreat (ATR).', 'None', 1),
    (179, '2026-02-05', '• Locked down production branch merges ahead of the ATR.\n• Conducted a final security sweep on the GraphQL endpoint using an automated pentesting suite. Passed with zero critical vulnerabilities.', '• Sprint retro.\n• Presenting the Q1 Infrastructure Health Report during the Internal Demos.', 'None', 1),
    (180, '2026-02-06', '• Sprint Retro. Internal Demos went smoothly; the p99 latency improvements from the team look great on the Datadog dashboards.\n• Handed off the critical escalation pager to the offshore SRE team.', '• Heading to the ATR ✈️?.', 'None', 1);



    --
    -- Dumping data for table `user_role`
    --

    INSERT INTO `user_role` (`user_id`, `role_id`, `start_date`, `end_date`) VALUES
    (1, 1, '2026-04-22 02:30:00.000000', NULL),
    (44, 1, '2026-04-22 02:30:00.000000', NULL),
    (2, 3, '2026-04-22 02:30:00.000000', NULL),
    (3, 3, '2026-04-22 02:30:00.000000', NULL),
    (4, 3, '2026-04-22 02:30:00.000000', NULL),
    (5, 3, '2026-04-22 02:30:00.000000', NULL),
    (6, 3, '2026-04-22 02:30:00.000000', NULL),
    (7, 3, '2026-04-22 02:30:00.000000', NULL),
    (8, 3, '2026-04-22 02:30:00.000000', NULL),
    (9, 3, '2026-04-22 02:30:00.000000', NULL),
    (10, 3, '2026-04-22 02:30:00.000000', NULL),
    (11, 3, '2026-04-22 02:30:00.000000', NULL),
    (12, 3, '2026-04-22 02:30:00.000000', NULL),
    (13, 3, '2026-04-22 02:30:00.000000', NULL),
    (14, 3, '2026-04-22 02:30:00.000000', NULL),
    (15, 3, '2026-04-22 02:30:00.000000', NULL),
    (16, 3, '2026-04-22 02:30:00.000000', NULL),
    (17, 3, '2026-04-22 02:30:00.000000', NULL),
    (18, 3, '2026-04-22 02:30:00.000000', NULL),
    (19, 3, '2026-04-22 02:30:00.000000', NULL),
    (20, 3, '2026-04-22 02:30:00.000000', NULL),
    (21, 3, '2026-04-22 02:30:00.000000', NULL),
    (22, 3, '2026-04-22 02:30:00.000000', NULL),
    (23, 3, '2026-04-22 02:30:00.000000', NULL),
    (24, 3, '2026-04-22 02:30:00.000000', NULL),
    (25, 3, '2026-04-22 02:30:00.000000', NULL),
    (26, 3, '2026-04-22 02:30:00.000000', NULL),
    (27, 3, '2026-04-22 02:30:00.000000', NULL),
    (28, 3, '2026-04-22 02:30:00.000000', NULL),
    (29, 3, '2026-04-22 02:30:00.000000', NULL),
    (30, 3, '2026-04-22 02:30:00.000000', NULL),
    (31, 3, '2026-04-22 02:30:00.000000', NULL),
    (32, 3, '2026-04-22 02:30:00.000000', NULL),
    (33, 3, '2026-04-22 02:30:00.000000', NULL),
    (34, 3, '2026-04-22 02:30:00.000000', NULL),
    (35, 3, '2026-04-22 02:30:00.000000', NULL),
    (36, 3, '2026-04-22 02:30:00.000000', NULL),
    (37, 3, '2026-04-22 02:30:00.000000', NULL),
    (38, 3, '2026-04-22 02:30:00.000000', NULL),
    (39, 3, '2026-04-22 02:30:00.000000', NULL),
    (40, 3, '2026-04-22 02:30:00.000000', NULL),
    (41, 3, '2026-04-22 02:30:00.000000', NULL),
    (42, 3, '2026-04-22 17:44:30.348353', NULL),
    (43, 3, '2026-04-22 17:45:27.186337', NULL);

    --
    -- Dumping data for table `user_team`
    --

    INSERT INTO `user_team` (`user_id`, `team_id`, `date_start`, `date_end`) VALUES
    (1, 3, '2026-04-22', NULL),
    (2, 1, '2026-04-21', NULL),
    (3, 1, '2026-04-21', NULL),
    (4, 1, '2026-04-21', NULL),
    (5, 1, '2026-04-21', NULL),
    (6, 1, '2026-04-21', NULL),
    (7, 1, '2026-04-21', NULL),
    (8, 2, '2026-04-21', NULL),
    (9, 2, '2026-04-21', NULL),
    (10, 2, '2026-04-21', NULL),
    (11, 2, '2026-04-21', NULL),
    (12, 2, '2026-04-21', NULL),
    (13, 2, '2026-04-21', NULL),
    (14, 3, '2026-04-22', NULL),
    (15, 3, '2026-04-22', NULL),
    (16, 3, '2026-04-22', NULL),
    (17, 3, '2026-04-22', NULL),
    (18, 3, '2026-04-22', NULL),
    (19, 3, '2026-04-22', NULL),
    (20, 4, '2026-04-21', NULL),
    (21, 4, '2026-04-21', NULL),
    (22, 4, '2026-04-21', NULL),
    (23, 4, '2026-04-21', NULL),
    (24, 4, '2026-04-21', NULL),
    (25, 4, '2026-04-21', NULL),
    (26, 5, '2026-04-21', NULL),
    (27, 5, '2026-04-21', NULL),
    (28, 5, '2026-04-21', NULL),
    (29, 5, '2026-04-21', NULL),
    (30, 5, '2026-04-21', NULL),
    (31, 5, '2026-04-21', NULL),
    (32, 6, '2026-04-21', NULL),
    (33, 6, '2026-04-21', NULL),
    (34, 6, '2026-04-21', NULL),
    (35, 6, '2026-04-21', NULL),
    (36, 6, '2026-04-21', NULL),
    (37, 7, '2026-04-21', NULL),
    (38, 7, '2026-04-21', NULL),
    (39, 7, '2026-04-21', NULL),
    (40, 7, '2026-04-21', NULL),
    (41, 7, '2026-04-21', NULL),
    (42, 3, '2026-04-22', NULL),
    (43, 3, '2026-04-22', NULL);

    ALTER TABLE `project` AUTO_INCREMENT = 15;
    ALTER TABLE `standup` AUTO_INCREMENT = 195;
    ALTER TABLE `team` AUTO_INCREMENT = 8;
    ALTER TABLE `user` AUTO_INCREMENT = 44;
    ALTER TABLE `report` AUTO_INCREMENT = 3;
    ALTER TABLE `highlights` AUTO_INCREMENT = 5;

    --
    -- Additional test data for project reports
    --

    -- Add standups for April 2026 for project 1 (Shared UI Component Library)
    INSERT INTO `standup` (`standup_id`, `date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
    (181, '2026-04-01', 'Completed button component documentation.', 'Start on navbar component.', 'None', 2),
    (182, '2026-04-02', 'Navbar component implemented.', 'Add responsive design.', 'None', 2),
    (183, '2026-04-03', 'Responsive navbar done.', 'Review PRs.', 'None', 2),
    (184, '2026-04-04', 'PR reviews completed.', 'Update Storybook.', 'None', 3),
    (185, '2026-04-05', 'Storybook updated.', 'Test across browsers.', 'None', 3),
    (186, '2026-04-06', 'Browser testing passed.', 'Prepare demo.', 'None', 3),
    (187, '2026-04-07', 'Demo presented.', 'Sprint planning.', 'None', 4);

    -- Link standups to project 1
    INSERT INTO `standup_project` (`standup_id`, `project_id`) VALUES
    (181, 1),
    (182, 1),
    (183, 1),
    (184, 1),
    (185, 1),
    (186, 1),
    (187, 1);

    -- Add highlights for project 1
    INSERT INTO `highlights` (`highlights_id`, `description`, `start_date`, `project_id`, `deleted_at`) VALUES
    (1, 'Successfully launched shared button component in production.', '2026-04-01', 1, NULL),
    (2, 'Improved component accessibility scores by 20%.', '2026-04-05', 1, NULL);

    -- Add a project report for project 1, covering April 1-7
    INSERT INTO `report` (`report_id`, `date_beginning`, `date_end`, `date_generated`, `ai_content`, `user_id`, `deleted_at`) VALUES
    (1, '2026-04-01', '2026-04-07', '2026-04-08 10:00:00', 'This week, the team focused on enhancing the Shared UI Component Library. Key achievements include completing the button and navbar components, improving accessibility, and updating documentation. The team demonstrated strong collaboration with 7 standups recorded and no blockers reported. Highlights include successful production deployment and accessibility improvements.', 1, NULL);

    -- Link report to project
    INSERT INTO `project_report` (`report_id`, `project_about`) VALUES
    (1, 1);

    -- Link report to standups
    INSERT INTO `report_standup` (`report_id`, `standup_id`) VALUES
    (1, 181),
    (1, 182),
    (1, 183),
    (1, 184),
    (1, 185),
    (1, 186),
    (1, 187);

    -- Add another report for project 2 (Auth Frontend Revamp)
    INSERT INTO `standup` (`standup_id`, `date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
    (188, '2026-04-01', 'Added dark mode toggle.', 'Implement form validation.', 'None', 4),
    (189, '2026-04-02', 'Validation implemented.', 'Test login flow.', 'None', 4),
    (190, '2026-04-03', 'Login flow tested.', 'Fix mobile layout.', 'None', 5),
    (191, '2026-04-04', 'Mobile layout fixed.', 'Code review.', 'None', 5),
    (192, '2026-04-05', 'PR merged.', 'Update styles.', 'None', 6),
    (193, '2026-04-06', 'Styles updated.', 'Final testing.', 'None', 6),
    (194, '2026-04-07', 'Testing completed.', 'Deploy to staging.', 'None', 7);

    INSERT INTO `standup_project` (`standup_id`, `project_id`) VALUES
    (188, 2),
    (189, 2),
    (190, 2),
    (191, 2),
    (192, 2),
    (193, 2),
    (194, 2);

    INSERT INTO `highlights` (`highlights_id`, `description`, `start_date`, `project_id`, `deleted_at`) VALUES
    (3, 'Dark mode support added to login page.', '2026-04-01', 2, NULL),
    (4, 'Form validation improved user experience.', '2026-04-02', 2, NULL);

    INSERT INTO `report` (`report_id`, `date_beginning`, `date_end`, `date_generated`, `ai_content`, `user_id`, `deleted_at`) VALUES
    (2, '2026-04-01', '2026-04-07', '2026-04-08 11:00:00', 'The Auth Frontend Revamp project progressed well this week. The team implemented dark mode, enhanced form validation, and fixed mobile responsiveness. All standups were completed without issues, and the project is on track for the end-of-month deadline.', 1, NULL);

    INSERT INTO `project_report` (`report_id`, `project_about`) VALUES
    (2, 2);

    INSERT INTO `report_standup` (`report_id`, `standup_id`) VALUES
    (2, 188),
    (2, 189),
    (2, 190),
    (2, 191),
    (2, 192),
    (2, 193),
    (2, 194);

    -- Add Q1 2026 standups for project 5 (AI Standup Guidance)
    INSERT INTO `standup` (`standup_id`, `date`, `did_today`, `do_tomorrow`, `blockers`, `user_id`) VALUES
    (195, '2026-01-05', 'Drafted the initial AI workflow for standup prompts.', 'Share design with the engineering team.', 'Need product validation for prompt tone.', 14),
    (196, '2026-01-12', 'Built the Slack history parser prototype.', 'Integrate user metadata extraction.', 'Waiting on Slack API scopes approval.', 16),
    (197, '2026-02-02', 'Implemented the first standup guidance model call.', 'Add fallback when the model returns incomplete JSON.', 'Model output sometimes misses blocker fields.', 17),
    (198, '2026-02-09', 'Connected the AI guidance flow to the standup editor.', 'Test with sample standup entries.', 'Need clarification on how to label task priority.', 18),
    (199, '2026-02-16', 'Added inline suggestions for yesterday/today/blockers.', 'Improve prompt quality for shorter responses.', 'UX review requested before merging.', 19),
    (200, '2026-03-01', 'Validated AI-generated standup suggestions with the product team.', 'Create fallback messaging when the LLM is unavailable.', 'Pending legal review on data usage wording.', 42),
    (201, '2026-03-08', 'Added error handling for incomplete Slack message payloads.', 'Document the AI guidance workflow for the squad.', 'Investigating edge cases with multiline standups.', 43),
    (202, '2026-03-15', 'Improved the standup prompt to recommend clearer blockers.', 'Integrate analytics tracking for suggestion acceptance.', 'Still tuning the AI prompt to reduce hallucinations.', 14),
    (203, '2026-03-22', 'Worked on enhancements for user feedback collection.', 'Create a report summary view for the project.', 'Need alignment on the definition of "quality standup."', 16),
    (204, '2026-03-29', 'Finalized the AI guidance flow for Q1 release.', 'Prepare deployment notes and release plan.', 'Waiting on the security review to sign off.', 17);

    INSERT INTO `standup_project` (`standup_id`, `project_id`) VALUES
    (195, 5),
    (196, 5),
    (197, 5),
    (198, 5),
    (199, 5),
    (200, 5),
    (201, 5),
    (202, 5),
    (203, 5),
    (204, 5);

    COMMIT;
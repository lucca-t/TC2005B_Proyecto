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
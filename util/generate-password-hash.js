const bcrypt = require('bcrypt');

const plainPassword = process.argv[2];

if (!plainPassword) {
    console.error('Usage: node util/generate-password-hash.js <plain_password>');
    process.exit(1);
}

bcrypt.hash(plainPassword, 12)
    .then((hash) => {
        console.log(hash);
    })
    .catch((error) => {
        console.error('Failed to generate hash:', error.message);
        process.exit(1);
    });

/**
 * INSERT INTO User (email, password, full_name, slack_handle, slack_id)
VALUES ('admin@mail.com', 'HASH', 'admin', '@admin', '1234');
 * 
 */

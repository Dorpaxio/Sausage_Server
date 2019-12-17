const fs = require('fs');

module.exports = {
    'secret': process.env.SAUSAGE_SERVER_SECRET,

    'db_host' : process.env.SAUSAGE_SERVER_DB_HOST,
    'db_port' : process.env.SAUSAGE_SERVER_DB_PORT,
    'db_user' : process.env.SAUSAGE_SERVER_DB_USER,
    'db_password' : process.env.SAUSAGE_SERVER_DB_PASSWORD,
    'db_database' : process.env.SAUSAGE_SERVER_DB,

    'aws_secret': process.env.SAUSAGE_SERVER_AWS_SECRET,
    'aws_key': process.env.SAUSAGE_SERVER_AWS_KEY,
    'aws_region': process.env.SAUSAGE_SERVER_AWS_REGION,
}

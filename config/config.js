const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    },
    operatorAliases:false
  },
  test: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: "database_test",
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    }
  },
  production: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: "database_production",
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    }
  },
};

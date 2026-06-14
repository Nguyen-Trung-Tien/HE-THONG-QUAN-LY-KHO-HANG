require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
    database: process.env.DB_DEV_NAME,
    host: process.env.DB_DEV_HOST,
    port: process.env.DB_DEV_PORT || 3306,
    dialect: process.env.DB_DEV_DIALECT || "mysql",
    logging: false,
    // query: {
    //   raw: true,
    // },
    timezone: "+07:00",
  },
  test: {
    username: process.env.DB_TEST_USERNAME,
    password: process.env.DB_TEST_PASSWORD,
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_TEST_HOST,
    port: process.env.DB_TEST_PORT || 3306,
    dialect: process.env.DB_TEST_DIALECT || "mysql",
  },
  production: {
    use_env_variable: process.env.DATABASE_URL ? "DATABASE_URL" : undefined,
    username: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT || 3306,
    dialect: process.env.DB_PROD_DIALECT || "mysql",
    dialectOptions: process.env.DB_PROD_SSL === "true" ? {
      ssl: {
        rejectUnauthorized: process.env.DB_PROD_SSL_REJECT_UNAUTHORIZED !== "false"
      }
    } : {},
    timezone: "+07:00",
  },
};

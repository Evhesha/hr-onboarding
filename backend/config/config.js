require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_PROD;
const isProduction = process.env.NODE_ENV === "production";
const username = process.env.DB_USER || "postgres";
const password = process.env.DB_PASSWORD || "postgres";
const database = process.env.DB_NAME || process.env.DB_DATABASE || "autism_academy";
const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT || 5432);

const base = {
  dialect: "postgres",
  define: {
    underscored: true,
    timestamps: false,
  },
};

const localConfig = {
  ...base,
  username,
  password,
  database,
  host,
  port,
};


const productionConfig = databaseUrl
  ? {
      ...base,
      use_env_variable: "DATABASE_URL",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  : localConfig;

if (isProduction && !databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required in production.");
}

module.exports = {
  development: localConfig,
  test: { ...localConfig, database: `${database}_test` },
  production: productionConfig,
};

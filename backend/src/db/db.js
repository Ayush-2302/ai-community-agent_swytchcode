import mysql from "mysql2/promise";
import config from "../config/env.js";

let pool = null;

export const getConnection = async () => {
  if (pool) return pool;
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    });
    console.log("Connected to the MySQL database");
    return pool;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

export default getConnection;

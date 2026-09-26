import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const createConnection = async () => {
  try {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    console.log("Connected to the database");
    return pool;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

const connection = await createConnection();

export default connection;

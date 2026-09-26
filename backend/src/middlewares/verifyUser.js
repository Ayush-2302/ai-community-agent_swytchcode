import jwt from "jsonwebtoken";
import asyncWrapper from "../utils/asyncWrapper.js";
import ExpressError from "../utils/ExpressError.js";

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

const verifyUser = asyncWrapper(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      throw new ExpressError(403, "No token provided", false);
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      if (!decoded) {
        throw new ExpressError(403, "Invalid token", false);
      }

      req.user = decoded;
      next();
    } catch (err) {
      throw new ExpressError(403, "Failed to authenticate token", false);
    }
  });

export default verifyUser;

import jwt from "jsonwebtoken";
import asyncWrapper from "../utils/asyncWrapper.js";
import ExpressError from "../utils/ExpressError.js";
import config from "../config/env.js";

const SECRET_KEY = config.auth.jwtSecret;

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

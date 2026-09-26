import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { getNewLoginUrl } from "./controllers/googlePhotos.js";
import authRoutes from "./routes/authRoutes.js";
import certifRoutes from "./routes/certifRoute.js";
import commentRoutes from "./routes/commentRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import experienceRouter from "./routes/experienceRoute.js";
import mentorRouter from "./routes/mentorRoute.js";
import projectRouter from "./routes/projectRoute.js";
import skillRoutes from "./routes/skillRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import ExpressError from "./utils/ExpressError.js";

const app = express();

app.use(cookieParser());

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fixed path: uploads is in src/uploads
app.use("/api/images", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/experiences", experienceRouter);
app.use("/api/mentors", mentorRouter);
app.use("/api/projects", projectRouter);
app.use("/api/skills", skillRoutes);
app.use("/api/certificates", certifRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/social", socialRoutes);
app.get("/set-cookie", (req, res) => {
  res.cookie("demoCookie", "ThisIsADemoCookieValue", {
    maxAge: 3600000,
    httpOnly: true,
    secure: false,
  });
  res.send("Demo cookie has been set!");
});

app.get("/test", async (req, res) => {
  try {
    const data = await getNewLoginUrl();

    res.json({
      message: "This is a test endpoint",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

app.use((req, res, next) => {
  throw new ExpressError(404, "Page Not Found !!", false);
});

app.use((err, req, res, next) => {
  let {
    status = 500,
    message = "Internal server issue",
    success = false,
  } = err;
  res.status(status).json({ message, success });
});

export default app;

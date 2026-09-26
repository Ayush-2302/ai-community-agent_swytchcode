import fsSync from "fs";

export const ensureDirectories = (req, res, next) => {
  const dirs = ["uploads", "output"];
  dirs.forEach((dir) => {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
  });
  next();
};

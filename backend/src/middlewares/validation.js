import { body } from "express-validator";

export const signupValidation = [
  body("name", "Name is required").notEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

export const loginValidation = [
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").exists(),
];

// Validation for adding experience
export const addExperienceValidation = [
  body("company", "Company name is required").notEmpty(),
  body("location", "Location is required").notEmpty(),
  body("title", "Job title is required").notEmpty(),
  body("joinDate", "Join date must be a valid date").isDate(),
  body("lastDate")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      const date = new Date(value);
      if (isNaN(date.getTime()))
        throw new Error("Last date must be a valid date");
      return true;
    }),
  body("description", "Description is required").notEmpty(),
];

// Validation for updating experience
export const updateExperienceValidation = [
  body("company", "Company name is required").optional().notEmpty(),
  body("location", "Location is required").optional().notEmpty(),
  body("title", "Job title is required").optional().notEmpty(),
  body("joinDate", "Join date must be a valid date").optional().isDate(),
  body("lastDate")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      const date = new Date(value);
      if (isNaN(date.getTime()))
        throw new Error("Last date must be a valid date");
      return true;
    }),
  body("description", "Description is required").optional().notEmpty(),
];

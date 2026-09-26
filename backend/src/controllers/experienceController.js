import { validationResult } from "express-validator";
import Experience from "../models/Experience.js";
import ExpressError from "../utils/ExpressError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";
// POST: Add Experience
export const addExperience = asyncWrapper(async (req, res, next) => {
  const { company, location, title, joinDate, lastDate, description } =
    req.body;

  // Set lastDate to null if not provided or empty
  const processedLastDate =
    lastDate === undefined || lastDate === "" ? null : lastDate;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ExpressError(
      400,
      errors
        .array()
        .map((e) => e.msg)
        .join(", "),
      false
    );
  }

  const experience = new Experience({
    company,
    location,
    title,
    joinDate,
    lastDate: processedLastDate,
    description,
  });

  const savedExperience = await experience.save();
  res.status(201).json(apiResponse(savedExperience, true, 201));
});

// GET: Fetch all Experiences
export const getExperiences = asyncWrapper(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await Experience.countDocuments();
    const experiences = await Experience.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!experiences || experiences.length === 0) {
      throw new ExpressError(404, "No experiences found", false);
    }

    res.status(200).json(
      apiResponse({
        results: experiences,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      })
    );
  } else {
    const experiences = await Experience.find().sort({ createdAt: -1 });

    if (!experiences || experiences.length === 0) {
      throw new ExpressError(404, "No experiences found", false);
    }

    res.status(200).json(apiResponse(experiences));
  }
});

// GET: Fetch a single Experience by ID
export const getExperience = asyncWrapper(async (req, res, next) => {
  const { experience_id } = req.params;

  if (!experience_id) {
    throw new ExpressError(400, "Experience ID is required", false);
  }

  const experience = await Experience.findById(experience_id);
  if (!experience) {
    throw new ExpressError(404, "Experience not found", false);
  }

  res.status(200).json(apiResponse(experience));
});

// PUT: Update an Experience
export const updateExperience = asyncWrapper(async (req, res, next) => {
  const { experience_id } = req.params;

  const experience = await Experience.findById(experience_id);
  if (!experience) {
    throw new ExpressError(404, "Experience not found", false);
  }

  const { company, location, title, joinDate, lastDate, description } =
    req.body;

  // Set lastDate to null if not provided or empty
  const processedLastDate =
    lastDate === undefined || lastDate === "" ? null : lastDate;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ExpressError(
      400,
      errors
        .array()
        .map((e) => e.msg)
        .join(", "),
      false
    );
  }

  const updatedData = {};
  if (company) updatedData.company = company;
  if (location) updatedData.location = location;
  if (title) updatedData.title = title;
  if (joinDate) updatedData.joinDate = joinDate;
  if (processedLastDate !== undefined) updatedData.lastDate = processedLastDate;
  if (description) updatedData.description = description;

  const updatedExperience = await Experience.findByIdAndUpdate(
    experience_id,
    updatedData,
    { new: true, runValidators: true }
  );

  if (!updatedExperience) {
    throw new ExpressError(404, "Experience not found", false);
  }

  res
    .status(200)
    .json(apiResponse(updatedExperience, "Experience updated successfully"));
});

// DELETE: Delete an Experience
export const deleteExperience = asyncWrapper(async (req, res, next) => {
  const { experience_id } = req.params;

  if (!experience_id) {
    throw new ExpressError(400, "Experience ID is required", false);
  }

  const experience = await Experience.findByIdAndDelete(experience_id);
  if (!experience) {
    throw new ExpressError(404, "Experience not found", false);
  }

  res.status(200).json(apiResponse("Experience deleted successfully"));
});

// GET: Count experiences
export const countExperiences = asyncWrapper(async (req, res, next) => {
  const count = await Experience.countDocuments({});
  res
    .status(200)
    .json(apiResponse({ count }, "Experience count fetched successfully"));
});

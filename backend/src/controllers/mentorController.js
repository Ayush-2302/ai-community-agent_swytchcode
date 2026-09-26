// controllers/mentorController.js
import { toFile } from "@imagekit/nodejs";
import fs from "fs";
import imagekit from "../config/imagekit.js";
import Mentors from "../models/Mentors.js";
import ExpressError from "../utils/ExpressError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";

// POST: Add Mentor
export const addMentor = asyncWrapper(async (req, res, next) => {
  const { name, profileLink, altText } = req.body;

  if (!name || !profileLink || !altText) {
    throw new ExpressError(400, "Some fields are missing", false);
  }

  let imageUrl, fileId;

  if (req.file) {
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/mentors",
    });
    fs.unlinkSync(req.file.path);
    imageUrl = response.url;
    fileId = response.fileId;
  }

  const newMentor = new Mentors({
    name,
    profileLink,
    altText,
    imageUrl,
    fileId,
  });

  const savedMentor = await newMentor.save();

  res.status(201).json(apiResponse(savedMentor, true, 201));
});

// GET: Fetch all mentors
export const getMentors = asyncWrapper(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await Mentors.countDocuments();
    const mentors = await Mentors.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!mentors || mentors.length === 0) {
      throw new ExpressError(404, "No mentors found", false);
    }

    res.status(200).json(
      apiResponse({
        results: mentors,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      })
    );
  } else {
    const mentors = await Mentors.find().sort({ createdAt: -1 });
    if (!mentors || mentors.length === 0) {
      throw new ExpressError(404, "No mentors found", false);
    }

    res.status(200).json(apiResponse(mentors, true, 200));
  }
});

// GET: Fetch a single mentor by ID
export const getMentor = asyncWrapper(async (req, res, next) => {
  const { mentor_id } = req.params;

  if (!mentor_id) {
    throw new ExpressError(400, "Mentor ID is required", false);
  }

  const mentor = await Mentors.findById(mentor_id);
  if (!mentor || mentor.length === 0) {
    throw new ExpressError(404, "Mentor not found", false);
  }

  res.status(200).json(apiResponse(mentor, true, 200));
});

// PUT: Update Mentor details
export const updateMentor = asyncWrapper(async (req, res, next) => {
  const { mentor_id } = req.params;

  const mentor = await Mentors.findById(mentor_id);
  if (!mentor) {
    throw new ExpressError(404, "Mentor not found", false);
  }

  const { name, profileLink, altText } = req.body;

  let updatedData = {};
  if (name) updatedData.name = name;
  if (profileLink) updatedData.profileLink = profileLink;
  if (altText) updatedData.altText = altText;

  if (req.file) {
    if (mentor.fileId) {
      await imagekit.deleteFile(mentor.fileId);
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/mentors",
    });
    fs.unlinkSync(req.file.path);

    updatedData.imageUrl = response.url;
    updatedData.fileId = response.fileId;
  }

  const updatedMentor = await Mentors.findByIdAndUpdate(
    mentor_id,
    updatedData,
    { new: true },
  );

  if (!updatedMentor) {
    throw new ExpressError(404, "Mentor not found", false);
  }

  res
    .status(200)
    .json(apiResponse(updatedMentor, "Mentor update successfully !!"));
});

// DELETE: Delete Mentor
export const deleteMentor = asyncWrapper(async (req, res, next) => {
  const { mentor_id } = req.params;

  if (!mentor_id) {
    throw new ExpressError(400, "Mentor ID is required", false);
  }

  const mentor = await Mentors.findById(mentor_id);
  if (!mentor) {
    throw new ExpressError(404, "Mentor not found", false);
  }

  if (mentor.fileId) {
    await imagekit.deleteFile(mentor.fileId);
  }

  await Mentors.findByIdAndDelete(mentor_id);

  res.status(200).json(apiResponse("Mentor deleted successfully"));
});

// GET: Count mentors
export const countMentors = asyncWrapper(async (req, res, next) => {
  const count = await Mentors.countDocuments({});
  res
    .status(200)
    .json(apiResponse({ count }, "Mentor count fetched successfully"));
});

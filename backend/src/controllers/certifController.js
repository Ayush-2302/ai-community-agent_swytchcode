import { toFile } from "@imagekit/nodejs";
import Certificates from "../models/Certificate.js";
import ExpressError from "../utils/ExpressError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";

import fs from "fs";
import imagekit from "../config/imagekit.js";

// POST: Add Certificate
export const addCertificate = asyncWrapper(async (req, res, next) => {
  const { issuer, description } = req.body;

  if (!issuer || !description) {
    throw new ExpressError(400, "Some fields are missing", false);
  }
 
  let imageUrl, fileId;

  if (req.file) {
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/certificates",
    });

    fs.unlinkSync(req.file.path);
    imageUrl = response.url;
    fileId = response.fileId;
  }

  const newCertificate = new Certificates({
    issuer,
    description,
    imageUrl,
    fileId,
  });

  const savedCertificate = await newCertificate.save();

  res.status(201).json(apiResponse(savedCertificate, true, 201));
});

// GET: Fetch all certificates
export const getAllCertificates = asyncWrapper(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await Certificates.countDocuments();
    const certificates = await Certificates.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!certificates || certificates.length === 0) {
      throw new ExpressError(404, "No certificates found", false);
    }

    res.status(200).json(
      apiResponse({
        results: certificates,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      })
    );
  } else {
    const certificates = await Certificates.find().sort({ createdAt: -1 });

    if (!certificates || certificates.length === 0) {
      throw new ExpressError(404, "No certificates found", false);
    }

    res.status(200).json(apiResponse(certificates, true, 200));
  }
});

// GET: Fetch a single certificate by ID
export const getCertificateById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    throw new ExpressError(400, "Certificate ID is required", false);
  }

  const certificate = await Certificates.findById(id);
  if (!certificate) {
    throw new ExpressError(404, "Certificate not found", false);
  }

  res.status(200).json(apiResponse(certificate, true, 200));
});

// PUT: Update Certificate details
export const updateCertificate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const certificate = await Certificates.findById(id);
  if (!certificate) {
    throw new ExpressError(404, "Certificate not found", false);
  }

  const { issuer, description } = req.body;
  let updatedData = {};
  if (issuer) updatedData.issuer = issuer;
  if (description) updatedData.description = description;

  if (req.file) {
    // Delete old image from ImageKit
    if (certificate.fileId) {
      await imagekit.deleteFile(certificate.fileId);
    }

    // Upload new image to ImageKit
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/certificates",
    });
    fs.unlinkSync(req.file.path);

    updatedData.imageUrl = response.url;
    updatedData.fileId = response.fileId;
  }

  const updatedCertificate = await Certificates.findByIdAndUpdate(
    id,
    updatedData,
    { new: true },
  );

  if (!updatedCertificate) {
    throw new ExpressError(404, "Certificate not found", false);
  }

  res
    .status(200)
    .json(apiResponse(updatedCertificate, "Certificate updated successfully!"));
});

// DELETE: Delete Certificate
export const deleteCertificate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    throw new ExpressError(400, "Certificate ID is required", false);
  }

  const certificate = await Certificates.findById(id);
  if (!certificate) {
    throw new ExpressError(404, "Certificate not found", false);
  }

  // Delete image from ImageKit
  await imagekit.deleteFile(certificate.fileId);

  await Certificates.findByIdAndDelete(id);

  res.status(200).json(apiResponse("Certificate deleted successfully"));
});

export const countCertificates = asyncWrapper(async (req, res, next) => {
  const count = await Certificates.countDocuments({});
  res
    .status(200)
    .json(apiResponse({ count }, "Project count fetched successfully"));
});

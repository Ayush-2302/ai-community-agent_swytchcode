import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import mime from "mime-types";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Uploads a file to Supabase storage and returns the public URL
 * @param {string} filePath - Local path to the file
 * @param {string} destinationName - Desired name in the bucket (e.g., 'reels/my-video.mp4')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadToSupabase(filePath, destinationName) {
  const fileBuffer = await fs.readFile(filePath);
  const contentType = mime.lookup(filePath) || "application/octet-stream";

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(destinationName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(destinationName);

  return publicUrlData.publicUrl;
}

export async function deleteFromSupabase(destinationName) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([destinationName]);

  if (error) {
    console.error(`[Supabase] Delete failed:`, error.message);
  } else {
  }
}

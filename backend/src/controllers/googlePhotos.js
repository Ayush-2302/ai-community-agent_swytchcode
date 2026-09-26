import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// const googleResponse = await axios.get(
//   `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
// );

export const getNewLoginUrl = () => {
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fphotoslibrary.readonly` +
    `&response_type=code` +
    `&client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}` +
    `&prompt=consent` +
    `&access_type=offline` +
    `&include_granted_scopes=true`;
  return url;
};

// Handle OAuth2 callback and retrieve the access token
export const handleAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send("Authentication successful. You can now access Google Photos.");
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    res.status(500).send("Authentication failed");
  }
};

// Fetch Google Photos albums
export const getAlbums = async (req, res) => {
  try {
    const photos = google.photos({ version: "v1", auth: oauth2Client });

    const response = await photos.albums.list({
      pageSize: 10,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).send("Failed to fetch albums");
  }
};

// Fetch photos from a specific album
export const getPhotosFromAlbum = async (req, res) => {
  const { albumId } = req.params;

  try {
    const photos = google.photos({ version: "v1", auth: oauth2Client });

    const response = await photos.mediaItems.search({
      requestBody: {
        albumId,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching photos for album ${albumId}:`, error);
    res.status(500).send(`Failed to fetch photos for album ${albumId}`);
  }
};

// Download a specific photo
export const downloadPhoto = async (req, res) => {
  const { photoId } = req.params;

  try {
    const photos = google.photos({ version: "v1", auth: oauth2Client });

    const photoDetails = await photos.mediaItems.get({
      mediaItemId: photoId,
    });

    const downloadUrl = photoDetails.data.baseUrl + "=d"; // Add "=d" to download the image

    // Using Axios to download the image
    const response = await axios.get(downloadUrl, { responseType: "stream" });

    res.setHeader("Content-Type", "image/jpeg");
    response.data.pipe(res);
  } catch (error) {
    console.error(`Error downloading photo ${photoId}:`, error);
    res.status(500).send(`Failed to download photo ${photoId}`);
  }
};

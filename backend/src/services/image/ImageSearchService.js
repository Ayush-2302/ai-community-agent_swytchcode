import axios from "axios";

class ImageSearchService {
  constructor() {
    this.pixabayKey = process.env.PIXABAY_API_KEY;
    this.unsplashKey = process.env.UNSPLASH_ACCESS;
    this.freepikKey = process.env.FREEPIK_API_KEY;
    this.pexelsKey = process.env.PEXELS_API_KEY;
  }

  async search(query, orientation = "landscape") {
    console.log(`🔍 Searching for images with query: "${query}" (orientation: ${orientation})`);

    // 1. Try Pexels
    if (this.pexelsKey) {
      try {
        const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`;
        const response = await axios.get(pexelsUrl, {
          headers: { Authorization: this.pexelsKey },
        });
        if (response.data.photos && response.data.photos.length > 0) {
          console.log("✅ Image found on Pexels");
          return response.data.photos[0].src.large || response.data.photos[0].src.original;
        }
      } catch (e) {
        console.warn("⚠️ Pexels Search Failed:", e.message);
      }
    }

    // 2. Try Pixabay
    if (this.pixabayKey) {
      try {
        const pixabayUrl = `https://pixabay.com/api/?key=${this.pixabayKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=${orientation === "portrait" ? "vertical" : "horizontal"}&safesearch=true`;
        const response = await axios.get(pixabayUrl);
        if (response.data.hits && response.data.hits.length > 0) {
          console.log("✅ Image found on Pixabay");
          return response.data.hits[0].largeImageURL;
        }
      } catch (e) {
        console.warn("⚠️ Pixabay Search Failed:", e.message);
      }
    }

    // 3. Try Unsplash
    if (this.unsplashKey) {
      try {
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${this.unsplashKey}&orientation=${orientation}&per_page=1`;
        const response = await axios.get(unsplashUrl);
        if (response.data.results && response.data.results.length > 0) {
          console.log("✅ Image found on Unsplash");
          return response.data.results[0].urls.regular;
        }
      } catch (e) {
        console.warn("⚠️ Unsplash Search Failed:", e.message);
      }
    }

    // 4. Try Freepik
    if (this.freepikKey) {
      try {
        // Freepik orientation mapping: portrait, landscape, square
        const freepikUrl = `https://api.freepik.com/v1/resources?term=${encodeURIComponent(query)}&filters[content_type]=photo&filters[orientation]=${orientation}&page=1&limit=1`;
        const response = await axios.get(freepikUrl, {
          headers: { "x-freepik-api-key": this.freepikKey },
        });
        if (response.data.data && response.data.data.length > 0) {
          console.log("✅ Image found on Freepik");
          return response.data.data[0].image.source || response.data.data[0].image.url;
        }
      } catch (e) {
        console.warn("⚠️ Freepik Search Failed:", e.message);
      }
    }

    console.error(`❌ No images found on any stock provider for query: "${query}"`);
    return null;
  }

  async downloadBuffer(imageUrl) {
    if (!imageUrl) return null;
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data);
    } catch (e) {
      console.error("Failed to download image buffer:", e.message);
      return null;
    }
  }
}

export default new ImageSearchService();

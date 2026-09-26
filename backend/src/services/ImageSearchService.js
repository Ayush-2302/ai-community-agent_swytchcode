import axios from "axios";
import fs from "fs";
import path from "path";

class ImageSearchService {
  constructor() {
    this.pixabayKey = process.env.PIXABAY_API_KEY;
    this.unsplashKey = process.env.UNSPLASH_ACCESS;
    this.freepikKey = process.env.FREEPIK_API_KEY;
    this.pexelsKey = process.env.PEXELS_API_KEY;
    this.usedImagesFile = path.resolve("used", "used_images.json");
    this.usedImages = this.loadUsedImages();
  }

  loadUsedImages() {
    try {
      if (fs.existsSync(this.usedImagesFile)) {
        return JSON.parse(fs.readFileSync(this.usedImagesFile, "utf-8"));
      }
    } catch (e) {}
    return [];
  }

  saveUsedImage(url) {
    this.usedImages.push(url);
    if (this.usedImages.length > 500) this.usedImages.shift();
    try {
      fs.writeFileSync(
        this.usedImagesFile,
        JSON.stringify(this.usedImages, null, 2),
      );
    } catch (e) {}
  }

  async search(query, orientation = "landscape") {
    const resultsPerPage = 20;
    let allFoundUrls = [];

    const providers = {
      pexels: async () => {
        if (!this.pexelsKey) return null;
        try {
          const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${resultsPerPage}&orientation=${orientation}`;
          const response = await axios.get(pexelsUrl, {
            headers: { Authorization: this.pexelsKey },
          });
          return (
            response.data.photos?.map(
              (p) => p.src.large2x || p.src.large || p.src.original,
            ) || []
          );
        } catch (e) {
          return null;
        }
      },
      pixabay: async () => {
        if (!this.pixabayKey) return null;
        try {
          const isIllustration = /anime|illustration|lofi|drawing|art|vector/i.test(query);
          const type = isIllustration ? "illustration" : "photo";
          const pixabayUrl = `https://pixabay.com/api/?key=${this.pixabayKey}&q=${encodeURIComponent(query)}&image_type=${type}&orientation=${orientation === "portrait" ? "vertical" : "horizontal"}&safesearch=true&per_page=${resultsPerPage}`;
          const response = await axios.get(pixabayUrl);
          return response.data.hits?.map((h) => h.largeImageURL) || [];
        } catch (e) {
          return null;
        }
      },
      unsplash: async () => {
        if (!this.unsplashKey) return null;
        try {
          const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${this.unsplashKey}&orientation=${orientation}&per_page=${resultsPerPage}`;
          const response = await axios.get(unsplashUrl);
          return response.data.results?.map((r) => r.urls.regular) || [];
        } catch (e) {
          return null;
        }
      },
      freepik: async () => {
        if (!this.freepikKey) return null;
        try {
          const freepikUrl = `https://api.freepik.com/v1/resources?query=${encodeURIComponent(query)}&per_page=${resultsPerPage}&orientation=${orientation}`;
          const response = await axios.get(freepikUrl, {
            headers: { "x-freepik-api-key": this.freepikKey },
          });
          return (
            response.data.data
              ?.map((r) => r.image?.source?.url)
              .filter(Boolean) || []
          );
        } catch (e) {
          return null;
        }
      },
    };

    let order = ["pexels", "pixabay", "unsplash", "freepik"].sort(
      () => Math.random() - 0.5,
    );

    for (const providerName of order) {
      try {
        const urls = await providers[providerName]();
        if (!urls || urls.length === 0) continue;

        allFoundUrls.push(...urls);

        let unused = urls.filter((u) => !this.usedImages.includes(u));
        if (unused.length === 0) continue;

        unused = unused.sort(() => Math.random() - 0.5);

        for (const url of unused.slice(0, 10)) {
          const buffer = await this.downloadBuffer(url);
          if (buffer) {
            this.saveUsedImage(url);
            return { url, buffer };
          }
        }
      } catch (e) {}
    }

    if (allFoundUrls.length > 0) {
      const shuffledAll = allFoundUrls.sort(() => Math.random() - 0.5);
      for (const url of shuffledAll.slice(0, 5)) {
        const buffer = await this.downloadBuffer(url);
        if (buffer) return { url, buffer };
      }
    }

    return null;
  }

  async downloadBuffer(imageUrl, retries = 3) {
    if (!imageUrl) return null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 10000,
        });
        return Buffer.from(response.data);
      } catch (e) {
        if (e.response?.status === 429 && i < retries - 1) {
          const waitTime = (i + 1) * 2000;
          console.log(`Rate limited (429). Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        console.error(`Failed to download image buffer (Attempt ${i + 1}):`, e.message);
        if (i === retries - 1) return null;
      }
    }
    return null;
  }
}

export default new ImageSearchService();

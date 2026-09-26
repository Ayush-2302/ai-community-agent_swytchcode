import ImageKit from "@imagekit/nodejs";
import config from "./env.js";

const imagekit = new ImageKit({
  publicKey: config.media.imagekit.publicKey || "",
  privateKey: config.media.imagekit.privateKey || "",
  urlEndpoint: config.media.imagekit.urlEndpoint || "",
});

export default imagekit;

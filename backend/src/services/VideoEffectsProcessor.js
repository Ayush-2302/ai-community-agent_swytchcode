import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class VideoEffectsProcessor {
  async applyEffects(inputPath, outputPath, style = "sad") {
    const filters = this._getFiltersForStyle(style);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters(filters)
        .outputOptions([
          "-c:v libx264",
          "-preset fast",
          "-crf 23",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
        ])
        .save(outputPath)
        .on("end", () => {
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error(`❌ [VideoEffects] Render Failed: ${err.message}`);
          reject(err);
        });
    });
  }

  _getFiltersForStyle(style) {
    switch (style) {
      case "broken_wings":
        return [
          "boxblur=1:1",
          "eq=brightness=-0.05:saturation=0.7:contrast=1.05",
          "colorbalance=rs=-0.05:gs=-0.02:bs=0.1",
          "noise=alls=8:allf=t",
          "vignette=PI/4",
        ];
      case "personallinkedin":
      case "dotenvcoder":
        return [
          "eq=brightness=0:saturation=1.1:contrast=1.1",
          "colorbalance=bs=0.03",
        ];
      case "kanhacode":
        return [
          "eq=brightness=0.02:saturation=1.15:contrast=1.08",
          "colorbalance=rs=0.03:gs=0.01:bs=-0.03",
          "vignette=PI/5",
        ];
      default:
        return ["eq=brightness=0:saturation=1"];
    }
  }
}

export default new VideoEffectsProcessor();

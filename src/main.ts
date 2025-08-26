import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import WallpaperCarousel, { WallpaperPath } from "./wallpaper-carousel";

async function setupWallpaperCarousel(): Promise<void> {
  try {
    // Get wallpaper paths from Tauri backend
    const wallpaperPaths: string[] = await invoke("get_wallpapers");

    // Convert file paths for web view
    const convertedPaths: WallpaperPath[] = wallpaperPaths.map(
      (path): WallpaperPath => {
        return {
          path,
          assetPath: convertFileSrc(path),
        };
      },
    );

    // Create carousel
    const carousel = new WallpaperCarousel(convertedPaths);

    document.addEventListener("keydown", async (e: KeyboardEvent) => {
      if (e.code == "Space") {
        e.preventDefault();
        const path = carousel.getCurrentWallpaper();
        await invoke("set_wallpaper", { path });
      }
    });
  } catch (error) {
    console.error("Failed to setup wallpaper carousel:", error);
  }
}

// Initialize
setupWallpaperCarousel();

export type WallpaperPath = {
  path: string;
  assetPath: string;
};
class WallpaperCarousel {
  private wallpaperPaths: WallpaperPath[];
  private currentIndex: number;
  private track: HTMLElement;

  constructor(wallpaperPaths: WallpaperPath[]) {
    this.wallpaperPaths = wallpaperPaths;
    this.currentIndex = 0;

    const trackElement = document.getElementById("carouselTrack");
    if (!trackElement) {
      throw new Error("Carousel track element not found");
    }
    this.track = trackElement;

    this.init();
    this.bindEvents();
  }

  private init(): void {
    this.renderItems();
    this.updateCarousel();
  }

  private renderItems(): void {
    this.track.innerHTML = "";

    if (this.wallpaperPaths.length === 0) {
      const item = document.createElement("div");
      item.className = "carousel-item loading";
      item.textContent = "No wallpapers available";
      this.track.appendChild(item);
      return;
    }

    this.wallpaperPaths.forEach(
      (wallpaperPath: WallpaperPath, index: number) => {
        const item = document.createElement("div");
        item.className = "carousel-item";
        item.dataset.index = index.toString();
        item.innerHTML = `<img src="${wallpaperPath.assetPath}" alt="Wallpaper">`;
        this.track.appendChild(item);
      },
    );

    // Set initial position
    this.currentIndex = Math.min(2, Math.floor(this.wallpaperPaths.length / 2));
  }

  private updateCarousel(): void {
    const items = this.track.querySelectorAll(".carousel-item");
    const containerWidth = this.track.parentElement?.clientWidth || 0;
    const centerPosition = containerWidth / 2;

    // Remove center class from all items
    items.forEach((item: Element) => {
      item.classList.remove("center");
    });

    // Mark center item
    if (items[this.currentIndex]) {
      items[this.currentIndex].classList.add("center");
    }

    // Calculate the position needed to center the selected item
    let offset = 0;
    const gap = 15; // Gap between items

    // Calculate position of each item and find the offset needed to center current item
    for (let i = 0; i < items.length; i++) {
      const isCenter = i === this.currentIndex;

      // Get actual item dimensions based on center state
      const itemWidth = isCenter ? 320 : 240; // Match your CSS values

      if (i === this.currentIndex) {
        // Calculate offset to center this item
        offset = centerPosition - (offset + itemWidth / 2);
        break;
      }

      // Add this item's width and gap to running total
      offset += itemWidth + gap;
    }

    // Apply the transform
    this.track.style.transform = `translateX(${offset}px)`;
  }

  public next(): void {
    this.currentIndex++;

    // Wrap around at the end
    if (this.currentIndex >= this.wallpaperPaths.length) {
      this.currentIndex = 0;
    }

    this.updateCarousel();
  }

  public prev(): void {
    this.currentIndex--;

    // Wrap around at the beginning
    if (this.currentIndex < 0) {
      this.currentIndex = this.wallpaperPaths.length - 1;
    }

    this.updateCarousel();
  }

  private bindEvents(): void {
    // Mouse wheel scrolling
    this.track.parentElement?.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY > 0) {
        this.next();
      } else if (e.deltaY < 0) {
        this.prev();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        this.next();
      }
      if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        this.prev();
      }
    });

    // Click on items to select
    this.track.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const item = target.closest(".carousel-item") as HTMLElement;
      if (item && item.dataset.index) {
        const targetIndex = parseInt(item.dataset.index);
        this.currentIndex = targetIndex;
        this.updateCarousel();
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => this.updateCarousel());
  }

  // Method to update wallpapers dynamically
  public updateWallpapers(newWallpaperPaths: WallpaperPath[]): void {
    this.wallpaperPaths = newWallpaperPaths;
    this.init();
  }

  // Get currently selected wallpaper path
  public getCurrentWallpaper(): string | undefined {
    return this.wallpaperPaths[this.currentIndex].path;
  }

  // Get current index
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  // Get total wallpaper count
  public getTotalCount(): number {
    return this.wallpaperPaths.length;
  }
}

// Export for module usage
export default WallpaperCarousel;

// Usage example:
/*
const wallpaperPaths: string[] = [
    '/path/to/wallpaper1.jpg',
    '/path/to/wallpaper2.png',
    '/path/to/wallpaper3.jpg'
];

const carousel = new WallpaperCarousel(wallpaperPaths);

// Get selected wallpaper
const selected: string | undefined = carousel.getCurrentWallpaper();

// Update wallpapers
carousel.updateWallpapers(['new/path1.jpg', 'new/path2.jpg']);
*/

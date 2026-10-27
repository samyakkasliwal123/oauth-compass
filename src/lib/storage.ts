import fs from "fs";
import path from "path";
import { OAuthGuide } from "@/types/guide";
import { SEED_GUIDES, SEED_GUIDES_MAP } from "@/data/seeds";
import { OAuthGuideSchema } from "@/lib/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "guides.json");

/**
 * GuideStorage provides persistent storage for all guides.
 * Seeds initial guides on first run and persists generated guides to disk.
 */
class GuideStorage {
  private cache: Map<string, OAuthGuide> = new Map();
  private initialized = false;

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error("Failed to create data directory:", err);
      }
    }
  }

  private init() {
    if (this.initialized) return;
    this.ensureDirectory();

    // Load seeds first
    for (const guide of SEED_GUIDES) {
      this.cache.set(guide.id, guide);
      this.cache.set(guide.slug, guide);
    }

    // Try reading existing file
    if (fs.existsSync(STORAGE_FILE)) {
      try {
        const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const validation = OAuthGuideSchema.safeParse(item);
            if (validation.success) {
              this.cache.set(validation.data.id, validation.data);
              this.cache.set(validation.data.slug, validation.data);
            }
          }
        }
      } catch (err) {
        console.error("Error reading guides.json:", err);
      }
    } else {
      this.persist();
    }

    this.initialized = true;
  }

  private persist() {
    this.ensureDirectory();
    try {
      // Get unique guides (filter duplicates by id)
      const unique = Array.from(new Set(Array.from(this.cache.values())));
      const json = JSON.stringify(unique, null, 2);
      fs.writeFileSync(STORAGE_FILE, json, "utf-8");
    } catch (err) {
      console.error("Error persisting guides:", err);
    }
  }

  public getAllGuides(): OAuthGuide[] {
    this.init();
    const map = new Map<string, OAuthGuide>();
    for (const guide of this.cache.values()) {
      map.set(guide.id, guide);
    }
    return Array.from(map.values()).sort((a, b) => {
      // Seeded guides first, then by date descending
      if (a.isSeeded && !b.isSeeded) return -1;
      if (!a.isSeeded && b.isSeeded) return 1;
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });
  }

  public getGuideByIdOrSlug(idOrSlug: string): OAuthGuide | null {
    this.init();
    if (!idOrSlug) return null;
    const lower = idOrSlug.toLowerCase().trim();
    
    // Check cache
    if (this.cache.has(lower)) {
      return this.cache.get(lower)!;
    }

    // Fallback search across values
    for (const guide of this.cache.values()) {
      if (guide.id.toLowerCase() === lower || guide.slug.toLowerCase() === lower) {
        return guide;
      }
    }

    // Check seed fallback
    if (SEED_GUIDES_MAP[lower]) {
      return SEED_GUIDES_MAP[lower];
    }

    return null;
  }

  public saveGuide(guide: OAuthGuide): OAuthGuide {
    this.init();
    // Validate with Zod
    const validated = OAuthGuideSchema.parse(guide);
    this.cache.set(validated.id, validated);
    this.cache.set(validated.slug, validated);
    this.persist();
    return validated;
  }
}

export const guideStorage = new GuideStorage();

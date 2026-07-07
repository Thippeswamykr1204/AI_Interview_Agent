import { promises as fs } from "fs";
import path from "path";
import { StorageInterface } from "./storage.interface";
import { logger } from "../utils/logger";

/**
 * File-based JSON storage. One file per record, named `${id}.json`,
 * stored under the provided base directory.
 *
 * A per-id write queue prevents concurrent writes to the same file
 * from corrupting data (e.g. rapid answer submissions on one session).
 */
export class JsonStorage<T> implements StorageInterface<T> {
  private readonly baseDir: string;
  private readonly writeQueues: Map<string, Promise<void>> = new Map();

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  private filePath(id: string): string {
    const safeId = this.sanitizeId(id);
    return path.join(this.baseDir, `${safeId}.json`);
  }

  private sanitizeId(id: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error(`Invalid storage id: ${id}`);
    }
    return id;
  }

  private async ensureBaseDir(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  async read(id: string): Promise<T | null> {
    const filePath = this.filePath(id);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw) as T;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      logger.error(`Failed to read storage file: ${filePath}`, error);
      throw error;
    }
  }

  async write(id: string, data: T): Promise<void> {
    const previous = this.writeQueues.get(id) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() => this.writeToDisk(id, data));
    this.writeQueues.set(id, next);
    await next;
  }

  private async writeToDisk(id: string, data: T): Promise<void> {
    await this.ensureBaseDir();
    const filePath = this.filePath(id);
    const tempPath = `${filePath}.tmp`;
    const serialized = JSON.stringify(data, null, 2);

    await fs.writeFile(tempPath, serialized, "utf-8");
    await fs.rename(tempPath, filePath);
  }

  async delete(id: string): Promise<void> {
    const filePath = this.filePath(id);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (!this.isNotFoundError(error)) {
        logger.error(`Failed to delete storage file: ${filePath}`, error);
        throw error;
      }
    }
  }

  async exists(id: string): Promise<boolean> {
    const record = await this.read(id);
    return record !== null;
  }

  async listIds(): Promise<string[]> {
    await this.ensureBaseDir();
    const files = await fs.readdir(this.baseDir);
    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""));
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    );
  }
}
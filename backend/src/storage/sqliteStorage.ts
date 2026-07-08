import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { StorageInterface } from "./storage.interface";
import { logger } from "../utils/logger";

/**
 * SQLite-backed key-value document storage.
 *
 * Replaces JsonStorage (one-file-per-record) with a single WAL-mode SQLite
 * database. Fixes the concurrency/corruption risk JsonStorage had under
 * concurrent writes to the same id, and removes the "thousands of loose
 * files" scaling problem — without requiring an external DB server.
 *
 * Same StorageInterface contract as JsonStorage, so SessionRepository
 * (and everything above it) doesn't change.
 */
export class SqliteStorage<T> implements StorageInterface<T> {
  private readonly db: Database.Database;

  // Prepared statements — compiled once, reused for every call.
  private readonly stmtRead: Database.Statement;
  private readonly stmtWrite: Database.Statement;
  private readonly stmtDelete: Database.Statement;
  private readonly stmtExists: Database.Statement;
  private readonly stmtListIds: Database.Statement;

  constructor(dbPath: string) {
    this.ensureParentDir(dbPath);

    this.db = new Database(dbPath);

    // WAL mode: readers don't block writers and vice versa. This is the
    // core fix for the corruption/concurrency risk JsonStorage carried —
    // multiple in-flight writes to different (or the same) session no
    // longer race on the filesystem.
    this.db.pragma("journal_mode = WAL");
    // Caller (this process) waits for locks instead of failing immediately
    // if a write is momentarily in progress on another connection.
    this.db.pragma("busy_timeout = 5000");
    this.db.pragma("foreign_keys = ON");

    this.migrate();

    this.stmtRead = this.db.prepare("SELECT data FROM documents WHERE id = ?");
    this.stmtWrite = this.db.prepare(
      `INSERT INTO documents (id, data, updated_at) VALUES (@id, @data, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
    );
    this.stmtDelete = this.db.prepare("DELETE FROM documents WHERE id = ?");
    this.stmtExists = this.db.prepare("SELECT 1 FROM documents WHERE id = ? LIMIT 1");
    this.stmtListIds = this.db.prepare("SELECT id FROM documents ORDER BY updated_at DESC");
  }

  private ensureParentDir(dbPath: string): void {
    const dir = path.dirname(dbPath);
    fs.mkdirSync(dir, { recursive: true });
  }

  /**
   * Minimal hand-rolled migration runner. Each migration is a single SQL
   * statement keyed by an incrementing version; applied migrations are
   * tracked in schema_version so this is safe to run on every startup.
   * Add new entries to MIGRATIONS below rather than editing table DDL
   * in place once this has shipped anywhere.
   */
  private migrate(): void {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS schema_version (
         version INTEGER PRIMARY KEY,
         applied_at TEXT NOT NULL
       )`
    );

    const MIGRATIONS: string[] = [
      `CREATE TABLE IF NOT EXISTS documents (
         id TEXT PRIMARY KEY,
         data TEXT NOT NULL,
         updated_at TEXT NOT NULL
       )`,
      `CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at)`,
    ];

    const currentVersion =
      (this.db.prepare("SELECT MAX(version) as v FROM schema_version").get() as { v: number | null })
        .v ?? 0;

    const applyFrom = currentVersion; // migrations[0] is version 1
    for (let i = applyFrom; i < MIGRATIONS.length; i++) {
      const version = i + 1;
      const runMigration = this.db.transaction(() => {
        this.db.exec(MIGRATIONS[i]);
        this.db
          .prepare("INSERT INTO schema_version (version, applied_at) VALUES (?, ?)")
          .run(version, new Date().toISOString());
      });
      runMigration();
      logger.info(`[sqliteStorage] applied migration ${version}/${MIGRATIONS.length}`);
    }
  }

  async read(id: string): Promise<T | null> {
    const row = this.stmtRead.get(id) as { data: string } | undefined;
    if (!row) return null;
    try {
      return JSON.parse(row.data) as T;
    } catch (error) {
      logger.error(`[sqliteStorage] Failed to parse stored JSON for id: ${id}`, error);
      throw error;
    }
  }

  async write(id: string, data: T): Promise<void> {
    // Single synchronous statement — better-sqlite3 is synchronous under
    // the hood and SQLite serializes writers itself, so (unlike JsonStorage)
    // no in-process write queue is needed to stay safe under concurrent
    // writes to the same id.
    this.stmtWrite.run({
      id,
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    this.stmtDelete.run(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.stmtExists.get(id) !== undefined;
  }

  async listIds(): Promise<string[]> {
    const rows = this.stmtListIds.all() as { id: string }[];
    return rows.map((r) => r.id);
  }

  /** Call on graceful shutdown so the WAL is checkpointed and the file handle released. */
  close(): void {
    this.db.close();
  }
}
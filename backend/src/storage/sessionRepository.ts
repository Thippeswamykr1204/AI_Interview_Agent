import { SqliteStorage } from "./sqliteStorage";
import { InterviewSession } from "../types/session.types";
import { NotFoundError } from "../types/api.types";
import { env } from "../config/env";

/**
 * Repository for InterviewSession persistence.
 * Wraps the generic SqliteStorage with domain-specific operations
 * so services never touch the storage layer directly.
 */
export class SessionRepository {
  private readonly storage: SqliteStorage<InterviewSession>;

  constructor(storage: SqliteStorage<InterviewSession> = new SqliteStorage<InterviewSession>(env.dbPath)) {
    this.storage = storage;
  }

  async create(session: InterviewSession): Promise<InterviewSession> {
    await this.storage.write(session.id, session);
    return session;
  }

  async findById(id: string): Promise<InterviewSession | null> {
    return this.storage.read(id);
  }

  async getByIdOrThrow(id: string): Promise<InterviewSession> {
    const session = await this.storage.read(id);
    if (!session) {
      throw new NotFoundError(`Interview session not found: ${id}`);
    }
    return session;
  }

  async update(session: InterviewSession): Promise<InterviewSession> {
    await this.storage.write(session.id, session);
    return session;
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async listAllIds(): Promise<string[]> {
    return this.storage.listIds();
  }

  /** Call on graceful shutdown (SIGTERM/SIGINT) so the WAL is checkpointed cleanly. */
  close(): void {
    this.storage.close();
  }
}
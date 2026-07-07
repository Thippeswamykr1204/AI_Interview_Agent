/**
 * Generic key-value document storage abstraction.
 * Allows swapping JSON-file storage for SQLite or another backend
 * without touching repository/service code.
 */
export interface StorageInterface<T> {
  read(id: string): Promise<T | null>;
  write(id: string, data: T): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  listIds(): Promise<string[]>;
}
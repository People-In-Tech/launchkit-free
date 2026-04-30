export interface DatabaseAdapter {
  getClient(): unknown;
  healthCheck(): Promise<boolean>;
}

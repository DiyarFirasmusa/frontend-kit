export type ID = string;
export interface User {
  id: ID;
  username: string;
  roles?: string[];
}

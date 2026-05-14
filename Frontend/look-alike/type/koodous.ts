export interface AppResult {
  id: string;
  app: string;
  package_name: string;
  company: string;
  image: string | null;
  is_detected: boolean;
  tags: string[];
  sha256: string;
}
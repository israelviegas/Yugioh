export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
}

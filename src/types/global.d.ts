export {};

declare global {
  interface Window {
    versions: {
      ping: () => Promise<string>;
      chrome: () => string;
      node: () => string;
      electron: () => string;
      currentVersion: () => Promise<string>;
      lastVersion: () => Promise<string>;
    };
    electronAPI: {
      requestUpdate: () => void;
      onDownloadProgress: (callback: (progress: number) => void) => void;
    };
  }
}

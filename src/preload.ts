// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, app } from 'electron';

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  currentVersion: async () => {
    return await ipcRenderer.invoke('get-app-current-version');
  },
  lastVersion: async () => {
    return await ipcRenderer.invoke('get-app-last-version');
  },
  ping: () => ipcRenderer.invoke('ping'), // 发送器
  // 除函数之外，我们也可以暴露变量
});

contextBridge.exposeInMainWorld('electronAPI', {
  requestUpdate: () => {
    console.log(1111);
    ipcRenderer.send('update-app');
  },
  onDownloadProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on('download-progress', (_event, progress) =>
      callback(progress)
    ),
});

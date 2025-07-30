import { app, BrowserWindow, ipcMain } from 'electron';
import os from 'os';
import path from 'node:path';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
export const createReceiver = () => {
  ipcMain.handle('ping', () => 'pong'); // 接收器
  ipcMain.handle('get-app-current-version', () => {
    return app.getVersion();
  });
};

export const setLastVersion = (version: string) => {
  ipcMain.handle('get-app-last-version', () => {
    return version;
  });
};

// 更新
export const updateApp = (updateWindow: BrowserWindow) => {
  ipcMain.on('update-app', async () => {
    const zipUrl = 'http://localhost:3000/dist-0.2.0-beta.20250729-1547.zip';
    const tmpZipPath = path.join(os.tmpdir(), 'update.zip');
    const extractPath = path.join(os.tmpdir(), 'update-dist');
    const distPath = path.resolve(__dirname, '.vite/build/dist');

    try {
      // 下载 zip
      const res = await fetch(zipUrl);

      // 进度
      let received = 0;
      const total = Number(res.headers.get('content-length'));
      res.body.on('data', (chunk) => {
        received += chunk.length;
        const progress = Math.floor((received / total) * 100);
        updateWindow.webContents.send('download-progress', progress);
      });

      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(tmpZipPath, buffer);

      // 解压 zip
      const zip = new AdmZip(tmpZipPath);
      zip.extractAllTo(extractPath, true);

      // 获取解压后 dist-xxxxx 文件夹（只取第一个）
      const extractedDirs = fs
        .readdirSync(extractPath)
        .filter((name) =>
          fs.statSync(path.join(extractPath, name)).isDirectory()
        );
      if (extractedDirs.length === 0) throw new Error('No folder found in zip');
      const newDistDir = path.join(extractPath, extractedDirs[0]);

      // 替换 .vite/build/dist 内容
      await fs.emptyDir(distPath);
      await fs.copy(newDistDir, distPath);

      console.log('Update completed successfully.');
      // 可选：通知渲染进程完成
      // mainWindow.webContents.send('update-success')
    } catch (err) {
      console.error('Update failed:', err);
      // mainWindow.webContents.send('update-failure', err.message)
    }
  });
};

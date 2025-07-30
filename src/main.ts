import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { serverRun } from './script/express-server';
import { startJavaServer, waitForJavaServer } from './script/start-java';
import { ChildProcessWithoutNullStreams } from 'node:child_process';
import { createReceiver, setLastVersion, updateApp } from './script/receiver';
const versionIp = 'http://localhost:3000';
// import { serverRun } from './express-server';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}
let javaProcess: ChildProcessWithoutNullStreams;
const createMainWindow = (url?: string) => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, './assets/atg.ico'),
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'),
    // },
  });

  // and load the index.html of the app.
  // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(
  //     url ? url : `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/static/index.html`
  //   );
  // } else {
  //   mainWindow.loadFile(
  //     path.join(
  //       __dirname,
  //       `../renderer/${MAIN_WINDOW_VITE_NAME}/dist/index.html`
  //     )
  //   );
  // }

  // mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  mainWindow.loadURL(url);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  return mainWindow;
};

// 更新页面窗口
const createUpdateWindow = () => {
  const updateWindow = new BrowserWindow({
    width: 400,
    height: 200,
    icon: path.join(__dirname, './assets/atg.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    updateWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
  } else {
    updateWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  return updateWindow;
};

// 控制台事件
const listenOpenDevToolsKeyEvent = (window: BrowserWindow) => {
  globalShortcut.register('F12', () => {
    window.webContents.openDevTools();
  });

  // Ctrl+Shift+I 打开 DevTools
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    window.webContents.openDevTools();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createReceiver();

  // 启动 java
  // javaProcess = startJavaServer();
  // await waitForJavaServer();

  // 设置前端静态资源服务
  const url = await serverRun();

  const mainWindow = createMainWindow(url);
  // listenOpenDevToolsKeyEvent(mainWindow);
  // 检查是否有更新，如果版本不一致，则显示更新窗口
  const res = await fetch(`${versionIp}/version/version.json`).then((res) =>
    res.json()
  );
  setLastVersion(res.version);

  if (app.getVersion() !== res.version) {
    const updateWindow = createUpdateWindow();
    updateApp(updateWindow);
    listenOpenDevToolsKeyEvent(updateWindow);
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createMainWindow();
//   }
// });

app.on('before-quit', () => {
  if (javaProcess && !javaProcess.killed) {
    javaProcess.kill(); // 或发送信号：javaProcess.kill('SIGTERM')
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

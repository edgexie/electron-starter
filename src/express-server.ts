import express from 'express';
import path from 'node:path';
const staticApp = express();
const port = 3000;

const pathed = MAIN_WINDOW_VITE_DEV_SERVER_URL
  ? path.join(__dirname, `/dist`)
  : path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/dist`);
staticApp.use(express.static(pathed));

export async function serverRun(): Promise<string> {
  return new Promise((resolve, reject) => {
    // 启动服务器
    staticApp.listen(port, () => {
      console.log(`静态资源服务器已启动: http://localhost:${port}`);
      resolve(`http://localhost:${port}`);
    });
  });
}

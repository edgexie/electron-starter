import { app } from 'electron';
import { spawn } from 'node:child_process';
import path from 'node:path';
import http from 'node:http';
const JAVA_PORT = 24000; // 你 Java 后端使用的端口
const MAX_RETRIES = 30; // 最多尝试 30 次（比如 15 秒）
const RETRY_INTERVAL = 500; // 每次尝试间隔 500ms
export function startJavaServer() {
  const isPackaged = app.isPackaged;
  const basePath = isPackaged
    ? path.join(process.resourcesPath, 'app', 'java') // 打包后
    : path.resolve(__dirname, '../../app', 'java'); // 开发时
  console.log('basePath', basePath);

  const javaPath = path.join(
    basePath,
    'jre',
    'bin',
    process.platform === 'win32' ? 'java.exe' : 'java'
  );

  const jarPath = path.join(basePath, 'jar', 'xgcs-boot.jar');
  // Java参数数组
  const javaArgs = [
    '-Xmx6G',
    '-Xms6G',
    '-XX:MaxMetaspaceSize=300M',
    '-XX:+HeapDumpOnOutOfMemoryError',
    '-XX:HeapDumpPath=./app/error/dump.hprof',
    '-XX:ErrorFile=./app/error/hs_err_pid%p.log',
    '-jar',
    jarPath,
  ];

  const javaProcess = spawn(javaPath, javaArgs);

  javaProcess.stdout.on('data', (data) => {
    console.log(`Java stdout: ${data}`);
  });

  javaProcess.stderr.on('data', (data) => {
    console.error(`Java stderr: ${data}`);
  });

  javaProcess.on('close', (code) => {
    console.log(`Java 进程已退出，退出码 ${code}`);
  });
  return javaProcess;
}

export function waitForJavaServer(retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const req = http.get(`http://localhost:${JAVA_PORT}`, (res) => {
        resolve(); // Java 服务已经启动
      });

      req.on('error', () => {
        if (retries <= 0) {
          reject(new Error('Java 服务启动超时'));
        } else {
          setTimeout(() => {
            waitForJavaServer(retries - 1)
              .then(resolve)
              .catch(reject);
          }, RETRY_INTERVAL);
        }
      });
    };

    tryConnect();
  });
}

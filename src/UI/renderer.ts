const func = async () => {
  const response = await window.versions.ping();

  // 内核版本信息
  const information = document.getElementById('info');
  information.innerText = `Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), 和 Electron (v${window.versions.electron()})`;

  // 当前版本
  const currentVersion = document.getElementById('currentVersion');
  currentVersion.innerText = `${await window.versions.currentVersion()}`;

  // 最新版本
  const lastVersion = document.getElementById('lastVersion');
  lastVersion.innerText = `${await window.versions.lastVersion()}`;

  // 更新版本
  if (currentVersion.innerText !== lastVersion.innerText) {
    const updateBtn = document.getElementById('updateBtn');

    updateBtn?.addEventListener('click', () => {
      console.log('1111');
      window.electronAPI.requestUpdate();
    });
  }

  // 监听进度
  window.electronAPI.onDownloadProgress((progress) => {
    console.log('下载进度:', progress + '%');
    document.getElementById('progress-bar').innerText = progress + '%';
  });
};

func();

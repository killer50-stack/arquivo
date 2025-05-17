// Elementos do DOM
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress');
const progressPercentage = document.getElementById('progress-percentage');
const fileName = document.getElementById('file-name');
const filesContainer = document.getElementById('files-container');
const emptyFiles = document.getElementById('empty-files');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const closeToast = document.getElementById('close-toast');
const usedSpace = document.getElementById('used-space');
const storageUsed = document.getElementById('storage-used');

// Estado global
let totalUsedSpace = 0;
const maxStorage = 1099511627776; // 1TB em bytes

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Carregar arquivos existentes
  fetchFiles();

  // Configurar eventos para drag and drop
  setupDragAndDrop();

  // Configurar evento para o input de arquivo
  setupFileInput();

  // Configurar toast
  setupToast();
});

// Buscar arquivos existentes do servidor
function fetchFiles() {
  fetch('/api/files')
    .then(response => response.json())
    .then(files => {
      if (files.length === 0) {
        showEmptyFilesMessage();
        return;
      }

      hideEmptyFilesMessage();
      renderFiles(files);
      updateStorageInfo(files);
    })
    .catch(error => {
      console.error('Erro ao carregar arquivos:', error);
      showToast('Erro ao carregar arquivos', 'error');
    });
}

// Renderizar arquivos na interface
function renderFiles(files) {
  // Limpar o container exceto pela mensagem de vazio
  const elements = filesContainer.querySelectorAll(':not(#empty-files)');
  elements.forEach(element => element.remove());
  
  // Adicionar cada arquivo
  files.forEach(file => {
    const fileElement = createFileElement(file);
    filesContainer.appendChild(fileElement);
  });
}

// Criar elemento de arquivo
function createFileElement(file) {
  const fileItem = document.createElement('div');
  fileItem.className = 'file-item';
  fileItem.dataset.id = file.id;

  // Determinar ícone com base no tipo de arquivo
  const iconClass = getFileIconClass(file.mimetype);
  
  // Formatar tamanho do arquivo
  const formattedSize = formatFileSize(file.size);

  // Criar conteúdo do elemento
  fileItem.innerHTML = `
    <i class="file-icon ${iconClass}"></i>
    <div class="file-name">${file.originalname}</div>
    <div class="file-size">${formattedSize}</div>
    <div class="file-actions">
      <button class="download-btn" title="Download"><i class="fas fa-download"></i></button>
      <button class="delete-btn" title="Excluir"><i class="fas fa-trash-alt"></i></button>
    </div>
  `;

  // Configurar eventos para botões
  const downloadBtn = fileItem.querySelector('.download-btn');
  const deleteBtn = fileItem.querySelector('.delete-btn');

  downloadBtn.addEventListener('click', () => {
    window.open(`/uploads/${file.filename}`, '_blank');
  });

  deleteBtn.addEventListener('click', () => {
    deleteFile(file.id);
  });

  return fileItem;
}

// Determinar ícone com base no tipo de arquivo
function getFileIconClass(mimetype) {
  if (mimetype.startsWith('image/')) {
    return 'fas fa-file-image';
  } else if (mimetype.startsWith('video/')) {
    return 'fas fa-file-video';
  } else if (mimetype.startsWith('audio/')) {
    return 'fas fa-file-audio';
  } else if (mimetype.includes('pdf')) {
    return 'fas fa-file-pdf';
  } else if (mimetype.includes('word') || mimetype.includes('document')) {
    return 'fas fa-file-word';
  } else if (mimetype.includes('excel') || mimetype.includes('sheet')) {
    return 'fas fa-file-excel';
  } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
    return 'fas fa-file-powerpoint';
  } else if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar') || mimetype.includes('compressed')) {
    return 'fas fa-file-archive';
  } else if (mimetype.includes('text')) {
    return 'fas fa-file-alt';
  } else if (mimetype.includes('javascript') || mimetype.includes('json') || mimetype.includes('html') || mimetype.includes('css')) {
    return 'fas fa-file-code';
  } else {
    return 'fas fa-file';
  }
}

// Formatar tamanho do arquivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Excluir arquivo
function deleteFile(fileId) {
  fetch(`/api/files/${fileId}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Remover elemento do DOM
        const fileElement = document.querySelector(`.file-item[data-id="${fileId}"]`);
        fileElement.remove();

        // Mostrar mensagem de sucesso
        showToast('Arquivo excluído com sucesso');

        // Atualizar lista de arquivos
        fetchFiles();
      } else {
        showToast('Erro ao excluir arquivo', 'error');
      }
    })
    .catch(error => {
      console.error('Erro ao excluir arquivo:', error);
      showToast('Erro ao excluir arquivo', 'error');
    });
}

// Configurar eventos para drag and drop
function setupDragAndDrop() {
  // Prevenir comportamento padrão para eventos de drag
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area quando um item é arrastado sobre ela
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  // Remove highlight quando o item sai ou é solto
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  // Lidar com o arquivo quando for solto
  dropArea.addEventListener('drop', handleDrop, false);
}

// Configurar input de arquivo
function setupFileInput() {
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
    }
  });
}

// Funções auxiliares para drag and drop
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

// Processar arquivos para upload
function handleFiles(files) {
  // Verificar se há arquivos
  if (files.length === 0) return;
  
  // Fazer upload de apenas um arquivo por vez
  const file = files[0];
  
  // Verificar tamanho do arquivo (2GB = 2 * 1024 * 1024 * 1024 bytes)
  if (file.size > 2 * 1024 * 1024 * 1024) {
    showToast('Arquivo muito grande. O limite é de 2GB por arquivo.', 'error');
    return;
  }
  
  // Verificar espaço disponível
  if (totalUsedSpace + file.size > maxStorage) {
    showToast('Espaço de armazenamento insuficiente.', 'error');
    return;
  }
  
  // Iniciar upload
  uploadFile(file);
}

// Fazer upload do arquivo
function uploadFile(file) {
  // Mostrar barra de progresso
  showProgressBar(file.name);
  
  // Criar FormData para o upload
  const formData = new FormData();
  formData.append('file', file);
  
  // Criar XMLHttpRequest para monitorar o progresso
  const xhr = new XMLHttpRequest();
  
  // Monitorar progresso do upload
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const percentComplete = Math.round((event.loaded / event.total) * 100);
      updateProgress(percentComplete);
    }
  });
  
  // Finalizar upload
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      hideProgressBar();
      showToast('Arquivo enviado com sucesso');
      fetchFiles();
    } else {
      hideProgressBar();
      showToast('Erro ao enviar arquivo', 'error');
    }
  });
  
  // Lidar com erros
  xhr.addEventListener('error', () => {
    hideProgressBar();
    showToast('Erro ao enviar arquivo', 'error');
  });
  
  // Configurar e enviar a requisição
  xhr.open('POST', '/api/upload');
  xhr.send(formData);
}

// Atualizar barra de progresso
function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
  progressPercentage.textContent = `${percent}%`;
}

// Mostrar barra de progresso
function showProgressBar(name) {
  fileName.textContent = name;
  progressBar.style.width = '0%';
  progressPercentage.textContent = '0%';
  uploadProgress.classList.remove('hide');
}

// Esconder barra de progresso
function hideProgressBar() {
  uploadProgress.classList.add('hide');
}

// Mostrar mensagem de arquivos vazios
function showEmptyFilesMessage() {
  emptyFiles.style.display = 'flex';
}

// Esconder mensagem de arquivos vazios
function hideEmptyFilesMessage() {
  emptyFiles.style.display = 'none';
}

// Configurar toast
function setupToast() {
  closeToast.addEventListener('click', hideToast);
}

// Mostrar toast
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  
  // Trocar ícone baseado no tipo
  const iconElement = toast.querySelector('.toast-content i');
  iconElement.className = type === 'success' ? 'fas fa-check-circle success-icon' : 'fas fa-exclamation-circle error-icon';
  
  // Mostrar toast
  toast.classList.add('show');
  
  // Esconder após 5 segundos
  setTimeout(hideToast, 5000);
}

// Esconder toast
function hideToast() {
  toast.classList.remove('show');
}

// Atualizar informações de armazenamento
function updateStorageInfo(files) {
  totalUsedSpace = files.reduce((total, file) => total + file.size, 0);
  const usedPercentage = (totalUsedSpace / maxStorage) * 100;
  
  // Atualizar texto e barra de progresso
  usedSpace.textContent = formatFileSize(totalUsedSpace);
  storageUsed.style.width = `${usedPercentage}%`;
} 
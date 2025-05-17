const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();

// Inicializar o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Criar pasta para uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar o banco de dados SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Criar tabela de arquivos se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      originalname TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB em bytes
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// API para listar arquivos
app.get('/api/files', (req, res) => {
  db.all('SELECT * FROM files ORDER BY uploadDate DESC', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar arquivos:', err);
      return res.status(500).json({ error: 'Erro ao buscar arquivos' });
    }
    res.json(rows);
  });
});

// API para upload de arquivos
app.post('/api/upload', (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const uploadedFile = req.files.file;
    const fileId = uuidv4();
    const fileName = `${fileId}-${uploadedFile.name}`;
    const uploadPath = path.join(uploadsDir, fileName);

    // Mover o arquivo para a pasta de uploads
    uploadedFile.mv(uploadPath, (err) => {
      if (err) {
        console.error('Erro ao mover arquivo:', err);
        return res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
      }

      // Salvar informações do arquivo no banco de dados
      db.run(
        'INSERT INTO files (id, filename, originalname, mimetype, size, path) VALUES (?, ?, ?, ?, ?, ?)',
        [fileId, fileName, uploadedFile.name, uploadedFile.mimetype, uploadedFile.size, uploadPath],
        function(err) {
          if (err) {
            console.error('Erro ao salvar arquivo no banco de dados:', err);
            return res.status(500).json({ error: 'Erro ao salvar arquivo no banco de dados' });
          }

          res.json({
            id: fileId,
            filename: fileName,
            originalname: uploadedFile.name,
            mimetype: uploadedFile.mimetype,
            size: uploadedFile.size,
            path: uploadPath
          });
        }
      );
    });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// API para excluir arquivo
app.delete('/api/files/:id', (req, res) => {
  const fileId = req.params.id;

  // Buscar informações do arquivo no banco de dados
  db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
    if (err) {
      console.error('Erro ao buscar arquivo:', err);
      return res.status(500).json({ error: 'Erro ao buscar arquivo' });
    }

    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Excluir o arquivo físico
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Erro ao excluir arquivo físico:', err);
      }

      // Remover registro do banco de dados
      db.run('DELETE FROM files WHERE id = ?', [fileId], (err) => {
        if (err) {
          console.error('Erro ao remover arquivo do banco de dados:', err);
          return res.status(500).json({ error: 'Erro ao excluir arquivo' });
        }

        res.json({ success: true, message: 'Arquivo excluído com sucesso' });
      });
    });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 
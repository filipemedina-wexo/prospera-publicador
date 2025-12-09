require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const unzipper = require('unzipper');

const app = express();
// Usa porta 4002 para evitar conflitos conhecidos
const PORT = process.env.PORT || 4000;
const SITES_BASE = process.env.SITES_BASE || path.join(__dirname, 'sites');

// Configuração do Multer (armazenamento temporário)
const upload = multer({
    dest: 'temp_uploads/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Garante que a pasta de sites existe
fs.ensureDirSync(SITES_BASE);

// --- ENDPOINT DE PUBLICAÇÃO ---
app.post('/publish', upload.single('file'), async (req, res) => {
    try {
        const { subdomain } = req.body;
        const file = req.file;

        // 1. Validações
        if (!file) {
            return res.status(400).json({ success: false, message: 'Arquivo ZIP é obrigatório.' });
        }

        if (!subdomain || !/^[a-z0-9-]+$/.test(subdomain)) {
            // Remove o arquivo temporário se a validação falhar
            await fs.remove(file.path);
            return res.status(400).json({
                success: false,
                message: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífens.'
            });
        }

        const destDir = path.join(SITES_BASE, subdomain);

        // 2. Limpeza da pasta de destino (se existir)
        await fs.emptyDir(destDir); // Cria se não existir, limpa se existir

        // 3. Extração do ZIP
        const zipStream = fs.createReadStream(file.path).pipe(unzipper.Extract({ path: destDir }));

        await new Promise((resolve, reject) => {
            zipStream.on('close', resolve);
            zipStream.on('error', reject);
        });

        // 4. Limpeza do arquivo temporário
        await fs.remove(file.path);

        // 5. Retorno de sucesso
        res.json({
            success: true,
            url: `https://${subdomain}.useprospera.com.br`,
            message: 'LP publicada com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao publicar LP:', error);
        // Tenta limpar o arquivo temporário em caso de erro
        if (req.file) await fs.remove(req.file.path).catch(() => { });

        res.status(500).json({
            success: false,
            message: 'Erro interno ao processar a publicação.',
            error: error.message
        });
    }
});

// --- MIDDLEWARE PARA SERVIR SITES POR SUBDOMÍNIO ---
app.use(async (req, res, next) => {
    const host = req.headers.host;
    if (!host) return next();

    const parts = host.split('.');

    // Ignora se for o domínio raiz ou IP
    if (parts.length < 3) return next();

    const subdomain = parts[0];
    const siteDir = path.join(SITES_BASE, subdomain);

    // Verifica se o diretório do site existe
    if (await fs.pathExists(siteDir)) {
        // Serve os arquivos estáticos desse diretório
        express.static(siteDir)(req, res, next);
    } else {
        next();
    }
});

// Rota padrão
app.get('/', (req, res) => {
    res.send('API de Publicação de Landing Pages está rodando. Envie um POST para /publish para publicar.');
});

// Inicia o servidor e trata erros
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Diretório base dos sites: ${SITES_BASE}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Erro Crítico: A porta ${PORT} já está em uso.`);
    } else {
        console.error('Erro desconhecido ao iniciar servidor:', e);
    }
});

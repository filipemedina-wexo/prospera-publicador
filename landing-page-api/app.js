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

const https = require('https');

// Função auxiliar para fazer requisições HTTP (Promisified)
function httpRequest(url, options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body); // Se não for JSON
                    }
                } else {
                    reject({ statusCode: res.statusCode, body });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Busca o ID do domínio no EasyPanel
async function findDomainId(subdomain) {
    const apiKey = process.env.EASYPANEL_API_KEY;
    const apiUrlBase = process.env.EASYPANEL_API_URL ? process.env.EASYPANEL_API_URL.split('/trpc')[0] : 'https://34eiwn.easypanel.host/api';

    if (!apiKey) return null;

    const domainHost = `${subdomain}.useprospera.com.br`;

    // TRPC Input para listDomains (baseado em projectName e serviceName)
    const input = {
        json: {
            projectName: "prospera",
            serviceName: "lp-prospera-publicador"
        }
    };

    const encodedInput = encodeURIComponent(JSON.stringify(input));
    const url = `${apiUrlBase}/trpc/domains.listDomains?input=${encodedInput}`;

    try {
        const options = {
            method: 'GET',
            headers: { 'Authorization': apiKey }
        };

        const response = await httpRequest(url, options, null);
        // TRPC response structure: { result: { data: { json: [...] } } }
        // Ou direto se for transformer: { result: { data: [...] } }
        // Vamos tentar navegar com segurança
        const domains = response?.result?.data?.json || response?.result?.data || [];

        if (Array.isArray(domains)) {
            const found = domains.find(d => d.host === domainHost);
            return found ? found.id : null;
        }
        return null;

    } catch (error) {
        console.error('[EasyPanel] Erro ao listar domínios:', error);
        return null;
    }
}

// Deleta o domínio no EasyPanel pelo ID
async function deleteDomainInEasyPanel(domainId) {
    const apiKey = process.env.EASYPANEL_API_KEY;
    const apiUrlBase = process.env.EASYPANEL_API_URL ? process.env.EASYPANEL_API_URL.split('/trpc')[0] : 'https://34eiwn.easypanel.host/api';

    if (!apiKey || !domainId) return false;

    const url = `${apiUrlBase}/trpc/domains.deleteDomain`;
    const payload = {
        json: { id: domainId }
    };
    const postData = JSON.stringify(payload);

    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'Authorization': apiKey
            }
        };

        await httpRequest(url, options, postData);
        console.log(`[EasyPanel] Domínio ID ${domainId} deletado com sucesso.`);
        return true;
    } catch (error) {
        console.error('[EasyPanel] Erro ao deletar domínio:', error);
        return false;
    }
}

// Register (Create) Domain - Adaptado para usar o helper
async function registerDomain(subdomain) {
    const apiKey = process.env.EASYPANEL_API_KEY;
    const apiUrl = process.env.EASYPANEL_API_URL || 'https://34eiwn.easypanel.host/api/trpc/domains.createDomain';

    if (!apiKey) {
        console.warn('[EasyPanel] API Key não configurada. Pulei o registro automático.');
        return false;
    }

    const domainHost = `${subdomain}.useprospera.com.br`;
    const payload = {
        json: {
            id: "",
            https: true,
            host: domainHost,
            path: "/",
            middlewares: [],
            certificateResolver: "",
            destinationType: "service",
            wildcard: false,
            serviceDestination: {
                protocol: "http",
                port: 3000,
                path: "/",
                projectName: "prospera",
                serviceName: "lp-prospera-publicador"
            }
        }
    };

    const postData = JSON.stringify(payload);

    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'Authorization': apiKey
            }
        };

        await httpRequest(apiUrl, options, postData);
        console.log(`[EasyPanel] Domínio ${domainHost} registrado com sucesso!`);
        return true;
    } catch (err) {
        console.error(`[EasyPanel] Falha no registro:`, err);
        return false;
    }
}

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

        // 3. Integração EasyPanel
        try {
            await registerDomain(subdomain);
        } catch (e) {
            console.error('Erro ao registrar domínio, mas prosseguindo com upload:', e);
        }

        // 4. Extração do ZIP
        console.log(`[Publish] Iniciando extração do ZIP para: ${destDir}`);
        const zipStream = fs.createReadStream(file.path).pipe(unzipper.Extract({ path: destDir }));

        await new Promise((resolve, reject) => {
            zipStream.on('close', () => {
                console.log(`[Publish] Extração concluída com sucesso.`);
                // Lista arquivos para confirmar
                try {
                    const files = fs.readdirSync(destDir);
                    console.log(`[Publish] Arquivos extraídos em ${destDir}:`, files);
                } catch (e) {
                    console.error(`[Publish] Erro ao listar arquivos extraídos:`, e);
                }
                resolve();
            });
            zipStream.on('error', (err) => {
                console.error(`[Publish] Erro na extração:`, err);
                reject(err);
            });
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
    // Ex: localhost:3000 (2 partes) ou 127.0.0.1 (4 partes numéricas - simplificação)
    // Ex real: teste.useprospera.com.br (4 partes) -> subdomain=teste
    // Ex real: publicador.useprospera.com.br (4 partes) -> subdomain=publicador

    // Log para debug
    console.log(`[Middleware] Host: ${host}, Parts: ${parts.length}`);

    if (parts.length < 3) return next();

    const subdomain = parts[0];

    // Lista negra de subdomínios (api, www, publicador, etc) se necessário
    if (['www', 'api', 'publicador'].includes(subdomain)) return next();

    const siteDir = path.join(SITES_BASE, subdomain);

    const exists = await fs.pathExists(siteDir);
    if (exists) {
        console.log(`[Middleware] Servindo site para subdomínio: ${subdomain} em ${siteDir}`);
        express.static(siteDir)(req, res, next);
    } else {
        // Se é um subdomínio mas não tem pasta, loga warning (pode ser 404 real ou erro de volume)
        if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
            console.warn(`[Middleware] Subdomínio ${subdomain} acessado, mas pasta não encontrada em ${siteDir}`);
        }
        next();
    }
});

// Rota padrão
app.get('/', (req, res) => {
    res.send('API de Publicação de Landing Pages está rodando. Envie um POST para /publish para publicar.');
});

// --- ENDPOINT DE DELEÇÃO ---
app.delete('/publish/:subdomain', async (req, res) => {
    const { subdomain } = req.params;

    if (!subdomain || !/^[a-z0-9-]+$/.test(subdomain)) {
        return res.status(400).json({ success: false, message: 'Subdomínio inválido.' });
    }

    const siteDir = path.join(SITES_BASE, subdomain);

    try {
        // 1. Tentar remover do EasyPanel (Sempre tentamos, mesmo se pasta não existir)
        console.log(`[Delete] Buscando ID do domínio para ${subdomain}...`);
        const domainId = await findDomainId(subdomain);

        if (domainId) {
            console.log(`[Delete] Removendo domínio ID ${domainId} do EasyPanel...`);
            await deleteDomainInEasyPanel(domainId);
        } else {
            console.warn(`[Delete] ID do domínio não encontrado no EasyPanel para ${subdomain}. Talvez já tenha sido removido.`);
        }

        // 2. Remover arquivos locais
        if (await fs.pathExists(siteDir)) {
            await fs.remove(siteDir);
            console.log(`[Delete] Pasta ${siteDir} removida.`);
        } else {
            console.warn(`[Delete] Pasta não encontrada: ${siteDir}`);
        }

        res.json({ success: true, message: 'Landing Page removida com sucesso.' });

    } catch (error) {
        console.error(`[Delete] Erro ao remover ${subdomain}:`, error);
        res.status(500).json({ success: false, message: 'Erro ao remover LP.', error: error.message });
    }
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

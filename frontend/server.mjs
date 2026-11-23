import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distDir = path.join(__dirname, 'dist');

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'railyatra-3d-render' });
});

app.use(express.static(distDir));
app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 10000);
app.listen(port, () => {
  console.log(`RailYatra 3D Render server listening on port ${port}`);
});
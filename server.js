import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = join(__dirname, 'dist');

// Build if dist doesn't exist
if (!existsSync(distPath)) {
  console.log('Building app...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build complete');
  } catch(e) {
    console.error('Build failed:', e.message);
    process.exit(1);
  }
}

app.use(express.static(distPath));
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Build failed - index.html not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sojourn running on port ${PORT}`);
});

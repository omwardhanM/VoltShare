import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlPath = path.join(__dirname, 'report.html');
const pdfPath = path.join(rootDir, 'VoltShare_PBL_Report.pdf');

console.log('[INFO] Compiling VoltShare 7-Page Academic Report to PDF...');
try {
  execSync(
    `google-chrome --headless --disable-gpu --no-sandbox --print-to-pdf-no-header --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
    { stdio: 'inherit' }
  );
  console.log(`[SUCCESS] Generated official academic report at: ${pdfPath}`);
} catch (err) {
  console.error('[ERROR] Failed to compile PDF:', err.message);
}

import { writeFile } from 'node:fs/promises';
import { createCanvas, loadImage } from 'canvas';

const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0b1326';
ctx.fillRect(0, 0, 1200, 630);
ctx.fillStyle = '#6bfb9a';
ctx.fillRect(72, 72, 64, 6);
const logo = await loadImage(new URL('../public/icon.svg', import.meta.url).pathname);
ctx.drawImage(logo, 1024, 64, 104, 104);
ctx.fillStyle = '#dae2fd';
ctx.font = 'bold 64px monospace';
ctx.fillText('ChessRoot', 72, 170);
ctx.font = 'bold 44px monospace';
ctx.fillText('Your chess opening tree.', 72, 290);
ctx.fillText('Your games, understood.', 72, 350);
ctx.fillStyle = '#bccabb';
ctx.font = '26px monospace';
ctx.fillText('Lichess & Chess.com', 72, 432);
ctx.fillText('Opening explorer / Insights / Achievements', 72, 480);
ctx.fillStyle = '#6bfb9a';
ctx.font = '24px monospace';
ctx.fillText('Free & open source', 72, 564);
ctx.fillText('chessroot.org', 928, 564);
await writeFile(
  new URL('../public/social-preview.png', import.meta.url),
  canvas.toBuffer('image/png'),
);

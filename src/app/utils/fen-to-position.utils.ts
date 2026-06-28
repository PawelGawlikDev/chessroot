export function fenToPosition(fen: string): string {
  return fen
    .split(' ')[0]
    .split('/')
    .map((rank) => rank.replace(/[1-8]/g, (m) => '.'.repeat(parseInt(m))))
    .join('');
}

export function positionToFiles(position: string): string[] {
  const files: string[] = [];

  for (let i = 0; i < position.length; i++) {
    const file = i % 8;

    if (!files[file]) {
      files[file] = '';
    }

    files[file] += position[i];
  }

  return files;
}

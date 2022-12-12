import path from 'path';
import url from 'url';

function currentDir(fileUrl: string) {
  return path.dirname(url.fileURLToPath(fileUrl));
}

export default currentDir;

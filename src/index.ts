import * as path from 'path';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { App } from 'cdktf';
import currentDir from './utils/current-dir.js';
import fileExists from './utils/file-exists.js';

// returns all subfolders in src\stacks
async function getStacksPaths(stacksPath: string): Promise<string[]> {
  try {
    return (await readdir(stacksPath, { withFileTypes: true })).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
  } catch (readDirError) {
    console.error('readdir error: ', readDirError);
    console.log('readdir stacks path: ', stacksPath);
    console.log(`Is the "${stacksPath}" path missing?`);
    return [];
  }
}

// addStacks will import all folders in src\stacks that have an index.ts (or index.js) file
// the stack name used will match the folder name.  GitHub Actions can skip folders/stacks with no changes.
async function addStacks(app: App) {
  const stacksPath = path.join(currentDir(import.meta.url), 'stacks');
  const stackFolders = await getStacksPaths(stacksPath);
  return Promise.all(stackFolders.map(async (stackFolder) => {
    const stackFileIndexPath: string = path.join(stacksPath, stackFolder, 'index.js');
    const stackFilePathExists = await fileExists(stackFileIndexPath);
    if (!stackFilePathExists) {
      return {
        stackFilePathExists,
        stackFolder,
        stackHandle: () => {},
      };
    }
    const AddNewStack = (await import(pathToFileURL(stackFileIndexPath).href)).default;
    return {
      stackFilePathExists,
      stackFolder,
      stackHandle: new AddNewStack(app, stackFolder), // the stackFolder and the CDKTF stack name are the same
    };
  }));
}

(async () => {
  const app = new App();
  await addStacks(app);
  app.synth();
})();

// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
// import { Construct } from 'constructs';
// import { App, TerraformStack } from 'cdktf';

// class MyStack extends TerraformStack {
//   constructor(scope: Construct, id: string) {
//     super(scope, id);

//     // define resources here
//   }
// }

import * as path from 'path';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { App } from 'cdktf';
import currentDir from './utils/current-dir.js';
import fileExists from './utils/file-exists.js';

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

async function addStacks(app: App) {
  const stacksPath = path.join(currentDir(import.meta.url), 'stacks');
  const stackFolders = await getStacksPaths(stacksPath);
  // console.log('stackFolders: ', stackFolders);
  return Promise.all(stackFolders.map(async (stackFolder) => {
    // console.log('stackFolder: ', stackFolder);
    const stackFilePath: string = path.join(stacksPath, stackFolder, 'index.js');
    const stackFilePathExists = await fileExists(stackFilePath);
    // console.log('stackFilePath: ', stackFilePath);
    // console.log('stackFilePathExists: ', stackFilePathExists);
    if (!stackFilePathExists) {
      return {
        stackFilePathExists,
        stackFolder,
        stackHandle: () => {},
      };
    }
    const addNewStack = await import(pathToFileURL(stackFilePath).href);
    // console.log('addNewStack: ', addNewStack);
    return {
      stackFilePathExists,
      stackFolder,
      stackHandle: addNewStack.default(app, stackFolder),
    };
  }));
}

(async () => {
  const app = new App();
  // const _stackResults =
  await addStacks(app);
  // console.log('stackResults: ', stackResults);

  // new MyStack(app, 'cdktf_az_hub_spoke');
  app.synth();
})();

import { access, constants } from 'node:fs';

function testFileAccess(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    access(filePath, constants.F_OK, (err) => {
      if (err) {
        // console.log('file does not exist: ', err.message);
        reject(err.message);
      }
      resolve();
    });
  });
}

async function fileExists(filePath: string): Promise<boolean> {
  let result: boolean = false;
  try {
    await testFileAccess(filePath);
    result = true;
  } catch (error) {
    // console.debug('fileExists error: ', error);
  }
  return result;
}

export default fileExists;

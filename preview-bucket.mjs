import fs from 'node:fs/promises';import path from 'node:path';
export function previewBucket(){
 const root=path.resolve('.preview-photos');
 const filename=key=>{const file=path.resolve(root,key);if(!file.startsWith(root+path.sep))throw Error('Invalid object key');return file;};
 return {async put(key,bytes){const file=filename(key);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,typeof bytes.arrayBuffer==='function'?new Uint8Array(await bytes.arrayBuffer()):bytes);},async get(key){try{const data=await fs.readFile(filename(key));return {body:new Blob([data]).stream()};}catch(error){if(error.code==='ENOENT')return null;throw error;}},async delete(key){await fs.rm(filename(key),{force:true});}};
}

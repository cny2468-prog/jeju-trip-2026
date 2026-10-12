import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function previewDatabase(filename='preview-submissions.sqlite'){
 const db=new DatabaseSync(filename);
 const migrations=fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort();
 db.exec('CREATE TABLE IF NOT EXISTS preview_migrations (name TEXT PRIMARY KEY)');
 for(const file of migrations)if(!db.prepare('SELECT name FROM preview_migrations WHERE name=?').get(file)){
  db.exec(fs.readFileSync('drizzle/'+file,'utf8'));db.prepare('INSERT INTO preview_migrations VALUES (?)').run(file);
 }
 return {
  prepare(sql){
   const statement=db.prepare(sql);
   return {bind(...values){return {
    async run(){const result=statement.run(...values);return {meta:{changes:result.changes}};},
    async all(){return {results:statement.all(...values)};}
   };}};
  }
 };
}

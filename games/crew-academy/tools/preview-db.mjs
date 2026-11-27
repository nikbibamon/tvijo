import {DatabaseSync} from 'node:sqlite';
import {readFile,readdir} from 'node:fs/promises';

export async function openCrewDB(){
  const db=new DatabaseSync(':memory:'),dir=new URL('../drizzle/',import.meta.url);
  for(const name of (await readdir(dir)).filter(n=>n.endsWith('.sql')).sort())db.exec(await readFile(new URL(name,dir),'utf8'));
  const DB={
    prepare(sql){return {bind(...args){const stmt=db.prepare(sql);
      return {async all(){return {results:stmt.all(...args)};},async run(){return stmt.run(...args);}};
    }};},
    async batch(statements){db.exec('BEGIN');
      try{const results=[];for(const statement of statements)results.push(await statement.run());db.exec('COMMIT');return results;}
      catch(error){db.exec('ROLLBACK');throw error;}
    }
  };
  return {DB,db};
}

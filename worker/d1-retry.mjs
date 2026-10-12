// Only use for read queries and writes whose result is unchanged on repetition:
// the submission routes use keyed UPSERTs and absolute-value UPDATEs.
export function submissionDatabase(db){
 const transient=error=>/Network connection lost|Replica disconnected from primary|storage caused object to be reset|reset because its code was updated|transient issue on remote node/i.test(String(error?.message)+' '+String(error?.cause?.message));
 const execute=async operation=>{
  for(let attempt=0;;attempt++){
   try{return await operation();}
   catch(error){
    if(attempt>=3||!transient(error))throw error;
    console.warn('Submission database transient error; retrying',attempt+1);
    await new Promise(resolve=>setTimeout(resolve,200*2**attempt+Math.floor(Math.random()*200)));
   }
  }
 };
 const statement=inner=>({bind(...args){return statement(inner.bind(...args));},all(...args){return execute(()=>inner.all(...args));},run(...args){return execute(()=>inner.run(...args));}});
 return {prepare(sql){return statement(db.prepare(sql));}};
}

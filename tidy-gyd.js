/* convert WFG format to JSON */
import {nodefs,writeChanged,readTextContent,patchBuf} from 'ptk/nodebundle.cjs';
import {parseRevisedEntry} from './src/moe-revised.js'
import Errata from './src/errata-concised.js'

await nodefs;
const srcdir='raw/'
const outdir='tidied/';
//https://drive.google.com/drive/folders/11-nEz4xlm3nT25bOrj6l7WRKA1faix8X 教育部成語典[5153].7z
const srcfile='dict_revised.json'; //test file moe-format.json

const entries = JSON.parse(readTextContent(srcdir+srcfile));
const ctx={};
const out=[];
const rare=[];

entries.forEach(entry=>{
	const E=Errata[entry[1]];
	if (E ) for (let i in E) { //for every fields
		let patched;
		if (E[i]) {
			patched=patchBuf( entry[i] , E[i]);
			if (entry[i]!==patched){
				console.log(entry[0],entry[1],'patched')
				delete Errata[entry[0]];// 因為有同音字詞，發現後就刪去。
			}
			entry[i]=patched;
		}
	} 
	const [id,orth,zy,py]=entry;

	const obj=parseRevisedEntry(entry,ctx); 

	if (!obj) return;
	out.push(obj);
});

let outfn=outdir+srcfile.replace('.txt','.off');
writeChanged(outfn,JSON.stringify(out,'',' '),true);
/* convert WFG format to JSON */
import {nodefs,writeChanged,readTextLines,readTextContent} from 'pitaka/cli';
import {parseIdiomEntry} from './src/moe-idioms.js'


await nodefs;
const srcdir='raw/'
const outdir='off/';
//https://drive.google.com/drive/folders/11-nEz4xlm3nT25bOrj6l7WRKA1faix8X 教育部成語典[5153].7z
const srcfile='moe-format.json';//'dict_idioms.json'; //test file wfg-format.txt

const entries = JSON.parse(readTextContent(srcdir+srcfile));
const ctx={};
const out=[];
entries.forEach(entry=>{
	const obj=parseIdiomEntry(entry,ctx); 
	if (!obj) return;
	out.push(obj);
});

if (writeChanged(outdir+srcfile.replace('.txt','.off'),JSON.stringify(out,'',' '))) {
	console.log('written',out.length);
}




/* 
prerequisite 

to raw/dict-revised*.txt in utf-8 format
釋義 有\n 符，要處理。

*/

import {nodefs,writeChanged,readTextLines,readTextContent} from 'ptk/nodebundle.cjs';
import {fromExcelXML} from './src/excelxml.js'
await nodefs;
const srcdir='raw/';

import PUA from './src/pua.js';
let raw=[];
const srcfn=process.argv[2]|| 'dict_idioms.xml'
//if (srcfn.indexOf('concised')>0) idfield=2;
readTextLines('raw/sym.txt').forEach(line=>{
	const at=line.indexOf(' ');
	if (at==-1) return;
	const code=line.slice(0,at);
	const repl=line.slice(at+1);
	PUA[code]=repl;
});

let entries=[];
if (srcfn.endsWith('.xml')) {
	raw=readTextContent(srcdir+srcfn);
	const entityfn=srcfn.replace('.xml','-entity.json');
	let entities={}	
	if (fs.existsSync(srcdir+entityfn)) {
		entities=JSON.parse(readTextContent(srcdir+entityfn));
	}
	entries=fromExcelXML(raw,entities);
	entries.shift();//drop field names
} else throw "only support and xml";


const defPUA=cp=>{
	if ((cp[0]=='2' && cp.length==5) || (cp[0]=='3'&&cp.length==4)) {
		const s=String.fromCodePoint(parseInt(cp,16))
		if (s) return s;
	}
	return '^pua#'+cp;
}
const replacePUA=buf=>{
	buf=buf.replace(/\&([\da-fx]+)\._104_0\.gif;?/ig,(m,m1)=>{
		m1=m1.toLowerCase();
		let repl=PUA[m1]||PUA['x'+m1];

		return repl?repl: defPUA(m1);
	})
	buf=buf.replace(/\&([\da-fx]+);?_\.png;/g,(m,m1)=>{
		const repl=PUA[m1]||PUA['x'+m1];
		return repl?repl:defPUA(m1);
	})	
	return buf;
}
const tidy=buf=>{
	buf=replacePUA(buf);
	return buf;
}

entries.shift();
const entry_id={};
entries.forEach(entry=>{
	const [id,idiom]=entry;
	if (entry_id[idiom] && id!=='354') { // 含沙射影 duplicated 8 and 354
		console.log('duplicated idiom',id,idiom, entry_id[idiom]);
	} else {
		entry_id[idiom]=id;
	}
})


let outfn='raw/'+srcfn.replace('.xml','.json');
if (outfn!==srcfn) {
	if (writeChanged(outfn,JSON.stringify(entries,'',' '))) {
		console.log('written',outfn,'length,',entries.length);
	} else {
		console.log(outfn,'no difference')
	}
} else {
	console.log('src filename must be .xml');
}
outfn=srcdir+'entry_id.json';
if (writeChanged(outfn,JSON.stringify(entry_id,'',' '))) {
	console.log('written',outfn)
} else {
	console.log(outfn,'no difference')
}
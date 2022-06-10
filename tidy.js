/* 
prerequisite 

to raw/dict-revised*.txt in utf-8 format
釋義 有\n 符，要處理。

*/

import {nodefs,writeChanged,readTextLines,readTextContent} from 'pitaka/cli';
import {fromDIF} from 'pitaka/format'
import {fromExcelXML} from './src/excelxml.js'
await nodefs;
const srcdir='raw/';

import PUA from './src/pua.js';
let raw=[];
const srcfn=process.argv[2]|| 'dict_idioms.xml'

readTextLines('raw/sym.txt').forEach(line=>{
	const at=line.indexOf(' ');
	if (at==-1) return;
	const code=line.slice(0,at);
	const repl=line.slice(at+1);
	PUA[code]=repl;
});
/*
for (let i=1;i<4;i++) {
	const rawlines=readTextLines('raw/'+srcfile);
	if (rawlines[0].slice(0,4)=='字詞屬性') rawlines.shift();//去欄名列
	raw.push(...  rawlines) ;
}
*/

/*
const fixMultiline=raw=>{
	const out=[];
	let linedata='';
	for (let i=0;i<raw.length;i++) {
		const at=raw[i].indexOf('\t');
		const f0=raw[i].slice(0,at);
		if (parseInt(f0).toString()===f0 ) { //這是開始行
			i&&out.push(linedata);
			linedata=raw[i];
		} else { //接回上一次
			linedata+='$$'+raw[i];
		}
	}
	out.push(linedata);
	return out;
}
*/

let entries=[];
if (srcfn.endsWith('.dif')) {
	raw=readTextLines(srcdir+srcfn);
	entries=fromDIF(raw);
} else if (srcfn.endsWith('.xml')) {
	raw=readTextContent(srcdir+srcfn);
	const entityfn=srcfn.replace('.xml','-entity.json');
	const entities=JSON.parse(readTextContent(srcdir+entityfn));
	entries=fromExcelXML(raw,entities);
	entries.shift();//drop field names
} else throw "only support dif and xml";


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


const outfn='raw/'+srcfn.replace('.xml','.json');
if (outfn!==srcfn) {
	if (writeChanged(outfn,JSON.stringify(entries,'',' '))) {
		console.log('written',outfn,'length,',entries.length);
	}
} else {
	console.log('src filename must be .dif');
}

if (writeChanged(srcdir+'entry_id.json',JSON.stringify(entry_id,'',' '))) {
	console.log('writting entry_id.json')
}
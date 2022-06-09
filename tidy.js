/* 
prerequisite 

to raw/dict-revised*.txt in utf-8 format
釋義 有\n 符，要處理。

*/

import {nodefs,writeChanged,readTextLines} from 'pitaka/cli';
import {fromDIF} from 'pitaka/format'
await nodefs;
import PUA from './src/pua.js';
let raw=[];
const srcfn=process.argv[2]|| 'dict-revised.txt'
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
 raw=readTextLines('raw/'+srcfn);
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


const entries=fromDIF(raw);

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



const outfn='raw/'+srcfn.replace('.dif','.json');
if (outfn!==srcfn) {
	if (writeChanged(outfn,JSON.stringify(entries,'',' '))) {
		console.log('written',outfn,'length,',entries.length);
	}
} else {
	console.log('src filename must be .dif');
}
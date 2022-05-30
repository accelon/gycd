/* 
prerequisite 

to raw/dict-revised*.txt in utf-8 format
釋義 有\n 符，要處理。

*/

import {nodefs,writeChanged,readTextLines} from 'pitaka/cli';
await nodefs;
import PUA from './src/pua.js';
const raw=[];
readTextLines('raw/sym.txt').forEach(line=>{
	const at=line.indexOf(' ');
	if (at==-1) return;
	const code=line.slice(0,at);
	const repl=line.slice(at+1);
	PUA[code]=repl;
});

for (let i=1;i<4;i++) {
	const rawlines=readTextLines('raw/dict-revised'+i+'.txt');
	if (rawlines[0].slice(0,4)=='字詞屬性') rawlines.shift();//去欄名列
	raw.push(...  rawlines) ;
}
// raw.push(...readTextLines('raw/dict-sample.txt'));

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

const entries=fixMultiline(raw);

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

let content=tidy(entries.join('\n'));

const validate=buf=>{
	const lines=buf.split('\n');
	for (let i=0;i<lines.length;i++){
		const count=lines[i].split('\t').length;
		if (count!==14) console.log('line items error',count,i,lines[i]);
	}
}
validate(content);
const outfn='raw/dict-revised.txt';
if (writeChanged(outfn,content)) {
	console.log('written',outfn,'length,',entries.length);
}
import {nodefs,writeChanged,readTextLines} from 'pitaka/cli';
import {fromObj} from 'pitaka/utils'
import {parseRaw} from './src/parseraw.js'
import {identify} from './src/identify.js'
import {serialize} from './src/serializer.js'
await nodefs
const srcdir='raw/'
const srcfn='dict-revised.txt';
const outdir='off/';
console.log('loading')
const lines=readTextLines(srcdir+srcfn);//.slice(100);;
const rawdata=parseRaw(lines);

let outfn=outdir+srcfn.replace('.txt','.off')
const ctx={Strings:[],   Sentences:[] , Persons:[],  count:0};
      //短字串(詞目,書名)   含標點的句子    人名朝代名
let out=serialize(rawdata,ctx);
out=identify(out,ctx);

let wid='';

for (let i=0;i<out.length;i++) {
	const line=out[i];
	let touch=line.trim();
	if (line.slice(0,2)=='^e') {
		const at=line.indexOf('[')
		wid=line.slice(2,at);
	} else {

	}	
	out[i]=touch.trim();
}

const readonly=false;
// const arrtype=fromObj(ctx.Types,(a,b)=>[a,b]);
// arrtype.sort((a,b)=>b[1]-a[1]);

if (!readonly) {

console.log('writing');
if (writeChanged(outfn,out.join('\n'))){
	console.log('written',outfn,out.length);
}
// outfn=outdir+'quotes-sample.txt';

// if (writeChanged(outfn,quotes.join('\n'))){
// 	console.log('written',outfn,quotes.length)
// }

outfn=outdir+'string-table.txt';
let arr=fromObj(ctx.Strings,(a,b)=>[a,b[1]]); //drop the wid
arr.sort((a,b)=>b[1]-a[1]);
if (writeChanged(outfn,arr.join('\n'))){
	console.log('written',outfn,arr.length)
}

outfn=outdir+'sentences.txt';
arr=fromObj(ctx.Sentences,(a,b)=>[a,b[1]]); //drop the wid
arr.sort((a,b)=>b[1]-a[1]);
if (writeChanged(outfn,arr.join('\n'))){
	console.log('written',outfn,arr.length)
}

outfn=outdir+'persons.txt';
arr=fromObj(ctx.Persons,(a,b)=>[a,b[1]]); //drop the wid
arr.sort((a,b)=>b[1]-a[1]);
if (writeChanged(outfn,arr.join('\n'))){
	console.log('written',outfn,arr.length)
}

}
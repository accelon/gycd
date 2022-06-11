import {nodefs,writeChanged,readTextContent} from 'pitaka/cli';
import {fromObj,patchBuf} from 'pitaka/utils'

await nodefs
const fieldCNames=['編號','成語', '注音','漢語拼音','釋義',
'典源出處名稱','典源文獻內容','典源-註解','典源-參考', 
'典故說明','用法-語意說明', '用法-使用類別','用法-例句', 
'書證','辨識-同', '辨識-異','辨識-例句', 
'形音辨誤','近義成語','反義成語','參考詞語'];
const outdir='off/';
const srcfile='raw/dict_idioms.json'
/* parse raw/idioms.txt */
const sources={};
const books={};
const explaining={} ;//有注釋的詞，最長十字，最短一字 乃不知有漢，無論魏晉
// 5007 words to explain, 6742 times. 
const content=JSON.parse(readTextContent(srcfile));
import {parseAnnotation} from './src/annotation.js';
import {parseQuotes,parseBookname} from './src/patterns.js'
content.forEach(entry=>{


	const [id,idiom,zhuyin,pinyin,definition,
		source_name,source,annotation,source_reference,
		allusion,usage_semantic,usage_category, usecase ,
		bookproof, identify_synonym,identify_antonym, identify_examples,
		istake, synonym, antonym, reference]=entry;
	
	parseAnnotation(explaining,source,annotation,id,idiom);
	if (source_name) {
		const sname=source_name.replace(/[※＃\d\*]/g,'')
		parseBookname( sname , books, sources);
	}
	if (bookproof) {
		parseQuotes( bookproof, books, sources );
	}
})

let arr=fromObj(sources,(a,b)=>[a,b]);
arr.sort((a,b)=>b[1].length-a[1].length)
let outfn='source.txt';
if (writeChanged(outdir+outfn,arr.join('\n'))) {
	console.log('written',outfn,arr.length)
}
arr=fromObj(books,true);
outfn='books.txt';
if (writeChanged(outdir+outfn,arr.join('\n'))) {
	console.log('written',outfn,arr.length)
}
arr=fromObj(explaining,true);
outfn='explaining.txt';
if (writeChanged(outdir+outfn,arr.join('\n'))) {
	console.log('written',outfn,arr.length)
}
// if (writeChanged(outdir+'idioms.txt',out.join('\n'))) {
	// console.log('written idioms.txt',out.length)
// }
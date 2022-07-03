import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,
fromObj,patchBuf,toObj,incObj,extractAuthor,extractBook}=PTK;

await nodefs
const outdir='off/';
const srcfile='json/dict_idioms.json'
/* parse raw/idioms.txt */
const sources={};
const books={};
const explaining={} ;//有注釋的詞，最長十字，最短一字 乃不知有漢，無論魏晉
// 5007 words to explain, 6742 times. 

const idioms={}; //所有的成語，無論是不是 條目
const booknames={};//書名  ．陳亮《
const persons={}  ;//．[u3400-\u9fff\ud800-\udfff]{2,5}《  allusion source_bookname definition bookproof

const persons_fields=toObj("allusion,source_bookname,definition,bookproof".split(','));
const booknames_fields=toObj("allusion,source_bookname,definition,bookproof".split(','));
const idioms_fields=toObj("synonym,antonym,related".split(','));

const content=JSON.parse(readTextContent(srcfile));
content.forEach(entry=>{
	for (let f in entry) {
		if (idioms_fields[f]) {
			const out=entry[f].split('、');
			out.forEach( it=>it&&incObj(idioms,it) );
		}
		if (persons_fields[f]) {
			const out=extractAuthor( entry[f] );
			out.forEach( it=>incObj(persons,it) );
		}
		if (booknames_fields[f]) {
			const out=extractBook( entry[f] );
			out.forEach( it=>incObj(booknames,it) );
		}
	}
	
})

const writeField=(obj,filename)=>{
	let arr=fromObj(obj,true);
	let outfn=outdir+filename;
	if (writeChanged(outfn,arr.join('\n'))) {
		console.log('written',outfn,arr.length)
	} else {
		console.log(outfn,'no difference')
	}
}
writeField(idioms,'idioms.txt');
writeField(persons,'persons.txt');
writeField(booknames,'books.txt');

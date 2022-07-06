import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,bsearch,xorStrings,writeIncObj,
patchBuf,toObj,incObj,extractAuthor,extractBook,alphabetically}=PTK;

await nodefs
const outdir='tidied/';
const srcfile='tidied/dict_idioms.json'
/* parse raw/idioms.txt */
const sources={};
const books={};
const explaining={} ;//有注釋的詞，最長十字，最短一字 乃不知有漢，無論魏晉
// 5007 words to explain, 6742 times. 

const idioms={}; //所有的成語，無論是不是 條目
const booknames={};//書名  ．陳亮《
const persons={}  ;//．[u3400-\u9fff\ud800-\udfff]{2,5}《  allusion source_bookname definition bookproof
const allusions={};
const persons_fields=toObj("allusion,source_bookname,definition,bookproof".split(','));
const booknames_fields=toObj("allusion,source_bookname,definition,bookproof".split(','));
const idioms_fields=toObj("synonym,antonym,related".split(','));

const content=JSON.parse(readTextContent(srcfile));
let orth=[];
content.forEach(entry=>{
	for (let f in entry) {
		if (f=='orth') orth.push(entry[f]);
		if (f=='definition') { 
			entry[f].replace(/「([＿\u3400-\u9fff\ud800-\udfff，]{3,10})」/g,(m,m1)=>{
				incObj(idioms,m1)
			});
		}
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
//所有成語
const allidioms=writeIncObj(idioms,outdir+'idioms.txt');

orth.sort(alphabetically);
const nonorth_idioms=xorStrings(allidioms,orth,0);

if (writeChanged(outdir+'orth.txt',orth.join('\n'))) {
	console.log('orth.txt',orth.length)
} else {
	console.log('orth.txt no differnce')
}
let nonorth=writeIncObj(nonorth_idioms,outdir+'nonorth-stat.txt');

//不是詞目的成語
if (writeChanged(outdir+'nonorth.txt',nonorth.map(it=>it[0]).sort(alphabetically).join('\n'),'utf8')) {
	console.log('written nonorth.txt',nonorth.length)
} else {
	console.log('nonorth.txt no differnce')
}


const persons_=writeIncObj(persons,outdir+'persons-stat.txt');
if (writeChanged(outdir+'persons.txt',persons_.map(it=>it[0]).sort(alphabetically).join('\n'),'utf8')) {
	console.log('written persons.txt',persons_.length)
} else {
	console.log('persons.txt no differnce')
}



const book_fields=writeIncObj(booknames,outdir+'books-stat.txt');
if (writeChanged(outdir+'books.txt',book_fields.map(it=>it[0]).sort(alphabetically).join('\n'),'utf8')) {
	console.log('written books.txt',book_fields.length)
} else {
	console.log('books.txt no differnce')
}


//writeIncObj(allusions,outdir+'allusions-stat.txt');
import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,bsearch,xorStrings,writeIncObj,
	pack2,SEPARATOR2D,
patchBuf,fromObj,toObj,incObj,extractAuthor,extractBook,alphabetically,alphabetically0}=PTK;

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
const idioms_fields="synonym,antonym,related".split(',');


const ORTH=0,ID=1  /*0 not orth, 1: is orth, 2: has detail allusion*/ ,  SYN=2, ANT=3, REL=4;
const addIdiom=(str,role, orth)=>{
	if (!idioms[str]) idioms[str]=[0,0,[],[],[]]; //
	if (str!==orth)  {
		//如果相關成語已在 同義或反義，就不必再列了
		if (role==REL && (idioms[str][SYN].indexOf(orth)>-1 ||
				idioms[str][ANT].indexOf(orth)>-1 )) return;
		
		if (idioms[str][role].indexOf(orth)==-1) {
			idioms[str][role].push(orth);
		}
	}
}
const content=JSON.parse(readTextContent(srcfile));
let orth='',cydid='';
content.forEach(entry=>{
	for (let f in entry) {
		if (f=='id') cydid=entry[f];
		else if (f=='orth') {
			orth=entry[f];
			addIdiom(orth,ORTH,orth);
			idioms[orth][ID]=cydid;
			idioms[orth][ORTH]=2; //有詳細的典故
		}
		else if (f=='definition'||f=='allusion') { 
			entry[f].replace(/「([＿\u3400-\u9fff\ud800-\udfff，]{3,10})」/g,(m,m1)=>{
				addIdiom(m1, REL, orth); //定義和語源出現的詞條，也視為 相關 成語
			});
			if (f=='allusion' && entry[f][0]=='△') {
				idioms[orth][ORTH]=1;//典故參見其他成語
			}
		}
		const role=idioms_fields.indexOf(f);

		if (role>-1) {
			const out=entry[f].split('、');
			out.forEach( it=>it&&addIdiom(it, role+2, orth) );
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
const idiomslexicon=fromObj(idioms,(k,v)=>{
	return [k, v.join('\t') ];
})
idiomslexicon.sort(alphabetically0)
const lemma=idiomslexicon.map(it=>it[0]);

//replace lemma with idx

/* 200kb
for (let i=0;i<idiomslexicon.length;i++) {
	const entry=idiomslexicon[i][1];
	for (let j=1;j<entry.length;j++) {
		const arr=entry[j];
		if (arr.length) entry[j]=pack2(arr.map( it=> bsearch(lemma,it)  ));
	}
	idiomslexicon[i][1]=entry.join(SEPARATOR2D)
}
*/
const out=idiomslexicon.map(it=>it[0]+'='+it[1]);
out.unshift('^lexicon[orth=number cyd=unique_number synonym=lemmalist antonym=lemmalist related=lemmalist reference=lemmalist] ');
if (writeChanged(outdir+'cyd-lemma.off',out.join('\n'))) {
	console.log('written cyd-lemma.off')
}

/*
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
*/

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
import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,bsearch,xorStrings,writeIncObj,
	pack2,SEPARATOR2D,replaceZhuyin,toBase26,
patchBuf,fromObj,toObj,incObj,extractAuthor,extractBook,alphabetically,alphabetically0}=PTK;

await nodefs
const outdir='cyd.offtext/';
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
const annotations={};
const persons_fields=toObj("allusion,source_bookname,definition,bookproof".split(','));
const booknames_fields=toObj("allusion,source_bookname,definition,bookproof".split(','));
const idioms_fields="synonym,antonym,related".split(',');


//const ORTH=0,ID=1  /*0 not orth, 1: is orth, 2: has detail allusion*/ ,  
const SYN=0, ANT=1, REL=2;
const addIdiom=(str,role, orth)=>{
	if (!idioms[str]) idioms[str]=[[],[],[]]; //
	if (str!==orth && orth)  {
		//如果相關成語已在 同義或反義，就不必再列了
		if (role==REL && (idioms[str][SYN].indexOf(orth)>-1 ||
				idioms[str][ANT].indexOf(orth)>-1 )) return;
		if (role>=0 && idioms[str][role].indexOf(orth)==-1) {
			idioms[str][role].push(orth);
		}
	}
}
const addPropername=(obj,str,orth)=>{
	if (!obj[str])  obj[str]=[];
	if (obj[str].indexOf(orth)==-1) obj[str].push(orth);
}
const content=JSON.parse(readTextContent(srcfile));
let orth='',cydid='';
content.forEach(entry=>{
	for (let f in entry) {
		if (f=='id') cydid=entry[f];
		else if (f=='orth') {
			orth=entry[f];
			addIdiom(orth);
			// idioms[orth][ID]=cydid;
			// idioms[orth][ORTH]=2; //有詳細的典故
		}
		else if (f=='definition'||f=='allusion') { 
			entry[f].replace(/「([＿\u3400-\u9fff\ud800-\udfff，]{3,10})」/g,(m,m1)=>{
				addIdiom(m1, REL, orth); //定義和語源出現的詞條，也視為 相關 成語
			});
			if (f=='allusion' && entry[f][0]=='△') {
				// idioms[orth][ORTH]=1;//典故參見其他成語
			}
		}
		const role=idioms_fields.indexOf(f);

		if (role>-1) {
			const out=entry[f].split('、');
			out.forEach( it=>it&&addIdiom(it, role, orth) );
		}
		if (persons_fields[f]) {
			const out=extractAuthor( entry[f] );
			out.forEach( it=>addPropername(persons,it,orth) );
		}
		if (booknames_fields[f]) {
			const out=extractBook( entry[f] );
			out.forEach( it=>addPropername(booknames,it, orth) );
		}
		if (f=='annotation') {
			for (let i=0;i<entry[f].length;i++) {
				const m=entry[f][i].match(/fn(\d+)(｛[^｝]+｝)?(.+)/);
				if (m&&m[2]) {
					const term=m[2].slice(1,m[2].length-1);
					if (!annotations[term])  annotations[term]=[ [],[]];
					const ann=replaceZhuyin(m[3]);
					if (annotations[term][0].indexOf(ann)==-1) {
						annotations[term][0].push(ann);
						annotations[term][1].push(orth);
					}
				}
			}
		}
	}
	
})
const idiomslexicon=fromObj(idioms,(k,v)=>{
	return [k, v.join('\t') ];
})
idiomslexicon.sort(alphabetically0)
const lemma=idiomslexicon.map(it=>it[0]);

let out=idiomslexicon.map(it=>it[0]+'\t'+it[1]);
//tagname 讓 條目連到 ^e
out.unshift('^_<ptk=cyd type=tsv name=lemma tagname=e caption=詞目 preload=true>\tsyn=keys\tant=keys\trel=keys');
writeChanged(outdir+'1-lemma.tsv',out.join('\n'));

const booknames_ = fromObj(booknames,(a,b)=>[a,b.join(',')]);
out=booknames_.sort(alphabetically0).map(it=>it.join('\t'));

//　逆連到 e , 以 lemma 為key
out.unshift('^_<ptk=cyd type=tsv name=book caption=書名 preload=true>\te=keys:lemma'); //  出現此書的詞目列表
writeChanged(outdir+'2-book.tsv',out.join('\n'),true)

const persons_ = fromObj(persons,(a,b)=>[a,b]);
out=persons_.sort(alphabetically0).map(it=>it.join('\t'))
out.unshift('^_<ptk=cyd type=tsv name=person caption=人名 preload=true>\te=keys:lemma'); //  出現此人的詞目列表

writeChanged(outdir+'3-person.tsv',out.join('\n'),true)

let maxann=0;
let annotationlexicon=fromObj(annotations,(k,[ann,id] )=>{
	const out=[];
	if (ann.length>maxann) maxann=ann.length;
	for (let i=0;i<ann.length;i++) {
		out.push( [ k , id[i] ,ann[i]  ]);
	}
	return out;
}).sort(alphabetically0);

annotationlexicon=annotationlexicon.flat().map(it=>it.join('\t'))
annotationlexicon.unshift('^_<ptk=cyd type=tsv caption=注釋 name=annotation preload=true>\te=key:lemma\tann=text'); //  出現此人的詞目列表

writeChanged(outdir+'5-annotation.tsv',annotationlexicon.join('\n'),true)
console.log('max ann',maxann)

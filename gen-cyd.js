import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,readTextLines,bsearch,
fromObj,patchBuf,toObj,incObj,extractAuthor,extractBook,replaceAuthor,replaceBook}=PTK;

await nodefs;
const outfile='cyd.offtext/cyd.off'
const srcdir='tidied/'
const srcfile=srcdir+'dict_idioms.json'
const content=JSON.parse(readTextContent(srcfile));

const Orth=readTextLines(srcdir+'orth.txt'); //是詞目的熟語
const Nonorth=readTextLines(srcdir+'nonorth.txt'); //非詞目的熟語
const Books=readTextLines(srcdir+'books.txt'); //是詞目的熟語
const Persons=readTextLines(srcdir+'persons.txt'); //是詞目的熟語
                

const out=`^_[memo="教育部成語典"]
^_e[caption=詞目 idtype=number unique=true]
^_syn[innertext=true caption=同義詞]
^_ant[innertext=true caption=反義詞]
^_rel[innertext=true caption=相關]
^_def[caption=釋文]
`.split(/\r?\n/)

const orthId=str=>{
	const at=bsearch(Orth,str);
	if (Orth[at]===str) return at;
	const at2=bsearch(Nonorth,str);
	if (Nonorth[at2]===str) return at2+Orth.length;  //非詞目熟語 序号從這裡起算
	else throw "unable to locate str "+str;
}
const authorId=str=>{
	const at=bsearch(Persons,str);
	if (Persons[at]===str) return at;
}
const bookId=str=>{
	const at=bsearch(Books,str);
	if (Books[at]===str) return at;
}
let id,orth,syn,ant,rel;
content.forEach(entry=>{
	for (let f in entry) {
		if (f=="id") id=entry[f];
		else if (f=='orth') orth='^e'+id+'['+entry[f];
		else if (f=='synonym') syn=entry[f].split('、').filter(it=>!!it).map(it=>orthId(it)).join('.');
		else if (f=='antonym') ant=entry[f].split('、').filter(it=>!!it).map(it=>orthId(it)).join('.');
		else if (f=='related') rel=entry[f].split('、').filter(it=>!!it).map(it=>orthId(it)).join('.');
		else if (f=='definition') {
			out.push(orth+ (syn?' syn='+syn:'') + (ant?' ant='+ant:'') +(syn?' rel='+rel:'')+']');
			//△「」是多餘的，在synonym 

			let def=entry[f];
			def=def.replace(/△「[＿\u3400-\u9fff\ud800-\udfff，、「」]+/g,'').trim();

			def=def.replace(/「([＿\u3400-\u9fff\ud800-\udfff，]{3,10})」/g,(m,m1)=>{
			 	const sid=orthId(m1);
			 	return '^ref'+sid+'['+m1+']';
			});

			def=replaceAuthor(def,(prefix,str,suffix)=>{
				const auid=authorId(str);
				return prefix+(auid?'^au['+str+']':str)+suffix;
			})
			def=replaceBook(def,(prefix,str,suffix)=>{
				const bkid=bookId(str);
				return prefix+(bkid?'^ti['+str+']':str)+suffix;
			})			

			out.push(def);
		}
	}
});
if (writeChanged(outfile,out.join('\n'))) {
	console.log('written',outfile,out.length)
} else {
	console.log(outfile,'no change')
}

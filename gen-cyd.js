import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,readTextLines,bsearch,
fromObj,patchBuf,toObj,incObj,codePointLength,
extractAuthor,extractBook,replaceAuthor,replaceBook}=PTK;

await nodefs;
const outfile='cyd.offtext/cyd.off'
const srcdir='tidied/'
const srcfile=srcdir+'dict_idioms.json'
const content=JSON.parse(readTextContent(srcfile));

const Lemma=readTextLines('cyd.offtext/1-lemma.tsv'); //是詞目及非詞目的熟語
Lemma.shift();
const Books=readTextLines('cyd.offtext/2-books.tsv'); 
Books.shift();
const Persons=readTextLines('cyd.offtext/3-persons.tsv'); 
Persons.shift();
                

const out=`^_<ptk=cyd zh=教育部成語典>
^:e<caption=詞目 preload=true id=unique_number syn=keys:lemma ant=keys:lemma rel=keys:lemma>
^:def<caption=釋文>
^:ti
^:au
^:cf`.split(/\r?\n/)

const orthId=str=>{
	const at=bsearch(Lemma,str);
	if (Lemma[at].startsWith(str+'\t')) return at;
	else throw "unable to locate str "+str;
}
const authorId=str=>{
	const at=bsearch(Persons,str);
	if (Persons[at].startsWith(str+'\t')) return at;
}
const bookId=str=>{
	const at=bsearch(Books,str);
	if (Books[at].startsWith(str+'\t')) return at;
}
let id,orth,syn,ant,rel;
content.forEach(entry=>{
	for (let f in entry) {
		if (f=="id") id=entry[f];
		else if (f=='orth') orth=entry[f];
		else if (f=='synonym') syn=entry[f].replace(/、/g,',').replace(/ /g,'')//.split('、').filter(it=>!!it).map(it=>orthId(it)).join(',');
		else if (f=='antonym') ant=entry[f].replace(/、/g,',').replace(/ /g,'')//.split('、').filter(it=>!!it).map(it=>orthId(it)).join(',');
		else if (f=='related') rel=entry[f].replace(/、/g,',').replace(/ /g,'')//.split('、').filter(it=>!!it).map(it=>orthId(it)).join(',');
		else if (f=='definition') {
			const attrs=((syn?'syn='+syn:'') + (ant?' ant='+ant:'') +(syn?' rel='+rel:'')).trim();
			out.push('^e'+id+(attrs?'<'+attrs+'>':'')+'【'+orth+'】');
			//△「」是多餘的，在synonym 

			let def=entry[f];
			def=def.replace(/△「[＿\u3400-\u9fff\ud800-\udfff，、「」]+/g,'').trim();

			def=def.replace(/「([＿\u3400-\u9fff\ud800-\udfff，]{3,10})」/g,(m,m1)=>{
			 	const sid=orthId(m1);
			 	return '^cf'+sid+'「'+m1+'」';
			});

			def=replaceAuthor(def,(prefix,str,suffix)=>{
				const auid=authorId(str);
				return prefix+(auid?'^au~'+codePointLength(str)+str:str)+suffix;
			})
			def=replaceBook(def,(prefix,str,suffix)=>{
				const bkid=bookId(str);
				return (bkid?'^ti'+prefix+str:str)+suffix;
			})			

			out.push(def.replace(/\n+/g,'\n')); //remove inner blank lines
		}
	}
});
if (writeChanged(outfile,out.join('\n'))) {
	console.log('written',outfile,out.length)
} else {
	console.log(outfile,'no change')
}

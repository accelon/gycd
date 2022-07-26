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
let id,orth,syn,ant,rel ,idobj={};
const doQuotes=(source, annotation,orth)=>{ //將annotation 的名相解釋填入source (含source_name 及quotes )的 ^f
	const fn=[];
	for (let i=0;i<annotation.length;i++) {
		const ann=annotation[i];
		const m=ann.match(/fn(\d+)(｛[^｝]+｝)?(.+)/);
		if (!m) {
			console.log('wrong fn format '+orth);
			return '';
		}
		fn[ parseInt(m[1])-1] = m[3];
	}
	return source.replace(/\^f(\d+)(~\d+)?/g,(m,m1,m2)=>{
		const n=parseInt(m1)-1;
		if (!fn[n]) {
			console.log("missing fn "+m1+' of '+orth);
			return '^f'+m1+(m2||'');
		}
		return '^f'+m1+(m2||'')+'<note="'+fn[n]+'">';
	})

}
content.forEach(entry=>{
	let quotes,source,source_bookname;
	for (let f in entry) {
		if (f=='orth') orth=entry[f];
		else if (f=='synonym') syn=entry[f].replace(/、/g,',').replace(/ /g,'')//.split('、').filter(it=>!!it).map(it=>orthId(it)).join(',');
		else if (f=='antonym') ant=entry[f].replace(/、/g,',').replace(/ /g,'')//.split('、').filter(it=>!!it).map(it=>orthId(it)).join(',');
		else if (f=='related') rel=entry[f].replace(/、/g,',').replace(/ /g,'')//.split('、').filter(it=>!!it).map(it=>orthId(it)).join(',');
		else if (f=='quotes') {
			source=source_bookname+entry[f].join('');
		}
		else if (f=='source_bookname') {
			source_bookname=entry[f];
		}
		else if (f=='annotation'){
			out.push('典故：'+doQuotes(source,entry[f], orth));
		}
		else if (f=='definition') {
			/* use indexOf 1-lemma.off as id */
			const id=bsearch(Lemma,orth);
			if (id<0) throw "not found in lemma"+orth;
			if (idobj[id]) {
				console.log('dup item' , orth)
				continue;
			} else {
				idobj[id]=orth;	
			}
			
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

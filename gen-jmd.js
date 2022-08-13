import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,readTextLines,bsearch,alphabetically,
fromObj,patchBuf,toObj,incObj,codePointLength,replaceZhuyin,
extractAuthor,extractBook,replaceAuthor,replaceBook}=PTK;

await nodefs;
const outdir='jmd.offtext/';
const outfile=outdir+'2-jmd.off'
const srcdir='tidied/'
const srcfile=srcdir+'dict_concised.json'
const content=JSON.parse(readTextContent(srcfile));




const LemmaRef={};
const addLemma=(lemma,orth)=>{
	if (!lemma) return;
	if (!LemmaRef[lemma]) LemmaRef[lemma]=[];
	if (orth && lemma!==orth) LemmaRef[lemma].push(orth);
}
//"def": "→
let Orth={};
const enumLemma=()=>{
	content.forEach(entry=>{
		addLemma(entry.orth);
		entry.def.replace(/△([^　\[\( ，\n]+)/g,(m,m1)=>{
			m1.split('、').forEach(it=>addLemma(it,entry.orth));
		})

		entry.def.replace(/→([^　\[\( ，\n]+)/g,(m,m1)=>{
			m1.split('、').forEach(it=>addLemma(it,entry.orth));
		})

		const syn=(entry.syn||'').replace('[似]','').replace(/\d\./g,'').split(/[、　 ]+/).filter(it=>!!it);
		syn.length && syn.forEach(it=>addLemma(it,entry.orth));
		entry.syn=syn.length?syn:null;

		const ant=(entry.ant||'').replace('[反]','').replace(/\d\./g,'').split(/[、　 ]+/).filter(it=>!!it);
		ant.length && ant.forEach(it=>addLemma(it,entry.orth));
		entry.ant=ant.length?ant:null;
	});
}
enumLemma();
const Lemma=fromObj(LemmaRef,(a,b)=>a+'\t'+ b.join(','));
Lemma.sort(alphabetically);
Lemma.unshift('^_<ptk=jmd type=tsv name=lemma caption=詞目 preload=true>\trel=keys')

writeChanged(outdir+'1-lemma.tsv',Lemma.join('\n'),true);
Lemma.shift();//drop first line for a searchable lexicon

const LemmaPhony={};
const buildOfftext=()=>{
	const header=`^_<ptk=jmd zh=簡明典 chunktag=e name=main caption=正文>
^:e<caption=詞目 preload=true id=unique_number syn=keys:lemma ant=keys:lemma>
^:pron<caption=讀音>
^:eg
^:cf
^:ref
^:def<caption=釋文>`.split(/\r?\n/)

	content.forEach(entry=>{
		const body=[];
		const at=bsearch(Lemma,entry.orth);
		let attrs='';

		attrs=(entry.syn?.length?('syn='+entry.syn.join(',')):'')+
		(entry.ant?.length?(' ant='+entry.ant.join(',')):'');

		if (attrs) attrs='<'+attrs.trim()+'>';

		if (!LemmaPhony[entry.orth]) {
			LemmaPhony[entry.orth]=[];
			body.push('^e'+at+attrs+'【'+entry.orth+'】');
		}
		body.push('^pron<py="'+replaceZhuyin(entry.zy).replace(/　/g,' ')+'">');

		let def=entry.def.replace(/△([^　\[\( ，\n]+)/g,(m,m1)=>{
			return m1.split('、').map(it=>{
				const at=bsearch(Lemma,it);
				return '^cf'+at+'「'+it+'」'	
			}).join('')
		}).replace(/→([^　\[\( ，\n]+)/g,(m,m1)=>{
			return m1.split('、').map(it=>{
				const at=bsearch(Lemma,it);
				return '^ref'+at+'「'+it+'」'	
			}).join('')
		}).replace(/\[例\]([^\(\)\[\n\t\^◎]+)/g,(m,m1)=>{ //標記  例子
			return '^eg﹝'+m1.replace(/[ 　]/g,'')+'﹞';
		}).replace(/\b(\d+\.)/g,(m,m1)=>{
			return String.fromCharCode(parseInt(m1)+0x2460-1); //義項
		}).replace(/\((\d+)\) ?/g,(m,m1)=>{                    //次項
			return String.fromCharCode(parseInt(m1)+0x2473);
		}).replace(/\n	\n/g,'\n')

		body.push(def);
		LemmaPhony[entry.orth].push(body.join('\n'));
	});

	const out=fromObj(LemmaPhony,(a,b)=>b.join('\n'));
	// out.length=1000;
	out.unshift(...header);
	writeChanged(outfile, replaceZhuyin(out.join('\n')),true)
}
buildOfftext();
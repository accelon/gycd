import {fromChineseNumber,isChineseChapter} from 'pitaka/utils'

function onBook(m,m1){
	const parts=m1.split(/[．‧]/);
	let s='';
	for (let i=0;i<parts.length;i++) {
		const cn=isChineseChapter(parts[i]);
		if (i) {
			if (cn) {
				s+='.'+cn;
			} else {
				s+='^ts'+getStr(parts[i],this); //partial
			}
		} else {
			s+=getStr(parts[i],this);
		}
	}
	s='^tb'+s;	
	return s;
}
function onArticle(m,m1){
	const parts=m1.split(/[．‧]/);
	let s='';
	for (let i=0;i<parts.length;i++) {
		if (i) {
			s+='^ts'+getStr(parts[i],this);
		}
	}
	s='^ta'+s;
	return s;
}
const Dynasties={};
`下南朝宋,及唐,及元,是宋,西漢,見宋,見梁,見隋,見五代漢,引宋,見前秦,本南朝陳,東周戰國,本五代周,本三國魏,引漢,引梁,三國,如元,如元代,如清,五代唐,五代梁,五代,五代南漢,五代蜀,下三國魏,下南朝梁,如唐,唐,見明,見唐,引晉,引元,引唐,見清,本南朝宋,本三國蜀,本南朝梁,見漢,語本晉,見晉,見南朝梁,見北魏,出南朝梁,南朝粱,南朝魏,見南朝宋,見元,見五代周,見五代,宋,如宋,元,晉,漢,魏,秦,梁,東晉,前秦,東漢,前蜀,南朝陳,南朝宋,南朝梁,南唐,南朝齊,十國前蜀,北齊,金,北周,語出明,戰國燕,戰國楚,隋,三國魏,五代周,北宋,北朝,北涼,十國蜀,南朝晉,南齊,句下漢,句下唐,句下宋,句下晉,句下清,句下元,句下漢,周,後秦,後蜀,後魏,三國魏,出五代漢,三國蜀,出三國蜀,三國晉,三國吳,北魏,戰國,明,清,民國,典出宋,典出唐,典出漢,典出明,典出晉,語出清,五代漢,五代梁,語本唐,語本漢,十國南唐,十國後蜀,語本戰國,語本北周,出三國魏,語本金,語本北齊,語本清,語本宋,語出周,語出漢,語出宋,語出唐,語出晉,出南朝宋,遼`.split(',').forEach(dy=>Dynasties[dy]=true);
function onPerson(m,m1) {
	let [dy,pr]=m1.split(/[．‧]/);
	if (Dynasties[dy]) {
		let extra='';
		const ch2=dy.slice(0,2),ch1=dy.slice(0,1)
		if (ch2=='語出'||ch2=='句下'||ch2=='語本'||ch2=='典出'||ch2=='十國') {
			extra=ch2;
			dy=dy.slice(2);
		} else if (ch1=='如'||ch1=='見'||ch1=='本'||ch1=='引'||ch1=='下'||ch1=='出'||ch1=='及'||ch1=='是') {
			extra=ch1;
			dy=dy.slice(1);			
		}

		return extra+'^dy'+getStr(dy,this)+'^pr'+getStr(pr,this);
	} else {
		//console.log('wrong Dynasty',dy,pr);
		return m1;//putback
	}

}
const StringPatterns=[
	['ba',/「([\?０-９ａ-ｚＡ-Ｚ\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9．]+)」/g], //純引文
	['bb',/『([\?\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]+)』/g], 
	[onBook,/《([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9（），˙・‧．○。 、　•]+)》/g, ], 
	[onArticle,/〈([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9（），˙・‧．○。 、　•]+)〉/g], 
]
const SentencePatterns=[
	['sb',/『([\?－０-９a-zA-Zａ-ｚＡ-Ｚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；：:…#^\d]+)』/g],
	['sa',/「([\?－０-９a-zA-Zａ-ｚＡ-Ｚㄚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；：:…#^\d]+)」/g],
	['sb',/『([－\(\)〔〕a-zA-Zａ-ｚＡ-Ｚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；：:…#^\d]+)』/g],
	['sa',/「([－\(\)〔〕a-zA-Zａ-ｚＡ-Ｚㄚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；:：…#^\d]+)」/g],
]
const PersonPatterns=[
	[onPerson,/([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]{1,4}[．‧][\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]+)/g],
]
const onfulldate=(m0,year,month,day)=>{
	const y=fromChineseNumber(year);
	const m=fromChineseNumber(month);
	const d=fromChineseNumber(day);
	return '^ad'+y+'.'+m+'.'+d;
}
const onyearmonth=(m0,year,month)=>'^ad'+fromChineseNumber(year)+'.'+fromChineseNumber(month);
const onyear=(m0,year)=>'^ad'+fromChineseNumber(year);
const onyearbc=(m0,year)=>'^bc'+fromChineseNumber(year);
const onyearrange=(m0,year,year2)=>'^ad'+fromChineseNumber(year)+'-'+fromChineseNumber(year2);
const onbirthdead=(m0,year,year2)=>'^adbd'+year+'-'+year2+' ';
const onbirthdeadbc=(m0,year,year2)=>'^bcbd'+year+'-'+year2+' ';
const onyearbr=(m0,y)=>'^ad'+y;
const DatePatterns=[
	[onfulldate,/西元([一二三四五六七八九十○]{1,4})年([一二三四五六七八九十○]{1,2})月([一二三四五六七八九十○]{1,3})日/g]
	,[onyearmonth,/西元([一二三四五六七八九十○]{1,4})年([一二三四五六七八九十○]{1,2})月/g]
	,[onyearrange,/西元([一二三四五六七八九十○]{1,4})年至([一二三四五六七八九十○]{1,4})年/g]
	,[onyear,/西元([一二三四五六七八九十○]{1,4})年/g]
	,[onyearbr,/[（\(]西元 ?(\d{1,4})年?[）\)]/g]
	,[onyearbc,/西元前([一二三四五六七八九十○]{1,4})年/g]
	,[onbirthdead,/[\(（]西元 ?(\d{1,4}) *～ *(\d{1,4})年?[）\)]/g]
	,[onbirthdeadbc,/[\(（]西元前 ?(\d{1,4}) *～ *前?(\d{1,4})[）\)]/g] //缺前是公元後？
]

const getStr=(str,ctx)=>{
	str=str.replace(/ /g,'');
	if (!ctx.Strings[str]) {
		ctx.Strings[str]=[ 1+ctx.count, 0];
		ctx.count++;
	}
	ctx.Strings[str][1]++;
	return ctx.Strings[str][0];
}


export const toUnits=(lines,ctx)=>{
	let out=lines;
	for (let i=0;i<ctx.patterns.length;i++) {
		const [lbl,pat]=ctx.patterns[i];
		let func=(typeof lbl=='function')? lbl.bind(ctx):null;
	    out=out.map( (line,idx)=>{
			if (func) {
				line=line.replace( pat, func );
			} else {
				if (!line) console.log(lbl,pat,idx)
				line=line.replace( pat, (m,m1)=>'^'+lbl+getStr(m1,ctx));
			}
			return line;
		})
	}
	return out;
}
export const identify=(lines,ctx)=>{
	const Strings=[], Sentences=[] , Persons=[];
	lines=toUnits(lines,{Strings,count:0,patterns:StringPatterns});
	lines=toUnits(lines,{Strings:Sentences,count:0,patterns:SentencePatterns});
	lines=toUnits(lines,{Strings:Persons,count:0,patterns:PersonPatterns});
	lines=toUnits(lines,{patterns:DatePatterns});	
	ctx.Strings=Strings
	ctx.Sentences=Sentences
	ctx.Persons=Persons;
	return lines;
}


/*
const quotes=[],
const regex_quote=/([\u3400-\u9fff\ud800-\udfff]{1,3}．[\u3400-\u9fff\ud800-\udfff、]{2,6})?([〈《][^》〉]+?[〉》][\u3400-\u9fff\ud800-\udfff]*[：:][　 ]*「[^」]+?」)/g
const replaceQuote=line=>line.replace(regex_quote,(m,author,m1)=>{
	quotes.push([wid,quotes.length+1,(author||'')+m1])
	return '^q'+quotes.length;
})

const replaceAlso=line=>{
	line=line.replace(/(也作|也稱為|參見)([「\u3400-\u9fff\ud800-\udfff、」]+)/g,(m,t,m1)=>{
		const at=m1.indexOf('「',1);
		if (at==-1) {
			return '^se1[t='+m1.replace('」','').replace('「','')+']';
		} else {
	        const s=m1.replace(/「([^」]+」)/g,(m,m5)=>{
	        	return (parseInt(m5).toString()==m5)?'「'+m5+'」':'^se2[t='+m5+']';
	        }) 
	        return s;
		}	
	})

	return line; 
}
const isSentence=str=>{
	return str.match(/[，。！、？]/);
}
const replaceEg=line=>line.replace(/([：，。！\d]) ?如：(「[^\^\(]+)/g,(m,punc,m1)=>{ //剖出混入 釋義的例句 ，
    if (m1.indexOf('「',1)>0) { //e 張  如：「一張弓」、「兩張嘴」。 還有「
        const s=m1.replace(/「([^」]+)」/g,(m,m5)=>{
        	return (isSentence(m5))?'^eg[t='+m5+']':'「'+m5+'」';
        }) 
        return punc+s;
    } else { //只有一組「」
        const at=m1.indexOf('」');
        let t=m1.slice(1,at).trim();
        return isSentence(t)?punc+'^eg[t='+t+']'+m1.slice(at+1):m1;
    }
})

*/
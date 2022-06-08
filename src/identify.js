import {fromChineseNumber,isChineseChapter} from 'pitaka/utils'
import {getStr} from './stringtable.js'
import {Dynasties,PartOfSpeechCode} from './eletypes.js'

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
		} else {
			s+=getStr(parts[i],this);
		}
	}
	s='^ta'+s;
	return s;
}

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

		return extra+dy+'^pr'+getStr(pr,this);
	} else {
		//console.log('wrong Dynasty',dy,pr);
		return m1;//putback
	}
}
function onBookJuan(m,m1){
	const n=fromChineseNumber(m1);
	if (!n) {
		console.log('wrong chinese number',m1);
	}
	return '.'+n; 
}
function onPartOfSpeech(m,m1){
	const poscode=PartOfSpeechCode[m1]
	if (!poscode) console.log('invalide part of speech',m1);
	return '^o#'+poscode;
}

const StringPatterns=[
	['ba',/「([\?０-９ａ-ｚＡ-Ｚ\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9．]+)」/g], //純引文
	['bb',/『([\?\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]+)』/g], 
	[onBook,/《([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9（），˙・‧．○。 、　•]+)》/g, ], 
	[onArticle,/〈([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9（），˙・‧．○。 、　•]+)〉/g], 

	[onBookJuan,/\^tb\d+第([一二三四五六七八九十百千○〇零]+)[卷回章]：?/g], //與onBook 連動，處理跑到書名號外的章回
	[onBookJuan,/\^tb\d+卷([一二三四五六七八九十百千○〇零]+)：?/g], //　卷可以置前，但如果在　數字後，前面一定要有「第」。
]
const SentencePatterns=[
	['sb',/『([\?－０-９a-zA-Zａ-ｚＡ-Ｚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；：:…#^\d]+)』/g],
	['sa',/「([\?－０-９a-zA-Zａ-ｚＡ-Ｚㄚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；：:…#^\d]+)」/g],
	['sb',/『([－\(\)〔〕a-zA-Zａ-ｚＡ-Ｚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；：:…#^\d]+)』/g],
	['sa',/「([－\(\)〔〕a-zA-Zａ-ｚＡ-Ｚㄚ \u25a1\u2ff0-\u2fff\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9○,，　（─）！!。？，．、；:：…#^\d]+)」/g],
	[(m,m1,m2)=>m1+m2,/(\^t[abs][\d\.]+)：(\^sa)/g] //去多餘的 ：
]
const PersonPatterns=[
	[onPerson,/([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]{1,4}[．‧][\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]+)/g],
]
const labelPatterns=[
	[onPartOfSpeech,/^\[([\u2e80-\u2fd5\u3400-\u9fff\ud800-\udfff\ue000-\ufad9]{1,4})\]$/g],
]

// 帶？還沒處理，要如何表達？ ^ad2022.4.6  ^adbd-33  未知起  adbd33- 未知迄
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

export const toUnits=(lines,ctx)=>{
	let out=lines;
	for (let i=0;i<ctx.patterns.length;i++) {
		const [lbl,pat]=ctx.patterns[i];
		let func=(typeof lbl=='function')? lbl.bind(ctx):null;
	    out=out.map( (line,idx)=>{
	    	const m=line.match(/^\[[\u3400-\u9fff]{1,5}\]$/);
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
	ctx.patterns=StringPatterns;
	lines=toUnits(lines,ctx,true); 
	lines=toUnits(lines,{Strings:ctx.Sentences,count:0,patterns:SentencePatterns}); //獨立計數。不與ctx混雜
	lines=toUnits(lines,{Strings:ctx.Persons,count:0,patterns:PersonPatterns});//獨立計數。不與ctx混雜
	lines=toUnits(lines,{patterns:DatePatterns});	
	lines=toUnits(lines,{Types:ctx.Types,patterns:labelPatterns});	
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
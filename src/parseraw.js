import {styledNumber} from 'pitaka/utils'
const py_regex=/([（）\(\)一二三四五六　又語讀音變ààāáǎíīìǐǒōóòéềèēěūúùüǔǚǜǘa-z ]+)/;

const getSubdefs=(deq)=>{ //deq , def+examples+quotes
	let subs=[],prevseq=0 ;
	if (~deq.indexOf('(2)') || ~deq.indexOf('（2）')) { //有子義項，切分
		const items=deq.split(/([\(（]\d+[）\)] ?)/);
		let combined='';
		for (let i=0;i<items.length;i++) {
			const m=items[i].match(/[\(（](\d+)[）\) ?]/);
			if (m) {
				let seq=parseInt(m[1]);
				if (seq!==prevseq+1) { 
					if (items[i]=='(2)') { //workaround with 04889 漢
						seq=6; //reset to prevent seq
						combined+='之2';
					} else {
						console.log('warning def seq',seq,prevseq,items[i], 'prev',items[i-1], deq);						
					}
				} else {
					combined&&subs.push(combined);
					combined=styledNumber(seq,'⑴') ;
				}
				prevseq=seq;
			} else {
				combined+=items[i];
			}
		}
		if (combined) subs.push(combined.trim());
	} else {
		subs=[deq]
	}
	return subs;
}
const breakMeaning=rawmean=>{
	if (rawmean[0]=='"' && rawmean[rawmean.length-1]=='"') rawmean=rawmean.slice(1,rawmean.length-1);
	const lines=rawmean.split('$$');
	const defs=[];
	let i=0 ,prevseq=0;
	while(i<lines.length){
		let line=lines[i];
		if (line[0]=='[') prevseq=0; //reset
		const m=line.match(/^(\d+)\. ?/); //去掉後面的空格
		if (m) {
			const seq=parseInt(m[1]);
			if (seq!==prevseq+1) {
				console.log('seq error',lines[i].slice(0,10));
			} else {
				line=styledNumber(seq,'①')+line.slice(m[0].length);
			}
			prevseq=seq;
		}
		const subdefs=getSubdefs(line);
		defs.push(...subdefs);
		i++;
	}
	return defs;
}

export const parseRaw=lines=>{
	const out=[];
	lines.forEach(line=>{
		//字詞屬性	字詞號	字詞名	部首字	部首外筆畫數	總筆畫數	注音一式	漢語拼音	相似詞	相反詞	釋義	編按	多音參見訊息	異體字
		let [wtype, wid, orth, rad, radstk, stk, bpmf, py, synonym, antonym, rawdef, editnote, polyphony]=line.split('\t');

		let en='',at=orth.indexOf('（');
        const at2=orth.indexOf('(');
        if (at>-1||at2>-1) {
        	if (at2>at) at=at2;
        	en=orth.substr(at+1);
        	if (en[en.length-1]=='）'||en[en.length-1]==')' ) en=en.substr(0,en.length-1);
        	orth=orth.substr(0,at);
    	}

    	const m=py.match(py_regex);
    	// console.log(m[1].length,py.length)
    	if (py&& (!m || m[1].length!==py.length)) {
    		console.log('wrong pinyin',py ,m&& m[1])
    	}

		const defs=breakMeaning(rawdef);
		if (orth[0]!=='^') {//drop ^pua , 異體字
			out.push({wtype, wid, en, orth, rad, radstk, stk, bpmf, py, synonym, antonym, rawdef, 
				defs,
				editnote, polyphony});

		}
	})
	return out;
}
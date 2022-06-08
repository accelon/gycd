import {getStr} from './stringtable.js'
import {cjkPhrases} from 'pitaka/utils'

export const serialize=(entries,ctx)=>{
	const out=[]
	for (let i=0;i<entries.length;i++) {
		const e=entries[i];
		getStr(e.orth,ctx);　　//每個字頭都算一個短字串

		cjkPhrases(e.antonym).forEach(s=>getStr(s,ctx));
		cjkPhrases(e.synonym).forEach(s=>getStr(s,ctx));

		out.push('^e'+e.wid+'[t='+e.orth+ (e.en?' en="'+e.en+'"':'')+ 
			(e.py?' y="'+e.py+'"':'')+ 
			(e.synonym?' syn='+e.synonym:'')+
			(e.antonym?' antn='+e.antonym:'')+
			 ']')
		out.push(...e.defs)
	}
	return out;
}
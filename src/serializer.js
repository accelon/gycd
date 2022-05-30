
export const serialize=entries=>{
	const out=[]
	for (let i=0;i<entries.length;i++) {
		const e=entries[i];
		out.push('^e'+e.wid+'[t='+e.orth+ (e.en?' en="'+e.en+'"':'')+ 
			(e.py?' y="'+e.py:'"')+ 
			(e.synonym?' syn='+e.synonym:'')+
			(e.antonym?' antn='+e.antonym:'')+
			 ']')
		out.push(...e.defs)
	}
	return out;
}

export const parseAnnotation=(source_text,source_annotation,id,idiom)=>{
	// if (id==421) console.log(source_annotation)
	const words=[];
	const vars=[];//words with different explaination in other idiom
	const annotation=[]
	//check if explained , each line is an exmplanation
	const anno=source_annotation.split(/\r?\n/);
	for (let i=0;i<anno.length;i++) {
		let at=anno[i].indexOf('：');
		if (at==-1) {
			//console.log('wrong format',source_annotation)
			continue;
		} else {
			const w=anno[i].slice(0,at);
			const exp=anno[i].slice(at+1);
			let v=0;//some words has occur more than one time and with different explaination
			if (!explaining[w]) {
				explaining[w]=exp;
			} else {
				if (explaining[w]!==exp) { //different explaination
					if (typeof explaining[w]=='string') {
						explaining[w]=[explaining[w]];
					} 
					v=explaining[w].length;
					if (explaining[w].indexOf(exp)==-1) {
						explaining[w].push(exp);
					}
					
				}
			}
			words.push(w);
			vars.push(v);
		}		
	}
	const sourcetext=source_text.replace(/\n\*(\d+)\*([a-z\u3400-\u9fff\ud800-\udfff]+)\n/g,(m,fn,w)=>{
		const at=words.indexOf(w)
		if (at==-1) {
			console.log(id,idiom,'no explaining word',w, words);

		} else {
			return '^w'+vars[at]+'['+w+']';
		}
	});

	return [sourcetext ,annotation]
}
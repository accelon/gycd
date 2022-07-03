const addCircleNum=arr=>{
	return arr.filter(it=>!!it).map((it,idx)=> String.fromCodePoint(idx+0x2460)+it  );
}
const markAnnotation=str=>{
	// if (!str)return [];
	return str.split(/\r?\n/).filter(it=>!!it).
	map((it,idx)=>{
		const at=it.indexOf('：');
		return '^fn'+(idx+1)+'['+it.slice(0,at)+'] '+it.slice(at+1)
	})
}
const markQuote=str=>{
	// if (!str) return []
	return str.replace(/\r?\n?\*(\d+)\*(.+?)\r?\n/g,(m,n,w)=>{
		return '^f'+n+'['+w+']';
	}).replace(/([？。])\^f1/,'$1\n^f1') //灰段(不帶注腳)和帶注腳段要分開
	.split(/\r?\n/).filter(it=>!!it)
	.map(it=>it[0]=='#'?it.slice(1):it) //remove the # (灰段標記)
}
export const parseIdiomEntry=(buf,ctx)=>{
	let [id,orth,zy,py,definition,
	_source_name,source_text,source_annotation,source_reference,
	allusion,usage_semantic,usage_category,usecase ,
	bookproof,identify_synonym,identify_antonym,identify_examples,
	mistake,synonym,antonym,related] = buf;

	definition=definition.replace(/<br>(\d+)\./g,'\n$1.')
	.replace(/　?<a name=([^>]+)>　<\/a>/g,'△「$1」')
	.replace(/<br>△/g,'△').replace(/<br>$/,'')
	.replace(/\n?(0\d)\./g,(m,m1)=>'\n'+String.fromCodePoint(parseInt(m1)-1+0x2460 ))
	const obj={id:parseInt(id),orth,zy,py,synonym,antonym,related,definition}

	const source_name=_source_name.split(/\r?\n/);


	const usage_semantics=usage_semantic.split('＆');

	if (source_name.length>1) { //multi source idiom
		let at=source_name[0].indexOf('：');
		const source_texts=source_text.split(/[＋＆◎]/).filter(it=>it.trim()); 
		const annotations=source_annotation.split(/[＋＆◎]/).filter(it=>it.trim())
		obj.source_group=source_name[0].slice(0,at+1).replace(/[「」]/g,'');
		obj.source_bookname=source_name[0].slice(at+1);
		obj.quotes=markQuote(source_texts[0])
		if (!annotations[0] && obj.id!==261) {//只有 啞口無言 無注釋
			console.log('missing annotations',obj.orth)
		}
		obj.annotation=annotations[0]?markAnnotation(annotations[0]):[];

		at=source_name[1].indexOf('：');
		obj.source_group2=source_name[1].slice(0,at+1).replace(/[「」]/g,'');
		obj.source_bookname2=source_name[1].slice(at+1);

		 if (!source_texts[1]) console.log('missing quote2',obj.orth)
		obj.quotes2=source_texts[1]?markQuote(source_texts[1]):[];

		 // if (!annotations[1]) console.log('missing annotations2',obj.orth)
		obj.annotation2=annotations[1]?markAnnotation(annotations[1]):[];
	
	} else {
		obj.source_bookname=_source_name;
		obj.quotes=markQuote(source_text);
		obj.annotation=markAnnotation(source_annotation)
	}

	obj.allusion=allusion;
	bookproof=bookproof.replace(/（源） ?(\d+)\./g,'\n$1.')
	.replace(/<br>(\d+)\./g,'\n$1.')
	.replace(/\n?（([一二三])）(\d+)\./g,'\n（$1）$2.')
	.replace(/<br>$/g,'')
	;//少了換行

	obj.bookproof=bookproof.split(/\r?\n/).map(it=>
		it.trim().replace(/(\d+)\./,(m,m1)=>String.fromCodePoint(parseInt(m1)-1+0x2460 )))

	if (usage_semantics.length>1) {
		const usage_categories=usage_category.split('＆');
		const usecases=usecase.split(/＆/);

		obj.usage_semantic=usage_semantics[0]
		obj.usage_category=usage_categories[0]
		obj.usecase=addCircleNum(usecases[0].split(/\r?\n/))

		obj.usage_semantic2=usage_semantics[1]
		obj.usage_category2=usage_categories[1]
		if (!usecases[1]) console.log('missing usecase2',obj.orth)
		obj.usecase2=addCircleNum((usecases[1]||'').split(/\r?\n/))
	} else {
		obj.usage_semantic=usage_semantic;
		obj.usage_category=usage_category;
		obj.usecase=addCircleNum(usecase.split(/\r?\n/))
	}
	if(mistake)obj.mistake=mistake;
	obj.identify_synonym=identify_synonym;
	obj.identify_antonym=identify_antonym;
	obj.identify_examples=identify_examples.split(/\r?\n/).filter(it=>!!it)
	return obj;
}
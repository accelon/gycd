
export const parseRevisedEntry=(buf,ctx)=>{
	//字詞名 別名 字數 字詞號 部首字 總筆畫數 部首外筆畫數 多音排序
	//注音一式 變體類型 1:變 2:又音 3:語音 4:讀音 變體注音
	//漢語拼音 變體漢語拼音 
	//相似詞 相反詞 釋義 多音參見訊息
	let [orth,alias,count, id, headchar, strokecount, stroke, polyphonyorder,
	zy, var_type, var_zy, py, var_py, syn, ant, def, polyphony] = buf;

	def=def.replace(/\t\n?/g,'');
	const obj={orth,zy,py,def,syn,ant};
	return obj;
}
const replaceEntity=(str,entities,rowid,ncell)=>{
	str=str.replace(/&#13;&#10;/g,'\n').replace(/&#10;/g,'\n')
	.replace(/&#10;/g,'\n').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
	.replace(/&quot;/g,"")
	.replace(/&amp;/g,'&')
	str=str.replace(/&([^;]+);/g,(m,m1)=>{
		const repl=entities[m1]
		if (!repl) {
			console.log(rowid,ncell,'unknow entity',m1)	
			return m1;
		} else {
			return repl;
		}
	})
	return str;
}
export const fromExcelXML=(content,entities)=>{
	const entries=[];
	let cellcount=0,row=[],id;

	const cols=parseInt(content.match(/ss:ExpandedColumnCount="(\d+)"/)[1]);
	content.replace(/<Cell[^>]*>(.+?)<\/Cell>/g,(m,m1)=>{
		m1=m1.replace(/<[^>]+>/g,'');
		if (cellcount%cols==0) {
			entries.push(row);
			row=[];
			if (id &&parseInt(m1).toString()!==m1) {
				console.log('wrong id',m1,'prev',id)
			}
			id=m1;
		} 
		const cell=replaceEntity(m1,entities,id,cellcount %cols);
		row.push(cell);	
		cellcount++;
	});
	if (row.length!==cols) {
		console.log('wrong ending data',row)
	} else entries.push(row)
	return entries;
}
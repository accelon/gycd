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
export const fromExcelXML=(content,entities, idfield=0)=>{
	const entries=[];

	const cols=parseInt(content.match(/ss:ExpandedColumnCount="(\d+)"/)[1]);
	content.replace(/<Row[^>]*>(.+?)<\/Row>/g,(m0,rowdata)=>{
		let cellcount=0;
		let row=[],id, fieldidx=0;
		rowdata.replace(/<Cell([^>]*)>(.+?)<\/Cell>/g,(m,ssindex,m1)=>{
			if (ssindex) {
				const at=ssindex.indexOf('ss:Index');
				if (at>0) {
					cellcount=parseInt(ssindex.slice(11))-1;
				}
			}

			m1=m1.replace(/<[^>]+>/g,'');
			if (cellcount==idfield) {
				//entries.push(row);
				// if (id &&parseInt(m1).toString()!==m1) {
				// 	console.log('wrong id',m1,'prev',id)
				// }
				id=m1;
			} 
			const cell=replaceEntity(m1,entities,id,cellcount %cols)||'';
			row[cellcount]=cell.trim();
			cellcount++;
		});
		// if (row.length!==cols) {
		// 	console.log('wrong ending data',row.length,cols)
		// } else 
		entries.push(row)
	})
	return entries;
}
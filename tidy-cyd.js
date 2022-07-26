/* convert WFG format to JSON */
import {nodefs,writeChanged,readTextLines,readTextContent,patchBuf} from 'ptk/nodebundle.cjs';
import {parseIdiomEntry} from './src/moe-idioms.js'
import Errata from './src/errata-idioms.js'

await nodefs;
const srcdir='raw/'
const outdir='tidied/';
//https://drive.google.com/drive/folders/11-nEz4xlm3nT25bOrj6l7WRKA1faix8X 教育部成語典[5153].7z
const srcfile='dict_idioms.json'; //test file moe-format.json

const entries = JSON.parse(readTextContent(srcdir+srcfile));
const ctx={};
const out=[];
const rare=[];
const zy_py={};
const map_zy_py=(zy,py,orth)=>{
	if (orth=='難兄難弟') return; //will cause wrong mapping 
	const arrzy=zy.trim().replace(/（[一二三四]）/g,'').split(/[　 ]+/);
	const arrpy=py.trim().replace(/（[一二三四]）/g,'').split(/[　 ]+/);
	if (arrzy.length!==arrpy.length) {
		console.log('cannot map zy py',orth,arrzy.length,arrpy.length);
	}
	for (let i=0;i<arrzy.length;i++) {
		if (!zy_py[arrzy[i]]) {
			zy_py[arrzy[i]]=arrpy[i];	
		} else if (zy_py[arrzy[i]]!=arrpy[i]) {
			console.log('inconsistent mapping',arrzy[i],arrpy[i],orth)
		}
		
	}
}
entries.forEach(entry=>{
	const E=Errata[entry[0]];
	if (E ) for (let i in E) { //for every fields
		if (E[i]) entry[i]=patchBuf( entry[i] , E[i]);
	} 
	const [id,orth,zy,py]=entry;
	map_zy_py(zy,py,orth);

	const obj=parseIdiomEntry(entry,ctx); 
	if (!obj) return;
	// if (obj.allusion.charAt(0)=='△') {
	// 	rare.push(obj);//用別人的典故，不常用的成語
	// } else {
		out.push(obj);
	// }
});

let outfn=outdir+srcfile.replace('.txt','.off');
writeChanged(outfn,JSON.stringify(out,'',' '),true);
outfn=outdir+'rare-'+srcfile.replace('.txt','.off');
writeChanged(outfn,JSON.stringify(rare,'',' '),true);
outfn=outdir+'zy_py.json';
writeChanged(outfn,JSON.stringify(zy_py,'',' '),true);




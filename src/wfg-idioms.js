const codeName={
	50:'orth',     //正
	51:'orth_sup', //補充
	//26:'idiommarker',//unused
	40:'hr',//細橫線
	80:'zy',//注音
	81:'py',//拼音
	70:'synonym',//近義
	71:'antonym',//反義
	72:'related',//關聯
	30:'alink',//帶連結  , 30 and 31 has some occurence, and the text is indentical
	31:'atext',//連結文字。缺30的話無法連
	42:'hr',//細橫線
	// 15:'defgroup',//釋義開始
	// 4:'definition',//釋義
	20:'section',//文段，看後面的文字才知道是什麼

	7:'source',//典源名稱 ，如果後面不是 `28` 表示多阡群
	28:'source_bookname',
	3:'quotes',//引文
	24:'anchorword', //有注釋的文字
	// 9:'elementlabel',// 反藍小標題 義、類、例
	6:'nitem',//序號
	// 1:'normaltext',//條列文字
	// 2:'terminator',//terminator
	21:'inlinezy',
	85:'zy', //只出現一次？
	// 91:'td',
	// 92:'td',
	// 93:'tr',
	94:'/table',
	// 22:'red',
	8:'grouping',
	//25:'sic', //底本用字<sic>，小字，校字<corr> 用 〔 〕

	100:'usage_semantic',// from `9`義`2`
	101:'usage_category',// from `9`類`2`
	102:'usecase',// from `9`例`2`
	104:'mistake',
	105:'annotation', // from `9`注`2`
	106:'identify_synonym', //`9`同`1`
	107:'identify_antonym', //`9`異`1`
	108:'identify_examples',
	110:'source',
	111:'allusion',
	112:'bookproof',
	113:'identify',
	114:'usage',
	122:'usage', 
	123:'usage', 
	115:'definition',

	131:'source_group',
	132:'source_group'
}
const handlers={
	111:function(o,ctx) {ctx.part=0},
	106:function(o,ctx) {ctx.part=0},
	114:function(o,ctx) {ctx.part=0},
	122:function(o,ctx) {ctx.part=1},
	123:function(o,ctx) {ctx.part=2}, //三組 用法
	131:function(o,ctx) {ctx.part=0},
	132:function(o,ctx) {ctx.part=1},

}
const emittext=(o,text,ctx)=>{
	if (!text)return;
	const section=ctx.section+ (ctx.part?(ctx.part+1):'')
	if (!o[section]) o[section]=[];
	o[section].push(text);
}
const linkAnnotation=(obj,part=0)=>{
	let nquote=-1;
	const qkey='quotes'+(part?part+1:'')
	const akey='annotation'+(part?part+1:'')
	if (!obj[qkey]) return;

	let quotes=obj[qkey].join('$$$');

	for (let i=0;i<obj[akey].length;i++) {
		const fnline=obj[akey][i];
		const m2=fnline.match(/^([\u2460-\u2473])([^：:]+)/g);
		if (m2) {
			const fn=m2[0].slice(0,1)
			const w=m2[0].slice(1)
			const f=(fn.codePointAt(0)-0x2460+1); 
			const newquotes=quotes.replace(w+fn,'^f'+f+'['+w+']')
			if (newquotes===quotes) {
				console.log('cannot locate footnote ',fn,w)
			} else {
				quotes=newquotes;
				obj[akey][i]='^fn'+f+'['+w+'] '+obj[akey][i].slice(w.length+2)
			}
		} else {
			console.log('invalid annotation',fnline)
		}

	}

	obj[qkey]=quotes.split('$$$');


/*
	for (let i=0;i<obj[qkey].length;i++) { //get the quotes line with anchorword

		const m=obj[qkey][i].match(/([\u2460-\u2473])/);
		if (m) {
			const fn= m[1].codePointAt(0)-0x2460;

			const fnline=obj[akey][fn];
			console.log(fn,fnline,obj[qkey][i])
			const m2=fnline.match(/^([\u2460-\u2473])([^：:]+)/g);
			let quoteline=obj[qkey][i];
			if (!m2) {
				console.log('error annotation'	);
			} else {
				// const n=fnline.slice(0,m2[0].length);
				const w=fnline.slice(m2[0].length+1);
				// console.log()
				const newquoteline=quoteline.replace(w,'^f'+(fn+1)+'['+w+']');
				if (newquoteline==quoteline) {
					console.log('cannot link annotation',fn,w)
				} else quoteline=newquoteline;
				obj[akey][i]='^fn'+(fn+1)+'['+w+'] '+obj[akey][i].slice(m[0].length+1)

				obj[qkey][nquote]=quoteline;
			}
		}
	}
*/
	
}
const singleItem={orth:true,zy:true,py:true,synonym:true,antonym:true,related:true,allusion:true,definition:true,
	//usage_semantic:true,usage_category:true,
	source_group:true,source_bookname:true,usage_semantic:true,usage_category:true,
	source_group2:true,source_bookname2:true,usage_semantic2:true,usage_category2:true,
	source_group3:true,source_bookname3:true,usage_semantic3:true,usage_category3:true,
	identify_synonym:true,identify_antonym:true ,mistake:true}
const compactObject=obj=>{
	for (let key in obj) {
		if (singleItem[key]) {
			if (obj[key].length>1) {
				console.log(key,obj[key],'has more than one item');
			} else {
				obj[key]=obj[key][0];
			}
		}
	}
}
//WFG 並無釋文的異詞，TODO ，連連回正詞，如 破釜沈舟=>破釜沉舟
const removedIdioms="破釜沈舟,龍頭蛇尾,根深柢固,付之丙丁,深根固柢,歎為觀止,解弦更張,改弦易張,深識遠慮,深根固本,風馳電卷,雷掣風馳,提耳面命,天長地闊,市虎三夫,言由衷發,竭水博魚,一柱難支,一簣功虧,一斤十六兩,一丘貉,無所措足,不共戴,觀隅反三,異代同工,德劭年高,自憐敝帚,避三舍,安分循理,涸澤取魚,深念遠慮,冷眼看,退三舍,頗別菽麥,校亂反正,如豆之目,好事難諧,見利背恩,分庭抗,復燃灰,光陸離,否極泰至,改弦易調,季常之懼,磨頂至踵,黃粱夢,民墜塗炭".split(',');
export const parseIdiomEntryWFG=(buf,ctx)=>{
	if (!buf)return null;
	buf=buf.replace(/`30`([^`]+)`31`\1`[12]`/g,'^se[$1]')
		   .replace(/`9`義`1`/g,'`100`')
		   .replace(/`9`類`1`/g,'`101`')
		   .replace(/`9`例`2`/g,'`102`')
		   .replace(/`9`注`2`/g,'`105`')
		   .replace(/`9`辨`1`/g,'`104`')
		   .replace(/`9`同`1`/g,'`106`')
		   .replace(/`9`異`1`/g,'`107`')
		   .replace(/`20`典源/g,'`110`')
		   .replace(/`20`典故\n`4`/g,'`111`')
		   .replace(/`20`書證/g,'`112`')
		   .replace(/`20`辨似/g,'`113`')
		   .replace(/`20`用法/g,'`114`')
		   .replace(/`7`⒈`2`/g,'`121`') 
		   .replace(/`7`⒉`2`/g,'`122`') 
		   .replace(/`7`⒊`2`/g,'`123`') 

		   .replace(/`15`釋義\n`4`/g,'`115`')
		   .replace(/`21`([^`]+)`1`/g,'^zy[$1]') //inline
		   .replace(/`24`([^`]+)`1`/g,'$1')
		   .replace(/`22`([^`]+)`[12]`/g,'^warn[$1]')
		   .replace(/`25`([^`]+)`[12]`/g,'^sic[$1]')
		   .replace(/`6`([^`]+)`1`/g,'$1')
		   .replace(/`26`㊣/g,'')
		   .replace(/`4``90`([^`]+)`91`([^`]+)`92`([^`]+)/g,(m,m1,m2,m3)=>{
		   	  return '`108`'+m1+'\t'+m2;// m3==辨似例句 is added by wfg
		   })
		   .replace(/`93`([^`]+)`91`([^`]+)`92`([^`]+)/g,(m,o,x,sent)=>{
		   		return '`108`'+o+'\t'+x+'\t'+sent
		   })
		   .replace(/<Font color=#808080>([^>]+)<\/Font>/g,(m,m1)=>{ //不出注的引文， #
		   		return '`1`'+m1+'`1`';
		   })
		   .replace('`8`㊤`1`','`131`')
		   .replace('`8`㊦`1`','`132`')


	const lines=buf.split('\n');
	const idiom=lines[0]
	const id=parseInt(ctx.entryId[idiom]);
	let section='';
	const outobj={id};
	if (!id) {
		if (removedIdioms.indexOf(idiom)==-1) { //去除的成語，
			console.log('idiom not found',idiom,buf); //未知的
		} 
		return null;
	}
	ctx.section='unparsed'
	for (let i=1;i<lines.length;i++) {
		const line=lines[i];
		let prev=0;
		line.replace(/`(\d+)`/g,(m,m1,idx)=>{
			const text=line.slice(prev,idx)
			emittext(outobj,text,ctx);
			if (m1!=='1' && m1!=='2') ctx.section = codeName[m1] || 'unparsed';
			handlers[m1] && handlers[m1](outobj,ctx);
			prev=m.length+idx;
		})
		emittext(outobj,line.slice(prev),ctx)
	}
	

	linkAnnotation(outobj);
	linkAnnotation(outobj,1);
	compactObject(outobj);
	return outobj;
}
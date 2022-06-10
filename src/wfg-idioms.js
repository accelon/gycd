const codeName={
	50:'idiom',     //正
	51:'idiom_sup', //補充
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
	15:'defgroup',//釋義開始
	4:'definition',//釋義
	20:'section',//文段，看後面的文字才知道是什麼

	7:'source',//典源名稱 ，如果後面不是 `28` 表示多阡群
	28:'source_bookname',
	3:'quote',//引文
	24:'anchorword', //有注釋的文字
	// 9:'elementlabel',// 反藍小標題 義、類、例
	6:'nitem',//序號
	1:'normaltext',//條列文字
	2:'terminator',//terminator
	21:'inlinezy',
	85:'zy', //只出現一次？
	// 91:'td',
	// 92:'td',
	// 93:'tr',
	94:'/table',
	22:'red',
	8:'grouping',
	25:'sic', //底本用字<sic>，小字，校字<corr> 用 〔 〕

	100:'usage_semantic',// from `9`義`2`
	101:'usage_category',// from `9`類`2`
	102:'usecase',// from `9`例`2`

	105:'annotation', // from `9`注`2`
	106:'identify_synonym', //`9`同`1`
	107:'identify_antonym', //`9`異`1`
	108:'identify_examples',
}
const emittext=(o,text,ctx)=>{
	if (!text)return;
	if (!o[ctx.section]) o[ctx.section]=[];
	o[ctx.section].push(text);
}
const handlers={
	idiom:(o,text)=>o.ortho=text,
	py:(o,text)=>	o.py=text,
	zy:(o,text)=>	o.zy=text,
	//terminator:(o,text,ctx)=>ctx.insection=null,
	synonym:(o,text,ctx)=>	{
		ctx.section='synonym';
		emittext(o,text,ctx);
	},
	section:(o,text,ctx)=>{
		if (text=='典源') {
			ctx.section='source';
		} else if (text=='典故') {
			ctx.section='allusion';
		} else if (text=='書證') {
			ctx.section='bookproof';
		} else if (text=='辨似') {
			ctx.section='identify'
		} else if (text=='用法') {
			ctx.section='usage'
		}
	},
	antonym:(o,text,ctx)=>	 {ctx.section='antonym';emittext(o,text,ctx)},
	related:(o,text,ctx)=>	 {ctx.section='related';emittext(o,text,ctx)},
	defgroup:(o,text,ctx)=>  {ctx.section='definition'},
	annotation:(o,text,ctx)=>  {ctx.section='annotation'},
	nitem:(o,text,ctx)=>emittext(o,text,ctx),

	alink:()=>console.log('wrong alink , should combined with 30'),
	atext:(o,text,ctx)=>{
		if (!o[ctx.section]) o[ctx.section]=[];
		o[ctx.section].push('*'+text);
	},
	normaltext:emittext,
	definition:emittext,
	quote:emittext
	// py:(outobj,text)=>	outobj.py=text;


}
const linkAnnotation=obj=>{
	let nsource=-1;
	for (let i=0;i<obj.source.length;i++) { //get the source line with anchorword
		if (~obj.source[i].indexOf('①')) {
			nsource=i;
		}
	}
	if (nsource==-1) {
		throw "no source containing ①"
	}
	let sourceline=obj.source[nsource];
	for (let i=0;i<obj.annotation.length;i++) {
		const m=obj.annotation[i].match(/^([\u2460-\u2473])([^：:]+)/g);
		if (!m) {
			console.log('error annotation',obj);
		} else {
			const n=m[0].slice(0,1);
			const fn=n.codePointAt(0)-0x2460+1;
			const w=m[0].slice(1);
			const newsourceline=sourceline.replace(w+n,'^f'+fn+'['+w+']');
			if (newsourceline==sourceline) {
				console.log('cannot link annotation',n,w)
			} else sourceline=newsourceline;
			obj.annotation[i]='^fn'+fn+'['+w+'] '+obj.annotation[i].slice(m[0].length+1)
		}
		
	}
	if (sourceline.match(/([\u2460-\u2473])/)) {
		console.log('unclean annotation line',sourceline)
	}
	obj.source[nsource]=sourceline
}
//WFG 並無釋文的異詞，TODO ，連連回正詞，如 破釜沈舟=>破釜沉舟
const removedIdioms="破釜沈舟,龍頭蛇尾,根深柢固,付之丙丁,深根固柢,歎為觀止,解弦更張,改弦易張,深識遠慮,深根固本,風馳電卷,雷掣風馳,提耳面命,天長地闊,市虎三夫,言由衷發,竭水博魚,一柱難支,一簣功虧,一斤十六兩,一丘貉,無所措足,不共戴,觀隅反三,異代同工,德劭年高,自憐敝帚,避三舍,安分循理,涸澤取魚,深念遠慮,冷眼看,退三舍,頗別菽麥,校亂反正,如豆之目,好事難諧,見利背恩,分庭抗,復燃灰,光陸離,否極泰至,改弦易調,季常之懼,磨頂至踵,黃粱夢,民墜塗炭".split(',');
export const parseIdiomEntry=(buf,ctx)=>{
	if (!buf)return null;
	buf=buf.replace(/`30`([^`]+)`31`\1`[12]`/g,'^se[$1]')
		   .replace(/`9`義`1`/g,'`100`')
		   .replace(/`9`類`1`/g,'`101`')
		   .replace(/`9`例`2`/g,'`102`')
		   .replace(/`9`注`2`/g,'`105`')
		   .replace(/`9`同`1`/g,'`106`')
		   .replace(/`9`異`1`/g,'`107`')

		   .replace(/`21`([^`]+)`1`/g,'^zy[$1]') //inline
		   .replace(/`24`([^`]+)`1`/g,'$1')
		   .replace(/`6`([^`]+)`1`/g,'`1`$1')
		   .replace(/`26`㊣/g,'')
		   .replace(/`90`([^`]+)`91`([^`]+)`92`([^`]+)/g,(m,m1,m2,m3)=>{
		   	  return '`108`'+m1+','+m2;// m3==辨似例句 is added by wfg
		   })
		   .replace(/`93`([^`]+)`91`([^`]+)`92`([^`]+)/g,(m,o,x,sent)=>{
		   		return '`108`'+o+','+x+','+sent
		   })
		   .replace(/<Font color=#808080>([^>]+)<\/Font>/g,(m,m1)=>{ //不出注的引文， #
		   		return '`1`'+m1+'`1`';
		   })


	const lines=buf.split('\n');
	const idiom=lines[0]
	const id=ctx.entryId[idiom];
	let section='';
	const outobj={};
	if (!id) {
		if (removedIdioms.indexOf(idiom)==-1) { //去除的成語，
			console.log('idiom not found',idiom,buf); //未知的
		} 
		return null;
	}
	for (let i=1;i<lines.length;i++) {
		const line=lines[i];
		line.replace(/`(\d+)`([^`]*)/g,(m,m1,text)=>{
			const name=codeName[m1];
			if (!name) {
				console.log('unknown code',m1,buf)
			} else {
				const handler=handlers[name];
				if (handler) {
					handler(outobj,text,ctx,m1);
				} else {
					const s=ctx.section;
					ctx.section=name;
					emittext(outobj,text,ctx,m1);
					ctx.section=s;
				}
			}
		})
	}

	linkAnnotation(outobj);
	return outobj;
}
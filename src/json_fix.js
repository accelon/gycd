const Fixes= {
	"胡柴":function(heteronyms){
			heteronyms[0].definitions=[{  // 剖析錯誤造成多出來的義項
				/*{
				"def": "隨意亂說、瞎編。「"
			},
			{
				"def": "告相公得知，上大人丘乙己，化三千，七十士。〔末〕一口胡柴。",
				"link": [
					"亦作「胡謅」、「胡嘈」。"
				],
				"quote": [
					"」《西遊記．第四一回》：「那潑猴頭！我與你有甚親情？你在這裡滿口胡柴，綽甚聲經兒？」"
				],
				"type": "丑"
			}*/
				"def": "隨意亂說、瞎編。",
				"link": ["亦作「胡謅」、「胡嘈」。"],
				"quote": [
					"明．高明《汲古閣本琵琶記．第一七齣》：告相公得知，上大人丘乙己，化三千，七十士。〔末〕一口胡柴。」"
					,"《西遊記．第四一回》：「那潑猴頭！我與你有甚親情？你在這裡滿口胡柴，綽甚聲經兒？」"
				],
				"type": "丑"
			}]
	},
	"朴":function(heteronyms){
		const D=heteronyms[2].definitions[3];
		if (D.def=='大、壯。《楚辭．屈原．天問》：恆秉季德，焉得夫朴牛。') {
			D.def='大、壯。' 
		} else console.log('cannot replace 朴');
		
		if (D.quote[0]=="」漢．王逸．注：「朴，大也。」") {
			D.quote[0]="《楚辭．屈原．天問》：恆秉季德，焉得夫朴牛。漢．王逸．注：「朴，大也。」" 
		} else console.log('cannot replace 朴')
	},
	"低眉":function(heteronyms){ //quote 跑到 example 
		if (heteronyms[0].definitions[1].example[0]=='如：「低眉善目」、《太平廣記．卷一七四．俊辯》：「金剛努目，所以降伏四魔；菩薩低眉，所以慈悲六道。」'){
			heteronyms[0].definitions[1].example[0]='如：「低眉善目」';
			heteronyms[0].definitions[1].quote=['《太平廣記．卷一七四．俊辯》：「金剛努目，所以降伏四魔；菩薩低眉，所以慈悲六道。」'];
		} else console.log('cannot replace 低眉')

	},
    "赤露":function(heteronyms) {
    	if (heteronyms[0].definitions[0].example[0]=='如：「他赤露著胸膛，在庭院裡乘涼。」、《金史．卷一二七．隱逸列傳．辛愿》：「性野逸不修威儀，貴人延客，麻衣草屨、足脛赤露坦然於其間，劇談豪飲，傍若無人。」') {
    		heteronyms[0].definitions[0].example[0]='如：「他赤露著胸膛，在庭院裡乘涼。」';
    		heteronyms[0].definitions[0].quote=['《金史．卷一二七．隱逸列傳．辛愿》：「性野逸不修威儀，貴人延客，麻衣草屨、足脛赤露坦然於其間，劇談豪飲，傍若無人。」'];
    	}
    },
    "用途":function(heteronyms) {
    	if (heteronyms[0].definitions[0].example[0]=='如：「用途很廣」、《清史稿．卷一○六．選舉志一》：「天下生員無所託業，迺議廣用途，許考各部院謄錄。」') {
    		heteronyms[0].definitions[0].example[0]='如：「用途很廣」';
    		heteronyms[0].definitions[0].quote=['《清史稿．卷一○六．選舉志一》：「天下生員無所託業，迺議廣用途，許考各部院謄錄。」'];
    	}
    }
 	
}

export const fixJSON=entry=>{
	const func=Fixes[entry.title];
	if (!func) return;

	// console.log(entry.title,'before',entry.heteronyms)
	func(entry.heteronyms);
	// console.log('after',entry.heteronyms);
}
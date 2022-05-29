import {fromObj,patchBuf,RemainingErrata} from 'pitaka/utils'
// import lit_12_quote from './lit_12_quote.js'
// import lit_6_quote from './lit_6_quote.js'
// import lit_19_quote from './lit_14_quote.js'
// import lit_14_quote from './lit_19_quote.js'
//const PinPoints={lit:[lit_12_quote, lit_6_quote,lit_14_quote,lit_19_quote]} ;

// const gycd=JSON.parse(readFileSync('./moedict-sample.json','utf8'))
//缺字一律改為● {[9951]}
//最多 6 個發音，  每個發音最多 30 義項
//'名': 12472,'形': 4001,'副': 1355,'動': 9701,'狀': 157,'助': 238,'連': 137,'介': 96,'代': 128,'歎': 82,'綴':14,
// strange type  p: 1,  '丑': 1,
/*
    只記錄 字頭 第一音 ，字頭排序
    <H1>行 ➀xíng
    行 ➁háng
        1.(名) 行列。直列為行，橫排為列。
            《左傳．成公二年》：「屬當戎行，無所逃隱。」
            唐．杜甫〈贈衛八處士〉詩：「昔別君未婚，兒女忽成行。」
        2.(名) 兄弟姐妹長幼的次序。
            如：「排行老三。」
        3.量詞。計算成排東西的單位。
            如：「一行樹」、「一目十行」。
            唐．杜甫〈絕句〉四首之三：「兩個黃鸝鳴翠柳，一行白鷺上青天。」
    行 ➂xìng
        (名) 行為舉止。
            如：「品行」、「操行」、「獸行」、「德行」。
            《論語．公冶長》：「聽其言而觀其行。」
    行 ➃hàng
        參見「行行」、「樹行子」等條。
*/

/*
make sure 不丹 come before 不丹王國
<H>不丹（Bhutan）
<H>不丹王國（Kingdom of Bhutan）
*/
import Def_errata from './def_errata.js'
import Quote_errata from './quote_errata.js'
let maxdefcount=0,maxproncount=0;
export const Lemma={};
export const QUOTESEP='|||';
const regex_q=/([\u3400-\u9fff]{1,3}．[\u3400-\u9fff、]{2,6})?([〈《][^》〉]+?[〉》][詞曲詩]?[：:][　 ]*「[^」]+?」)/ug
const types={},Propername={};
[
'河川名。','植物名。','動物名。','樂器名。','城市名。','職官名。','鄉鎮名。','星座名。','曲牌名。','雜劇名。',
'詞牌名。','朝代名。','雜劇名。','書體名。','武器名。','文體名。','海洋名。','方位名。','群島名。','朝代名。','詩體名。',
'文章名。','樂曲名。','海峽名。','半島名。','海灣名。','傳奇名。','湖泊名。','古地名。','山脈名。','女仙名。',
'仙人名。','琴曲名。','種族名。','公路名。','古國名。','古帝名。','舞曲名。','舞蹈名。',
'行星名。','運河名。','颱風名。','喪服名。','經穴名。','國家名。','細菌名。','地震名。',
'城鎮名。','官署名。','小說名。','山峰名。','港口名。','彈詞名。','昆蟲名。','歌曲名。',
'動物名：','城市名：','書體名：','朝代名：','植物名：','樂器名：','河川名：','海洋名：','海灣名：',
'湖泊名：','職官名：','鄉鎮名：','地名：',' 人名：','山名：','島名：','書名：','星名：','病名：','縣名：','詩名：','郡名：',
'水庫名。','人名。','國名。','地名。','書名。','病名。','山名。','州名。','洲名。','鳥名。','神名。','水名。','河名。','佛名。',
'湖名。','草名。','縣名。','郡名。','省名。','星名。','島名。','詩名。','藥名。'].forEach(item=>Propername[item]=true);

const extractQuote=str=>{
    const quotes=[];
    let def=str.replace(regex_q,(m,au,m1)=>{
        quotes.push((au||'')+m1);
        return '';
    })
    let type;
    const ch2=def.slice(0,2),ch3=def.slice(0,3),ch4=def.slice(0,4);
    if (ch2=='姓。')      {type=ch2.slice(0,1); 	def=def.slice(2);}
    if (Propername[ch3]) {type=ch3.slice(0,2); 	def=def.slice(3);}
    if (Propername[ch4]) {type=ch4.slice(0,3); 	def=def.slice(4);}
    return {def,quotes , type}
}

const tidyExamples=str=>{
    return str.replace('如：','').replace(/[「」]/g,'').replace(/。$/,'');
}
export const parseField=fields=>{
    let title=fields.title.replace(/\{\[....\]\}/,'●');
    //0x2780
    let en='';
    const words_defs=[];
    if (fields.heteronyms.length>maxproncount) maxproncount=fields.heteronyms.length;
    for (let i=0;i<fields.heteronyms.length;i++) {
        const defs=[];
        
        const entry=fields.heteronyms[i];
        if (entry.definitions.length>maxdefcount) maxdefcount=entry.definitions.length;

        if (title[0]=='{' ||title==' ') continue;
        let at=title.indexOf('（');
        const at2=title.indexOf('(');
        if (at>-1||at2>-1) {
        	if (at2>at) at=at2;
        	en=title.substr(at+1);
        	if (en[en.length-1]=='）'||en[en.length-1]==')' ) en=en.substr(0,en.length-1);
        	title=title.substr(0,at);
    	}

        addLemma(title,'e');
        let py='';
        if (fields.heteronyms.length==1) {
            //py=(entry.pinyin&&!entry.pinyin.indexOf(' ')==-1?(' '+entry.pinyin):'');
            py=entry.pinyin?entry.pinyin:'';
        } else {
            //py=(entry.pinyin?(' '+entry.pinyin.replace(/（.音）/,'')):'');
            py=entry.pinyin?entry.pinyin.replace(/（.音）/,''):'';
        }
        for (let j=0;j<entry.definitions.length;j++) {
            const D=entry.definitions[j];
            
            if (Def_errata[title]) {
            	if (~D.def.indexOf(Def_errata[title][0][0])) D.def=patchBuf(D.def,Def_errata[title]);
            }
            let {def,quotes,type}=extractQuote(D.def);

            def=markupDef(def);
            const examples=[];
            if(D.example)for (let k=0;k<D.example.length;k++) examples.push(D.example[k]);
            if(D.quote)for (let k=0;k<D.quote.length;k++) {
            	const errata=Quote_errata[title];
            	let q=D.quote[k];
            	if (errata && ~q.indexOf(errata[0][0])) q=patchBuf(q,errata);
                quotes.push(q);
            }
            if (type) {
            	if (!D.type || D.type=='名'|| D.type=='動'|| D.type=='形') D.type=type;
            	else {
            		console.log('inconsistent type',D.type,type,'orth',title)
            	}
            }
            defs.push('^d'+(D.type?('[o='+D.type)+']':' ')+def
            +examples.map(m=>'^eg['+tidyExamples(m)+']')
             +(quotes.length?QUOTESEP:'')
              +quotes.map(m=>'^cf '+m).join());

            if (D.type) {
	            if (!types[D.type]) types[D.type]=0;
	            types[D.type]++;            	
            }
        }   
        words_defs.push([py,defs.join('')]);
    }

    if (title.indexOf('^pua')==-1)  return ( [title, en,words_defs]);
}
const addLemma=(str,type)=>{
    if (!Lemma[str]) Lemma[str]='';
    Lemma[str]+=type;
}
const markupDef=def=>{
    def=def.replace(/ *「.{1,2}」的異體字（\d+）/g,'');//多餘的，已移到最上獨立義項，要先去掉，以免被視為 eg


//先處理 如：
    def=def.replace(/([：，。]) ?如：(「[^\^\(]+)/g,(m,punc,m1)=>{ //剖出混入 釋義的例句 ，
        if (m1.indexOf('「',1)>0) { //e 張  如：「一張弓」、「兩張嘴」。 還有「
            const s=m1.replace(/「([^」]+)」/g,(m,m5)=>{
                return '^eg2['+m5+']';
            })
            return punc+s;
        } else { //只有一組「」
            const at=m1.indexOf('」');
            const s=punc+'^eg1['+m1.slice(1,at).trim()+']'+m1.slice(at+1);
            return s;
        }
    });

//
    def=def.replace(/(也作|參見)「([^」]+)」(、「[^」]+」)*條?。?/g,(m,m1,m2,m3,m4)=>{ //混入釋義的 也作 參見
        m2=m2.trim();//some with leading blank
        let label='^se', type='2';
        if (m1=='參見') {label='^cf';type='3'}
        addLemma(m2,type);
        let s=label+'[t="'+m2+'"]';
        if (m3) {
            s+=m3.replace(/「([^」]+)」/g,(m,m5)=>{
                m5=m5.trim();
                addLemma(m5,type);
                return label+'[t="'+m5+'"]';
            })
        }
        return s;
   })
    def=def.replace(/「(.{1,2})」的異體字。/g,(m,m1)=>{
        addLemma(m1,'v');
        return '^var[t="'+m1+'"]';
    })
    return def;
}

export const doneParsing=()=>{
	RemainingErrata(Def_errata);
	RemainingErrata(Quote_errata);
	console.log(fromObj(types,(a,b)=>[a,b]).sort((a,b)=>b[1]-a[1]));
}

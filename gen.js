import {readFileSync,writeFileSync} from 'fs'
import {alphabetically0} from 'pitaka/utils'

//clone from https://github.com/g0v/moedict-data
import hotfixes from './hotfix.js'
import lit_12_quote from './lit_12_quote.js'
import lit_6_quote from './lit_6_quote.js'
import lit_19_quote from './lit_14_quote.js'
import lit_14_quote from './lit_19_quote.js'
//const PinPoints={lit:[lit_12_quote, lit_6_quote,lit_14_quote,lit_19_quote]} ;

const pua={'90ba':'𥳑'}
const tidy=str=>str
.replace(/&/g,'＆').replace(/</g,'＜').replace(/>/g,'＞')
.replace(/\{\[([^}]+)\]\}/g,(m,m1)=>{
	return pua[m1]||' ';
});

const content=tidy(readFileSync('./dict-revised.json','utf8'));
const gycd=JSON.parse(content)

// const gycd=JSON.parse(readFileSync('./moedict-sample.json','utf8'))
//缺字一律改為● {[9951]}
//最多 6 個發音，  每個發音最多 30 義項
//'名': 12472,'形': 4001,'副': 1355,'動': 9701,'狀': 157,'助': 238,'連': 137,'介': 96,'代': 128,'歎': 82,'綴':14,
// strange type  p: 1,  '丑': 1,
/*
    htll 格式
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
let maxdefcount=0;
let maxproncount=0;


const types={};
//有些並沒有被解出來
//一直、徑直。《紅樓夢．第一二回》：「幸而天色尚早，人都未起，從後門一徑跑回家去。」《文明小史．第二六回》：「只得付了茶錢下樓，一徑回家。」也作「一徑地」。
const regex_q=/(《[^》]+?》：「[^」]+?」)/g
const extractQuote=str=>{
    const quotes=[];
    const def=str.replace(regex_q,(m,m1)=>{
        quotes.push(m1);
        return '';
    })
    return {def,quotes}
}
const entries=[];
const markupDef=def=>{
   def=def.replace(/(也作|參見)「([^」]+)」(、「[^」]+」)*/g,(m,m1,m2,m3)=>{
        let s=m1+'^se['+m2+']';
        if (m3) {
            s+=m3.replace(/「([^」]+)」/g,(m,m4)=>{
                return '^se['+m4+']';
            })
        }
        return s;
   })
   

   return def;
}
/*
const getPinPoints=title=>{
    const out=[];
    for (let ptk in PinPoints) {
        PinPoints[ptk].forEach(pp=>{
            if (pp[title]) out.push(... pp[title].map(i=>i.replace('^','^/'+ptk+'/'))) 
        });
    }
    return out;
}
*/
const parseField=fields=>{
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
            
            let {def,quotes}=extractQuote(D.def);
            def=markupDef(def);
            const examples=[];
            if(D.example)for (let k=0;k<D.example.length;k++) examples.push(D.example[k]);
            if(D.quote)for (let k=0;k<D.quote.length;k++) {
                quotes.push(D.quote[k]);
            }

            defs.push('^d'+(D.type?('[o='+D.type+']'):' ')+def
            +(examples.length?'\n':'')
            +examples.map(m=>'^eg '+m)
            +(quotes.length?'\n':'')
            +quotes.map(m=>'^cf '+m)
            .join('\n'));

            if (!types[D.type]) types[D.type]=0;
            types[D.type]++;
        }   
        words_defs.push([py,defs]);
    }

    if (title[0]!=='●' && title[0]!==' ')  entries.push( [title, en,words_defs]);
}
console.log(`parsing ${gycd.length} entry`);
for (let i in  gycd) parseField(gycd[i]);

/*
make sure 不丹 come before 不丹王國
<H>不丹（Bhutan）
<H>不丹王國（Kingdom of Bhutan）
*/
entries.sort(alphabetically0);
const out=[];
entries.forEach(([title,en,words_defs])=>{
    let prevc='';
    const entry=[];
    words_defs.forEach( ([py,defs])=>{
        if (title!==prevc) {
            out.push(...entry);
            entry.length=0;
        	entry.push('^e '+title);
        	en&&entry.push('^en '+en);
        }
        py&&entry.push('^y '+py);
        // 詞條相同者，以音區分，定位簡單，缺點是 不同音的字的詞被拆開
        // 如「行規」háng、 「行動」xíng本應歸在不同的「行」詞群，但目前按逐字排序，所以被合併起來。

        if (hotfixes[title]) {
            let content=defs.join('\n');
            hotfixes[title].forEach(rep=>content=content.replace(rep[0],rep[1]));
            defs=content.split('\n')
        } else {
            defs=defs.join('\n').split('\n');
        }
/*
        const pp=getPinPoints(title);
        if (pp.length) {        
            for (let i=0;i<pp.length;i++) {
                if (!pp[i]) continue;
                const [y,target] = pp[i].split('^');
                
                const line = parseInt(y)-entry.length ;
                if (!defs[line]) continue;

                
                if (defs[line].indexOf('^q')==-1) {
                    throw 'pinpoint failed '+line+' '+title+' '+target;
                }
                
                const L=defs[line].substr(3);
                const start=L.indexOf('「');
                const end=L.lastIndexOf('」');
                if (start==-1||end==-1||start>end) {
                    throw 'quote text not found '+defs[line];
                }                
                defs[ line ] = L.substr(0,start) + '^t[@'+target+' '+L.substring(start,end+1)+']'+L.substr(end+1);
                pp[i]=null;
            }
        }
*/

        entry.push(...defs);
        prevc=title;
    })
    out.push(...entry);
    
})

// console.log(`max pronounce ${maxproncount} max def count ${maxdefcount}`)
// console.log(types)
writeFileSync('gycd.test',out.join('\n'),'utf8')
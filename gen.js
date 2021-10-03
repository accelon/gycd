import {readFileSync,writeFileSync} from 'fs'
import {alphabetically0} from 'pitaka/utils'
//clone from https://github.com/g0v/moedict-data
import hotfixes from './hotfix.js'
const pua={'90ba':'𥳑'}
const tidy=str=>str
.replace(/&/g,'＆').replace(/</g,'＜').replace(/>/g,'＞')
.replace(/\{\[([^}]+)\]\}/g,(m,m1)=>{
	return pua[m1]||' ';
});

const content=tidy(readFileSync('./dict-revised.json','utf8'));
const gycd=JSON.parse(content)
import {normalizeText} from './moedict-utils.js';

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


const parseField=fields=>{
    const title=fields.title.replace(/\{\[....\]\}/,'●');
    //0x2780
    const words_defs=[];
    if (fields.heteronyms.length>maxproncount) maxproncount=fields.heteronyms.length;
    for (let i=0;i<fields.heteronyms.length;i++) {
        const defs=[];
        const entry=fields.heteronyms[i];
        if (entry.definitions.length>maxdefcount) maxdefcount=entry.definitions.length;

        if (title[0]=='{') continue;
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
            
            const {def,quotes}=extractQuote(D.def);
            const examples=[];
            if(D.example)for (let k=0;k<D.example.length;k++) examples.push(D.example[k]);
            if(D.quote)for (let k=0;k<D.quote.length;k++) quotes.push(D.quote[k]);

            defs.push('^d '+(D.type?('['+D.type+']'):'')+def
            +(examples.length?'\n':'')
            +examples.map(m=>'^ex '+m)
            +(quotes.length?'\n':'')
            +quotes.map(m=>'^q '+m)
            .join('\n'));

            if (!types[D.type]) types[D.type]=0;
            types[D.type]++;
        }   

        words_defs.push([py,defs]);
    }

    if (title[0]!=='●')  entries.push( [normalizeText(title), title, words_defs]);
}
console.log(`parsing ${gycd.length} entry`);
for (let i in  gycd) parseField(gycd[i]);


const out=[];
/*
make sure 不丹 come before 不丹王國
<H>不丹（Bhutan）
<H>不丹王國（Kingdom of Bhutan）
*/
entries.sort(alphabetically0);

entries.forEach(([normalized,title,words_defs])=>{
    let prevc='';
    words_defs.forEach( ([py,defs])=>{
        if (title!==prevc) out.push('^c '+title);  
        py&&out.push('^y '+py);  
        // 詞條相同者，以音區分，定位簡單，缺點是 不同音的字的詞被拆開
        // 如「行規」háng、 「行動」xíng本應歸在不同的「行」詞群，但目前按逐字排序，所以被合併起來。
        
        let content=out.join('\n');
        if (hotfixes[title]) {
            hotfixes[title].forEach(rep=>content=content.replace(rep[0],rep[1]));
        }
        out.push(content);
        prevc=title;
    })
})

// console.log(`max pronounce ${maxproncount} max def count ${maxdefcount}`)
// console.log(types)
writeFileSync('gycd.off',out.join('\n'),'utf8')
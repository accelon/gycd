import {nodefs,writeChanged,readTextContent} from 'pitaka/cli';
await nodefs;
import {alphabetically0,fromObj} from 'pitaka/utils'
import PUA from './src/pua.js'; //造字區  Private User Area
import {parseField,Lemma,QUOTESEP,doneParsing} from './src/parser.js'
import {fixJSON} from './src/json_fix.js'

const outdir='off/'

const tidy=str=>str
.replace(/&/g,'＆').replace(/</g,'＜').replace(/>/g,'＞')
.replace(/\{\[([^}]+)\]\}/g,(m,m1)=>{
	const r=PUA[m1];
    return (typeof r==='undefined')?'^pua#'+m1:r;
});

const srcfile='moedict-data/dict-revised.json';
console.log('reading ',srcfile);
const content=tidy(readTextContent(srcfile));
const gycd=JSON.parse(content);


//有些並沒有被解出來
//一直、徑直。《紅樓夢．第一二回》：「幸而天色尚早，人都未起，從後門一徑跑回家去。」《文明小史．第二六回》：「只得付了茶錢下樓，一徑回家。」也作「一徑地」。
const entries=[];
console.log(`parsing ${gycd.length} entry`);
for (let i=0;i<gycd.length;i++) {
    // if (i>2000) break;
    fixJSON(gycd[i]);
    const r=parseField(gycd[i],entries);
    r&&entries.push(r);
}
doneParsing();

const out=[] , outquotes=[];
entries.forEach(([title,en,words_defs])=>{
    let prevc='';
    const entry=[] , entryquotes=[];
    words_defs.forEach( ([py,def_quotes])=>{
        if (title!==prevc) {
            out.push(...entry);
            entry.length=0;
            entryquotes.length=0;
            
            const extra=(py?'^y[t="'+py+'"]':'');
        	entry.push('^e[t="'+title+ (en?' en="'+en+'"':'')+'"]'+extra); // it will be removed
            entryquotes.push('^rem[t="'+title+'"]');
        } else {
            py&&entry.push('^y[t="'+py+'"]'); //not as text    
            py&&entryquotes.push('');
        }
        
        // 詞條相同者，以音區分，定位簡單，缺點是 不同音的字的詞被拆開
        // 如「行規」háng、 「行動」xíng本應歸在不同音的「行」詞群，但目前按逐字排序，所以被合併起來。
        let _defs=def_quotes.replace(/\^d/g,'\t\t\t^d').split('\t\t\t').filter(it=>!!it);

        for (let i=0;i<_defs.length;i++) {
            const [ d,q] = _defs[i].split(QUOTESEP);
            const defs=d.split('\n');
            const quotes=q?q.replace(/\^cf/g,'\t\t\t^cf').replace(/\n/g,'').split('\t\t\t').filter(it=>!!it):[];
            while (quotes.length<defs.length) quotes.push('')
            while (defs.length<quotes.length) defs.push('');
            entry.push(...defs);
            entryquotes.push(...quotes);
        }
        prevc=title;
    })
    out.push(...entry);
    outquotes.push(...entryquotes);
})

// console.log(`max pronounce ${maxproncount} max def count ${maxdefcount}`)
// console.log(types)
out.unshift('^bk#main');
let outfn=outdir+'gycd-main.off';
if (writeChanged(outfn,out.join('\n'))) {
	console.log('written to',outfn,out.length);
}
outquotes.unshift('^bk#quote');
outfn=outdir+'gycd-quotes.off';
if (writeChanged(outfn,outquotes.join('\n'))) {
    console.log('written to',outfn,outquotes.length);
}
const arr=fromObj(Lemma,(a,b)=>[a,b] );
outfn='lemma.txt';
arr.sort(alphabetically0);
if (writeChanged(outfn,arr.join('\n'))){
    console.log('written to',outfn,arr.length);
}
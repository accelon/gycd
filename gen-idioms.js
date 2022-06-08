import {nodefs,writeChanged,readTextContent} from 'pitaka/cli';
await nodefs
const fieldCNames=['編號','成語', '注音','漢語拼音','釋義','典源出處名稱','典源文獻內容','典源-註解','典源-參考', '典故說明','用法-語意說明', '用法-使用類別','用法-例句', '書證','辨識-同', '辨識-異','辨識-例句', '形音辨誤','近義成語','反義成語','參考詞語'];
//id,idiom,zhuyin,pinyin,definition,source_name,source_text,source_annotation,source_reference,allusion,sage_semantic,usage_category, usage_examples ,bookproof, identify_synonym,identify_antonym, identify_examples,	mistake, synonym, antonym, reference
const outdir='off/';
const srcfile='raw/idioms.json'
/* parse raw/idioms.txt */
const content=JSON.parse(readTextContent(srcfile));
console.log(content.slice(0,2))

// if (writeChanged(outdir+'idioms.txt',out.join('\n'))) {
	// console.log('written idioms.txt',out.length)
// }
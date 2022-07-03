import * as PTK from 'ptk/nodebundle.cjs';
const {nodefs,writeChanged,readTextContent,
fromObj,patchBuf,toObj,incObj,extractAuthor,extractBook}=PTK;

await nodefs
const outdir='off/';
const srcfile='json/dict_idioms.json'

const definition=text=>{
	text=text.replace(/<a name=([^>]+)>　<\/a>/g,'△「$1」');
	text=text.replace('01.','①');
	text=text.replace('02.','②');
	text=text.replace('03.','③');
	text=text.replace('04.','④');
}
const tidy={
	definition
}
const content=JSON.parse(readTextContent(srcfile));
content.forEach(entry=>{
	for (let f in entry) {
		const handler=tidy[f];
		entry[f]=handler(entry[f]);
	}
});
export const parseBookname=(source,books,sources)=>{
    const m=source.match(/《([\u3400-\u9fff\ud400-\udfff]+)/ );
    if (m) {
        const bookname=m[1]
        if (!books[bookname]) books[bookname]=0;
        books[bookname]++;		
    }
    if (!sources[sname]) sources[sname]=0;
    sources[sname]++;	
}
const QuoteRegex=/《([\u3400-\u9fff\ud400-\udfff]+)》：(.+)/;
export const parseQuotes=_quotes=>{
    const quotes=_quotes.split('\n');
    quotes.forEach(q=>{

    })
}
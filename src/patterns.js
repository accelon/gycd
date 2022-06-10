export const parseBookname=(source,books,sources)=>{
    const m=source.match(/《([\u3400-\u9fff\ud400-\udfff]+)/ );
    if (m) {
        const bookname=m[1]
        if (!books[bookname]) books[bookname]=0;
        books[bookname]++;		
    }
    if (!sources[source]) sources[source]=0;
    sources[source]++;	
}
const QuoteRegex=/《([\u3400-\u9fff\ud400-\udfff]+)》：(.+)/;
export const parseQuotes=(_quotes, books, sources)=>{
    const quotes=_quotes.split('\n');
    quotes.forEach(q=>{
        // console.log(q)
    })
}
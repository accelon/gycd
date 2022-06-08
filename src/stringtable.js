export const getStr=(str,ctx)=>{
	str=str.replace(/ /g,'');
	if (!ctx.Strings[str]) {
		ctx.Strings[str]=[ 1+ctx.count, 0];
		ctx.count++;
	}
	ctx.Strings[str][1]++;
	return ctx.Strings[str][0];
}
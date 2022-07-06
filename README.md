# gycd
台湾教育部国语辞典 以下称gycd CC BY-ND 3.0
[数据源](https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html)

基於 dict_revised_2015_20220328 版。

## 本数字加工
* 将 Excel 格式转为純文本。缺字以Unicode IDS表达。
* 将 词条释义内的元素（作者、朝代、书名篇名、引用等）进行模式识别并标注。
* 引文与原书进行模糊比对，产生双向连结。

## 放弃数字加工权利以及免责声明

在中华人民共和国规定之合理使用范围内，放弃所有在全世界范围内，基于相关法律对以上数字加工享有的权利，包括所有相关权利和邻接权利。
您可以复制、修改、发行和呈现本数字加工，甚至可用于商业性目的，都无需事先征求同意。


## build steps
    download https://github.com/g0v/moedict-data dict-revised*.xlt and export as utf-8 to raw/dict-revised*.txt
    save *.xlt as *.xml 

    download sym.txt from https://github.com/g0v/moedict-pub/

    node xml2json  //轉換缺字，修正多個義項折行問題，產生乾淨的 json ，二維陣列，每個元素為一個cell
    node tidy-cyd  // 規範 標點
    node extract-fields //抽出詞目、人名、書名，

    node gen-cyd //產生 成語典 offtext
## improvement
黃耆 is not an orth but searchable , it is more common than 黃芪

## 詞類 
dict-revised.json 剖析有誤，按excel 文件如下
 [ '名', 6591 ],   N  Noun
 [ '動', 4598 ],   V  Verb
 [ '形', 2578 ],   A  Adjective
 [ '副', 942 ],    B  adverB
 [ '助', 155 ],    X  auXiliary
 [ '狀', 138 ],    S  Status
 [ '代', 97 ],     P  Pronoun
 [ '連', 84 ],     J  conJunction
 [ '歎', 64 ],     E  Exclaimation
 [ '介', 51 ],     R  pReposition
 [ '綴', 12 ]      F  suFfix

## 思路
* 不改變辭典原來的順序
* 建立多個詞表，不存在的詞目也能查。
* lexicon有： 「人名、朝代名」  「書名、篇名、詞目」 「句子」，每個表都是二元排序的字串表，first pass 詞表序號是踫到的順序。
* 句子可遞迴展開
* second pass 改 wid，改為排序後的序號。
* 使用lemma 方式是 標籤加數字id ，標籤只能記錄linepos ，不記postings ，所以不參加全文檢索，只是用來過濾chunk。
* 半形, 用得不多取代「，」 143K
* 全形「。」有353K，用半形取代可省600K 「：」 200K 半形少用，應可取代
* 詞表分類檢索，摘要還是條目？如點 書名，先列出所有引用此書之條目，是否自動展開內文？

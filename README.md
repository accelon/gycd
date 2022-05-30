# gycd
教育部國語辭典



## build steps
    download https://github.com/g0v/moedict-data dict-revised*.xlt and export as utf-8 to raw/dict-revised*.txt
    download sym.txt from https://github.com/g0v/moedict-pub/

    node tidy  //轉換缺字，修正多個義項折行問題，產生乾淨的 dict-revised.txt ，每個詞條一行，共十六萬行

    node gen    //產生offtext 格式

## improvement
黃耆 is not an orth but searchable , it is more common than 黃芪

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

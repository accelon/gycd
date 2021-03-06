export const Dynasties={};
`下南朝宋,及唐,及元,是宋,西漢,見宋,見梁,見隋,見五代漢,引宋,見前秦,本南朝陳,東周戰國,本五代周,本三國魏,引漢,引梁,三國,如元,如元代,如清,五代唐,五代梁,五代,五代南漢,五代蜀,下三國魏,下南朝梁,如唐,唐,見明,見唐,引晉,引元,引唐,見清,本南朝宋,本三國蜀,本南朝梁,見漢,語本晉,見晉,見南朝梁,見北魏,出南朝梁,南朝粱,南朝魏,見南朝宋,見元,見五代周,見五代,宋,如宋,元,晉,漢,魏,秦,梁,東晉,前秦,東漢,前蜀,南朝陳,南朝宋,南朝梁,南唐,南朝齊,十國前蜀,北齊,金,北周,語出明,戰國燕,戰國楚,隋,三國魏,五代周,北宋,北朝,北涼,十國蜀,南朝晉,南齊,句下漢,句下唐,句下宋,句下晉,句下清,句下元,句下漢,周,後秦,後蜀,後魏,三國魏,出五代漢,三國蜀,出三國蜀,三國晉,三國吳,北魏,戰國,明,清,民國,典出宋,典出唐,典出漢,典出明,典出晉,語出清,五代漢,五代梁,語本唐,語本漢,十國南唐,十國後蜀,語本戰國,語本北周,出三國魏,語本金,語本北齊,語本清,語本宋,語出周,語出漢,語出宋,語出唐,語出晉,出南朝宋,遼`.split(',').forEach(dy=>Dynasties[dy]=true);

export const PartOfSpeechCode = { 
  '名':'n', //6591 ],   Noun
  '動':'v', //4598 ],   Verb
  '形':'a', //2578 ],   Adjective
  '副':'b', //942 ],    adverB
  '助':'x', //155 ],    auXiliary
  '狀':'s', //138 ],    Status
  '代':'p', //97 ],     Pronoun
  '連':'j', //84 ],     conJunction
  '歎':'e', //64 ],     Exclaimation
  '介':'r', //51 ],     pReposition
  '綴':'f', //12 ]      suFfix
}
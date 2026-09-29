window.PUTIRUSU_LESSONS = window.PUTIRUSU_LESSONS || {};

Object.assign(window.PUTIRUSU_LESSONS, {
  "a1-1:0": {
    objective:"Aprender А, О, М e Т de verdade: reconhecer, ouvir, ler e usar em palavras simples.",
    concept:"Estas quatro letras são um ponto de partida ideal porque se parecem com letras latinas e têm sons próximos. O objetivo não é decorar nomes de letras: é bater o olho e produzir o som automaticamente.",
    tip:"Não translitere mentalmente. Veja М e pense no som /m/; veja Т e pense /t/.",
    teach:[
      {glyph:"А а",sound:"/a/",name:"а",note:"Como o A de “casa”.",example:"мама",translation:"mamãe"},
      {glyph:"О о",sound:"/o/ → /a/ fraco sem acento",name:"о",note:"Com acento soa /o/. Sem acento pode se aproximar de /a/.",example:"том",translation:"tomo / volume"},
      {glyph:"М м",sound:"/m/",name:"эм",note:"Muito parecido com o M do português.",example:"мама",translation:"mamãe"},
      {glyph:"Т т",sound:"/t/",name:"тэ",note:"Som de T; na cursiva a minúscula muda bastante.",example:"там",translation:"lá"}
    ],
    examples:[
      {ru:"мама",pt:"mamãe",note:"МА-ма • acento na primeira sílaba"},
      {ru:"там",pt:"lá",note:"uma sílaba"},
      {ru:"том",pt:"tomo / volume",note:"uma sílaba"}
    ],
    listen:{prompt:"Ouça. Qual palavra foi dita?",target:"мама",options:["мама","там","том"],answer:"мама",explain:"Você ouviu мама: МА-ма."},
    choice:{prompt:"Qual palavra significa “mamãe”?",options:["мама","там","том"],answer:"мама",explain:"мама = mamãe."},
    type:{prompt:"Sem copiar: digite “мама” em cirílico.",answer:"мама"},
    arrange:{prompt:"Monte a palavra “там” (lá).",words:["т","а","м"],answer:"там"},
    speak:{target:"мама",pt:"mamãe",hint:"Fale МА-ма. A primeira sílaba é mais forte."},
    recap:["А = /a/","О = /o/ quando tônico","М = /m/","Т = /t/","Você já consegue ler мама, там e том."]
  },

  "a1-1:1": {
    objective:"Parar de soletrar e começar a ler мама, там e том como blocos.",
    concept:"Leitura fluente começa quando o cérebro deixa de converter letra por letra. Você vai reconhecer padrões curtos e ler a palavra inteira.",
    tip:"Faça duas passagens: primeiro devagar, depois em ritmo normal.",
    teach:[
      {glyph:"ма",sound:"/ma/",name:"sílaba",note:"М + А = ма.",example:"мама",translation:"mamãe"},
      {glyph:"там",sound:"/tam/",name:"palavra",note:"Т + А + М.",example:"там",translation:"lá"},
      {glyph:"том",sound:"/tom/",name:"palavra",note:"Т + О + М.",example:"том",translation:"tomo / volume"}
    ],
    examples:[
      {ru:"мама там.",pt:"Mamãe está lá.",note:"МА-ма там"},
      {ru:"там мама.",pt:"Lá está a mamãe.",note:"там МА-ма"},
      {ru:"том",pt:"tomo / volume",note:"том"}
    ],
    listen:{prompt:"Ouça e escolha o que você ouviu.",target:"там",options:["там","том","мама"],answer:"там",explain:"там tem А; том tem О."},
    choice:{prompt:"O que significa “там”?",options:["lá","aqui","mamãe"],answer:"lá",explain:"там = lá."},
    type:{prompt:"Digite a palavra russa para “lá”.",answer:"там"},
    arrange:{prompt:"Monte a frase “мама там”.",words:["там","мама"],answer:"мама там"},
    speak:{target:"мама там",pt:"mamãe está lá",hint:"Fale como uma frase curta, sem separar cada letra."},
    recap:["ма é uma sílaba, não duas letras isoladas","там = lá","мама = mamãe","Leia palavra inteira antes de pensar em transliteração."]
  },

  "a1-1:2": {
    objective:"Escrever palavras simples de memória e perceber se a ordem das letras está correta.",
    concept:"Escrita consolida leitura. Primeiro copie olhando; depois esconda o modelo e reproduza. A meta é lembrar a sequência visual e sonora.",
    tip:"Legibilidade primeiro. Velocidade vem depois.",
    teach:[
      {glyph:"мама",sound:"МА-ма",name:"4 letras",note:"м-а-м-а",example:"мама",translation:"mamãe"},
      {glyph:"там",sound:"там",name:"3 letras",note:"т-а-м",example:"там",translation:"lá"},
      {glyph:"том",sound:"том",name:"3 letras",note:"т-о-м",example:"том",translation:"tomo"}
    ],
    examples:[
      {ru:"мама",pt:"mamãe",note:"mantenha a ordem м-а-м-а"},
      {ru:"там",pt:"lá",note:"não troque а por о"},
      {ru:"том",pt:"tomo",note:"compare там × том"}
    ],
    listen:{prompt:"Ouça e escolha a grafia correta.",target:"том",options:["том","там","мот"],answer:"том",explain:"том contém О no meio."},
    choice:{prompt:"Qual sequência está escrita corretamente?",options:["мама","амма","ммаа"],answer:"мама",explain:"A ordem correta é м-а-м-а."},
    type:{prompt:"Sem olhar para o modelo: escreva “мама”.",answer:"мама"},
    arrange:{prompt:"Monte “том”.",words:["о","т","м"],answer:"том"},
    speak:{target:"том",pt:"tomo / volume",hint:"Uma sílaba curta: том."},
    recap:["Você já lê e escreve 3 palavras","а e о mudam o significado","A ordem das letras importa tanto quanto o som."]
  },

  "a1-2:0": {
    objective:"Dominar as letras familiares А, К, М, О e Т sem cair na transliteração.",
    concept:"Essas letras parecem familiares e o som básico também é próximo. Use isso para ganhar velocidade de leitura antes de entrar nas letras enganosas.",
    tip:"Reconheça pelo som: А /a/, К /k/, М /m/, О /o/, Т /t/.",
    teach:[
      {glyph:"А а",sound:"/a/",name:"а",note:"Som /a/.",example:"так",translation:"assim"},
      {glyph:"К к",sound:"/k/",name:"ка",note:"Som /k/.",example:"кот",translation:"gato"},
      {glyph:"М м",sound:"/m/",name:"эм",note:"Som /m/.",example:"мама",translation:"mamãe"},
      {glyph:"О о",sound:"/o/",name:"о",note:"Pode reduzir quando sem acento.",example:"кот",translation:"gato"},
      {glyph:"Т т",sound:"/t/",name:"тэ",note:"Som /t/.",example:"так",translation:"assim"}
    ],
    examples:[
      {ru:"кот",pt:"gato",note:"кот"},
      {ru:"так",pt:"assim / então",note:"так"},
      {ru:"кто",pt:"quem",note:"кто"}
    ],
    listen:{prompt:"Ouça. Qual palavra foi dita?",target:"кот",options:["кот","кто","так"],answer:"кот",explain:"кот = gato."},
    choice:{prompt:"Qual palavra significa “gato”?",options:["кот","кто","так"],answer:"кот",explain:"кот = gato (macho)."},
    type:{prompt:"Digite “кот”.",answer:"кот"},
    arrange:{prompt:"Monte “кто” (quem).",words:["о","к","т"],answer:"кто"},
    speak:{target:"кот",pt:"gato",hint:"Uma única sílaba curta."},
    recap:["А К М О Т são letras familiares","кот = gato","кто = quem","так = assim / então"]
  },

  "a1-2:1": {
    objective:"Reconhecer as falsas amigas В, Н, Р, С, У e Х sem ler como português.",
    concept:"Essas letras parecem latinas, mas o som é diferente. Aqui mora um dos maiores erros de iniciante.",
    tip:"Treine pares visuais: В→v, Н→n, Р→r, С→s, У→u, Х→kh.",
    teach:[
      {glyph:"В в",sound:"/v/",name:"вэ",note:"Parece B, soa V.",example:"вода",translation:"água"},
      {glyph:"Н н",sound:"/n/",name:"эн",note:"Parece H, soa N.",example:"нос",translation:"nariz"},
      {glyph:"Р р",sound:"/r/",name:"эр",note:"Parece P, soa R.",example:"рука",translation:"mão / braço"},
      {glyph:"С с",sound:"/s/",name:"эс",note:"Parece C, soa S.",example:"сок",translation:"suco"},
      {glyph:"У у",sound:"/u/",name:"у",note:"Parece y, soa U.",example:"утро",translation:"manhã"},
      {glyph:"Х х",sound:"/x/ ~ kh",name:"ха",note:"Som fricativo como em alemão Bach.",example:"хорошо",translation:"bem"}
    ],
    examples:[
      {ru:"вода",pt:"água",note:"В = v"},
      {ru:"сок",pt:"suco",note:"С = s"},
      {ru:"рука",pt:"mão / braço",note:"Р = r"},
      {ru:"нос",pt:"nariz",note:"Н = n"}
    ],
    listen:{prompt:"Ouça e escolha a palavra.",target:"сок",options:["сок","нос","рука"],answer:"сок",explain:"сок = suco."},
    choice:{prompt:"Em “сок”, a letra С tem som de...",options:["s","k","v"],answer:"s",explain:"С parece C latino, mas soa como S."},
    type:{prompt:"Digite a palavra russa para “suco”.",answer:"сок"},
    arrange:{prompt:"Monte “нос” (nariz).",words:["с","н","о"],answer:"нос"},
    speak:{target:"рука",pt:"mão / braço",hint:"O Р inicial é vibrante; não leia como P."},
    recap:["В=v","Н=n","Р=r","С=s","У=u","Х=kh"]
  },

  "a1-2:2": {
    objective:"Aprender Б, Г, Д, Л e П e usá-las em palavras reais.",
    concept:"Agora entram letras realmente novas para quem vem do alfabeto latino. Aprenda forma + som + palavra ao mesmo tempo.",
    tip:"Não decore desenho isolado. Associe cada letra a uma palavra-modelo.",
    teach:[
      {glyph:"Б б",sound:"/b/",name:"бэ",note:"Som de B.",example:"банк",translation:"banco"},
      {glyph:"Г г",sound:"/g/",name:"гэ",note:"Som de G em “gato”.",example:"город",translation:"cidade"},
      {glyph:"Д д",sound:"/d/",name:"дэ",note:"Som de D.",example:"дом",translation:"casa"},
      {glyph:"Л л",sound:"/l/",name:"эл",note:"Som de L.",example:"луна",translation:"lua"},
      {glyph:"П п",sound:"/p/",name:"пэ",note:"Som de P.",example:"папа",translation:"papai"}
    ],
    examples:[
      {ru:"дом",pt:"casa",note:"Д = d"},
      {ru:"папа",pt:"papai",note:"П = p"},
      {ru:"город",pt:"cidade",note:"Г = g"},
      {ru:"луна",pt:"lua",note:"Л = l"}
    ],
    listen:{prompt:"Ouça e escolha a palavra que significa “casa”.",target:"дом",options:["дом","папа","луна"],answer:"дом",explain:"дом = casa."},
    choice:{prompt:"Qual letra tem som /p/?",options:["П","Л","Д"],answer:"П",explain:"П п representa /p/."},
    type:{prompt:"Digite “дом”.",answer:"дом"},
    arrange:{prompt:"Monte “папа”.",words:["па","па"],answer:"папа"},
    speak:{target:"дом",pt:"casa",hint:"Uma sílaba, com D claro no início."},
    recap:["Б=b","Г=g","Д=d","Л=l","П=p"]
  },

  "a1-2:3": {
    objective:"Aprender Ж, З, Ц, Ч, Ш e Щ e diferenciar seus sons.",
    concept:"Este grupo concentra sons importantes do russo. O segredo é ouvir contrastes e não tentar encaixar tudo em letras do português.",
    tip:"Ж≈j francês, Ш≈sh mais duro, Щ≈sh mais suave/alongado, Ч≈tch, Ц≈ts.",
    teach:[
      {glyph:"Ж ж",sound:"/ʐ/ ~ j francês",name:"жэ",note:"Som retroflexo/fricativo sonoro.",example:"жизнь",translation:"vida"},
      {glyph:"З з",sound:"/z/",name:"зэ",note:"Som de Z.",example:"зима",translation:"inverno"},
      {glyph:"Ц ц",sound:"/ts/",name:"цэ",note:"Como ts.",example:"цена",translation:"preço"},
      {glyph:"Ч ч",sound:"/tɕ/ ~ tch",name:"чэ",note:"Parecido com tch, mais suave.",example:"чай",translation:"chá"},
      {glyph:"Ш ш",sound:"/ʂ/ ~ sh duro",name:"ша",note:"Sh mais duro.",example:"школа",translation:"escola"},
      {glyph:"Щ щ",sound:"/ɕː/ ~ shch suave",name:"ща",note:"Som mais suave e alongado.",example:"борщ",translation:"borscht"}
    ],
    examples:[
      {ru:"чай",pt:"chá",note:"Ч = tch"},
      {ru:"цена",pt:"preço",note:"Ц = ts"},
      {ru:"школа",pt:"escola",note:"Ш = sh duro"},
      {ru:"жизнь",pt:"vida",note:"Ж = som semelhante ao j francês"}
    ],
    listen:{prompt:"Ouça. Qual palavra foi dita?",target:"чай",options:["чай","цена","школа"],answer:"чай",explain:"чай = chá."},
    choice:{prompt:"Qual letra representa aproximadamente o som “tch”?",options:["Ч","Ц","Ш"],answer:"Ч",explain:"Ч ч é o som mais próximo de “tch”."},
    type:{prompt:"Digite a palavra russa para “chá”.",answer:"чай"},
    arrange:{prompt:"Monte “цена” (preço).",words:["на","це"],answer:"цена"},
    speak:{target:"чай",pt:"chá",hint:"Comece com um som tch curto e suave."},
    recap:["Ж≈j francês","З=z","Ц=ts","Ч≈tch","Ш=sh duro","Щ=sh suave/alongado"]
  },

  "a1-2:4": {
    objective:"Dominar Е, Ё, И, Й, У, Ы, Э, Ю e Я e perceber quando elas afetam a consoante anterior.",
    concept:"As vogais russas não servem só para formar sílabas: algumas também sinalizam palatalização da consoante anterior. Й é uma semivogal curta, parecida com y em inglês yes.",
    tip:"Aprenda em pares: Э/Е, У/Ю, А/Я, О/Ё. A segunda forma costuma trazer um efeito de /j/ ou suavização.",
    teach:[
      {glyph:"Е е",sound:"/je/ ou /e/ com suavização",name:"е",note:"Pode começar com yê.",example:"есть",translation:"comer / há"},
      {glyph:"Ё ё",sound:"/jo/",name:"ё",note:"É sempre tônica quando escrita com pontos.",example:"ёлка",translation:"árvore de Natal"},
      {glyph:"И и",sound:"/i/",name:"и",note:"Som de i.",example:"мир",translation:"mundo / paz"},
      {glyph:"Й й",sound:"/j/ curto",name:"и краткое",note:"Semivogal curta.",example:"чай",translation:"chá"},
      {glyph:"У у",sound:"/u/",name:"у",note:"Som de u.",example:"утро",translation:"manhã"},
      {glyph:"Ы ы",sound:"vogal central /ɨ/",name:"ы",note:"Não existe igual em português.",example:"мы",translation:"nós"},
      {glyph:"Э э",sound:"/e/",name:"э",note:"E aberto/fechado sem /j/ inicial.",example:"это",translation:"isto"},
      {glyph:"Ю ю",sound:"/ju/",name:"ю",note:"Como “iu”.",example:"юг",translation:"sul"},
      {glyph:"Я я",sound:"/ja/",name:"я",note:"Como “ia” com /j/.",example:"я",translation:"eu"}
    ],
    examples:[
      {ru:"я",pt:"eu",note:"Я = ya"},
      {ru:"мы",pt:"nós",note:"Ы não tem equivalente exato em português"},
      {ru:"это",pt:"isto / isso",note:"Э = e sem y inicial"},
      {ru:"ёлка",pt:"árvore de Natal",note:"Ё = yo"}
    ],
    listen:{prompt:"Ouça e escolha o pronome “eu”.",target:"я",options:["я","мы","это"],answer:"я",explain:"я = eu."},
    choice:{prompt:"Qual letra representa o som /ju/ aproximadamente?",options:["Ю","Я","Ё"],answer:"Ю",explain:"Ю ю ≈ /ju/."},
    type:{prompt:"Digite o pronome “eu” em russo.",answer:"я"},
    arrange:{prompt:"Monte “это” (isto).",words:["то","э"],answer:"это"},
    speak:{target:"я и мы",pt:"eu e nós",hint:"Compare Я com Ы em мы."},
    recap:["Е/Ё/И/Й/У/Ы/Э/Ю/Я completam o sistema de vogais e semivogal","Я=eu","мы=nós","это=isto"]
  },

  "a1-2:5": {
    objective:"Entender ь e ъ e finalmente fechar o alfabeto russo completo.",
    concept:"Ь e Ъ não têm som próprio. O ь normalmente suaviza a consoante anterior ou participa da separação antes de certas vogais. O ъ marca separação mais forte em contextos específicos.",
    tip:"O objetivo no A1 é reconhecer o efeito. As regras detalhadas entram depois.",
    teach:[
      {glyph:"Ь ь",sound:"sem som próprio",name:"мягкий знак",note:"Sinal brando: frequentemente suaviza a consoante anterior.",example:"день",translation:"dia"},
      {glyph:"Ъ ъ",sound:"sem som próprio",name:"твёрдый знак",note:"Sinal duro: separa consoante de Е, Ё, Ю, Я em certos contextos.",example:"объект",translation:"objeto"}
    ],
    examples:[
      {ru:"день",pt:"dia",note:"ь suaviza н"},
      {ru:"семья",pt:"família",note:"ь antes de я"},
      {ru:"объект",pt:"objeto",note:"ъ separa б de е"}
    ],
    listen:{prompt:"Ouça a palavra “день”. Qual sinal aparece no final?",target:"день",options:["ь","ъ","й"],answer:"ь",explain:"день termina com ь."},
    choice:{prompt:"Qual afirmação está correta?",options:["ь e ъ não têm som próprio","ь é uma vogal","ъ tem som de r"],answer:"ь e ъ não têm som próprio",explain:"Eles modificam/separam sons, mas não são pronunciados isoladamente."},
    type:{prompt:"Digite “день” (dia).",answer:"день"},
    arrange:{prompt:"Monte “семья” (família).",words:["я","сем","ь"],answer:"семья"},
    speak:{target:"день",pt:"dia",hint:"Tente deixar o Н final mais suave."},
    recap:["Você fechou as 33 letras","Ь = sinal brando","Ъ = sinal duro","Agora o próximo passo é automatizar leitura e escrita."]
  }
});

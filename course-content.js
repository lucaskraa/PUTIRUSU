window.PUTIRUSU_LESSONS = {
  "a1-1:0": {
    objective:"Reconhecer А, О, М e Т e ligar cada letra ao som sem depender do alfabeto latino.",
    concept:"Estas quatro letras são um ótimo começo porque a forma e o som são familiares. Leia devagar e sempre associe símbolo → som → palavra.",
    tip:"No russo, a sílaba tônica importa. Em мама, a primeira sílaba é forte: МА-ма.",
    examples:[
      {ru:"мама",pt:"mamãe",note:"МА-ма"},
      {ru:"там",pt:"lá",note:"там"},
      {ru:"том",pt:"volume / tomo",note:"том"}
    ],
    choice:{prompt:"Qual palavra significa “mamãe”?",options:["мама","там","том"],answer:"мама",explain:"мама = mamãe."},
    type:{prompt:"Digite em cirílico: mama",answer:"мама"},
    arrange:{prompt:"Monte a palavra “lá”.",words:["м","т","а"],answer:"там"},
    speak:{target:"мама",pt:"mamãe",hint:"Diga МА-ма, com a primeira sílaba mais forte."}
  },
  "a1-1:1": {
    objective:"Ler мама e там diretamente em cirílico, sem transliterar letra por letra.",
    concept:"A leitura começa a ficar automática quando você reconhece blocos. Em vez de pensar m-a-m-a, tente enxergar мама como uma palavra inteira.",
    tip:"Leia primeiro devagar, depois repita em ritmo normal.",
    examples:[
      {ru:"мама там.",pt:"Mamãe está lá.",note:"МА-ма там"},
      {ru:"там мама.",pt:"Lá está a mamãe.",note:"там МА-ма"}
    ],
    choice:{prompt:"O que significa “там”?",options:["aqui","lá","mamãe"],answer:"lá",explain:"там significa “lá”."},
    type:{prompt:"Digite a palavra russa para “lá”.",answer:"там"},
    arrange:{prompt:"Monte “мама там”.",words:["там","мама"],answer:"мама там"},
    speak:{target:"мама там",pt:"mamãe está lá",hint:"Faça uma pequena pausa natural entre as duas palavras."}
  },
  "a1-1:2": {
    objective:"Copiar palavras simples em cirílico mantendo forma, ordem e espaçamento.",
    concept:"Copiar não é desenhar letras isoladas. Olhe a palavra inteira, copie, esconda o modelo e tente novamente de memória.",
    tip:"Priorize legibilidade antes de velocidade.",
    examples:[
      {ru:"мама",pt:"mamãe",note:"4 letras"},
      {ru:"там",pt:"lá",note:"3 letras"},
      {ru:"том",pt:"tomo",note:"3 letras"}
    ],
    choice:{prompt:"Qual sequência está escrita corretamente?",options:["мама","амма","ммаа"],answer:"мама",explain:"A ordem correta é м-а-м-а."},
    type:{prompt:"Sem copiar: escreva “мама”.",answer:"мама"},
    arrange:{prompt:"Monte “том”.",words:["о","т","м"],answer:"том"},
    speak:{target:"том",pt:"tomo / volume",hint:"Pronuncie como uma única sílaba."}
  },

  "a1-2:0": {
    objective:"Reconhecer letras cirílicas que lembram o alfabeto latino e realmente têm som parecido.",
    concept:"А, К, М, О e Т são aliadas no começo. A forma é familiar e o som básico também é próximo do português.",
    tip:"Não confie só na aparência: confirme sempre o som da letra dentro de uma palavra.",
    examples:[
      {ru:"кот",pt:"gato",note:"кот"},
      {ru:"так",pt:"assim / então",note:"так"},
      {ru:"кто",pt:"quem",note:"кто"}
    ],
    choice:{prompt:"Qual palavra significa “gato”?",options:["кот","кто","так"],answer:"кот",explain:"кот = gato (macho)."},
    type:{prompt:"Digite “кот”.",answer:"кот"},
    arrange:{prompt:"Monte “кто”.",words:["о","к","т"],answer:"кто"},
    speak:{target:"кот",pt:"gato",hint:"Uma sílaba curta: кот."}
  },
  "a1-2:1": {
    objective:"Evitar as principais “falsas amigas” visuais do cirílico.",
    concept:"Algumas letras parecem latinas, mas têm outro som: В=v, Н=n, Р=r, С=s, У=u, Х=kh. Aprender isso cedo evita leitura errada.",
    tip:"Quando vir Р, pense no som de R; quando vir С, pense em S.",
    examples:[
      {ru:"сок",pt:"suco",note:"С soa s"},
      {ru:"рука",pt:"mão / braço",note:"Р soa r"},
      {ru:"нос",pt:"nariz",note:"Н soa n"}
    ],
    choice:{prompt:"Em “сок”, a letra С tem som de...",options:["s","k","v"],answer:"s",explain:"С parece C latino, mas soa como S."},
    type:{prompt:"Digite a palavra russa para “suco”.",answer:"сок"},
    arrange:{prompt:"Monte “нос” (nariz).",words:["с","н","о"],answer:"нос"},
    speak:{target:"рука",pt:"mão / braço",hint:"Tente um R curto no início."}
  },
  "a1-2:2": {
    objective:"Entender a função básica de ь e ъ na leitura.",
    concept:"O sinal ь normalmente indica palatalização/“suavização” da consoante anterior. O ъ separa uma consoante de uma vogal iotada em certos contextos. Eles não funcionam como vogais independentes.",
    tip:"No A1, o objetivo é reconhecer o efeito e não decorar todas as regras de uma vez.",
    examples:[
      {ru:"день",pt:"dia",note:"ь suaviza o н"},
      {ru:"семья",pt:"família",note:"ь participa da separação antes de я"},
      {ru:"объект",pt:"objeto",note:"ъ separa б de е"}
    ],
    choice:{prompt:"Qual sinal aparece em “день”?",options:["ь","ъ","й"],answer:"ь",explain:"день termina com o sinal brando ь."},
    type:{prompt:"Digite “день”.",answer:"день"},
    arrange:{prompt:"Monte “семья”.",words:["сем","я","ь"],answer:"семья"},
    speak:{target:"день",pt:"dia",hint:"O н final é mais suave do que um n português duro."}
  },

  "a1-3:0": {
    objective:"Perguntar e dizer o próprio nome de forma natural.",
    concept:"Как тебя зовут? é informal. Para responder, use Меня зовут + nome. Em contexto formal, você pode ouvir Как вас зовут?",
    tip:"Меня зовут literalmente usa uma estrutura diferente de “meu nome é”, então aprenda como bloco.",
    examples:[
      {ru:"Как тебя зовут?",pt:"Como você se chama?",note:"informal"},
      {ru:"Меня зовут Лукас.",pt:"Meu nome é Lucas.",note:"resposta padrão"},
      {ru:"Как вас зовут?",pt:"Como o(a) senhor(a) se chama?",note:"formal"}
    ],
    choice:{prompt:"Qual resposta serve para “Как тебя зовут?”",options:["Меня зовут Лукас.","Я из Бразилии.","Спасибо."],answer:"Меня зовут Лукас.",explain:"Меня зовут... é a forma padrão de dizer o nome."},
    type:{prompt:"Complete: Меня ___ Лукас.",answer:"зовут"},
    arrange:{prompt:"Monte “Меня зовут Лукас”.",words:["Лукас","зовут","Меня"],answer:"Меня зовут Лукас"},
    speak:{target:"Меня зовут Лукас",pt:"Meu nome é Lucas",hint:"Dê destaque natural a зовут."}
  },
  "a1-3:1": {
    objective:"Dizer de onde você é e perguntar a origem de outra pessoa.",
    concept:"Я из + lugar no genitivo é a estrutura básica. Para Brasil: Я из Бразилии. Para perguntar: Откуда ты?",
    tip:"Decore a frase inteira primeiro; os casos serão aprofundados mais tarde.",
    examples:[
      {ru:"Я из Бразилии.",pt:"Eu sou do Brasil.",note:"origem"},
      {ru:"Откуда ты?",pt:"De onde você é?",note:"informal"},
      {ru:"Я из России.",pt:"Eu sou da Rússia.",note:"origem"}
    ],
    choice:{prompt:"Como dizer “Eu sou do Brasil”?",options:["Я из Бразилии.","Я в Бразилии.","Я Бразилия."],answer:"Я из Бразилии.",explain:"Para origem, use Я из + lugar."},
    type:{prompt:"Digite: Я из Бразилии.",answer:"я из бразилии"},
    arrange:{prompt:"Monte a frase.",words:["Бразилии","из","Я"],answer:"Я из Бразилии"},
    speak:{target:"Я из Бразилии",pt:"Eu sou do Brasil",hint:"Não precisa inserir o verbo “ser” no presente."}
  },
  "a1-3:2": {
    objective:"Dizer profissão ou condição usando frases nominais no presente.",
    concept:"No presente, o verbo быть (“ser/estar”) normalmente é omitido: Я студент. Я студентка. Я учитель. Não diga *Я есть студент* em fala comum.",
    tip:"A forma pode mudar com gênero: студент / студентка.",
    examples:[
      {ru:"Я студент.",pt:"Eu sou estudante. (masc.)",note:"sem есть"},
      {ru:"Я студентка.",pt:"Eu sou estudante. (fem.)",note:"sem есть"},
      {ru:"Я работаю.",pt:"Eu trabalho.",note:"verbo explícito"}
    ],
    choice:{prompt:"Qual frase é a forma normal de “Eu sou estudante”?",options:["Я студент.","Я есть студент.","Я быть студент."],answer:"Я студент.",explain:"No presente, быть costuma ser omitido."},
    type:{prompt:"Corrija: Я есть студент.",answer:"я студент"},
    arrange:{prompt:"Monte “Eu sou estudante”.",words:["студент","Я"],answer:"Я студент"},
    speak:{target:"Я студент",pt:"Eu sou estudante",hint:"Fale como uma frase curta, sem inserir есть."}
  },

  "a2-1:0": {
    objective:"Usar verbos frequentes no presente para falar da rotina.",
    concept:"Os verbos russos mudam conforme a pessoa. Em vez de decorar tabelas isoladas, compare formas em frases: я работаю, ты читаешь, он говорит.",
    tip:"Aprenda cada verbo com pelo menos uma forma de “я” e uma de “ты”.",
    examples:[
      {ru:"Я работаю.",pt:"Eu trabalho.",note:"работать"},
      {ru:"Ты читаешь.",pt:"Você lê.",note:"читать"},
      {ru:"Он говорит по-русски.",pt:"Ele fala russo.",note:"говорить"}
    ],
    choice:{prompt:"Qual forma combina com “Я”?",options:["работаю","работаешь","работает"],answer:"работаю",explain:"Я работаю = eu trabalho."},
    type:{prompt:"Complete: Ты ___ книгу. (читать)",answer:"читаешь"},
    arrange:{prompt:"Monte “Eu estudo russo”.",words:["русский","учу","Я"],answer:"Я учу русский"},
    speak:{target:"Я работаю и учу русский",pt:"Eu trabalho e estudo russo",hint:"Mantenha ritmo contínuo entre работаю и учу."}
  },
  "a2-1:1": {
    objective:"Perguntar e dizer horas em situações cotidianas.",
    concept:"Который час? pergunta as horas. Para uma resposta simples: Сейчас три часа. Para dizer “às cinco”: в пять часов.",
    tip:"As formas de час mudam com o número; primeiro domine expressões frequentes.",
    examples:[
      {ru:"Который час?",pt:"Que horas são?",note:"pergunta"},
      {ru:"Сейчас три часа.",pt:"Agora são três horas.",note:"resposta"},
      {ru:"В пять часов.",pt:"Às cinco horas.",note:"horário"}
    ],
    choice:{prompt:"Como perguntar “Que horas são?”",options:["Который час?","Какой день?","Где часы?"],answer:"Который час?",explain:"Который час? é a pergunta padrão."},
    type:{prompt:"Complete: Сейчас три ___.",answer:"часа"},
    arrange:{prompt:"Monte “Às cinco horas”.",words:["часов","пять","В"],answer:"В пять часов"},
    speak:{target:"Сейчас три часа",pt:"Agora são três horas",hint:"Não corra em три часа."}
  },
  "a2-1:2": {
    objective:"Falar dos dias da semana e marcar atividades.",
    concept:"Para dizer “na segunda-feira”, use в понедельник. Hoje = сегодня, amanhã = завтра, ontem = вчера.",
    tip:"Use os dias dentro de frases reais da sua rotina.",
    examples:[
      {ru:"Сегодня понедельник.",pt:"Hoje é segunda-feira.",note:"hoje"},
      {ru:"В понедельник я работаю.",pt:"Na segunda eu trabalho.",note:"rotina"},
      {ru:"Завтра вторник.",pt:"Amanhã é terça-feira.",note:"amanhã"}
    ],
    choice:{prompt:"O que significa “Сегодня”?",options:["hoje","amanhã","ontem"],answer:"hoje",explain:"Сегодня = hoje."},
    type:{prompt:"Digite “segunda-feira” em russo.",answer:"понедельник"},
    arrange:{prompt:"Monte “Hoje é segunda-feira”.",words:["понедельник","Сегодня"],answer:"Сегодня понедельник"},
    speak:{target:"В понедельник я работаю",pt:"Na segunda eu trabalho",hint:"Fale в понедельник como um bloco."}
  },

  "a2-2:0": {
    objective:"Pedir e entender direções básicas na cidade.",
    concept:"Где...? serve para perguntar onde algo fica. Para instruções, você ouvirá прямо, налево, направо e рядом.",
    tip:"Treine como mini rota: прямо → направо → метро.",
    examples:[
      {ru:"Где метро?",pt:"Onde fica o metrô?",note:"pergunta"},
      {ru:"Идите прямо.",pt:"Siga em frente.",note:"formal/plural"},
      {ru:"Поверните направо.",pt:"Vire à direita.",note:"instrução"}
    ],
    choice:{prompt:"“направо” significa...",options:["à direita","à esquerda","em frente"],answer:"à direita",explain:"направо = à direita."},
    type:{prompt:"Digite a palavra russa para “metrô”.",answer:"метро"},
    arrange:{prompt:"Monte “Где метро?”",words:["метро","Где"],answer:"Где метро"},
    speak:{target:"Где метро",pt:"Onde fica o metrô?",hint:"Suba levemente a entonação de pergunta."}
  },
  "a2-2:1": {
    objective:"Perguntar preço e entender respostas simples.",
    concept:"Сколько это стоит? = Quanto isso custa? A resposta usa стоит + valor + moeda.",
    tip:"Para compras, pratique números junto com рублей.",
    examples:[
      {ru:"Сколько это стоит?",pt:"Quanto isso custa?",note:"preço"},
      {ru:"Это стоит пятьсот рублей.",pt:"Isso custa 500 rublos.",note:"resposta"},
      {ru:"Слишком дорого.",pt:"É caro demais.",note:"reação"}
    ],
    choice:{prompt:"Qual pergunta pede o preço?",options:["Сколько это стоит?","Где это?","Кто это?"],answer:"Сколько это стоит?",explain:"Сколько это стоит? pergunta quanto custa."},
    type:{prompt:"Complete: Это ___ 500 рублей.",answer:"стоит"},
    arrange:{prompt:"Monte a pergunta de preço.",words:["стоит","это","Сколько"],answer:"Сколько это стоит"},
    speak:{target:"Сколько это стоит",pt:"Quanto isso custa?",hint:"Dê destaque a сколько."}
  },
  "a2-2:2": {
    objective:"Usar imperativos educados em instruções simples.",
    concept:"Em situações com desconhecidos, formas como идите, скажите e поверните são comuns e polidas quando acompanhadas de пожалуйста.",
    tip:"Добавьте пожалуйста para suavizar o pedido.",
    examples:[
      {ru:"Скажите, пожалуйста.",pt:"Diga, por favor.",note:"pedido"},
      {ru:"Идите прямо.",pt:"Siga em frente.",note:"direção"},
      {ru:"Поверните налево.",pt:"Vire à esquerda.",note:"direção"}
    ],
    choice:{prompt:"Qual opção é um pedido educado?",options:["Скажите, пожалуйста.","Скажи!","Я говорю."],answer:"Скажите, пожалуйста.",explain:"Скажите + пожалуйста é apropriado com desconhecidos."},
    type:{prompt:"Complete: ___ направо. (повернуть)",answer:"поверните"},
    arrange:{prompt:"Monte “Siga em frente, por favor”.",words:["пожалуйста","прямо","Идите"],answer:"Идите прямо пожалуйста"},
    speak:{target:"Скажите пожалуйста",pt:"Diga, por favor",hint:"Use entonação neutra e educada."}
  },

  "b1-1:0": {
    objective:"Usar o acusativo com objetos e pessoas em frases frequentes.",
    concept:"O acusativo marca frequentemente o objeto direto. Compare: Я читаю книгу; Я вижу брата. As terminações dependem de gênero e animacidade.",
    tip:"Não tente decorar o caso isolado: observe qual verbo pede o objeto.",
    examples:[
      {ru:"Я читаю книгу.",pt:"Eu leio um livro.",note:"книга → книгу"},
      {ru:"Я вижу брата.",pt:"Eu vejo meu irmão.",note:"брат → брата"},
      {ru:"Я люблю музыку.",pt:"Eu amo música.",note:"музыка → музыку"}
    ],
    choice:{prompt:"Complete: Я читаю ___.",options:["книга","книгу","книге"],answer:"книгу",explain:"Objeto direto feminino em -а normalmente vai para -у."},
    type:{prompt:"Complete: Я люблю ___. (музыка)",answer:"музыку"},
    arrange:{prompt:"Monte “Eu vejo meu irmão”.",words:["брата","вижу","Я"],answer:"Я вижу брата"},
    speak:{target:"Я люблю музыку",pt:"Eu amo música",hint:"Ligue люблю музыку sem pausa grande."}
  },
  "b1-1:1": {
    objective:"Usar o prepositivo para localização e assunto.",
    concept:"Depois de в/на para localização e о para assunto, o prepositivo aparece com frequência: в Москве, на работе, о музыке.",
    tip:"Associe o caso a perguntas: где? e о чём?",
    examples:[
      {ru:"Я живу в Москве.",pt:"Eu moro em Moscou.",note:"где?"},
      {ru:"Она на работе.",pt:"Ela está no trabalho.",note:"где?"},
      {ru:"Мы говорим о музыке.",pt:"Falamos sobre música.",note:"о чём?"}
    ],
    choice:{prompt:"Complete: Я живу в ___.",options:["Москва","Москве","Москву"],answer:"Москве",explain:"Localização com в pede prepositivo aqui: в Москве."},
    type:{prompt:"Complete: Мы говорим о ___. (музыка)",answer:"музыке"},
    arrange:{prompt:"Monte “Ela está no trabalho”.",words:["работе","на","Она"],answer:"Она на работе"},
    speak:{target:"Я живу в Москве",pt:"Eu moro em Moscou",hint:"Não separe в de Москве."}
  },
  "b1-1:2": {
    objective:"Usar o genitivo para ausência, origem e quantidade.",
    concept:"O genitivo aparece em estruturas como нет времени, стакан воды e из Бразилии. Ele é extremamente frequente em russo.",
    tip:"Aprenda expressões-modelo antes de estudar todas as terminações.",
    examples:[
      {ru:"У меня нет времени.",pt:"Eu não tenho tempo.",note:"нет + genitivo"},
      {ru:"Стакан воды.",pt:"Um copo de água.",note:"quantidade"},
      {ru:"Я из Бразилии.",pt:"Eu sou do Brasil.",note:"origem"}
    ],
    choice:{prompt:"Complete: У меня нет ___.",options:["время","времени","временем"],answer:"времени",explain:"Depois de нет, usamos genitivo: времени."},
    type:{prompt:"Complete: стакан ___. (вода)",answer:"воды"},
    arrange:{prompt:"Monte “Eu não tenho tempo”.",words:["времени","нет","меня","У"],answer:"У меня нет времени"},
    speak:{target:"У меня нет времени",pt:"Eu não tenho tempo",hint:"Fale У меня como uma unidade rítmica."}
  },

  "b1-2:0": {
    objective:"Entender quando o imperfectivo descreve processo, hábito ou repetição.",
    concept:"O imperfectivo foca a atividade/processo ou algo habitual: Я читал книгу весь вечер. Я часто читаю.",
    tip:"Pergunte: estou falando do processo ou do resultado concluído?",
    examples:[
      {ru:"Я читал книгу весь вечер.",pt:"Eu li/estive lendo o livro a noite toda.",note:"processo"},
      {ru:"Я часто читаю.",pt:"Eu leio com frequência.",note:"hábito"},
      {ru:"Что ты делал?",pt:"O que você estava fazendo?",note:"processo"}
    ],
    choice:{prompt:"Qual frase destaca hábito?",options:["Я часто читаю.","Я прочитал книгу.","Я прочитаю книгу."],answer:"Я часто читаю.",explain:"O advérbio часто combina naturalmente com atividade habitual."},
    type:{prompt:"Complete: Я ___ книгу весь вечер. (читать, passado)",answer:"читал"},
    arrange:{prompt:"Monte “O que você estava fazendo?”",words:["делал","ты","Что"],answer:"Что ты делал"},
    speak:{target:"Я часто читаю",pt:"Eu leio com frequência",hint:"Mantenha frequentemente o acento de читаю em -та́-."}
  },
  "b1-2:1": {
    objective:"Usar o perfectivo para resultado concluído ou evento único completo.",
    concept:"O perfectivo apresenta a ação como um todo com resultado: Я прочитал книгу. No futuro: Я прочитаю книгу завтра.",
    tip:"Perfectivo não tem presente com valor presente; formas “presentes” morfológicas têm sentido de futuro.",
    examples:[
      {ru:"Я прочитал книгу.",pt:"Eu terminei de ler o livro.",note:"resultado"},
      {ru:"Я купил билет.",pt:"Eu comprei o bilhete.",note:"evento concluído"},
      {ru:"Я прочитаю завтра.",pt:"Vou terminar de ler amanhã.",note:"futuro"}
    ],
    choice:{prompt:"Qual frase enfatiza que o livro foi terminado?",options:["Я читал книгу.","Я прочитал книгу.","Я читаю книгу."],answer:"Я прочитал книгу.",explain:"прочитал apresenta a leitura como concluída."},
    type:{prompt:"Complete: Я ___ билет. (купить, passado masc.)",answer:"купил"},
    arrange:{prompt:"Monte “Vou terminar de ler amanhã”.",words:["завтра","прочитаю","Я"],answer:"Я прочитаю завтра"},
    speak:{target:"Я прочитал книгу",pt:"Eu terminei de ler o livro",hint:"Dê clareza ao prefixo про-."}
  },
  "b1-2:2": {
    objective:"Comparar pares aspectuais frequentes e escolher pelo sentido.",
    concept:"Muitos verbos aparecem em pares: делать/сделать, покупать/купить, читать/прочитать. O par não é só “tempo”; é perspectiva sobre a ação.",
    tip:"Aprenda pares dentro de contextos contrastivos.",
    examples:[
      {ru:"Я делал домашнее задание.",pt:"Eu estava fazendo a lição.",note:"processo"},
      {ru:"Я сделал домашнее задание.",pt:"Eu fiz/terminei a lição.",note:"resultado"},
      {ru:"Я покупал хлеб каждый день.",pt:"Eu comprava pão todos os dias.",note:"hábito"}
    ],
    choice:{prompt:"Você quer dizer “terminei a tarefa”. Qual verbo?",options:["делал","сделал","делаю"],answer:"сделал",explain:"сделал marca resultado concluído."},
    type:{prompt:"Complete com perfectivo: Я ___ хлеб. (купить)",answer:"купил"},
    arrange:{prompt:"Monte a frase de processo.",words:["задание","делал","Я","домашнее"],answer:"Я делал домашнее задание"},
    speak:{target:"Я сделал домашнее задание",pt:"Eu terminei a lição de casa",hint:"Não engula o prefixo с- em сделал."}
  },

  "b2-1:0": {
    objective:"Conectar argumentos com clareza em fala e escrita.",
    concept:"Use conectores para marcar contraste, causa e consequência: однако, поэтому, хотя, с одной стороны... с другой стороны.",
    tip:"Não empilhe conectores. Escolha um que deixe a relação lógica explícita.",
    examples:[
      {ru:"Я устал, поэтому остался дома.",pt:"Eu estava cansado, por isso fiquei em casa.",note:"consequência"},
      {ru:"Хотя было холодно, мы гуляли.",pt:"Embora estivesse frio, passeamos.",note:"concessão"},
      {ru:"Однако проблема осталась.",pt:"No entanto, o problema permaneceu.",note:"contraste"}
    ],
    choice:{prompt:"Qual conector indica consequência?",options:["поэтому","однако","хотя"],answer:"поэтому",explain:"поэтому = por isso / portanto."},
    type:{prompt:"Complete: Я устал, ___ остался дома.",answer:"поэтому"},
    arrange:{prompt:"Monte a frase com concessão.",words:["мы гуляли","Хотя было холодно"],answer:"Хотя было холодно мы гуляли"},
    speak:{target:"Хотя было холодно мы гуляли",pt:"Embora estivesse frio, passeamos",hint:"Faça uma pausa curta depois da oração com хотя."}
  },
  "b2-1:1": {
    objective:"Manter concordância correta em grupos nominais e frases mais longas.",
    concept:"Adjetivos concordam com substantivos em gênero, número e caso. Compare интересная книга, интересные книги, об интересной книге.",
    tip:"Ao revisar uma frase, cheque o substantivo primeiro e depois ajuste o adjetivo.",
    examples:[
      {ru:"интересная книга",pt:"livro interessante",note:"feminino singular"},
      {ru:"интересные книги",pt:"livros interessantes",note:"plural"},
      {ru:"об интересной книге",pt:"sobre um livro interessante",note:"prepositivo"}
    ],
    choice:{prompt:"Qual forma combina com “книга” no nominativo singular?",options:["интересная","интересный","интересные"],answer:"интересная",explain:"книга é feminino singular: интересная книга."},
    type:{prompt:"Complete: интересные ___. (книга, plural)",answer:"книги"},
    arrange:{prompt:"Monte “sobre um livro interessante”.",words:["книге","интересной","об"],answer:"об интересной книге"},
    speak:{target:"Это очень интересная книга",pt:"Este é um livro muito interessante",hint:"Mantenha интересная como uma palavra fluida, sem separar as sílabas demais."}
  },
  "b2-1:2": {
    objective:"Escolher registro adequado entre conversa informal e situações formais.",
    concept:"O russo muda bastante com relação social e contexto. Ты/вы, привет/здравствуйте e pedidos diretos/indiretos sinalizam proximidade e respeito.",
    tip:"Com desconhecidos, atendimento e situações profissionais, вы costuma ser a escolha segura.",
    examples:[
      {ru:"Привет! Как дела?",pt:"Oi! Como vai?",note:"informal"},
      {ru:"Здравствуйте. Как вы?",pt:"Olá. Como o(a) senhor(a) está?",note:"formal"},
      {ru:"Не могли бы вы помочь?",pt:"Poderia me ajudar?",note:"pedido polido"}
    ],
    choice:{prompt:"Qual frase é mais adequada em contexto formal?",options:["Не могли бы вы помочь?","Помоги мне.","Привет, ты кто?"],answer:"Не могли бы вы помочь?",explain:"A forma condicional com вы é mais polida."},
    type:{prompt:"Complete o pronome formal: Как ___?",answer:"вы"},
    arrange:{prompt:"Monte o pedido formal.",words:["помочь","вы","бы","Не могли"],answer:"Не могли бы вы помочь"},
    speak:{target:"Не могли бы вы помочь",pt:"Poderia me ajudar?",hint:"Use entonação suave, sem soar como ordem."}
  },

  "c1-1:0": {
    objective:"Adaptar estilo ao gênero textual: conversa, notícia e texto argumentativo.",
    concept:"No nível avançado, não basta estar gramaticalmente correto. Escolhas de vocabulário, estrutura e impessoalidade mudam conforme o gênero.",
    tip:"Pergunte sempre: quem fala, para quem, com qual objetivo?",
    examples:[
      {ru:"Я думаю, что это важно.",pt:"Acho que isso é importante.",note:"neutro/conversacional"},
      {ru:"Представляется важным отметить...",pt:"Parece importante observar...",note:"formal/escrito"},
      {ru:"По данным исследования...",pt:"Segundo os dados da pesquisa...",note:"informativo"}
    ],
    choice:{prompt:"Qual abertura soa mais formal/escrita?",options:["Представляется важным отметить...","Ну, я думаю...","Короче говоря..."],answer:"Представляется важным отметить...",explain:"Essa construção impessoal é típica de registro formal."},
    type:{prompt:"Complete a expressão: По ___ исследования...",answer:"данным"},
    arrange:{prompt:"Monte a abertura formal.",words:["важным","Представляется","отметить"],answer:"Представляется важным отметить"},
    speak:{target:"По данным исследования",pt:"Segundo os dados da pesquisa",hint:"Mantenha ritmo neutro e informativo."}
  },
  "c1-1:1": {
    objective:"Perceber partículas e advérbios que mudam nuance sem alterar o núcleo factual.",
    concept:"Palavras como ведь, же, всё-таки, скорее e пожалуй ajustam expectativa, contraste, insistência ou grau de certeza.",
    tip:"A tradução literal raramente captura tudo; observe o efeito no contexto.",
    examples:[
      {ru:"Он всё-таки пришёл.",pt:"No fim das contas, ele veio.",note:"resultado apesar de expectativa"},
      {ru:"Ты же знаешь.",pt:"Você sabe, afinal.",note:"apelo a conhecimento compartilhado"},
      {ru:"Пожалуй, я останусь.",pt:"Acho que talvez eu fique.",note:"decisão cautelosa"}
    ],
    choice:{prompt:"Qual partícula sugere “apesar de tudo / no fim das contas”?",options:["всё-таки","же","ведь"],answer:"всё-таки",explain:"всё-таки frequentemente marca resultado apesar de obstáculos ou expectativa contrária."},
    type:{prompt:"Complete: Он ___ пришёл.",answer:"всё-таки"},
    arrange:{prompt:"Monte “Acho que talvez eu fique”.",words:["останусь","я","Пожалуй"],answer:"Пожалуй я останусь"},
    speak:{target:"Он всё-таки пришёл",pt:"No fim das contas, ele veio",hint:"Dê leve ênfase a всё-таки."}
  },
  "c1-1:2": {
    objective:"Usar expressões idiomáticas frequentes sem traduzi-las palavra por palavra.",
    concept:"Expressões cristalizadas carregam sentido pragmático. Aprenda contexto, tom e situação de uso.",
    tip:"Use poucas expressões, mas use-as no contexto certo.",
    examples:[
      {ru:"Руки не доходят.",pt:"Não consigo arrumar tempo para isso.",note:"informal"},
      {ru:"Дело в том, что...",pt:"A questão é que...",note:"explicação"},
      {ru:"Ни пуха ни пера!",pt:"Boa sorte!",note:"expressão tradicional"}
    ],
    choice:{prompt:"Qual expressão introduz uma explicação?",options:["Дело в том, что...","Ни пуха ни пера!","Руки не доходят."],answer:"Дело в том, что...",explain:"Дело в том, что... introduz a razão ou explicação."},
    type:{prompt:"Complete: Дело в ___, что...",answer:"том"},
    arrange:{prompt:"Monte “Não consigo arrumar tempo para isso”.",words:["доходят","не","Руки"],answer:"Руки не доходят"},
    speak:{target:"Дело в том что",pt:"A questão é que...",hint:"Use a expressão como um bloco introdutório."}
  },

  "c2-1:0": {
    objective:"Produzir combinações lexicais naturais em vez de traduções literais.",
    concept:"Fluência avançada depende de colocações: принять решение, оказать влияние, обратить внимание. A gramática pode estar correta e ainda assim a combinação soar pouco natural.",
    tip:"Registre substantivos junto com os verbos que normalmente os acompanham.",
    examples:[
      {ru:"принять решение",pt:"tomar uma decisão",note:"colocação"},
      {ru:"оказать влияние",pt:"exercer influência",note:"colocação"},
      {ru:"обратить внимание",pt:"prestar atenção",note:"colocação"}
    ],
    choice:{prompt:"Qual verbo combina naturalmente com “решение” no sentido de tomar uma decisão?",options:["принять","сделать","взять"],answer:"принять",explain:"A colocação padrão é принять решение."},
    type:{prompt:"Complete: обратить ___.",answer:"внимание"},
    arrange:{prompt:"Monte a colocação “exercer influência”.",words:["влияние","оказать"],answer:"оказать влияние"},
    speak:{target:"Мы приняли решение",pt:"Nós tomamos uma decisão",hint:"Use приняли решение como um bloco lexical."}
  },
  "c2-1:1": {
    objective:"Reconhecer variação regional sem confundir com “erro”.",
    concept:"O russo padrão é amplamente compartilhado, mas algumas escolhas lexicais variam regionalmente. Em São Petersburgo, por exemplo, парадная e поребрик são marcadores conhecidos de uso local.",
    tip:"Reconheça variantes antes de tentar incorporá-las à sua própria fala.",
    examples:[
      {ru:"парадная",pt:"entrada de prédio",note:"associada a São Petersburgo"},
      {ru:"подъезд",pt:"entrada de prédio",note:"forma ampla no russo padrão"},
      {ru:"поребрик / бордюр",pt:"meio-fio",note:"variação lexical regional"}
    ],
    choice:{prompt:"Qual palavra é fortemente associada a São Petersburgo para “entrada de prédio”?",options:["парадная","подъезд","улица"],answer:"парадная",explain:"парадная é uma marca lexical conhecida de São Petersburgo."},
    type:{prompt:"Digite a forma ampla para “entrada de prédio”.",answer:"подъезд"},
    arrange:{prompt:"Monte o par regional.",words:["бордюр","поребрик"],answer:"поребрик бордюр"},
    speak:{target:"парадная и подъезд",pt:"duas variantes para entrada de prédio",hint:"Concentre-se na distinção de sons, não em imitar um sotaque regional."}
  },
  "c2-1:2": {
    objective:"Reescrever preservando sentido, mas ajustando precisão, concisão e registro.",
    concept:"Domínio avançado inclui dizer a mesma ideia de formas diferentes. Reescrita exige controlar tom e implicaturas, não apenas trocar sinônimos.",
    tip:"Depois de reescrever, cheque três coisas: sentido, registro e naturalidade.",
    examples:[
      {ru:"Я думаю, что это не очень хорошая идея.",pt:"Acho que não é uma ideia muito boa.",note:"neutro"},
      {ru:"Представляется, что это решение не вполне удачно.",pt:"Parece que essa solução não é totalmente adequada.",note:"formal"},
      {ru:"По-моему, идея так себе.",pt:"Na minha opinião, a ideia é mais ou menos.",note:"coloquial"}
    ],
    choice:{prompt:"Qual versão é mais coloquial?",options:["По-моему, идея так себе.","Представляется, что решение не вполне удачно.","Следует отметить недостатки решения."],answer:"По-моему, идея так себе.",explain:"так себе é uma expressão coloquial para algo mediano/pouco bom."},
    type:{prompt:"Complete a expressão coloquial: идея так ___.",answer:"себе"},
    arrange:{prompt:"Monte a versão formal.",words:["решение","не вполне удачно","Представляется что это"],answer:"Представляется что это решение не вполне удачно"},
    speak:{target:"По-моему идея так себе",pt:"Na minha opinião, a ideia é mais ou menos",hint:"Use entonação conversacional e leve redução, sem exagerar."}
  }
};

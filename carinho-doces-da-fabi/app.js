/**
 * Carinho Doces da Fabi - Core Application Logic
 * Banco de Dados de Receitas e Gerenciamento de Estados do App
 */

// --- UNIFIED GA4 METRICS TRACKING HELPER ---
function trackEvent(eventName, params = {}) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, {
        ...params,
        app_name: 'Carinho Doces da Fabi',
        platform: window.AndroidBridge ? 'Android Native' : 'PWA Web'
      });
      console.log(`[Analytics] Evento '${eventName}' enviado com sucesso:`, params);
    } else {
      console.warn(`[Analytics] gtag não está disponível para o evento '${eventName}'`);
    }
  } catch (e) {
    console.error(`[Analytics] Erro ao enviar evento '${eventName}':`, e);
  }
}

// --- BANCO DE DADOS LOCAL DE RECEITAS (12 COMPLETAS) ---
const RECEITAS_DB = [
  {
    id: 1,
    nome: "Bolo de Chocolate Fofinho",
    categoria: "Bolos",
    tags: ["chocolates", "bolos", "receitas da Fabi"],
    imagem: "assets/destaque_chocolate.jpg",
    descricao: "O clássico bolo de chocolate das tardes de domingo: massa extremamente úmida, fofinha e com uma calda vulcão de brigadeiro gourmet brilhante por cima.",
    tempo: "45 min",
    rendimento: "12 fatias",
    dificuldade: "Fácil",
    acompanhamento: "Uma xícara de café coado na hora ou uma bola de sorvete de creme para contrastar com o chocolate quente.",
    dicaEspecial: "Adicione uma colher de sopa de café solúvel na massa. O café não deixa sabor residual, mas potencializa e realça a cor e o sabor do cacau na massa!",
    historia: "O bolo de chocolate moderno começou a ganhar popularidade no final do século XIX, com a invenção do processo de fabricação de chocolate em pó e a prensa hidráulica por Coenraad van Houten. No Brasil, o bolo de chocolate com cobertura de brigadeiro mole virou o rei indiscutível das festas infantis e dos cafés da tarde em família.",
    curiosidade: "Sabia que o chocolate estimula a liberação de endorfina e serotonina? É por isso que uma fatia deste bolo quente tem o poder imediato de abraçar o coração e mandar a tristeza embora!",
    ingredientes: [
      "3 ovos inteiros",
      "1 xícara (chá) de óleo de girassol",
      "1 xícara (chá) de leite morno",
      "1 xícara (chá) de açúcar refinado",
      "1 xícara (chá) de cacau em pó 50%",
      "2 xícaras (chá) de farinha de trigo peneirada",
      "1 colher (sopo) de fermento químico em pó",
      "300g de chocolate meio amargo e 1 lata de leite condensado (para a cobertura vulcão)"
    ],
    modoPreparo: [
      "No liquidificador, bata os ovos, o óleo, o leite morno, o açúcar e o cacau em pó por 3 minutos até ficar homogêneo.",
      "Transfira a mistura para um bowl e adicione a farinha de trigo peneirada aos poucos, mexendo delicadamente com um fouet até incorporar.",
      "Por último, adicione o fermento em pó e misture levemente apenas para integrar à massa.",
      "Despeje em uma forma de furo central untada e polvilhada com cacau em pó (evita aquela bordinha branca de farinha de trigo).",
      "Asse em forno preaquecido a 180°C por cerca de 35 a 40 minutos. Faça o teste do palito.",
      "Para o vulcão: cozinhe o leite condensado com o chocolate meio amargo e uma colher de manteiga em fogo baixo até formar um brigadeiro mole. Despeje quente sobre o bolo desenformado."
    ]
  },
  {
    id: 2,
    nome: "Bolo de Cenoura com Brigadeiro",
    categoria: "Bolos",
    tags: ["chocolates", "bolos", "receitas rápidas"],
    imagem: "assets/destaque_cenoura.jpg",
    descricao: "O verdadeiro bolo de cenoura brasileiro: massa dourada, leve e aerada com aquela cobertura de brigadeiro que craquela levemente por cima. Um clássico irresistível.",
    tempo: "50 min",
    rendimento: "15 porções",
    dificuldade: "Fácil",
    acompanhamento: "Um copo de leite gelado ou um chá preto com raspas de laranja.",
    dicaEspecial: "Não pese a mão nas cenouras! Cenoura demais deixa o bolo pesado e solado. Use exatamente 250g de cenoura descascada para a medida clássica de 3 ovos.",
    historia: "Embora os bolos de cenoura tenham origem europeia medieval (onde a cenoura era usada como adoçante natural devido à escassez de açúcar), a versão brasileira com massa de liquidificador e cobertura espessa de brigadeiro é uma criação puramente nossa, que virou patrimônio afetivo nacional.",
    curiosidade: "A cobertura tradicional pode ser feita de duas formas: o brigadeiro cremoso clássico ou a calda de chocolate 'craquelada' (com açúcar, chocolate em pó e manteiga que seca ao esfriar). Ambas têm legiões de fãs apaixonados!",
    ingredientes: [
      "3 cenouras médias descascadas e picadas (250g)",
      "3 ovos grandes inteiros",
      "1/2 xícara (chá) de óleo de milho",
      "2 xícaras (chá) de açúcar cristal ou refinado",
      "2 xícaras (chá) de farinha de trigo",
      "1 colher (sopa) de fermento químico",
      "1 lata de leite condensado + 4 colheres de achocolatado + 1 colher de manteiga (para a cobertura)"
    ],
    modoPreparo: [
      "No liquidificador, bata a cenoura picada, os ovos e o óleo até que a cenoura esteja completamente triturada e vire um creme líquido uniforme.",
      "Adicione o açúcar e bata por mais 1 minuto para dissolver bem.",
      "Em uma tigela grande, coloque a farinha de trigo e despeje o creme líquido por cima. Misture suavemente com o fouet até obter uma massa lisa.",
      "Adicione o fermento e misture delicadamente de baixo para cima.",
      "Despeje em uma assadeira retangular média (20x30cm) untada e enfarinhada.",
      "Asse em forno preaquecido a 180°C por 40 minutos. Cubra com o brigadeiro ainda morno para penetrar na massa."
    ]
  },
  {
    id: 3,
    nome: "Brigadeiro Gourmet Tradicional",
    categoria: "Doces",
    tags: ["chocolates", "doces", "receitas rápidas", "receitas da Fabi"],
    imagem: "assets/destaque_brigadeiro.jpg",
    descricao: "O docinho mais amado do Brasil elevado ao nível gourmet: textura ultra aveludada, chocolate nobre belga e confeitos de qualidade premium que derretem na boca.",
    tempo: "25 min",
    rendimento: "25 unidades",
    dificuldade: "Fácil",
    acompanhamento: "Um espumante Moscatel bem gelado. A acidez do espumante equilibra perfeitamente a doçura do brigadeiro.",
    dicaEspecial: "Substitua o achocolatado comum por chocolate nobre em barra picado (mínimo 50% cacau) e adicione uma colher de sopa de creme de leite. Isso evita a cristalização e deixa uma textura aveludada incomparável.",
    historia: "O doce foi criado logo após a Segunda Guerra Mundial, em 1945, no Rio de Janeiro. Mulheres que apoiavam a campanha presidencial do Brigadeiro Eduardo Gomes faziam o docinho de leite condensado e cacau para arrecadar fundos. O candidato perdeu as eleições, mas o doce conquistou o mundo!",
    curiosidade: "Originalmente, o brigadeiro era chamado de 'doce do brigadeiro', mas com o tempo o nome se simplificou. É um dos poucos doces genuinamente brasileiros conhecidos internacionalmente pelo nome original.",
    ingredientes: [
      "1 lata de leite condensado de excelente qualidade (395g)",
      "100g de chocolate meio amargo picado (nobre belga ou nacional 50%)",
      "1 colher (sopa) de manteiga sem sal (15g)",
      "1 colher (sopa) de creme de leite de caixinha (opcional, para cremosidade)",
      "150g de confeitos granulados de chocolate puro (tipo splits ou vermicelli) para enrolar"
    ],
    modoPreparo: [
      "Em uma panela de fundo grosso (essencial para não queimar), misture o leite condensado, o chocolate meio amargo picado, a manteiga e o creme de leite.",
      "Leve ao fogo baixo, mexendo sem parar com uma espátula de silicone (pão duro), raspando bem as laterais e o fundo da panela.",
      "Cozinhe até que a massa engrosse e desgrude totalmente do fundo da panela (ponto de bloco). Quando você vira a panela, o brigadeiro cai como um bloco único.",
      "Transfira para um prato untado com manteiga, cubra com plástico filme em contato e deixe esfriar completamente em temperatura ambiente.",
      "Com as mãos levemente untadas com água gelada ou manteiga, modele bolinhas de 15g, passe nos confeitos de chocolate e acomode em forminhas delicadas."
    ]
  },
  {
    id: 4,
    nome: "Beijinho de Coco Tostado",
    categoria: "Doces",
    tags: ["doces", "receitas rápidas"],
    imagem: "assets/destaque_beijinho.jpg",
    descricao: "O par perfeito do brigadeiro: beijinho super cremoso feito com coco ralado fresco e finalizado com uma leve tostagem no coco que traz um aroma irresistível.",
    tempo: "20 min",
    rendimento: "25 unidades",
    dificuldade: "Fácil",
    acompanhamento: "Licor de coco ou um café espresso curto e encorpado.",
    dicaEspecial: "Toste metade do coco ralado em uma frigideira seca antes de enrolar. O coco queimadinho traz complexidade de sabor, aroma amendoado e uma cor linda ao doce.",
    historia: "Derivado da receita portuguesa de 'beijo de freira', o Beijinho no Brasil originalmente levava calda de açúcar e água. Com a industrialização do leite condensado pela Nestlé no início do século XX, a receita foi simplificada e adotou o coco ralado como estrela principal.",
    curiosidade: "O cravo-da-índia espetado no topo não serve apenas de decoração: ele libera óleos aromáticos que perfumam o docinho. Lembre-se de avisar aos convidados para retirá-lo antes de comer!",
    ingredientes: [
      "1 lata de leite condensado (395g)",
      "100g de coco ralado fino umedecido (de preferência fresco)",
      "1 colher (sopa) de manteiga sem sal",
      "1 colher (sopa) de creme de leite de caixinha",
      "Cravos-da-índia para decorar",
      "Coco ralado tostado para enrolar"
    ],
    modoPreparo: [
      "Em uma panela, junte o leite condensado, o coco ralado umedecido, a manteiga e o creme de leite.",
      "Misture bem antes de levar ao fogo.",
      "Cozinhe em fogo baixo, mexendo constantemente, até desgrudar do fundo da panela (cerca de 12 a 15 minutos).",
      "Despeje em um prato, cubra com filme plástico em contato e deixe esfriar completamente.",
      "Unte as mãos, modele as bolinhas, passe-as no coco ralado levemente tostado e decore cada um com um cravo-da-índia no topo."
    ]
  },
  {
    id: 5,
    nome: "Brownie Perfeito de Chocolate",
    categoria: "Chocolates",
    tags: ["chocolates", "doces", "receitas da Fabi"],
    imagem: "assets/destaque_brownie.jpg",
    descricao: "Brownie denso, intensamente achocolatado, com textura 'fudgy' puxa-puxa no centro e aquela casquinha brilhante e craquelada perfeita por cima.",
    tempo: "35 min",
    rendimento: "9 generosos quadrados",
    dificuldade: "Médio",
    acompanhamento: "Calda de frutas vermelhas ácida ou uma bola generosa de sorvete de baunilha artesanal.",
    dicaEspecial: "Bata os ovos e o açúcar muito bem antes de adicionar o chocolate derretido. É essa aeração rápida dos ovos com açúcar que cria a casquinha craquelada brilhante em cima do brownie!",
    historia: "Criado nos Estados Unidos no final do século XIX, reza a lenda que um cozinheiro esqueceu de adicionar fermento químico a uma massa de bolo de chocolate. Ao invés de descartar, ele serviu os quadrados densos e achatados, criando um dos maiores sucessos mundiais.",
    curiosidade: "O verdadeiro brownie de qualidade profissional nunca leva fermento químico. Ele cresce e se estrutura apenas com a liga dos ovos batidos e do chocolate derretido.",
    ingredientes: [
      "200g de chocolate meio amargo nobre picado",
      "150g de manteiga sem sal",
      "3 ovos grandes em temperatura ambiente",
      "1 xícara (chá) de açúcar refinado",
      "1/2 xícara (chá) de açúcar mascavo (traz umidade extra)",
      "1 xícara (chá) de farinha de trigo peneirada",
      "3 colheres (sopa) de cacau em pó 100%",
      "1 pitada de sal (essencial para equilibrar o açúcar)"
    ],
    modoPreparo: [
      "Derreta o chocolate meio amargo junto com a manteiga no micro-ondas ou em banho-maria até virar uma mistura brilhante. Reserve para amornar.",
      "Na batedeira ou com um fouet forte, bata os ovos, o açúcar refinado e o açúcar mascavo por cerca de 3 a 4 minutos até dobrar de volume e ficar um creme bem claro.",
      "Adicione o chocolate derretido com manteiga à mistura de ovos e mexa devagar.",
      "Incorpore a farinha de trigo, o cacau em pó e a pitada de sal peneirados, mexendo apenas até a farinha sumir na massa (não bata muito para não desenvolver o glúten).",
      "Despeje em uma forma quadrada de 20x20cm forrada com papel manteiga untado.",
      "Asse em forno preaquecido a 180°C por exatos 22 a 25 minutos. O centro deve estar ligeiramente úmido (ao espetar um palito, ele deve sair com pedacinhos úmidos grudados, nunca líquido)."
    ]
  },
  {
    id: 6,
    nome: "Pudim de Leite Condensado Vovó",
    categoria: "Sobremesas geladas",
    tags: ["sobremesas geladas", "doces"],
    imagem: "assets/destaque_pudim.jpg",
    descricao: "O pudim perfeito: sem furinhos, extremamente cremoso, lisinho como seda e banhado em uma calda dourada de caramelo brilhante.",
    tempo: "1h 30 min",
    rendimento: "10 porções",
    dificuldade: "Médio",
    acompanhamento: "Um café espresso cortado ou raspas de limão siciliano por cima para quebrar a doçura.",
    dicaEspecial: "Para o pudim ficar lisinho e sem furinhos, bata os ingredientes delicadamente com um fouet à mão (evitando criar bolhas de ar) e passe a mistura por uma peneira fina três vezes antes de colocar na forma.",
    historia: "O pudim é uma evolução do 'flan' europeu, derivado das papas de ovos medievais portuguesas. Quando chegou ao Brasil, a receita foi adaptada substituindo o leite fresco e o açúcar pelo leite condensado, criando a sobremesa mais clássica dos almoços de domingo brasileira.",
    curiosidade: "Existem duas grandes escolas de pudim: com furinhos (batido no liquidificador e assado em temperatura mais alta) e sem furinhos (misturado à mão e assado lentamente em banho-maria baixíssimo). A receita da Fabi é a lendária e ultra-cremosa versão sem furinhos!",
    ingredientes: [
      "1 lata de leite condensado integral (395g)",
      "2 medidas da lata de leite integral (use a lata como medida)",
      "4 ovos inteiros passados na peneira (tira o cheiro de ovo)",
      "1 colher (chá) de extrato de baunilha caseiro",
      "1 xícara (chá) de açúcar cristal + 1/2 xícara de água quente (para o caramelo)"
    ],
    modoPreparo: [
      "Caramelo: Derreta o açúcar na forma de pudim (20cm de diâmetro) em fogo baixo. Quando dourar, adicione a água quente com cuidado. Misture até dissolver os torrões e espalhe a calda por toda a forma.",
      "Em um bowl grande, misture os ovos peneirados, o leite condensado, o leite e a baunilha com um fouet lentamente, sem fazer espuma.",
      "Peneire a mistura de 2 a 3 vezes para eliminar qualquer resíduo de ar.",
      "Despeje na forma caramelizada com cuidado.",
      "Cubra muito bem com papel alumínio (parte brilhante para dentro) e asse em banho-maria (com água já quente) em forno baixo (160°C) por cerca de 1 hora e 15 minutos.",
      "Deixe esfriar completamente e leve à geladeira por pelo menos 6 horas antes de desenformar. Aqueça o fundo da forma na boca do fogão por 15 segundos para soltar o caramelo antes de virar no prato."
    ]
  },
  {
    id: 7,
    nome: "Cocada Cremosa de Forno",
    categoria: "Doces",
    tags: ["doces", "receitas da Fabi"],
    imagem: "assets/destaque_cocada.jpg",
    descricao: "Uma releitura da cocada de colher tradicional: dourada por fora, incrivelmente úmida por dentro, com pedaços suculentos de coco ralado fresco.",
    tempo: "35 min",
    rendimento: "8 porções",
    dificuldade: "Fácil",
    acompanhamento: "Um chá de capim-limão gelado ou um sorvete de tapioca.",
    dicaEspecial: "Use coco ralado fresco em fitas médias. O coco seco industrializado não tem a mesma umidade e gordura natural que tornam esta cocada incrivelmente suculenta.",
    historia: "A cocada nasceu do encontro da cultura açucareira dos colonizadores portugueses com a força e criatividade dos escravizados africanos no Nordeste brasileiro. Tornou-se um dos doces de tabuleiro mais tradicionais da Bahia e de todo o Brasil.",
    curiosidade: "Esta cocada de forno cria uma casquinha crocante e caramelizada na superfície, enquanto o interior permanece com uma consistência quase líquida e super cremosa de leite condensado.",
    ingredientes: [
      "300g de coco fresco ralado grosso",
      "1 lata de leite condensado (395g)",
      "3 gemas de ovos peneiradas",
      "1 colher (sopa) de manteiga sem sal derretida",
      "100ml de leite de coco concentrado",
      "Manteiga para untar o refratário"
    ],
    modoPreparo: [
      "Em uma tigela grande, misture o coco fresco ralado com as gemas peneiradas, a manteiga derretida e o leite de coco.",
      "Adicione o leite condensado e misture muito bem até virar uma massa úmida e pesada.",
      "Despeje em um refratário cerâmico ou de vidro pequeno (cerca de 20cm) untado com manteiga.",
      "Asse em forno preaquecido a 180°C por aproximadamente 25 a 30 minutos, ou até que as bordas e a superfície estejam bem douradas e caramelizadas.",
      "Sirva morna ou gelada direto no refratário."
    ]
  },
  {
    id: 8,
    nome: "Torta de Limão Delicada",
    categoria: "Tortas",
    tags: ["tortas", "sobremesas geladas", "receitas da Fabi"],
    imagem: "assets/destaque_torta_limao.jpg",
    descricao: "Massa sablée crocante amanteigada que derrete na boca, recheio aveludado e cítrico de limão taiti e cobertura de merengue suíço dourado no maçarico.",
    tempo: "1h",
    rendimento: "8 fatias",
    dificuldade: "Médio",
    acompanhamento: "Um chá verde gelado com hortelã ou espumante demi-sec.",
    dicaEspecial: "Ao fazer o creme de limão, adicione as raspas de limão somente no final, após desligar o fogo ou terminar a mistura. Se bater as raspas junto, o creme pode amargar com o tempo.",
    historia: "A torta de limão moderna é inspirada na famosa 'Key Lime Pie' da Flórida (EUA), criada no século XIX por marinheiros que não tinham acesso a leite fresco e usavam leite condensado e limões locais. A versão com merengue tostado por cima virou febre internacional.",
    curiosidade: "O ácido do suco de limão reage quimicamente com as proteínas do leite condensado, fazendo com que o recheio engrosse naturalmente sem precisar ir ao fogo ou levar gelatina!",
    ingredientes: [
      "200g de biscoito maisena triturado",
      "100g de manteiga sem sal derretida",
      "2 latas de leite condensado",
      "1/2 xícara (chá) de suco de limão taiti puro coado",
      "Raspas de 2 limões (sem a parte branca)",
      "3 claras de ovo + 1 xícara de açúcar (para o merengue suíço)"
    ],
    modoPreparo: [
      "Massa: Misture o biscoito triturado com a manteiga derretida até formar uma farofa úmida. Pressione no fundo e laterais de uma forma de fundo removível (22cm). Asse por 10 minutos a 180°C. Deixe esfriar.",
      "Recheio: Em um bowl, misture o leite condensado com o suco de limão taiti com um fouet até engrossar e ficar aveludado. Adicione as raspas de limão e misture. Despeje sobre a massa fria.",
      "Merengue: Aqueça as claras e o açúcar em banho-maria mexendo sempre até o açúcar dissolver por completo (não deixe cozinhar). Leve à batedeira e bata em velocidade máxima até formar picos firmes e esfriar.",
      "Espalhe o merengue sobre a torta criando picos decorativos com as costas de uma colher. Toste com maçarico culinário ou leve ao forno bem alto com o grill ligado por 3 minutos até dourar.",
      "Gele por no mínimo 4 horas antes de servir."
    ]
  },
  {
    id: 9,
    nome: "Quindim de Padaria Tradicional",
    categoria: "Doces",
    tags: ["doces", "receitas da Fabi"],
    imagem: "assets/destaque_quindim.jpg",
    descricao: "O autêntico doce português-brasileiro: amarelo brilhante intenso, casquinha crocante de coco no fundo e textura gelatinosa aveludada incomparável por cima.",
    tempo: "1h 10 min",
    rendimento: "12 unidades pequenas",
    dificuldade: "Médio",
    acompanhamento: "Um café espresso bem forte (ristretto) para criar um contraste maravilhoso com a doçura do quindim.",
    dicaEspecial: "Peneire as gemas por duas vezes apenas deixando-as escorrer sozinhas, sem esfregar a colher na peneira. É a película das gemas que deixa o cheiro de ovo forte; deixando-as escorrer naturalmente, a película fica retida na peneira.",
    historia: "O quindim nasceu em Portugal como 'brisa do Lis', que levava amêndoas na receita. Ao chegar ao Nordeste brasileiro, as amêndoas foram substituídas pelo coco ralado fresco abundante, e o doce ganhou o nome africano 'quindim', que significa dengo, encanto ou feitiço.",
    curiosidade: "Para obter aquele brilho espelhado espetacular no topo do quindim, unte as forminhas com bastante manteiga sem sal e polvilhe açúcar refinado fininho antes de despejar a massa.",
    ingredientes: [
      "12 gemas de ovos grandes e frescos",
      "1 xícara (chá) de açúcar refinado (200g)",
      "100g de coco ralado fresco grosso (não use de saquinho)",
      "1 colher (sopa) de manteiga sem sal em temperatura ambiente",
      "1 colher (sopa) de leite de coco de garrafinha"
    ],
    modoPreparo: [
      "Peneire as gemas em um bowl grande de vidro. Descarte a película que ficou na peneira.",
      "Adicione o açúcar refinado, a manteiga e o leite de coco às gemas. Misture tudo muito delicadamente com uma espátula, sem bater (não queremos incorporar ar).",
      "Adicione o coco ralado fresco e misture até incorporar bem.",
      "Deixe a mistura descansar na tigela por 1 hora antes de assar. Isso faz com que o coco hidrate e suba para o topo, criando a casquinha crocante perfeita no fundo do doce.",
      "Distribua em forminhas de quindim fartamente untadas com manteiga e polvilhadas com açúcar.",
      "Asse em banho-maria com água quente em forno preaquecido a 180°C por 40 a 50 minutos. Desenforme ainda morno para não quebrar."
    ]
  },
  {
    id: 10,
    nome: "Mousse de Maracujá Cremoso",
    categoria: "Sobremesas geladas",
    tags: ["sobremesas geladas", "receitas rápidas"],
    imagem: "assets/destaque_mousse_maracuja.jpg",
    descricao: "Sobremesa refrescante de liquidificador: mousse aerada de maracujá super cremosa coberta com uma calda brilhante com sementes da própria fruta.",
    tempo: "15 min",
    rendimento: "6 porções",
    dificuldade: "Fácil",
    acompanhamento: "Biscoitos champanhe crocantes ou raspas de chocolate branco por cima.",
    dicaEspecial: "Use suco concentrado puro do maracujá fresco batido e coado sem água (suco de polpa pura). Os sucos industrializados de garrafa não dão a acidez perfeita que corta a doçura do leite condensado.",
    historia: "Embora a mousse clássica tenha origem na alta gastronomia francesa (feita com claras em neve e chocolate), a mousse de maracujá é um ícone pop da culinária brasileira, nascida na segunda metade do século XX com a popularização dos eletrodomésticos domésticos.",
    curiosidade: "A palavra 'mousse' vem do francês e significa espuma. Graças à textura aerada cheia de micro-bolhas de ar que se formam ao bater o leite condensado com o suco cítrico no liquidificador, ela derrete instantaneamente na boca.",
    ingredientes: [
      "1 lata de leite condensado (395g)",
      "1 caixinha de creme de leite (200g)",
      "1 xícara (chá) de suco de maracujá puro concentrado (feito de 3 maracujás frescos)",
      "Polpa de 1 maracujá com sementes + 3 colheres (sopa) de açúcar + 50ml de água (para a calda decorativa)"
    ],
    modoPreparo: [
      "No liquidificador, coloque o leite condensado, o creme de leite e o suco concentrado de maracujá.",
      "Bata em velocidade máxima por exatos 5 minutos. Bater bastante ajuda a incorporar ar na mistura, deixando-a super leve e firme sem precisar de gelatina.",
      "Despeje em taças individuais ou em uma travessa bonita de vidro.",
      "Para a calda: Leve ao fogo a polpa do maracujá com as sementes, o açúcar e os 50ml de água. Ferva por 3 minutos até obter uma calda brilhante. Deixe esfriar completamente.",
      "Espalhe a calda de maracujá fria por cima da mousse e leve à geladeira por pelo menos 4 horas antes de servir."
    ]
  },
  {
    id: 11,
    nome: "Palha Italiana de Brigadeiro",
    categoria: "Doces",
    tags: ["chocolates", "doces", "receitas rápidas"],
    imagem: "assets/destaque_palha_italiana.jpg",
    descricao: "A combinação irresistível de brigadeiro de panela tradicional com pedaços crocantes de biscoito maisena, cortada em quadradinhos e polvilhada com açúcar refinado.",
    tempo: "30 min",
    rendimento: "16 quadradinhos",
    dificuldade: "Fácil",
    acompanhamento: "Um copo de leite bem gelado ou um cappuccino cremoso.",
    dicaEspecial: "Não quebre os biscoitos em migalhas! Deixe pedaços médios para garantir que cada mordida tenha o contraste perfeito entre a cremosidade do brigadeiro e a crocância do biscoito.",
    historia: "Apesar do nome, a Palha Italiana é um doce 100% brasileiro! Ela foi inspirada no 'salame de chocolate' italiano (que leva ovos, chocolate e biscoito picado). Adaptada no Brasil, os ovos deram lugar ao nosso amado brigadeiro.",
    curiosidade: "O nome 'palha' provavelmente veio do processo de preparação do salame de chocolate, onde ao final da tostagem de amêndoas e cascas de cacau se assemelhava à palha seca usada em celeiros italianos.",
    ingredientes: [
      "1 lata de leite condensado (395g)",
      "1 colher (sopa) de manteiga sem sal",
      "4 colheres (sopa) de chocolate em pó 50% cacau",
      "1 caixinha de creme de leite (200g - para deixar o brigadeiro mais macio)",
      "150g de biscoito maisena picado grosseiramente",
      "Açúcar refinado ou leite em pó para empanar"
    ],
    modoPreparo: [
      "Faça um brigadeiro: misture o leite condensado, a manteiga, o chocolate em pó e o creme de leite em uma panela e leve ao fogo baixo.",
      "Cozinhe mexendo sempre até começar a desgrudar do fundo da panela (um pouco antes do ponto de enrolar).",
      "Desligue o fogo e adicione imediatamente os biscoitos maisena picados grosseiramente, misturando tudo muito bem.",
      "Despeje a massa em uma assadeira pequena (20x20cm) untada ou forrada com papel manteiga.",
      "Pressione bem com as costas de uma colher untada para nivelar a superfície. Deixe esfriar completamente (pode levar à geladeira por 2 horas).",
      "Desenforme, corte em quadradinhos uniformes e passe-os no açúcar refinado ou leite em pó."
    ]
  },
  {
    id: 12,
    nome: "Bolo de Ninho com Morango",
    categoria: "Bolos",
    tags: ["bolos", "receitas da Fabi"],
    imagem: "assets/destaque_ninho.jpg",
    descricao: "Massa pão de ló super fofinha umedecida com calda de leite condensado, recheio cremoso trufado de Leite Ninho e muitos morangos frescos picados.",
    tempo: "1h 10 min",
    rendimento: "12 fatias",
    dificuldade: "Médio",
    acompanhamento: "Chá de hibisco gelado ou espumante Moscatel rosé.",
    dicaEspecial: "Seque muito bem os morangos picados com papel toalha antes de colocá-los no recheio do bolo. Morangos soltam muita água e podem amolecer demais o creme de Leite Ninho se estiverem úmidos.",
    historia: "A combinação de leite condensado em pó com morangos frescos explodiu nas confeitarias artesanais brasileiras na última década, virando um dos recheios mais encomendados para aniversários e casamentos no país.",
    curiosidade: "O Leite Ninho confere uma cremosidade e sabor lácteo doce e aveludado único que combina com a acidez do morango fresco, criando um equilíbrio perfeito que agrada crianças e adultos.",
    ingredientes: [
      "4 ovos (claras em neve)",
      "2 xícaras (chá) de açúcar refinado",
      "2 xícaras (chá) de farinha de trigo",
      "1 xícara (chá) de água quente + 3 colheres de óleo",
      "1 colher (sopa) de fermento químico",
      "1 lata de leite condensado + 1 caixinha de creme de leite + 1 xícara de leite em pó Ninho + 150g de manteiga sem sal (para o creme de Ninho)",
      "2 bandejas de morangos frescos lavados e picados"
    ],
    modoPreparo: [
      "Massa: Bata as gemas com o açúcar até formar um creme fofo. Adicione a água quente misturada com o óleo alternando com a farinha peneirada. Incorpore as claras em neve e o fermento delicadamente. Asse a 180°C por 35 minutos.",
      "Creme de Ninho: Na batedeira, bata a manteiga em temperatura ambiente com o leite condensado até clarear. Adicione o leite Ninho e bata mais um pouco. Junte o creme de leite gelado e bata até ficar um creme firme e aveludado. Deixe na geladeira por 30 minutos.",
      "Montagem: Divida o bolo assado e frio ao meio. Umedeça a base com uma calda leve de água e leite condensado.",
      "Espalhe uma camada farta do creme de Ninho gelado e cubra com os morangos picados bem sequinhos.",
      "Coloque a outra metade da massa por cima, umedeça novamente, cubra com o restante do creme e decore com morangos inteiros e leite em pó polvilhado."
    ]
  }
];

// --- SEÇÃO HISTÓRIAS DOS DOCES ---
const HISTORIAS_DB = [
  {
    id: "brigadeiro",
    nome: "Brigadeiro",
    emoji: "🍫",
    resumo: "Como um doce de campanha política derrotada virou a maior paixão nacional.",
    historiaCompleta: "O Brigadeiro nasceu em 1945, logo após o fim da Segunda Guerra Mundial. Naquela época, o Brasil estava em plena campanha para a eleição presidencial, e um dos candidatos era o Brigadeiro Eduardo Gomes, do partido UDN. As mulheres que apoiavam a sua candidatura no Rio de Janeiro resolveram criar um docinho inovador feito de leite condensado, manteiga e cacau em pó para vender em comícios e arrecadar fundos para a campanha. O doce ficou conhecido como 'o doce do Brigadeiro'. Eduardo Gomes acabou perdendo a eleição para Eurico Gaspar Dutra, mas o docinho venceu no coração dos brasileiros, tornando-se o doce mais tradicional do país, indispensável em qualquer comemoração de aniversário.",
    curiosidade: "Inicialmente, devido à escassez de leite fresco e açúcar na época do pós-guerra, o leite condensado (que era vendido em latas) tornou-se a base perfeita para doces, o que desencadeou a criação de dezenas de doces cremosos brasileiros."
  },
  {
    id: "pudim",
    nome: "Pudim de Leite",
    emoji: "🍮",
    resumo: "A incrível transformação do flan europeu em realeza dos domingos brasileiros.",
    historiaCompleta: "O Pudim de Leite Condensado é descendente direto do 'flan' europeu, uma receita muito antiga que remonta aos tempos do Império Romano, onde misturas de leite, ovos e mel eram cozidas no forno. Com a colonização portuguesa, as técnicas conventuais de doces carregados de gemas de ovos chegaram ao Brasil. A grande revolução aconteceu na década de 1940, quando a marca de leite condensado Moça publicou no verso das suas latas a receita do pudim misturando o leite condensado com leite e ovos. O sucesso foi imediato e transformou-se na sobremesa mais servida nos almoços de domingo de Norte a Sul do Brasil.",
    curiosidade: "A discussão sobre pudim ter ou não ter furinhos divide famílias brasileiras! Cientificamente, os furinhos são bolhas de ar que coagulam em temperaturas altas no forno. O pudim liso requer fogo muito baixo e cozimento lento."
  },
  {
    id: "bolo-cenoura",
    nome: "Bolo de Cenoura",
    emoji: "🥕",
    resumo: "O aconchego em forma de bolo que só o brasileiro sabe fazer com brigadeiro.",
    historiaCompleta: "Os bolos de vegetais têm raízes medievais na Europa. Cenouras e beterrabas eram usadas para adoçar massas de bolo em períodos de escassez e racionamento de açúcar refinado. No entanto, enquanto nos Estados Unidos e Europa o 'carrot cake' tradicional é denso, leva nozes, especiarias como canela e é coberto por creme de cream cheese, o brasileiro inventou sua própria versão no pós-guerra: um bolo leve feito no liquidificador, de cor alaranjada viva, finalizado com uma espessa cobertura de brigadeiro quente. Tornou-se sinônimo absoluto de lanche da tarde na casa das avós brasileiras.",
    curiosidade: "O segredo do bolo de cenoura perfeito é a proporção. Cenoura em excesso pesa a massa, fazendo com que o bolo fique 'solado' ou pesado, pois a cenoura solta água no forno."
  },
  {
    id: "brownie",
    nome: "Brownie",
    emoji: "🇺🇸",
    resumo: "O delicioso erro de um cozinheiro americano que conquistou o mundo.",
    historiaCompleta: "O Brownie nasceu nos Estados Unidos no final do século XIX. A lenda mais famosa conta que uma dona de casa ou um chef distraído estava preparando um bolo de chocolate tradicional e esqueceu de adicionar fermento químico à receita. Ao tirar o bolo do forno, percebeu que ele não havia crescido e estava plano, denso e super úmido. Decidido a não desperdiçar, o cozinheiro cortou a massa pesada em quadrados e serviu assim mesmo. O resultado foi um sucesso tão estrondoso que o doce ganhou o nome de 'brownie' (devido à sua cor marrom escura) e virou um ícone da culinária mundial.",
    curiosidade: "Um autêntico brownie profissional nunca deve conter fermento. A casquinha brilhante e craquelada clássica do brownie é criada a partir da reação do açúcar derretido e a aeração dos ovos batidos com o chocolate."
  },
  {
    id: "cocada",
    nome: "Cocada",
    emoji: "🥥",
    resumo: "O saboroso encontro da cultura açucareira com a tradição afro-brasileira.",
    historiaCompleta: "A Cocada é um doce carregado de história e cultura. Nascido no período colonial no Nordeste do Brasil, o doce surgiu da fusão da técnica portuguesa de fazer caldas de açúcar com o coco abundante e a maestria dos escravizados africanos. Nos engenhos de açúcar, as escravas cozinhavam o coco ralado na calda de açúcar mascavo (rapadura) até dar o ponto de corte, vendendo as cocadas em tabuleiros nas ruas coloniais. Com o tempo, a cocada ganhou versões refinadas com leite condensado e leite de coco, dando origem à irresistível cocada de forno cremosa.",
    curiosidade: "Nas religiões de matriz africana, a cocada é oferecida como oferenda de paz, alegria e doçura, representando a energia infantil dos Ibejis (Cosme e Damião)."
  },
  {
    id: "quindim",
    nome: "Quindim",
    emoji: "🥚",
    resumo: "O dengo africano que transformou uma receita portuguesa em feitiço de coco.",
    historiaCompleta: "O Quindim tem suas origens na doçaria conventual portuguesa, mais precisamente na receita chamada 'Brisa do Lis', que levava muitas gemas, açúcar e amêndoas moídas. Ao chegar ao Brasil colonial, as amêndoas europeias (caras e raras por aqui) foram substituídas pelo coco ralado fresco. A receita foi adotada pelas cozinheiras africanas que a batizaram com o termo quimbundo 'quindim', que significa dengo, encanto ou feitiço. O quindim tornou-se um dos maiores clássicos dos tabuleiros de doces brasileiros, famoso pelo seu amarelo vivo e espelhamento brilhante.",
    curiosidade: "Para obter o espelhamento brilhante perfeito na superfície do quindim, a forma deve ser untada fartamente com manteiga e polvilhada com açúcar refinado antes de assar."
  },
  {
    id: "beijinho",
    nome: "Beijinho",
    emoji: "💋",
    resumo: "O par perfeito do brigadeiro que nasceu nos conventos portugueses.",
    historiaCompleta: "Assim como o brigadeiro, o Beijinho é um rei incontestável dos aniversários brasileiros. Ele deriva de uma receita de doces à base de gemas e açúcar dos conventos portugueses. No Brasil Império, era conhecido como 'Beijo de Freira'. No início do século XX, com a chegada do leite condensado em lata, a receita foi reestruturada pelas donas de casa brasileiras, que retiraram a maior parte das gemas e adicionaram o coco ralado fresco, criando o docinho branco aveludado que conhecemos hoje.",
    curiosidade: "O Beijinho tradicionalmente leva um cravo-da-índia espetado no topo. Antigamente, o doce também recebia o nome de 'Doce de Coco' ou 'Olho de Sogra' (quando recheado com ameixa)."
  },
  {
    id: "torta-limao",
    nome: "Torta de Limão",
    emoji: "🍋",
    resumo: "A receita de marinheiros americanos que virou sinônimo de refrescância.",
    historiaCompleta: "A Torta de Limão moderna com merengue é inspirada na famosa 'Key Lime Pie' do arquipélago de Florida Keys, nos Estados Unidos, criada em meados do século XIX. Os marinheiros locais não tinham acesso a leite fresco ou refrigeração, por isso usavam leite condensado em lata enlatado e suco de limões selvagens locais. Ao misturarem o suco cítrico com o leite condensado, perceberam que a mistura engrossava sozinha sem ir ao fogo. A receita foi aprimorada com uma base de biscoitos amanteigados e uma cobertura volumosa de claras em neve tostadas.",
    curiosidade: "O recheio da torta de limão engrossa naturalmente devido a um processo químico chamado 'desnaturação das proteínas': o ácido cítrico do limão quebra as proteínas do leite condensado, coalhando e estruturando o creme."
  },
  {
    id: "mousse",
    nome: "Mousse",
    emoji: "🥣",
    resumo: "Da alta gastronomia francesa ao liquidificador prático das cozinhas brasileiras.",
    historiaCompleta: "A palavra 'mousse' significa espuma em francês, e o doce clássico foi criado na França no século XVIII pelo lendário artista e cozinheiro Henri de Toulouse-Lautrec, que a chamava de 'maionese de chocolate'. A versão original usava claras em neve batidas exaustivamente para dar leveza à massa. No Brasil, o conceito foi totalmente simplificado na década de 1970 com a invenção da mousse de maracujá e limão de liquidificador, batendo o suco cítrico diretamente com o leite condensado e creme de leite, o que dispensa o uso de claras cruas e gelatinas.",
    curiosidade: "A mousse de maracujá de liquidificador é um dos doces mais práticos do mundo, pois fica firme em menos de 10 minutos de geladeira graças à reação ácida da fruta com o leite."
  },
  {
    id: "bolo-chocolate",
    nome: "Bolo de Chocolate",
    emoji: "🎂",
    resumo: "A invenção da prensa de cacau que mudou a história dos aniversários mundiais.",
    historiaCompleta: "Até o início de 1800, o chocolate era consumido quase exclusivamente como bebida quente e amarga pelos nobres. Em 1828, o inventor holandês Casparus van Houten patenteou um método mecânico para espremer a gordura (manteiga de cacau) dos grãos de cacau torrados, restando um pó seco e fino. Esse cacau em pó pôde então ser misturado à farinha e açúcar, permitindo a criação do primeiro bolo de chocolate da história. No Brasil, o bolo de chocolate ganhou as coberturas de brigadeiro mole, virando o favorito absoluto em festas de todas as idades.",
    curiosidade: "O bolo de chocolate com massa úmida e escura, chamado 'Devil's Food Cake' (Bolo da Comida do Diabo), ganhou este nome nos EUA em contraste com o leve e branquinho 'Angel's Food Cake' (Bolo da Comida dos Anjos)."
  }
];

// --- DADOS INSTITUCIONAIS SOBRE A FABI ---
const INSTITUCIONAL_DB = {
  nome: "Carinho Doces da Fabi",
  slogan: "Confeitaria Artesanal Feita com Amor",
  whatsapp: "https://wa.me/5511997020827?text=Ol%C3%A1%20Fabi!%20Vim%20pelo%20seu%20aplicativo%20de%20receitas!",
  instagram: "https://instagram.com/carinhodocesdafabi",
  endereco: "Rua dos Doces Clássicos, 123 - Jardins, São Paulo/SP",
  telefoneExibicao: "(11) 99702-0827",
  instagramExibicao: "@carinhodocesdafabi"
};

// --- ESTADOS DO APLICATIVO ---
let currentTab = 'home';
let activeRecipe = null;
let showFavoritesOnly = false;

// --- INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
  // Analytics app_open event
  trackEvent('app_open');

  // Splash Screen Timeout
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    splash.classList.add('fade-out');
    
    // Remove completamente o container da Splash Screen da árvore de renderização após o fade-out
    setTimeout(() => {
      splash.style.display = 'none';
    }, 600);
    
    // Adiciona classe de animação suave na entrada da home
    document.getElementById('view-home').classList.add('active');
  }, 2200);

  // --- SEGURANÇA E PROTEÇÃO DE CONTEÚDO (DRM) ---
  // Bloquear clique direito (computador) e menus suspensos de toque longo (celular)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Bloquear atalhos comuns de cópia, impressão e salvamento por teclado (Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
    }
  });

  // Inicializar Favoritos no LocalStorage caso não exista
  if (!localStorage.getItem('carinho_doces_favorites')) {
    localStorage.setItem('carinho_doces_favorites', JSON.stringify([]));
  }

  // Renderizar a tela inicial
  initCategories();
  renderRecipes(RECEITAS_DB);
  renderStories();
  setupModalTabListeners();
  initFeaturedRecipe();

  // --- OUVINTES DE EVENTO DE ENCOMENDAS (SEGURANÇA EXTERNA) ---
  // Vincular eventos de encomendas da seção com cancelamento de navegação interna
  document.getElementById('order-btn-whatsapp').addEventListener('click', () => {
    if (!activeRecipe) return;
    trackEvent('order_whatsapp_click', { recipe_id: activeRecipe.id, recipe_name: activeRecipe.nome });
    const encodedSweetName = encodeURIComponent(activeRecipe.nome);
    const whatsappUrl = `https://wa.me/5511997020827?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20uma%20encomenda%20do%20doce:%20${encodedSweetName}.%20Poderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es?%20%F0%9F%8D%B0%F0%9F%92%95`;
    openExternal(whatsappUrl);
  });

  document.getElementById('order-btn-instagram').addEventListener('click', () => {
    trackEvent('order_instagram_click', { recipe_name: activeRecipe ? activeRecipe.nome : 'Geral' });
    openExternal('https://www.instagram.com/carinhodocesdafabi/');
  });

  document.getElementById('order-btn-email').addEventListener('click', () => {
    if (!activeRecipe) return;
    trackEvent('order_email_click', { recipe_id: activeRecipe.id, recipe_name: activeRecipe.nome });
    const emailSubject = encodeURIComponent("Encomenda - Carinho Doces da Fabi");
    const emailBody = encodeURIComponent(`Olá! Tenho interesse em encomendar o doce: ${activeRecipe.nome}.`);
    const emailUrl = `mailto:nany.fabi21@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    openExternal(emailUrl);
  });
});

// --- FUNÇÃO AUXILIAR DE INTENTS NATIVOS ---
function openExternal(url) {
  trackEvent('external_link_click', { url: url });
  if (window.AndroidBridge && window.AndroidBridge.openExternalUrl) {
    // Se estiver no aplicativo Android compilado, chama o canal nativo para abrir o Intent do app correspondente
    window.AndroidBridge.openExternalUrl(url);
  } else {
    // Se estiver rodando no navegador do PC ou iPhone, abre em uma nova guia sem travar a tela
    const win = window.open(url, '_blank');
    if (win) win.focus();
  }
}

// --- GERENCIADOR DE ABAS (VIEWS) ---
function switchTab(tabId) {
  currentTab = tabId;
  trackEvent('page_view', { page_path: `/${tabId}`, page_title: tabId });
  
  // Ocultar todas as views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  // Desativar todos os botões de navegação
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Ativar a view correspondente
  const activeView = document.getElementById(`view-${tabId}`);
  if (activeView) {
    activeView.classList.add('active');
    // Rola para o topo ao trocar de aba
    document.querySelector('.app-main').scrollTop = 0;
  }

  // Ativar o botão da barra de navegação correspondente
  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Configurações específicas de abas
  if (tabId === 'search') {
    document.getElementById('search-input').focus();
    handleSearch(document.getElementById('search-input').value);
  } else if (tabId === 'home') {
    // Reset do filtro de favoritos ao voltar para Home
    if (showFavoritesOnly) {
      toggleFavoritesOnly();
    } else {
      renderRecipes(RECEITAS_DB);
    }
  }
}

// --- RENDERIZAR CATEGORIAS ---
function initCategories() {
  const categories = ["Todos", "Bolos", "Doces", "Tortas", "Sobremesas geladas", "Chocolates", "Receitas rápidas", "Receitas da Fabi"];
  const emojis = {
    "Todos": "🍰",
    "Bolos": "🎂",
    "Doces": "🍬",
    "Tortas": "🥧",
    "Sobremesas geladas": "🍨",
    "Chocolates": "🍫",
    "Receitas rápidas": "⏱️",
    "Receitas da Fabi": "👩‍🍳"
  };

  const container = document.getElementById('categories-container');
  container.innerHTML = '';

  categories.forEach((cat, index) => {
    const pill = document.createElement('button');
    pill.className = `category-pill ${index === 0 ? 'active' : ''}`;
    pill.id = `cat-${cat.replace(/\s+/g, '-').toLowerCase()}`;
    pill.onclick = () => filterByCategory(cat, pill.id);
    
    pill.innerHTML = `
      <span class="category-emoji">${emojis[cat] || '🍭'}</span>
      <span>${cat}</span>
    `;
    
    container.appendChild(pill);
  });
}

// --- FILTRAR RECEITAS POR CATEGORIA ---
function filterByCategory(categoryName, pillId) {
  // Desativar todas as categorias
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.remove('active');
  });

  // Ativar a selecionada
  document.getElementById(pillId).classList.add('active');

  // Filtrar dados
  let filtered = RECEITAS_DB;

  // Se clicou em Favoritos antes, respeita
  if (showFavoritesOnly) {
    const favs = getFavorites();
    filtered = filtered.filter(r => favs.includes(r.id));
  }

  if (categoryName !== 'Todos') {
    if (categoryName === 'Receitas rápidas') {
      filtered = filtered.filter(r => r.tags.includes('receitas rápidas'));
    } else if (categoryName === 'Receitas da Fabi') {
      filtered = filtered.filter(r => r.tags.includes('receitas da Fabi'));
    } else {
      filtered = filtered.filter(r => r.categoria.toLowerCase() === categoryName.toLowerCase());
    }
  }

  renderRecipes(filtered);

  // Atualizar título da lista
  const listTitle = document.getElementById('recipe-list-title');
  listTitle.innerText = categoryName === 'Todos' ? 'Receitas Artesanais' : categoryName;
}

// --- RENDERIZAR GRID DE RECEITAS NA HOME ---
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  const countLabel = document.getElementById('recipe-count');
  container.innerHTML = '';

  // Atualiza contador
  countLabel.innerText = `${recipes.length} ${recipes.length === 1 ? 'delícia' : 'delícias'}`;

  if (recipes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: span 2; padding: 32px 0;">
        <div class="empty-icon">🥣</div>
        <h4>Nenhuma receita por aqui</h4>
        <p>Experimente marcar algumas receitas como favoritas para vê-las aqui!</p>
      </div>
    `;
    return;
  }

  recipes.forEach(recipe => {
    const isFav = isFavorite(recipe.id);
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = (e) => {
      // Evita disparar o clique do card ao favoritar
      if (e.target.closest('.card-fav-btn')) return;
      openRecipeDetail(recipe.id);
    };

    // Define cor de dificuldade
    const diffClass = `difficulty-${recipe.dificuldade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

    card.innerHTML = `
      <div class="card-img-wrapper loading-skeleton">
        <img class="card-img" src="${recipe.imagem}" alt="${recipe.nome}" loading="lazy" onload="handleImageLoad(this)" onerror="handleImageError(this, '${recipe.categoria}')">
        <button class="card-fav-btn" onclick="toggleFavorite(${recipe.id}, this)" aria-label="Favoritar">
          <svg class="icon heart-icon ${isFav ? 'active' : ''}" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <span class="card-badge">${recipe.categoria}</span>
      </div>
      <div class="card-content">
        <span class="card-category">${recipe.categoria}</span>
        <h4 class="card-title">${recipe.nome}</h4>
        <div class="card-footer">
          <span class="card-meta-item">
            <svg class="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${recipe.tempo}
          </span>
          <span class="card-difficulty ${diffClass}">${recipe.dificuldade}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// --- SISTEMA DE FAVORITOS (LOCALSTORAGE) ---
function getFavorites() {
  return JSON.parse(localStorage.getItem('carinho_doces_favorites')) || [];
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id, buttonEl) {
  let favs = getFavorites();
  const index = favs.indexOf(id);
  const heartSvg = buttonEl.querySelector('.heart-icon');
  
  const recipe = RECEITAS_DB.find(r => r.id === id);
  const recipeName = recipe ? recipe.nome : id;

  if (index > -1) {
    // Remove dos favoritos
    favs.splice(index, 1);
    heartSvg.classList.remove('active');
    heartSvg.setAttribute('fill', 'none');
    trackEvent('favorite_click', { recipe_id: id, recipe_name: recipeName, action: 'remove' });
  } else {
    // Adiciona aos favoritos
    favs.push(id);
    heartSvg.classList.add('active');
    heartSvg.setAttribute('fill', 'currentColor');
    trackEvent('favorite_click', { recipe_id: id, recipe_name: recipeName, action: 'add' });
  }

  localStorage.setItem('carinho_doces_favorites', JSON.stringify(favs));

  // Se estiver visualizando apenas favoritos, atualiza a lista
  if (showFavoritesOnly) {
    const filtered = RECEITAS_DB.filter(r => favs.includes(r.id));
    renderRecipes(filtered);
  }
}

// --- FILTRAR RECEITAS DO MENU SUPERIOR (APENAS FAVORITAS) ---
function toggleFavoritesOnly() {
  const topFavBtn = document.getElementById('top-fav-btn');
  const topFavHeart = topFavBtn.querySelector('.heart-icon');
  
  showFavoritesOnly = !showFavoritesOnly;

  if (showFavoritesOnly) {
    topFavBtn.style.backgroundColor = 'var(--primary-light)';
    topFavHeart.classList.add('active');
    topFavHeart.setAttribute('fill', 'currentColor');
    
    // Filtra receitas
    const favs = getFavorites();
    const filtered = RECEITAS_DB.filter(r => favs.includes(r.id));
    renderRecipes(filtered);
    
    document.getElementById('recipe-list-title').innerText = "Meus Favoritos";
  } else {
    topFavBtn.style.backgroundColor = 'var(--white)';
    topFavHeart.classList.remove('active');
    topFavHeart.setAttribute('fill', 'none');
    
    // Restaura lista
    renderRecipes(RECEITAS_DB);
    document.getElementById('recipe-list-title').innerText = "Receitas Artesanais";
  }
}

// --- TELA DE DETALHE DE RECEITA (MODAL) ---
function openRecipeDetail(recipeId) {
  const recipe = RECEITAS_DB.find(r => r.id === recipeId);
  if (!recipe) return;

  activeRecipe = recipe;
  trackEvent('recipe_view', { recipe_id: recipe.id, recipe_name: recipe.nome, category: recipe.categoria });
  
  // Set Imagem e Textos Básicos com Preloader e Fallback Nativo
  const modalEl = document.getElementById('recipe-detail-modal');
  modalEl.classList.add('loading-skeleton');
  
  const modalBanner = modalEl.querySelector('.modal-banner');
  if (modalBanner) modalBanner.style.backgroundImage = 'none';
  
  const modalImgLoader = new Image();
  modalImgLoader.onload = () => {
    modalEl.classList.remove('loading-skeleton');
    if (modalBanner) modalBanner.style.backgroundImage = `url('${recipe.imagem}')`;
  };
  modalImgLoader.onerror = () => {
    modalEl.classList.remove('loading-skeleton');
    if (modalBanner) modalBanner.style.backgroundImage = `url('${getFallbackImage(recipe.categoria)}')`;
  };
  modalImgLoader.src = recipe.imagem;
  
  document.getElementById('modal-recipe-category').innerText = recipe.categoria;
  document.getElementById('modal-recipe-title').innerText = recipe.nome;
  document.getElementById('modal-recipe-desc').innerText = recipe.descricao;
  
  // Set Ficha Técnica
  document.getElementById('modal-recipe-time').innerText = recipe.tempo;
  document.getElementById('modal-recipe-yield').innerText = recipe.rendimento;
  document.getElementById('modal-recipe-difficulty').innerText = recipe.dificuldade;
  
  // Set Dica da Fabi & Acompanhamento
  document.getElementById('modal-recipe-tip').innerText = recipe.dicaEspecial;
  document.getElementById('modal-recipe-accompaniment').innerText = recipe.acompanhamento;

  // Set História & Curiosidades
  document.getElementById('modal-recipe-history').innerText = recipe.historia;
  document.getElementById('modal-recipe-curiosity').innerText = recipe.curiosidade;

  // Atualizar Cor de Dificuldade no Modal
  const difficultyBadge = document.getElementById('modal-recipe-difficulty').parentElement;
  difficultyBadge.className = 'spec-card'; // limpa
  
  // Popula Ingredientes com interação de Checkbox
  const ingredientsContainer = document.getElementById('modal-recipe-ingredients');
  ingredientsContainer.innerHTML = '';
  
  recipe.ingredientes.forEach(ing => {
    const li = document.createElement('li');
    li.className = 'ingredient-item';
    li.onclick = () => li.classList.toggle('checked');
    li.innerHTML = `
      <div class="ingredient-checkbox"></div>
      <span class="ingredient-text">${ing}</span>
    `;
    ingredientsContainer.appendChild(li);
  });

  // Popula Modo de Preparo
  const stepsContainer = document.getElementById('modal-recipe-steps');
  stepsContainer.innerHTML = '';
  
  recipe.modoPreparo.forEach((step, index) => {
    const li = document.createElement('li');
    li.className = 'prep-step-item';
    li.innerHTML = `
      <div class="step-number-badge">${index + 1}</div>
      <div class="step-body">
        <h4>Passo ${index + 1}</h4>
        <p>${step}</p>
      </div>
    `;
    stepsContainer.appendChild(li);
  });

  // Set Estado do Botão de Favoritar no Modal
  const isFav = isFavorite(recipe.id);
  const modalFavBtn = document.getElementById('modal-fav-btn');
  const modalFavHeart = modalFavBtn.querySelector('.heart-icon');
  
  if (isFav) {
    modalFavHeart.classList.add('active');
    modalFavHeart.setAttribute('fill', 'currentColor');
  } else {
    modalFavHeart.classList.remove('active');
    modalFavHeart.setAttribute('fill', 'none');
  }

  // Set Estado do Texto de Favoritar na Seção de Encomenda
  const orderFavText = document.getElementById('order-fav-text');
  const orderFavBtn = document.querySelector('.order-fav-toggle');
  if (isFav) {
    orderFavText.innerText = "Remover dos Favoritos";
    orderFavBtn.classList.add('active');
  } else {
    orderFavText.innerText = "Salvar nos Favoritos";
    orderFavBtn.classList.remove('active');
  }

  // Reseta para a aba de Receita ativa no Modal
  switchModalTab('recipe');

  // Abre Modal com animação
  const modal = document.getElementById('recipe-detail-modal');
  modal.classList.add('active');
}

function closeRecipeDetail() {
  const modal = document.getElementById('recipe-detail-modal');
  modal.classList.remove('active');
  activeRecipe = null;
  
  // Atualiza a Home se os favoritos mudaram no modal
  if (showFavoritesOnly) {
    const favs = getFavorites();
    const filtered = RECEITAS_DB.filter(r => favs.includes(r.id));
    renderRecipes(filtered);
  } else {
    // Apenas atualiza cor dos corações dos cards do grid
    renderRecipes(RECEITAS_DB);
  }
}

// Favoritar dentro do Modal
function toggleFavoriteCurrent() {
  if (!activeRecipe) return;
  const modalFavBtn = document.getElementById('modal-fav-btn');
  toggleFavorite(activeRecipe.id, modalFavBtn);
  
  // Atualiza o estado do botão de favoritos secundário (área de encomendas)
  const isFav = isFavorite(activeRecipe.id);
  const orderFavText = document.getElementById('order-fav-text');
  const orderFavBtn = document.querySelector('.order-fav-toggle');
  
  if (isFav) {
    orderFavText.innerText = "Remover dos Favoritos";
    orderFavBtn.classList.add('active');
  } else {
    orderFavText.innerText = "Salvar nos Favoritos";
    orderFavBtn.classList.remove('active');
  }
}

// Compartilhar Receita
function shareRecipeCurrent() {
  if (!activeRecipe) return;
  trackEvent('share_click', { recipe_id: activeRecipe.id, recipe_name: activeRecipe.nome });

  const shareText = `Olha que delícia de receita do app *Carinho Doces da Fabi*! 😍\n\n*${activeRecipe.nome}*\n\n⏱️ Preparo: ${activeRecipe.tempo}\n🍴 Rendimento: ${activeRecipe.rendimento}\n👩‍🍳 Dificuldade: ${activeRecipe.dificuldade}\n\nAbra o aplicativo ou peça pelo Whatsapp! 🥰`;

  if (navigator.share) {
    navigator.share({
      title: activeRecipe.nome,
      text: shareText,
      url: window.location.href
    }).catch(err => console.log(err));
  } else {
    // Fallback: copiar para área de transferência
    navigator.clipboard.writeText(shareText).then(() => {
      // Alerta customizado rápido (Toast)
      showToast('Receita copiada para a área de transferência! Compartilhe com quem você ama. 💕');
    }).catch(err => {
      alert('Erro ao compartilhar receita.');
    });
  }
}

// Gerenciamento de Abas Internas do Modal (Receita vs. História)
function setupModalTabListeners() {
  // Já configurado direto no HTML nas funções switchModalTab
}

function switchModalTab(tabName) {
  // Desativa abas e conteúdos
  document.getElementById('modal-tab-recipe').classList.remove('active');
  document.getElementById('modal-tab-story').classList.remove('active');
  document.getElementById('modal-tab-content-recipe').classList.remove('active');
  document.getElementById('modal-tab-content-story').classList.remove('active');

  // Ativa a selecionada
  document.getElementById(`modal-tab-${tabName}`).classList.add('active');
  document.getElementById(`modal-tab-content-${tabName}`).classList.add('active');
  
  // Roda o topo do modal ao trocar de aba
  document.querySelector('.modal-body').scrollTop = 0;
}

// --- BUSCA FUNCIONAL ---
function handleSearch(query) {
  const clearBtn = document.getElementById('clear-search-btn');
  const resultsHeader = document.querySelector('.search-results-header');
  const resultsContainer = document.getElementById('search-results-container');
  const emptyState = document.getElementById('search-empty-state');
  
  if (!query || query.trim() === '') {
    clearBtn.style.display = 'none';
    resultsHeader.style.display = 'none';
    resultsContainer.innerHTML = '';
    emptyState.style.display = 'none';
    return;
  }

  clearBtn.style.display = 'flex';
  const cleanQuery = query.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (cleanQuery.length >= 3 && handleSearch._lastTracked !== cleanQuery) {
    handleSearch._lastTracked = cleanQuery;
    trackEvent('search', { search_term: query.trim() });
  }

  // Algoritmo de busca por nome, ingredientes, categoria ou tags
  const matchedRecipes = RECEITAS_DB.filter(recipe => {
    const matchNome = recipe.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(cleanQuery);
    const matchCategoria = recipe.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(cleanQuery);
    const matchTags = recipe.tags.some(tag => tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(cleanQuery));
    const matchIngredientes = recipe.ingredientes.some(ing => ing.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(cleanQuery));
    
    return matchNome || matchCategoria || matchTags || matchIngredientes;
  });

  // Mostra resultados
  resultsHeader.style.display = 'flex';
  document.getElementById('search-results-count').innerText = `${matchedRecipes.length} ${matchedRecipes.length === 1 ? 'encontrado' : 'encontrados'}`;
  
  resultsContainer.innerHTML = '';

  if (matchedRecipes.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    
    matchedRecipes.forEach(recipe => {
      const isFav = isFavorite(recipe.id);
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.onclick = (e) => {
        if (e.target.closest('.card-fav-btn')) return;
        openRecipeDetail(recipe.id);
      };
      
      const diffClass = `difficulty-${recipe.dificuldade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

      card.innerHTML = `
        <div class="card-img-wrapper loading-skeleton">
          <img class="card-img" src="${recipe.imagem}" alt="${recipe.nome}" onload="handleImageLoad(this)" onerror="handleImageError(this, '${recipe.categoria}')">
          <button class="card-fav-btn" onclick="toggleFavorite(${recipe.id}, this)">
            <svg class="icon heart-icon ${isFav ? 'active' : ''}" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <span class="card-badge">${recipe.categoria}</span>
        </div>
        <div class="card-content">
          <span class="card-category">${recipe.categoria}</span>
          <h4 class="card-title">${recipe.nome}</h4>
          <div class="card-footer">
            <span class="card-meta-item">
              <svg class="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${recipe.tempo}
            </span>
            <span class="card-difficulty ${diffClass}">${recipe.dificuldade}</span>
          </div>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }
}

function clearSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  handleSearch('');
  searchInput.focus();
}

function applySearchTag(tagName) {
  const searchInput = document.getElementById('search-input');
  searchInput.value = tagName;
  handleSearch(tagName);
}

// --- RENDERIZAR SEÇÃO HISTÓRIAS DOS DOCES ---
function renderStories() {
  const container = document.getElementById('stories-container');
  container.innerHTML = '';

  HISTORIAS_DB.forEach(story => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => {
      // Abre o detalhe da receita correspondente se existir
      const recipeMap = {
        "brigadeiro": 3,
        "pudim": 6,
        "bolo-cenoura": 2,
        "brownie": 5,
        "cocada": 7,
        "quindim": 9,
        "beijinho": 4,
        "torta-limao": 8,
        "mousse": 10,
        "bolo-chocolate": 1
      };
      
      const recipeId = recipeMap[story.id];
      if (recipeId) {
        openRecipeDetail(recipeId);
        // Toca aba do modal para aba de histórias automaticamente!
        switchModalTab('story');
      }
    };

    card.innerHTML = `
      <div class="story-card-header">
        <h4 class="story-card-title">${story.nome}</h4>
        <span class="story-card-emoji">${story.emoji}</span>
      </div>
      <p class="story-card-excerpt">${story.resumo}</p>
      <div class="story-card-footer">
        Ler história completa
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    `;

    container.appendChild(card);
  });
}

// --- UTILS: TOAST PERSONALIZADO ---
function showToast(message) {
  // Cria elemento toast dinâmico
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '84px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%) translateY(20px)';
  toast.style.background = 'rgba(74, 53, 56, 0.95)';
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '24px';
  toast.style.fontSize = '12px';
  toast.style.fontWeight = '600';
  toast.style.textAlign = 'center';
  toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
  toast.style.zIndex = '500';
  toast.style.width = '85%';
  toast.style.maxWidth = '400px';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  toast.innerText = message;

  document.body.appendChild(toast);

  // Force reflow
  toast.offsetHeight;

  // Animação de entrada
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  // Remove após 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// --- CONTROLE DE DESTAQUE & IMAGENS COM SKELETON E SUCESSO/ERRO ---
function initFeaturedRecipe() {
  const banner = document.getElementById('featured-recipe-banner');
  if (!banner) return;
  
  // A receita em destaque é a de id: 12 (Bolo de Ninho com Morango)
  const recipe = RECEITAS_DB.find(r => r.id === 12);
  if (!recipe) return;

  // Atualiza os dados do banner dinamicamente para garantir consistência
  const titleEl = banner.querySelector('.hero-title');
  const descEl = banner.querySelector('.hero-desc');
  if (titleEl) titleEl.innerText = recipe.nome;
  if (descEl) descEl.innerText = recipe.descricao;

  // Adiciona skeleton animation
  banner.classList.add('loading-skeleton');
  
  const imgLoader = new Image();
  
  imgLoader.onload = () => {
    banner.classList.remove('loading-skeleton');
    banner.style.backgroundImage = `url('${recipe.imagem}')`;
  };
  
  imgLoader.onerror = () => {
    console.warn("Featured image failed to load. Using offline local fallback.");
    banner.classList.remove('loading-skeleton');
    banner.style.backgroundImage = `url('${getFallbackImage(recipe.categoria)}')`;
  };
  
  imgLoader.src = recipe.imagem;
}

function handleImageLoad(imgElement) {
  const wrapper = imgElement.parentElement;
  if (wrapper && wrapper.classList.contains('loading-skeleton')) {
    wrapper.classList.remove('loading-skeleton');
  }
}

function getFallbackImage(categoria) {
  if (!categoria) return 'assets/destaque_ninho.jpg';
  const cat = categoria.toLowerCase().trim();
  if (cat.includes('bolo')) {
    return 'assets/destaque_ninho.jpg';
  } else if (cat.includes('doce')) {
    return 'assets/destaque_brigadeiro.jpg';
  } else if (cat.includes('chocolate')) {
    return 'assets/destaque_chocolate.jpg';
  } else if (cat.includes('sobremesa') || cat.includes('gelada')) {
    return 'assets/destaque_pudim.jpg';
  } else if (cat.includes('torta')) {
    return 'assets/destaque_torta_limao.jpg';
  }
  return 'assets/destaque_ninho.jpg';
}

function handleImageError(imgElement, categoria) {
  const wrapper = imgElement.parentElement;
  if (wrapper && wrapper.classList.contains('loading-skeleton')) {
    wrapper.classList.remove('loading-skeleton');
  }
  imgElement.onerror = null; // evita loops recursivos
  imgElement.src = getFallbackImage(categoria);
}

// --- FUNÇÃO DE ENCOMENDA GERAL (FORA DOS LINKS) ---
function openGeneralOrder() {
  trackEvent('order_whatsapp_click', { recipe_name: 'Geral' });
  const whatsappUrl = "https://wa.me/5511997020827?text=Ol%C3%A1%20Fabi!%20Acessei%20seu%20aplicativo%20e%20gostaria%20de%20fazer%20um%20pedido%20personalizado%20/%20encomenda%20especial%20de%20doces!%20Poderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es?%20%F0%9F%8D%B0%F0%9F%92%95";
  openExternal(whatsappUrl);
}


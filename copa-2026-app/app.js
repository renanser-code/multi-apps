// ==========================================================================
// 🏆 COPA CENTER 2026 - MAIN ENGINE (PWA & MATCHZONE & BRASIL HISTÓRICO)
// ==========================================================================

// --- SELECTORS SHORTCUTS ---
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// --- GLOBAL STATE ---
const state = {
  currentView: "home",
  currentUser: null,
  isLoginTab: true,
  inviteCode: null,
  activePrivateGroup: null,
  simulationReady: false,
  favorites: JSON.parse(localStorage.getItem("brasil_favorites_copa2026")) || [],
  
  // Quiz states
  quizCurrentQuestion: 0,
  quizScore: 0,
  quizAnswers: [],

  // Mock Database
  matches: [
    { id: 1, group: "A", date: "11/06/2026", time: "20:00", teamA: "México", flagA: "🇲🇽", scoreA: null, teamB: "Canadá", flagB: "🇨🇦", scoreB: null, stadium: "Estádio Azteca", phase: "grupos", highlight: true },
    { id: 2, group: "B", date: "12/06/2026", time: "20:00", teamA: "EUA", flagA: "🇺🇸", scoreA: null, teamB: "Marrocos", flagB: "🇲🇦", scoreB: null, stadium: "MetLife Stadium", phase: "grupos", highlight: true },
    { id: 3, group: "C", date: "15/06/2026", time: "20:00", teamA: "Brasil", flagA: "🇧🇷", scoreA: null, teamB: "Croácia", flagB: "🇭🇷", scoreB: null, stadium: "SoFi Stadium", phase: "grupos", highlight: true },
    { id: 4, group: "D", date: "16/06/2026", time: "22:00", teamA: "Argentina", flagA: "🇦🇷", scoreA: null, teamB: "Portugal", flagB: "🇵🇹", scoreB: null, stadium: "Hard Rock Stadium", phase: "grupos", highlight: true },
    { id: 5, group: "E", date: "17/06/2026", time: "16:00", teamA: "Alemanha", flagA: "🇩🇪", scoreA: null, teamB: "Japão", flagB: "🇯🇵", scoreB: null, stadium: "Mercedes-Benz Stadium", phase: "grupos", highlight: false },
    { id: 6, group: "F", date: "18/06/2026", time: "19:00", teamA: "França", flagA: "🇫🇷", scoreA: null, teamB: "Senegal", flagB: "🇸🇳", scoreB: null, stadium: "Lumen Field", phase: "grupos", highlight: false }
  ],

  teams: {
    brazil: { id: "brazil", name: "Brasil", flag: "🇧🇷", group: "C", coach: "Dorival Júnior", rating: 9.2, stats: { wins: 5, draws: 0, losses: 1 }, roster: [
      { num: 1, pos: "GOL", name: "Alisson" },
      { num: 2, pos: "LAT", name: "Danilo" },
      { num: 3, pos: "ZAG", name: "Marquinhos" },
      { num: 4, pos: "ZAG", name: "Gabriel Magalhães" },
      { num: 6, pos: "LAT", name: "Guilherme Arana" },
      { num: 5, pos: "MEI", name: "Bruno Guimarães" },
      { num: 8, pos: "MEI", name: "Lucas Paquetá" },
      { num: 10, pos: "ATA", name: "Rodrygo" },
      { num: 7, pos: "ATA", name: "Vinicius Jr" },
      { num: 11, pos: "ATA", name: "Raphinha" },
      { num: 9, pos: "ATA", name: "Endrick" }
    ]},
    argentina: { id: "argentina", name: "Argentina", flag: "🇦🇷", group: "D", coach: "Lionel Scaloni", rating: 9.5, stats: { wins: 5, draws: 1, losses: 0 }, roster: [
      { num: 23, pos: "GOL", name: "Emiliano Martínez" },
      { num: 26, pos: "LAT", name: "Nahuel Molina" },
      { num: 13, pos: "ZAG", name: "Cristian Romero" },
      { num: 19, pos: "ZAG", name: "Nicolás Otamendi" },
      { num: 3, pos: "LAT", name: "Nicolás Tagliafico" },
      { num: 7, pos: "MEI", name: "Rodrigo De Paul" },
      { num: 8, pos: "MEI", name: "Enzo Fernández" },
      { num: 20, pos: "MEI", name: "Alexis Mac Allister" },
      { num: 10, pos: "ATA", name: "Lionel Messi" },
      { num: 22, pos: "ATA", name: "Lautaro Martínez" },
      { num: 9, pos: "ATA", name: "Julián Álvarez" }
    ]},
    portugal: { id: "portugal", name: "Portugal", flag: "🇵🇹", group: "D", coach: "Roberto Martínez", rating: 8.9, stats: { wins: 4, draws: 1, losses: 1 }, roster: [
      { num: 22, pos: "GOL", name: "Diogo Costa" },
      { num: 2, pos: "LAT", name: "João Cancelo" },
      { num: 4, pos: "ZAG", name: "Rúben Dias" },
      { num: 3, pos: "ZAG", name: "Pepe" },
      { num: 19, pos: "LAT", name: "Nuno Mendes" },
      { num: 6, pos: "MEI", name: "João Palhinha" },
      { num: 23, pos: "MEI", name: "Vitinha" },
      { num: 8, pos: "MEI", name: "Bruno Fernandes" },
      { num: 10, pos: "ATA", name: "Bernardo Silva" },
      { num: 7, pos: "ATA", name: "Cristiano Ronaldo" },
      { num: 17, pos: "ATA", name: "Rafael Leão" }
    ]}
  }
};

// ==========================================================================
// 🇧🇷 DATASET: BRASIL NAS COPAS (CONTEÚDO PREMIUM)
// ==========================================================================

const BRASIL_TIMELINE = [
  { year: 1950, pos: "Vice-campeão", coach: "Flávio Costa", stars: "Ademir de Menezes, Zizinho", status: "runnerup", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600", desc: "A trágica perda do título em casa no episódio conhecido como 'Maracanazo'. Ademir foi o artilheiro com 9 gols." },
  { year: 1954, pos: "Quartas de Final", coach: "Zezé Moreira", stars: "Didi, Julinho Botelho", status: "eliminated", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600", desc: "Eliminação na violenta partida contra a lendária Hungria, batizada como 'A Batalha de Berna'." },
  { year: 1958, pos: "Campeão", coach: "Vicente Feola", stars: "Pelé, Garrincha, Didi", status: "champion", img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600", desc: "O primeiro título mundial! Revelação do garoto Pelé com 17 anos e a genialidade de Garrincha na Suécia." },
  { year: 1962, pos: "Campeão", coach: "Aymoré Moreira", stars: "Garrincha, Amarildo, Mauro", status: "champion", img: "https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?q=80&w=600", desc: "O bicampeonato no Chile. Com a lesão de Pelé, Garrincha assumiu o protagonismo e Amarildo brilhou como substituto." },
  { year: 1966, pos: "Fase de Grupos", coach: "Vicente Feola", stars: "Pelé, Garrincha", status: "eliminated", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600", desc: "Campanha conturbada na Inglaterra. Marcada pela caçada violenta dos adversários ao rei Pelé." },
  { year: 1970, pos: "Campeão", coach: "Mário Zagallo", stars: "Pelé, Tostão, Jairzinho, Rivelino", status: "champion", img: "https://images.unsplash.com/photo-1540747737956-37872404f80a?q=80&w=600", desc: "Considerada a maior seleção de todos os tempos! Triunfo inquestionável com 100% de aproveitamento no México." },
  { year: 1974, pos: "4º Lugar", coach: "Mário Zagallo", stars: "Rivelino, Jairzinho", status: "eliminated", img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600", desc: "Primeira Copa sem Pelé. O Brasil sucumbiu à revolucionária 'Laranja Mecânica' da Holanda de Cruyff." },
  { year: 1978, pos: "3º Lugar", coach: "Cláudio Coutinho", stars: "Zico, Dirceu", status: "eliminated", img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600", desc: "Conhecido como o 'Campeão Moral'. O Brasil terminou invicto, mas perdeu a vaga na final devido à goleada suspeita da Argentina por 6x0 sobre o Peru." },
  { year: 1982, pos: "2ª Fase", coach: "Telê Santana", stars: "Zico, Sócrates, Falcão, Cerezo", status: "eliminated", img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", desc: "A 'Tragedia do Sarriá'. A seleção que encantou o mundo jogando o verdadeiro futebol arte acabou eliminada pela Itália de Paolo Rossi." },
  { year: 1986, pos: "Quartas de Final", coach: "Telê Santana", stars: "Zico, Careca, Müller", status: "eliminated", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600", desc: "Eliminação dramática nos pênaltis contra a França de Platini, após empate épico por 1x1 no tempo regulamentar." },
  { year: 1990, pos: "Oitavas de Final", coach: "Sebastião Lazaroni", stars: "Careca, Valdo", status: "eliminated", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600", desc: "A 'Era Dunga'. Estilo extremamente defensivo que culminou na eliminação para a rival Argentina de Maradona e Caniggia." },
  { year: 1994, pos: "Campeão", coach: "Carlos Alberto Parreira", stars: "Romário, Bebeto, Taffarel", status: "champion", img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600", desc: "O Tetracampeonato nos EUA! O renascimento da paixão nacional carregada pelos gols do Baixinho Romário e os pênaltis defendidos por Taffarel." },
  { year: 1998, pos: "Vice-campeão", coach: "Mário Zagallo", stars: "Ronaldo, Rivaldo, Bebeto", status: "runnerup", img: "https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?q=80&w=600", desc: "Marcada pela convulsão misteriosa do fenômeno Ronaldo horas antes da grande final, onde a anfitriã França de Zidane levou a melhor." },
  { year: 2002, pos: "Campeão", coach: "Luiz Felipe Scolari", stars: "Ronaldo, Rivaldo, Ronaldinho, Cafu", status: "champion", img: "https://images.unsplash.com/photo-1540747737956-37872404f80a?q=80&w=600", desc: "O Pentacampeonato na Coreia do Sul e Japão! Superação inacreditável de Ronaldo Fenômeno após graves cirurgias, marcando 8 gols no torneio." },
  { year: 2006, pos: "Quartas de Final", coach: "Carlos Alberto Parreira", stars: "Ronaldo, Ronaldinho, Adriano, Kaká", status: "eliminated", img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600", desc: "O chamado 'Quadrado Mágico' decepcionou em campo, sendo neutralizado por uma atuação antológica de Zidane pela França." },
  { year: 2010, pos: "Quartas de Final", coach: "Dunga", stars: "Kaká, Robinho, Luís Fabiano", status: "eliminated", img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600", desc: "Eliminação frustrante de virada contra a Holanda de Sneijder, marcada pelo descontrole emocional coletivo no segundo tempo." },
  { year: 2014, pos: "4º Lugar", coach: "Luiz Felipe Scolari", stars: "Neymar, Thiago Silva", status: "eliminated", img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", desc: "O trágico 7x1 contra a Alemanha nas semifinais jogando em casa. Sem Neymar (lesionado) e Thiago Silva (suspenso)." },
  { year: 2018, pos: "Quartas de Final", coach: "Tite", stars: "Neymar, Philippe Coutinho", status: "eliminated", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600", desc: "Parada na talentosa 'Geração Belga'. Derrota por 2x1 em Kazan com grande atuação de Hazard e Courtois." },
  { year: 2022, pos: "Quartas de Final", coach: "Tite", stars: "Neymar, Casemiro, Richarlison", status: "eliminated", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600", desc: "Eliminação dramática nos pênaltis contra a Croácia, após sofrer o gol de empate nos minutos finais da prorrogação." }
];

const BRASIL_TITULOS = [
  { year: "1958", country: "Suécia", coach: "Vicente Feola", score: "Brasil 5 x 2 Suécia", stars: "Pelé, Garrincha, Didi, Vavá, Nilton Santos", desc: "Primeiro título. O Brasil inovou taticamente no esquema 4-2-4 e apresentou ao mundo Pelé com apenas 17 anos, que marcou um golaço antológico chapelando o defensor na grande final.", trivia: "Para evitar confusão de cores com a camisa da Suécia, a delegação brasileira comprou camisas azuis na véspera da final em Estocolmo. O chefe da comissão disse aos jogadores que o azul representava o manto de Nossa Senhora Aparecida." },
  { year: "1962", country: "Chile", coach: "Aymoré Moreira", score: "Brasil 3 x 1 Tchecoslováquia", stars: "Garrincha, Amarildo, Zito, Vavá, Didi", desc: "O bicampeonato consecutivo. Pelé se machucou logo no segundo jogo, mas Garrincha jogou a Copa da vida dele, driblando zagueiros inteiros e liderando o Brasil até a taça com gols decisivos.", trivia: "Amarildo, apelidado de 'O Possesso', substituiu Pelé e marcou gols vitais na fase de grupos e na final. A Tchecoslováquia elogiou a honestidade dos defensores brasileiros." },
  { year: "1970", country: "México", coach: "Mário Zagallo", score: "Brasil 4 x 1 Itália", stars: "Pelé, Jairzinho, Tostão, Rivelino, Gérson, Carlos Alberto", desc: "O Tri definitivo no auge técnico do futebol brasileiro. A equipe reunia cinco camisas 10 de clubes no mesmo meio-campo, vencendo todos os 6 confrontos com exibições primorosas.", trivia: "Jairzinho, o 'Furacão da Copa', estabeleceu o recorde inédito de marcar gols em todas as partidas de uma única edição do mundial." },
  { year: "1994", country: "EUA", coach: "Carlos Alberto Parreira", score: "Brasil 0 (3) x (2) 0 Itália", stars: "Romário, Bebeto, Taffarel, Dunga, Aldair, Jorginho", desc: "O fim do jejum de 24 anos. Romário fez uma das atuações individuais mais dominantes da história das Copas. A final contra a Itália foi a primeira decidida nos pênaltis, encerrando com o chute para fora de Roberto Baggio.", trivia: "A clássica comemoração de Bebeto fazendo o 'ninar de bebê' após gol nas quartas contra a Holanda foi dedicada ao nascimento do seu filho, Mattheus." },
  { year: "2002", country: "Coreia do Sul / Japão", coach: "Luiz Felipe Scolari", score: "Brasil 2 x 0 Alemanha", stars: "Ronaldo, Rivaldo, Ronaldinho, Cafu, Roberto Carlos, Marcos", desc: "A glória máxima do Pentacampeonato. Conquistada com 7 vitórias consecutivas. Ronaldo deu a volta por cima após lesões graves e marcou duas vezes na final histórica contra Oliver Kahn.", trivia: "Cafu tornou-se o único jogador no mundo a disputar três finais consecutivas de Copa do Mundo (1994, 1998 e 2002)." }
];

const BRASIL_LEGENDS = [
  { name: "Pelé", copas: "1958, 1962, 1966, 1970", matches: 14, goals: 12, trophies: "3 (1958, 1962, 1970)", photo: "https://images.unsplash.com/photo-1540747737956-37872404f80a?q=80&w=600", desc: "O maior atleta de todos os tempos. Estreou na Suécia fazendo mágica, marcou o gol do título no tri de 70 com cabeça espetacular e eternizou o camisa 10 no esporte.", quote: "Eu nasci para jogar futebol, assim como Beethoven nasceu para escrever música." },
  { name: "Ronaldo Fenômeno", copas: "1994, 1998, 2002, 2006", matches: 19, goals: 15, trophies: "2 (1994, 2002)", photo: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600", desc: "Símbolo máximo de resiliência. Consagrou-se em 2002 com 8 gols e sua velocidade imparável, sendo durante anos o maior artilheiro geral dos mundiais.", quote: "Minha maior vitória na vida foi voltar a correr e chutar uma bola." },
  { name: "Garrincha", copas: "1958, 1962, 1966", matches: 12, goals: 5, trophies: "2 (1958, 1962)", photo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600", desc: "A 'Alegria do Povo'. Dono de dribles inacreditáveis que desafiavam a física, carregou a seleção no bicampeonato de 62 de forma brilhante.", quote: "Garrincha não joga contra adversários, joga contra a lógica." },
  { name: "Romário", copas: "1990, 1994", matches: 8, goals: 5, trophies: "1 (1994)", photo: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", desc: "O gênio da grande área. Com frieza cirúrgica e posicionamento perfeito, foi a figura central e o grande salvador do tetracampeonato de 94.", quote: "Dentro da área sou Deus, fora dela sou um homem comum." },
  { name: "Ronaldinho Gaúcho", copas: "2002, 2006", matches: 10, goals: 2, trophies: "1 (2002)", photo: "https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?q=80&w=600", desc: "O bruxo do futebol espetáculo. Protagonista do antológico gol de falta encobrindo o goleiro Seaman contra a Inglaterra nas quartas de 2002.", quote: "Eu busco apenas divertir as pessoas com a bola no pé." },
  { name: "Cafu", copas: "1994, 1998, 2002, 2006", matches: 20, goals: 0, trophies: "2 (1994, 2002)", photo: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600", desc: "Líder e locomotiva da lateral direita. Único atleta a disputar 3 finais seguidas e eterno capitão que eternizou o 'Regina' na camisa de 2002.", quote: "Subi no pódio para mostrar ao mundo que a periferia pode ser campeã." },
  { name: "Neymar Jr", copas: "2014, 2018, 2022", matches: 13, goals: 8, trophies: "0", photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600", desc: "Habilidade extrema e artilheiro refinado. Alcançou Pelé em gols oficiais da Seleção Masculina e liderou o ataque brasileiro em três Copas consecutivas.", quote: "Representar o meu país na Copa do Mundo é a maior honra possível." },
  { name: "Rivaldo", copas: "1998, 2002", matches: 14, goals: 8, trophies: "1 (2002)", photo: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600", desc: "O herói silencioso de 2002. Fez uma Copa impecável marcando gols fantásticos e servindo de garçom perfeito para a consolidação do Penta.", quote: "Nunca busquei os holofotes, apenas dei a vida pela minha seleção." },
  { name: "Kaká", copas: "2002, 2006, 2010", matches: 11, goals: 1, trophies: "1 (2002)", photo: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600", desc: "Elegância e arrancadas devastadoras. O último brasileiro eleito Melhor do Mundo (2007), integrou a 'Família Scolari' de 2002 com apenas 20 anos.", quote: "O futebol me deu tudo e sempre joguei com o coração." },
  { name: "Zico", copas: "1978, 1982, 1986", matches: 14, goals: 5, trophies: "0", photo: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", desc: "O 'Galinho de Quintino'. Maestro e cobrador de faltas incomparável da lendária geração de 1982 que encantou o planeta futebol.", quote: "Nós não vencemos a taça em 82, mas vencemos a admiração da história." }
];

const BRASIL_RECORDS = [
  { title: "Única Seleção Pentacampeã", value: "5 Títulos", desc: "O Brasil lidera o ranking mundial de taças com as conquistas de 1958, 1962, 1970, 1994 e 2002, abrindo vantagem sobre Itália e Alemanha (4 cada)." },
  { title: "Presença Absoluta", value: "22 Copas", desc: "A única nação de todo o planeta a participar de TODAS as edições da Copa do Mundo FIFA organizadas desde o torneio inaugural em 1930." },
  { title: "Vitórias Consecutivas", value: "11 Triunfos", desc: "O Brasil estabeleceu a maior sequência invicta e vitoriosa da história do torneio, vencendo as 7 partidas de 2002 e mais 4 no mundial de 2006." },
  { title: "Maior Artilharia Brasileira", value: "Ronaldo (15)", desc: "Com 15 gols anotados em 19 partidas oficiais, o Fenômeno Ronaldo é o maior goleador brasileiro em copas, seguido por Pelé com 12 gols." },
  { title: "Goleada Histórica", value: "Brasil 7 x 1 Suécia", desc: "O placar mais elástico do Brasil no torneio aconteceu em 1950, na fase quadrangular do Maracanã, com 4 gols marcados por Ademir de Menezes." },
  { title: "Invencibilidade em Grupos", value: "40 Anos", desc: "De 1982 a 2022, o Brasil permaneceu incríveis 40 anos sem perder um único jogo sequer na fase inicial de grupos da Copa do Mundo." }
];

const BRASIL_MOMENTS = [
  { id: "maracanazo", title: "O Maracanazo (1950)", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600", desc: "A tragédia que silenciou 200 mil brasileiros. Diante do Uruguai, o Brasil precisava apenas do empate para sagrar-se campeão, mas acabou sofrendo a virada por 2x1 com gol de Ghiggia nos minutos finais." },
  { id: "tri70", title: "O Tri no México (1970)", img: "https://images.unsplash.com/photo-1540747737956-37872404f80a?q=80&w=600", desc: "A glória máxima do futebol. Uma goleada de 4x1 na Itália na final de 1970 coroou Pelé e seus companheiros com a icônica Taça Jules Rimet de forma definitiva." },
  { id: "tetra94", title: "O Tetra nos Pênaltis (1994)", img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=600", desc: "A libertação nacional! Após 24 anos de agonia, Galvão Bueno grita 'É TETRA!' no microfone enquanto o italiano Baggio chuta o pênalti por cima da trave em Pasadena." },
  { id: "penta02", title: "A Volta por Cima de Ronaldo (2002)", img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600", desc: "O milagre do Fenômeno. Após duas graves lesões de joelho que quase o aposentaram do esporte, Ronaldo brilha no Japão, marca 2 gols na final contra a Alemanha e ergue a taça do Penta." },
  { id: "7x1", title: "O Pesadelo do 7x1 (2014)", img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", desc: "A maior dor do futebol nacional moderno. Nas semifinais em Belo Horizonte, a seleção sofreu um apagão histórico diante da Alemanha, resultando na goleada histórica por 7x1." },
  { id: "capita70", title: "O Gol Coletivo de Carlos Alberto (1970)", img: "https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?q=80&w=600", desc: "Considerado o gol mais bonito da história das Copas. Uma troca de passes perfeita envolvendo quase o time inteiro até o cruzamento preciso de Pelé para o chute potente e cruzado do capitão Carlos Alberto Torres." },
  { id: "pele58", title: "O Estreante de 17 Anos (1958)", img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600", desc: "O início da lenda do Rei Pelé. Barreado por psicólogos que o chamavam de infantil, o jovem entra no time na Suécia e brilha com chapéu em zagueiro e gols decisivos." },
  { id: "taffarel94", title: "Taffarel Defende contra a Itália (1994)", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600", desc: "O clamor 'Sai que é sua, Taffarel!'. A frieza lendária do goleiro brasileiro defendendo o pênalti do italiano Massaro abriu caminho para a conquista do tetracampeonato." }
];

const BRASIL_TRIVIA = [
  { title: "A Evolução das Bolas da Copa", type: "Equipamento", img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600", desc: "Das costuras pesadas de couro marrom de 1950 até a tecnológica Al Rihla de 2022. O Brasil foi campeão com a de couro simples (58 e 62), a clássica Telstar da Adidas (70), a Questra (94) e a brilhante Fevernova (2002)." },
  { title: "Os Mascotes da Seleção", type: "Folclore", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600", desc: "Os bonecos icônicos que animaram as edições locais. Do clássico tatu-bola 'Fuleco' em 2014, passando pelo leão 'Zakumi' em 2010 até o galo 'Footix' em 1998. Na torcida nacional, o 'Canarinho Pistola' virou um símbolo folclórico carismático de paixão inabalável." },
  { title: "Histórias do Manto Amarelo", type: "Uniforme", img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=600", desc: "A famosa camisa Amarela (Canarinho) foi criada após o trauma de 1950 para substituir a branca original, que passou a ser considerada de azar. O desenho vencedor foi elaborado por Aldyr Garcia Schlee através de um concurso nacional." },
  { title: "O Feito Inédito de Zagallo", type: "Treinadores", img: "https://images.unsplash.com/photo-1540747737956-37872404f80a?q=80&w=600", desc: "O eterno lobo Mário Jorge Lobo Zagallo é o maior colecionador de copas do mundo. Ele conquistou o torneio como jogador em 58 e 62, como técnico em 70 e como coordenador técnico em 94. O número 13 sempre foi seu amuleto da sorte!" }
];

const QUIZ_QUESTIONS = [
  {
    emoji: "👑",
    text: "Quantas Copas do Mundo o rei Pelé venceu jogando ativamente pela Seleção Brasileira?",
    options: ["1 vez", "2 vezes", "3 vezes", "4 vezes"],
    correct: 2,
    explanation: "Pelé é o único jogador do planeta a possuir 3 títulos mundiais no currículo, conquistados nas edições gloriosas de 1958 (Suécia), 1962 (Chile) e 1970 (México)."
  },
  {
    emoji: "🏆",
    text: "Quem foi o capitão responsável por erguer a taça da Copa do Mundo de 2002 na Coreia e Japão?",
    options: ["Dunga", "Cafu", "Ronaldo Fenômeno", "Rivaldo"],
    correct: 1,
    explanation: "O capitão Cafu ergueu a taça do Penta, eternizando o gesto de subir no pódio e escrever '100% Jardim Irene' e 'Regina Eu Te Amo' em sua camisa."
  },
  {
    emoji: "⚽",
    text: "Quem é o maior artilheiro da Seleção Brasileira em toda a história das Copas do Mundo?",
    options: ["Pelé", "Neymar Jr", "Romário", "Ronaldo Fenômeno"],
    correct: 3,
    explanation: "Ronaldo Fenômeno marcou 15 gols oficiais em Copas (4 em 1998, 8 em 2002 e 3 em 2006), mantendo o recorde nacional absoluto."
  },
  {
    emoji: "🇭🇷",
    text: "Qual seleção europeia eliminou o Brasil nos pênaltis nas quartas de final da Copa do Mundo do Catar de 2022?",
    options: ["Bélgica", "França", "Croácia", "Alemanha"],
    correct: 2,
    explanation: "A Croácia eliminou o Brasil nas quartas em 2022 após empatar em 1x1 na prorrogação e vencer na disputa de pênaltis."
  },
  {
    emoji: "👔",
    text: "Quem era o treinador oficial da Seleção Brasileira na campanha histórica do Tetracampeonato em 1994?",
    options: ["Carlos Alberto Parreira", "Mário Zagallo", "Telê Santana", "Luiz Felipe Scolari"],
    correct: 0,
    explanation: "Carlos Alberto Parreira comandou a seleção de 1994 nos Estados Unidos, tendo Zagallo como seu consagrado coordenador técnico."
  }
];

// ==========================================================================
// 🛠️ PWA SERVICE WORKER DYNAMIC SCOPE RESOLVER
// ==========================================================================
(function registerPWA() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Resolve path dynamically to ensure stability on local or Subfolder hosting (GitHub Pages)
      const pathname = window.location.pathname;
      const directory = pathname.substring(0, pathname.lastIndexOf('/'));
      const swPath = directory + '/service-worker.js';
      
      navigator.serviceWorker.register(swPath)
        .then(reg => console.log("Service Worker registrado com sucesso no escopo:", reg.scope))
        .catch(err => console.error("Falha ao registrar Service Worker:", err));
    });
  }
})();

// ==========================================================================
// 📈 GA4 ANALYTICS TELEMETRY EMULATOR
// ==========================================================================
function trackGAEvent(eventName, params = {}) {
  console.log(`[GA4 TELEMETRY] Evento: "${eventName}"`, params);
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

// ==========================================================================
// 👤 CORE LOCAL STORAGE & AUTH SANDBOX
// ==========================================================================
const MOCK_USERS = [
  { name: "Fabi Confeiteira", email: "fabi@doces.com", points: 85, fav: "Brasil" },
  { name: "Lucas Dev", email: "lucas@dev.com", points: 68, fav: "Alemanha" },
  { name: "Renan Pires", email: "renan@doces.com", points: 95, fav: "Brasil" }
];

function initSocialEngine() {
  let users = JSON.parse(localStorage.getItem("matchzone_users"));
  if (!users) {
    localStorage.setItem("matchzone_users", JSON.stringify(MOCK_USERS));
  }
  
  const savedSession = localStorage.getItem("matchzone_session");
  if (savedSession) {
    state.currentUser = JSON.parse(savedSession);
    renderAuthenticatedUI();
  } else {
    $("#auth-container").style.display = "block";
    $("#social-dashboard-container").style.display = "none";
  }
}

function toggleAuthState(isLogin) {
  state.isLoginTab = isLogin;
  $("#auth-error-msg").textContent = "";
  
  if (isLogin) {
    $("#auth-tab-login").className = "btn btn-primary btn-sm";
    $("#auth-tab-register").className = "btn btn-secondary btn-sm";
    $("#group-auth-nickname").style.display = "none";
    $("#group-auth-favteam").style.display = "none";
    $("#auth-submit-btn").textContent = "Entrar";
  } else {
    $("#auth-tab-login").className = "btn btn-secondary btn-sm";
    $("#auth-tab-register").className = "btn btn-primary btn-sm";
    $("#group-auth-nickname").style.display = "flex";
    $("#group-auth-favteam").style.display = "flex";
    $("#auth-submit-btn").textContent = "Cadastrar Conta";
  }
}

function handleAuthSubmit() {
  const email = $("#auth-email-input").value.trim();
  const password = $("#auth-password-input").value;
  const nickname = $("#auth-nickname-input").value.trim();
  const favTeam = $("#auth-favteam-input").value;
  
  if (!email || !password) {
    showAuthError("Preencha todos os campos obrigatórios!");
    return;
  }
  
  let users = JSON.parse(localStorage.getItem("matchzone_users")) || [];
  
  if (state.isLoginTab) {
    // Login flow
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      state.currentUser = matched;
      localStorage.setItem("matchzone_session", JSON.stringify(matched));
      renderAuthenticatedUI();
      showToast("Acesso autorizado na MatchZone!");
      trackGAEvent("login", { method: "Email" });
    } else {
      // Create user on-the-fly for smooth sandbox onboarding
      const newUser = { name: email.split("@")[0], email, points: 0, fav: "Brasil" };
      users.push(newUser);
      localStorage.setItem("matchzone_users", JSON.stringify(users));
      state.currentUser = newUser;
      localStorage.setItem("matchzone_session", JSON.stringify(newUser));
      renderAuthenticatedUI();
      showToast("Nova conta Sandbox criada e conectada!");
      trackGAEvent("sign_up", { method: "Email" });
    }
  } else {
    // Signup flow
    if (!nickname) {
      showAuthError("Escolha um apelido para a liga!");
      return;
    }
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      showAuthError("E-mail já está cadastrado na MatchZone!");
      return;
    }
    const newUser = { name: nickname, email, points: 0, fav: favTeam };
    users.push(newUser);
    localStorage.setItem("matchzone_users", JSON.stringify(users));
    state.currentUser = newUser;
    localStorage.setItem("matchzone_session", JSON.stringify(newUser));
    renderAuthenticatedUI();
    showToast("Conta criada com sucesso na MatchZone!");
    trackGAEvent("sign_up", { method: "Email" });
  }
}

function showAuthError(msg) {
  $("#auth-error-msg").textContent = msg;
}

function handleLogout() {
  localStorage.removeItem("matchzone_session");
  state.currentUser = null;
  $("#auth-container").style.display = "block";
  $("#social-dashboard-container").style.display = "none";
  $("#header-username").textContent = "Acessar";
  showToast("Sessão encerrada!");
  trackGAEvent("logout");
}

function renderAuthenticatedUI() {
  $("#auth-container").style.display = "none";
  $("#social-dashboard-container").style.display = "block";
  
  // Update profiles
  $("#profile-display-name").textContent = state.currentUser.name;
  $("#profile-favorite-team").textContent = `Torcedor: ${state.currentUser.fav || "Brasil"}`;
  $("#profile-total-score").textContent = `${state.currentUser.points || 0} pts`;
  $("#header-username").textContent = state.currentUser.name;
  
  // Set invite code
  state.inviteCode = `MZ-${state.currentUser.name.substring(0,3).toUpperCase()}${Math.floor(100+Math.random()*900)}`;
  $("#user-invite-code").textContent = state.inviteCode;
  
  // Render subviews
  renderPredictionList();
  renderLeaderboard();
  renderPrivateGroups();
}

// ==========================================================================
// 🏆 MATCHZONE GAME PREDICTIONS & LEADERBOARD
// ==========================================================================

function renderPredictionList() {
  const container = $("#prediction-matches-list");
  container.innerHTML = "";
  
  const savedPredictions = JSON.parse(localStorage.getItem(`predictions_${state.currentUser.email}`)) || {};
  
  state.matches.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel match-card";
    
    const predA = savedPredictions[m.id]?.scoreA !== undefined ? savedPredictions[m.id].scoreA : "";
    const predB = savedPredictions[m.id]?.scoreB !== undefined ? savedPredictions[m.id].scoreB : "";
    
    card.innerHTML = `
      <div class="match-header">
        <span>GRUPO ${m.group} • ${m.date} às ${m.time}</span>
        <span class="match-status upcoming">Aberto</span>
      </div>
      <div class="match-teams">
        <div class="team-display left">
          <span class="team-name">${m.teamA}</span>
          <span class="team-flag">${m.flagA}</span>
        </div>
        <div class="prediction-inputs">
          <input type="number" id="pred-${m.id}-A" value="${predA}" min="0" placeholder="0">
          <span>x</span>
          <input type="number" id="pred-${m.id}-B" value="${predB}" min="0" placeholder="0">
        </div>
        <div class="team-display right">
          <span class="team-flag">${m.flagB}</span>
          <span class="team-name">${m.teamB}</span>
        </div>
      </div>
      <div class="match-footer" style="padding-top:10px;">
        <span style="font-size:11px; color:var(--text-muted);"><i data-lucide="map-pin" style="width:12px; height:12px; display:inline; vertical-align:middle;"></i> ${m.stadium}</span>
        <button class="btn btn-primary btn-sm" onclick="savePrediction(${m.id})">Salvar</button>
      </div>
    `;
    container.appendChild(card);
  });
  
  if (window.lucide) lucide.createIcons();
}

function savePrediction(matchId) {
  const scoreA = $(`#pred-${matchId}-A`).value;
  const scoreB = $(`#pred-${matchId}-B`).value;
  
  if (scoreA === "" || scoreB === "") {
    showToast("Por favor, digite os placares do jogo!");
    return;
  }
  
  let predictions = JSON.parse(localStorage.getItem(`predictions_${state.currentUser.email}`)) || {};
  predictions[matchId] = { scoreA: parseInt(scoreA), scoreB: parseInt(scoreB) };
  localStorage.setItem(`predictions_${state.currentUser.email}`, JSON.stringify(predictions));
  
  // Award random points for interactive sandbox feedback
  let users = JSON.parse(localStorage.getItem("matchzone_users")) || [];
  const uIndex = users.findIndex(u => u.email === state.currentUser.email);
  if (uIndex !== -1) {
    users[uIndex].points += 10;
    state.currentUser.points = users[uIndex].points;
    localStorage.setItem("matchzone_users", JSON.stringify(users));
    localStorage.setItem("matchzone_session", JSON.stringify(state.currentUser));
    $("#profile-total-score").textContent = `${state.currentUser.points} pts`;
  }
  
  showToast("Palpite salvo com sucesso na MatchZone!");
  trackGAEvent("favorite_curiosity", { match_id: matchId });
}

function renderLeaderboard() {
  const container = $("#global-ranking-list");
  container.innerHTML = "";
  
  let users = JSON.parse(localStorage.getItem("matchzone_users")) || [];
  users.sort((a,b) => b.points - a.points);
  
  users.forEach((u, index) => {
    const item = document.createElement("div");
    item.className = `leaderboard-item ${index === 0 ? 'top-1' : ''}`;
    
    item.innerHTML = `
      <div class="rank-badge">${index + 1}</div>
      <div class="rank-user-info">
        <span class="name">${u.name} ${u.email === state.currentUser.email ? '(Você)' : ''}</span>
        <small style="color:var(--text-muted); font-size:11px;">Torce para: ${u.fav || 'Brasil'}</small>
      </div>
      <div class="rank-score">${u.points} pts</div>
    `;
    container.appendChild(item);
  });
}

function loadSocialSubView(view) {
  $$(".social-subview").forEach(s => s.style.display = "none");
  $(`#social-subview-${view}`).style.display = "block";
  
  // Toggle buttons
  $("#btn-social-tab-ranking").className = view === "ranking" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
  $("#btn-social-tab-groups").className = view === "groups" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
}

// --- PRIVATE LIGAS / GROUPS ---
function renderPrivateGroups() {
  const container = $("#private-groups-list");
  const groups = JSON.parse(localStorage.getItem("matchzone_groups")) || [];
  
  const myGroups = groups.filter(g => g.members.includes(state.currentUser.email));
  
  if (myGroups.length === 0) {
    container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); text-align:center; padding:10px;">Você ainda não participa de nenhuma liga privada.</p>`;
    return;
  }
  
  container.innerHTML = "";
  myGroups.forEach(g => {
    const item = document.createElement("div");
    item.className = "glass-panel glass-panel-hover";
    item.style.padding = "12px 16px";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.style.cursor = "pointer";
    item.onclick = () => openGroupRanking(g.code);
    
    item.innerHTML = `
      <div>
        <h4 style="font-size:14px; font-weight:800;">${g.name}</h4>
        <small style="color:var(--text-muted); font-size:10px;">Código: ${g.code} • ${g.members.length} participantes</small>
      </div>
      <span style="color:var(--accent); font-weight:800; font-size:12px;">Ver Tabela ➔</span>
    `;
    container.appendChild(item);
  });
}

function createPrivateGroup() {
  const name = $("#create-group-name-input").value.trim();
  if (!name) {
    showToast("Escolha um nome para sua liga!");
    return;
  }
  
  const code = `MZ-${Math.floor(1000+Math.random()*9000)}`;
  const groups = JSON.parse(localStorage.getItem("matchzone_groups")) || [];
  
  const newGroup = {
    name,
    code,
    creator: state.currentUser.email,
    members: [state.currentUser.email]
  };
  
  groups.push(newGroup);
  localStorage.setItem("matchzone_groups", JSON.stringify(groups));
  $("#create-group-name-input").value = "";
  
  renderPrivateGroups();
  showToast(`Liga "${name}" criada com código ${code}!`);
  trackGAEvent("create_group", { group_code: code });
}

function joinPrivateGroup() {
  const code = $("#join-group-code-input").value.trim().toUpperCase();
  if (!code) {
    showToast("Digite o código de convite da liga!");
    return;
  }
  
  let groups = JSON.parse(localStorage.getItem("matchzone_groups")) || [];
  const gIndex = groups.findIndex(g => g.code === code);
  
  if (gIndex === -1) {
    showToast("Nenhuma liga encontrada com este código!");
    return;
  }
  
  if (groups[gIndex].members.includes(state.currentUser.email)) {
    showToast("Você já está participando desta liga!");
    return;
  }
  
  groups[gIndex].members.push(state.currentUser.email);
  localStorage.setItem("matchzone_groups", JSON.stringify(groups));
  $("#join-group-code-input").value = "";
  
  renderPrivateGroups();
  showToast(`Você entrou na liga "${groups[gIndex].name}"!`);
  trackGAEvent("join_group", { group_code: code });
}

function openGroupRanking(code) {
  const groups = JSON.parse(localStorage.getItem("matchzone_groups")) || [];
  const group = groups.find(g => g.code === code);
  if (!group) return;
  
  $("#group-details-panel").style.display = "block";
  $("#group-details-title").textContent = group.name;
  $("#group-details-code").textContent = group.code;
  
  const rankingList = $("#group-ranking-list");
  rankingList.innerHTML = "";
  
  const allUsers = JSON.parse(localStorage.getItem("matchzone_users")) || [];
  const groupMembers = allUsers.filter(u => group.members.includes(u.email));
  groupMembers.sort((a,b) => b.points - a.points);
  
  groupMembers.forEach((u, idx) => {
    const item = document.createElement("div");
    item.className = "leaderboard-item";
    item.style.padding = "10px 14px";
    item.innerHTML = `
      <div class="rank-badge">${idx + 1}</div>
      <div class="rank-user-info">
        <span class="name">${u.name}</span>
      </div>
      <div class="rank-score">${u.points} pts</div>
    `;
    rankingList.appendChild(item);
  });
}

function closeGroupDetailsPanel() {
  $("#group-details-panel").style.display = "none";
}

function shareAppStats() {
  if (navigator.share) {
    navigator.share({
      title: 'MatchZone Copa 2026',
      text: `Participe da minha liga no CopaCenter com o código: ${state.inviteCode}!`,
      url: window.location.href
    }).catch(err => console.log(err));
  } else {
    navigator.clipboard.writeText(`Participe da minha liga da Copa 2026 com o código: ${state.inviteCode}!`);
    showToast("Mensagem de convite copiada na área de transferência!");
  }
  trackGAEvent("share_curiosity", { type: "MatchZone Stats" });
}

// ==========================================================================
// 🇧🇷 LOGIC ENGINE: BRASIL NAS COPAS
// ==========================================================================

function renderBrasilDashboard() {
  // Sync favorites badge count
  $("#fav-counter-badge").textContent = `${state.favorites.length} itens salvos`;
}

function showBrasilSubView(view) {
  // Hide main dashboard
  $("#brasil-dashboard").style.display = "none";
  // Hide all subviews
  $$("[id^='subview-brasil-']").forEach(panel => panel.style.display = "none");
  // Show target
  const target = $(`#subview-brasil-${view}`);
  if (target) {
    target.style.display = "block";
    trackGAEvent("curiosity_view", { category: view });
  }

  // Handle specific renders
  if (view === "timeline") renderTimeline();
  if (view === "titulos") renderTitulos();
  if (view === "legends") renderLegends();
  if (view === "records") renderRecords();
  if (view === "moments") renderMoments();
  if (view === "trivia") renderTrivia();
  if (view === "favorites") renderFavorites();
}

function backToBrasilDashboard() {
  $$("[id^='subview-brasil-']").forEach(panel => panel.style.display = "none");
  $("#brasil-dashboard").style.display = "block";
  renderBrasilDashboard();
}

// --- RENDERS FOR EACH SUBVIEW ---

function renderTimeline() {
  const container = $("#brasil-timeline-list");
  container.innerHTML = "";
  
  BRASIL_TIMELINE.forEach(evt => {
    const node = document.createElement("div");
    node.className = `timeline-event-node ${evt.status === 'champion' ? 'champion' : ''}`;
    
    const isFav = state.favorites.includes(`timeline_${evt.year}`);
    
    node.innerHTML = `
      <div class="glass-panel timeline-body-card">
        <img class="timeline-img-cover" src="${evt.img}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600';" alt="Copa de ${evt.year}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <h4 style="font-size:16px; font-weight:900; color:var(--secondary);">${evt.year} - ${evt.pos}</h4>
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="toggleFavorite('timeline_${evt.year}', 'Linha do Tempo: Copa ${evt.year}')">
            <span style="color:${isFav ? 'var(--blood)' : 'var(--text-muted)'}; font-size:14px;">${isFav ? '❤️' : '🤍'}</span>
          </button>
        </div>
        <p style="font-size:12.5px; line-height:1.5; color:#cbd5e1; margin-bottom:8px;">${evt.desc}</p>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); border-top:1px solid var(--line); padding-top:8px;">
          <span>👔 Técnico: <strong>${evt.coach}</strong></span>
          <span>👑 Estrelas: <strong>${evt.stars}</strong></span>
        </div>
        <div style="margin-top:10px; display:flex; justify-content:flex-end;">
          <button class="btn btn-secondary btn-sm" style="padding:3px 6px; font-size:10px;" onclick="shareCuriosity('timeline_${evt.year}', '${evt.year} - ${evt.pos}: ${evt.desc}')">
            Compartilhar 🔗
          </button>
        </div>
      </div>
    `;
    container.appendChild(node);
  });
}

function renderTitulos() {
  const container = $("#brasil-titulos-list");
  container.innerHTML = "";
  
  BRASIL_TITULOS.forEach(tit => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "20px";
    card.style.borderLeft = "4px solid var(--secondary)";
    
    const isFav = state.favorites.includes(`titulo_${tit.year}`);
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span class="gold-star-badge">⭐️ Copa de ${tit.year}</span>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="toggleFavorite('titulo_${tit.year}', 'Campanha do Título: Copa ${tit.year}')">
            <span style="color:${isFav ? 'var(--blood)' : 'var(--text-muted)'}; font-size:14px;">${isFav ? '❤️' : '🤍'}</span>
          </button>
        </div>
      </div>
      
      <h4 style="font-size:16px; font-weight:900; color:#fff; margin-bottom:6px;">Sede: ${tit.country} | Final: ${tit.score}</h4>
      <p style="font-size:13px; color:#e2e8f0; line-height:1.5; margin-bottom:12px;">${tit.desc}</p>
      
      <div class="glass-panel" style="padding:12px; background:rgba(0,0,0,0.2); font-size:12px; margin-bottom:12px;">
        <strong style="color:var(--secondary); display:block; margin-bottom:4px;">💡 Fato Histórico Curioso:</strong>
        <p style="color:var(--text-muted); font-style:italic;">"${tit.trivia}"</p>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-muted);">
        <span>👔 Técnico: <strong>${tit.coach}</strong></span>
        <span>👑 Craques: <strong>${tit.stars}</strong></span>
      </div>
      
      <div style="margin-top:14px; display:flex; justify-content:flex-end;">
        <button class="btn btn-secondary btn-sm" style="padding:4px 10px;" onclick="shareCuriosity('titulo_${tit.year}', 'Título de ${tit.year} na sede ${tit.country}. Fato: ${tit.trivia}')">
          Compartilhar Conquista 🔗
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderLegends() {
  const container = $("#brasil-legends-list");
  container.innerHTML = "";
  
  BRASIL_LEGENDS.forEach(leg => {
    const card = document.createElement("div");
    card.className = "glass-panel legend-detail-card";
    
    const isFav = state.favorites.includes(`legend_${leg.name.toLowerCase().replace(/\s/g,'')}`);
    
    card.innerHTML = `
      <div class="legend-avatar-row">
        <img class="legend-avatar-img" src="${leg.photo}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600';" alt="${leg.name}">
        <div>
          <h4 style="font-size:18px; font-weight:900; color:#fff;">${leg.name}</h4>
          <span style="font-size:11px; color:var(--primary); font-weight:800; text-transform:uppercase;">🏆 Títulos: ${leg.trophies}</span>
        </div>
        <button class="btn btn-secondary btn-sm" style="padding:4px 8px; margin-left:auto;" onclick="toggleFavorite('legend_${leg.name.toLowerCase().replace(/\s/g,'')}', 'Jogador Lendário: ${leg.name}')">
          <span style="color:${isFav ? 'var(--blood)' : 'var(--text-muted)'}; font-size:14px;">${isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>
      
      <p style="font-size:13px; color:#cbd5e1; line-height:1.5;">${leg.desc}</p>
      
      <blockquote style="border-left:3px solid var(--accent); padding-left:12px; font-style:italic; font-size:12px; color:var(--text-muted);">
        "${leg.quote}"
      </blockquote>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; border-top:1px solid var(--line); padding-top:10px; font-size:11.5px; text-align:center;">
        <div>
          <span style="display:block; color:var(--text-muted); font-size:9px; text-transform:uppercase;">Copas</span>
          <strong>${leg.copas}</strong>
        </div>
        <div>
          <span style="display:block; color:var(--text-muted); font-size:9px; text-transform:uppercase;">Partidas</span>
          <strong>${leg.matches}</strong>
        </div>
        <div>
          <span style="display:block; color:var(--text-muted); font-size:9px; text-transform:uppercase;">Gols</span>
          <strong>${leg.goals}</strong>
        </div>
      </div>
      
      <div style="display:flex; justify-content:flex-end; margin-top:8px;">
        <button class="btn btn-secondary btn-sm" style="padding:3px 6px; font-size:10px;" onclick="shareCuriosity('legend_${leg.name}', 'Lenda: ${leg.name}. Estatísticas: ${leg.goals} gols em Copas. Descrição: ${leg.desc}')">
          Compartilhar Estatísticas 🔗
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderRecords() {
  const container = $("#brasil-records-list");
  container.innerHTML = "";
  
  BRASIL_RECORDS.forEach(rec => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:12px; font-weight:800; color:var(--accent); text-transform:uppercase;">${rec.title}</span>
        <span class="gold-star-badge" style="font-size:11px;">${rec.value}</span>
      </div>
      <p style="font-size:13px; color:#e2e8f0; line-height:1.4;">${rec.desc}</p>
    `;
    container.appendChild(card);
  });
}

function renderMoments() {
  const container = $("#brasil-moments-list");
  container.innerHTML = "";
  
  BRASIL_MOMENTS.forEach(mom => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    
    const isFav = state.favorites.includes(`moment_${mom.id}`);
    
    card.innerHTML = `
      <img src="${mom.img}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600';" alt="${mom.title}" style="width:100%; height:120px; border-radius:var(--radius-sm); object-fit:cover; margin-bottom:10px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <h4 style="font-size:15px; font-weight:900; color:var(--secondary);">${mom.title}</h4>
        <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="toggleFavorite('moment_${mom.id}', 'Momento: ${mom.title}')">
          <span style="color:${isFav ? 'var(--blood)' : 'var(--text-muted)'}; font-size:14px;">${isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>
      
      <p style="font-size:12.5px; color:#e2e8f0; line-height:1.4; margin-bottom:10px;">${mom.desc}</p>
      
      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-secondary btn-sm" style="padding:3px 6px; font-size:10px;" onclick="shareCuriosity('moment_${mom.id}', '${mom.title}: ${mom.desc}')">
          Compartilhar Momento 🔗
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderTrivia() {
  const container = $("#brasil-trivia-list");
  container.innerHTML = "";
  
  BRASIL_TRIVIA.forEach(triv => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    
    const isFav = state.favorites.includes(`trivia_${triv.title.toLowerCase().replace(/\s/g,'')}`);
    
    card.innerHTML = `
      <img src="${triv.img}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600';" alt="${triv.title}" style="width:100%; height:110px; border-radius:var(--radius-sm); object-fit:cover; margin-bottom:10px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div>
          <span style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; display:block;">${triv.type}</span>
          <h4 style="font-size:15px; font-weight:900; color:#fff;">${triv.title}</h4>
        </div>
        <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="toggleFavorite('trivia_${triv.title.toLowerCase().replace(/\s/g,'')}', 'Fato: ${triv.title}')">
          <span style="color:${isFav ? 'var(--blood)' : 'var(--text-muted)'}; font-size:14px;">${isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>
      
      <p style="font-size:12.5px; color:#cbd5e1; line-height:1.4; margin-bottom:10px;">${triv.desc}</p>
      
      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-secondary btn-sm" style="padding:3px 6px; font-size:10px;" onclick="shareCuriosity('trivia_${triv.title}', '${triv.title} (${triv.type}): ${triv.desc}')">
          Compartilhar Fato 🔗
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFavorites() {
  const container = $("#brasil-favorites-list");
  
  if (state.favorites.length === 0) {
    container.innerHTML = `<p style="font-size: 12.5px; color: var(--text-muted); text-align:center; padding:20px;">Nenhum item salvo nos seus favoritos do Brasil. Clique no ícone de coração nas curiosidades para salvar!</p>`;
    return;
  }
  
  container.innerHTML = "";
  
  const savedFavoritesMap = JSON.parse(localStorage.getItem("brasil_favorites_titles_map")) || {};
  
  state.favorites.forEach(favKey => {
    const title = savedFavoritesMap[favKey] || favKey;
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "14px 18px";
    card.style.display = "flex";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    
    card.innerHTML = `
      <div>
        <span style="font-size:10px; color:var(--secondary); text-transform:uppercase; font-weight:800; display:block;">Item Favoritado</span>
        <h4 style="font-size:13.5px; font-weight:800; color:#fff; margin-top:2px;">${title}</h4>
      </div>
      <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="toggleFavorite('${favKey}', '${title}')">
        <span style="color:var(--blood); font-size:14px;">❤️</span>
      </button>
    `;
    container.appendChild(card);
  });
}

// --- INTERACTIVE ACTIONS & HANDLERS FOR BRASIL COPAS ---

function toggleFavorite(key, title) {
  let favs = JSON.parse(localStorage.getItem("brasil_favorites_copa2026")) || [];
  let map = JSON.parse(localStorage.getItem("brasil_favorites_titles_map")) || {};
  
  const index = favs.indexOf(key);
  if (index === -1) {
    favs.push(key);
    map[key] = title;
    showToast("Adicionado aos favoritos do Brasil!");
    trackGAEvent("favorite_curiosity", { item_key: key, action: "add" });
  } else {
    favs.splice(index, 1);
    delete map[key];
    showToast("Removido dos favoritos!");
    trackGAEvent("favorite_curiosity", { item_key: key, action: "remove" });
  }
  
  localStorage.setItem("brasil_favorites_copa2026", JSON.stringify(favs));
  localStorage.setItem("brasil_favorites_titles_map", JSON.stringify(map));
  state.favorites = favs;
  
  // Re-render active subview
  renderBrasilDashboard();
  
  const currentSubView = $$("[id^='subview-brasil-']").find(panel => panel.style.display === "block");
  if (currentSubView) {
    const viewName = currentSubView.id.replace("subview-brasil-", "");
    showBrasilSubView(viewName);
  }
}

function shareCuriosity(key, text) {
  const formattedText = `🇧🇷 Brasil nas Copas no CopaCenter 2026 ⚽\n\n"${text}"`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Curiosidades do Brasil nas Copas',
      text: formattedText,
      url: window.location.href
    }).catch(err => console.log(err));
  } else {
    navigator.clipboard.writeText(formattedText);
    showToast("Curiosidade copiada para transferência!");
  }
  trackGAEvent("share_curiosity", { item_key: key });
}

// --- INTERACTIVE QUIZ LOGIC ---

function startQuizChallenge() {
  state.quizCurrentQuestion = 0;
  state.quizScore = 0;
  state.quizAnswers = [];
  
  $("#quiz-intro-box").style.display = "none";
  $("#quiz-score-box").style.display = "none";
  $("#quiz-play-box").style.display = "block";
  
  trackGAEvent("quiz_start");
  loadQuizQuestion();
}

function loadQuizQuestion() {
  const qIndex = state.quizCurrentQuestion;
  const question = QUIZ_QUESTIONS[qIndex];
  
  // Update progress UI
  $("#quiz-question-counter").textContent = `Pergunta ${qIndex + 1} de ${QUIZ_QUESTIONS.length}`;
  $("#quiz-score-badge").textContent = `Score: ${state.quizScore}`;
  
  const progressPercent = ((qIndex) / QUIZ_QUESTIONS.length) * 100;
  $("#quiz-progress-fill").style.width = `${progressPercent}%`;
  
  // Load content
  $("#quiz-question-emoji").textContent = question.emoji;
  $("#quiz-question-text").textContent = question.text;
  
  const optionsContainer = $("#quiz-options-container");
  optionsContainer.innerHTML = "";
  
  $("#quiz-feedback-box").style.display = "none";
  
  question.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.onclick = () => selectQuizAnswer(idx);
    optionsContainer.appendChild(btn);
  });
}

function selectQuizAnswer(selectedIndex) {
  const qIndex = state.quizCurrentQuestion;
  const question = QUIZ_QUESTIONS[qIndex];
  
  // Disable options
  const optionBtns = $$(".quiz-option-btn");
  optionBtns.forEach(btn => btn.disabled = true);
  
  const correct = selectedIndex === question.correct;
  
  // Highlight
  optionBtns[selectedIndex].classList.add(correct ? "correct" : "incorrect");
  optionBtns[question.correct].classList.add("correct");
  
  // Award score
  if (correct) {
    state.quizScore += 20;
    $("#quiz-score-badge").textContent = `Score: ${state.quizScore}`;
  }
  
  // Feedback
  const feedbackBox = $("#quiz-feedback-box");
  feedbackBox.style.display = "block";
  feedbackBox.style.background = correct ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)";
  feedbackBox.style.color = correct ? "var(--primary)" : "var(--blood)";
  feedbackBox.style.border = `1px solid ${correct ? 'var(--primary)' : 'var(--blood)'}`;
  
  feedbackBox.innerHTML = `
    <strong style="display:block; margin-bottom:4px;">${correct ? '⚽ RESPOSTA CORRETA!' : '❌ RESPOSTA ERRADA!'}</strong>
    <p style="font-size:11.5px; color:var(--text-main); font-weight:400; line-height:1.4;">${question.explanation}</p>
    <button class="btn btn-primary btn-sm" style="margin-top:10px; width:100%;" onclick="nextQuizStep()">
      ${qIndex === QUIZ_QUESTIONS.length - 1 ? 'Ver Resultado Final 🏆' : 'Próxima Pergunta ➔'}
    </button>
  `;
}

function nextQuizStep() {
  state.quizCurrentQuestion += 1;
  
  if (state.quizCurrentQuestion >= QUIZ_QUESTIONS.length) {
    showQuizScoreScreen();
  } else {
    loadQuizQuestion();
  }
}

function showQuizScoreScreen() {
  $("#quiz-play-box").style.display = "none";
  $("#quiz-score-box").style.display = "block";
  
  const correctCount = state.quizScore / 20;
  
  $("#quiz-final-performance-text").textContent = `Você acertou ${correctCount} de ${QUIZ_QUESTIONS.length} perguntas desafiadoras.`;
  $("#quiz-final-score-label").textContent = `${state.quizScore} pts`;
  
  // Save score locally to boost MatchZone profile
  if (state.currentUser) {
    let users = JSON.parse(localStorage.getItem("matchzone_users")) || [];
    const idx = users.findIndex(u => u.email === state.currentUser.email);
    if (idx !== -1) {
      users[idx].points += state.quizScore;
      state.currentUser.points = users[idx].points;
      localStorage.setItem("matchzone_users", JSON.stringify(users));
      localStorage.setItem("matchzone_session", JSON.stringify(state.currentUser));
      $("#profile-total-score").textContent = `${state.currentUser.points} pts`;
    }
  }
  
  trackGAEvent("quiz_complete", { score: state.quizScore });
}

// ==========================================================================
// 🧭 SPA ROUTER & VIEW NAVIGATION MANAGER
// ==========================================================================

function initAppRouter() {
  // Bind all nav links to dynamic view switcher
  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function navigateTo(viewId) {
  $$(".view-section").forEach(view => view.classList.remove("active"));
  const viewElement = $(`#view-${viewId}`);
  if (viewElement) {
    viewElement.classList.add("active");
    state.currentView = viewId;
    window.scrollTo(0, 0);
    
    // GA4 view logs
    trackGAEvent("page_view", { view_name: viewId });
    
    // Custom loading
    if (viewId === "home") renderHighlightMatches();
    if (viewId === "matches") renderFullMatches();
    if (viewId === "teams") renderTeamsGrid();
    if (viewId === "brasil") renderBrasilDashboard();
    if (viewId === "simulator") renderSimulatorGroups();
    if (viewId === "social") initSocialEngine();
  }
}

// ==========================================================================
// 📅 MATCHES & TOURNAMENT TABS RENDERS
// ==========================================================================

function renderHighlightMatches() {
  const container = $("#home-highlight-matches");
  container.innerHTML = "";
  
  const highlights = state.matches.filter(m => m.highlight);
  highlights.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel match-card";
    
    card.innerHTML = `
      <div class="match-header">
        <span>GRUPO ${m.group} • ${m.date}</span>
        <span class="match-status upcoming">Grupo</span>
      </div>
      <div class="match-teams">
        <div class="team-display left">
          <span class="team-name">${m.teamA}</span>
          <span class="team-flag">${m.flagA}</span>
        </div>
        <div class="score-display upcoming">
          ${m.time}
        </div>
        <div class="team-display right">
          <span class="team-flag">${m.flagB}</span>
          <span class="team-name">${m.teamB}</span>
        </div>
      </div>
      <div class="match-footer">
        <span><i data-lucide="map-pin" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> ${m.stadium}</span>
        <span>${m.time} BRT</span>
      </div>
    `;
    container.appendChild(card);
  });
  
  if (window.lucide) lucide.createIcons();
}

function renderFullMatches() {
  const container = $("#matches-list-container");
  container.innerHTML = "";
  
  state.matches.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel match-card";
    
    card.innerHTML = `
      <div class="match-header">
        <span>GRUPO ${m.group} • ${m.date} às ${m.time}</span>
        <span class="match-status upcoming">Aberto</span>
      </div>
      <div class="match-teams">
        <div class="team-display left">
          <span class="team-name">${m.teamA}</span>
          <span class="team-flag">${m.flagA}</span>
        </div>
        <div class="score-display upcoming">
          VS
        </div>
        <div class="team-display right">
          <span class="team-flag">${m.flagB}</span>
          <span class="team-name">${m.teamB}</span>
        </div>
      </div>
      <div class="match-footer">
        <span><i data-lucide="map-pin" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> ${m.stadium}</span>
        <span>BRT: ${m.time}</span>
      </div>
    `;
    container.appendChild(card);
  });
  
  if (window.lucide) lucide.createIcons();
}

// ==========================================================================
// 🛡️ TEAMS AND ROSTERS MODULE
// ==========================================================================

function renderTeamsGrid() {
  const container = $("#teams-grid-container");
  container.innerHTML = "";
  
  Object.values(state.teams).forEach(t => {
    const card = document.createElement("div");
    card.className = "glass-panel glass-panel-hover";
    card.style.padding = "16px";
    card.style.cursor = "pointer";
    card.onclick = () => showTeamDetails(t.id);
    
    card.innerHTML = `
      <div style="text-align: center;">
        <span style="font-size: 38px; display: block; margin-bottom: 8px;">${t.flag}</span>
        <h3 style="font-size: 15px; font-weight: 800; color: #fff;">${t.name}</h3>
        <small style="color: var(--text-muted); font-size: 10px; text-transform: uppercase;">Grupo ${t.group}</small>
      </div>
    `;
    container.appendChild(card);
  });
}

function showTeamDetails(teamId) {
  const team = state.teams[teamId];
  if (!team) return;
  
  $("#team-modal").style.display = "block";
  
  const titleRow = $("#modal-team-title-row");
  titleRow.innerHTML = `
    <span style="font-size: 32px;">${team.flag}</span>
    <div>
      <h3 style="font-size: 18px; font-weight: 900; color: #fff;">${team.name}</h3>
      <small style="color: var(--text-muted); font-size: 11px;">Técnico: ${team.coach}</small>
    </div>
  `;
  
  const body = $("#modal-team-body");
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: var(--radius-md);">
      <div>
        <span style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; display: block;">Vitórias</span>
        <strong style="font-size: 15px; color: var(--primary);">${team.stats.wins}</strong>
      </div>
      <div>
        <span style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; display: block;">Empates</span>
        <strong style="font-size: 15px; color:#fff;">${team.stats.draws}</strong>
      </div>
      <div>
        <span style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; display: block;">Derrotas</span>
        <strong style="font-size: 15px; color: var(--blood);">${team.stats.losses}</strong>
      </div>
    </div>
    
    <h4 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: var(--secondary); margin-bottom: 10px;">Escalação Provável</h4>
    <div class="roster-grid">
      ${team.roster.map(player => `
        <div class="roster-item">
          <span class="num">${player.num}</span>
          <div style="margin-left: 8px;">
            <span style="font-size: 12px; font-weight: 700; display: block; color: #fff;">${player.name}</span>
            <span style="font-size: 9px; color: var(--text-muted);">${player.pos}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function closeTeamModal() {
  $("#team-modal").style.display = "none";
}

// ==========================================================================
// 🔄 BRACKET AND GROUP SIMULATOR
// ==========================================================================

function renderSimulatorGroups() {
  const container = $("#simulator-groups-container");
  container.innerHTML = "";
  
  // Group C Simulator Display (Brasil showcase)
  const groupC = {
    name: "GRUPO C",
    teams: [
      { name: "Brasil", flag: "🇧🇷", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 },
      { name: "Croácia", flag: "🇭🇷", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 },
      { name: "Japão", flag: "🇯🇵", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 },
      { name: "Camarões", flag: "🇨🇲", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 }
    ]
  };
  
  const panel = document.createElement("div");
  panel.className = "glass-panel";
  panel.style.padding = "16px";
  
  panel.innerHTML = `
    <h4 style="font-size: 15px; font-weight: 800; color: var(--secondary); margin-bottom: 10px;">${groupC.name}</h4>
    
    <!-- Simulation inputs row -->
    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid var(--line); padding-bottom: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size:12px;">
        <span>🇧🇷 Brasil</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <input type="number" id="sim-c1-a" value="2" style="width:36px; text-align:center; height:28px; background:#000; border:1px solid var(--line); color:#fff; border-radius:4px; font-weight:800;" onchange="recalculateGroupCSimulation()">
          <span>x</span>
          <input type="number" id="sim-c1-b" value="0" style="width:36px; text-align:center; height:28px; background:#000; border:1px solid var(--line); color:#fff; border-radius:4px; font-weight:800;" onchange="recalculateGroupCSimulation()">
        </div>
        <span>🇭🇷 Croácia</span>
      </div>
      
      <div style="display: flex; align-items: center; justify-content: space-between; font-size:12px;">
        <span>🇯🇵 Japão</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <input type="number" id="sim-c2-a" value="1" style="width:36px; text-align:center; height:28px; background:#000; border:1px solid var(--line); color:#fff; border-radius:4px; font-weight:800;" onchange="recalculateGroupCSimulation()">
          <span>x</span>
          <input type="number" id="sim-c2-b" value="1" style="width:36px; text-align:center; height:28px; background:#000; border:1px solid var(--line); color:#fff; border-radius:4px; font-weight:800;" onchange="recalculateGroupCSimulation()">
        </div>
        <span>🇨🇲 Camarões</span>
      </div>
    </div>

    <table class="standings-table">
      <thead>
        <tr>
          <th style="text-align:left;">Seleção</th>
          <th>P</th>
          <th>V</th>
          <th>E</th>
          <th>SG</th>
        </tr>
      </thead>
      <tbody id="sim-standings-body">
        <!-- Recalculated dynamically -->
      </tbody>
    </table>
  `;
  
  container.appendChild(panel);
  recalculateGroupCSimulation();
  renderBracketSimulator();
}

function recalculateGroupCSimulation() {
  const g1A = parseInt($("#sim-c1-a")?.value || 0);
  const g1B = parseInt($("#sim-c1-b")?.value || 0);
  const g2A = parseInt($("#sim-c2-a")?.value || 0);
  const g2B = parseInt($("#sim-c2-b")?.value || 0);
  
  let teams = [
    { name: "Brasil", flag: "🇧🇷", p: 0, w: 0, d: 0, l: 0, sg: 0 },
    { name: "Croácia", flag: "🇭🇷", p: 0, w: 0, d: 0, l: 0, sg: 0 },
    { name: "Japão", flag: "🇯🇵", p: 0, w: 0, d: 0, l: 0, sg: 0 },
    { name: "Camarões", flag: "🇨🇲", p: 0, w: 0, d: 0, l: 0, sg: 0 }
  ];
  
  // Game 1: Brasil vs Croacia
  teams[0].sg += (g1A - g1B);
  teams[1].sg += (g1B - g1A);
  if (g1A > g1B) { teams[0].p += 3; teams[0].w += 1; teams[1].l += 1; }
  else if (g1B > g1A) { teams[1].p += 3; teams[1].w += 1; teams[0].l += 1; }
  else { teams[0].p += 1; teams[1].p += 1; teams[0].d += 1; teams[1].d += 1; }
  
  // Game 2: Japao vs Camaraos
  teams[2].sg += (g2A - g2B);
  teams[3].sg += (g2B - g2A);
  if (g2A > g2B) { teams[2].p += 3; teams[2].w += 1; teams[3].l += 1; }
  else if (g2B > g2A) { teams[3].p += 3; teams[3].w += 1; teams[2].l += 1; }
  else { teams[2].p += 1; teams[3].p += 1; teams[2].d += 1; teams[3].d += 1; }
  
  // Sort standings
  teams.sort((a, b) => b.p - a.p || b.sg - a.sg);
  
  const tbody = $("#sim-standings-body");
  if (tbody) {
    tbody.innerHTML = teams.map((t, idx) => `
      <tr class="${idx < 2 ? 'highlighted' : ''}">
        <td class="team-cell"><span>${t.flag}</span> ${t.name}</td>
        <td><strong>${t.p}</strong></td>
        <td>${t.w}</td>
        <td>${t.d}</td>
        <td>${t.sg > 0 ? '+' : ''}${t.sg}</td>
      </tr>
    `).join("");
  }
}

function renderBracketSimulator() {
  const container = $("#simulator-bracket-container");
  container.innerHTML = "";
  
  const bracket = [
    { phase: "OITAVAS DE FINAL", matches: [
      { tA: "Brasil 🇧🇷", tB: "Portugal 🇵🇹", status: "simulated" },
      { tA: "Argentina 🇦🇷", tB: "Croácia 🇭🇷", status: "simulated" }
    ]},
    { phase: "SEMIFINAIS", matches: [
      { tA: "Brasil 🇧🇷", tB: "Argentina 🇦🇷", status: "simulated" }
    ]}
  ];
  
  bracket.forEach(p => {
    const col = document.createElement("div");
    col.className = "bracket-phase";
    
    col.innerHTML = `
      <span style="font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 6px; display: block;">${p.phase}</span>
      ${p.matches.map(m => `
        <div class="glass-panel" style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; font-size:13px; font-weight:700;">
            <span>${m.tA}</span>
            <input type="number" value="2" style="width:28px; text-align:center; background:#000; border:1px solid var(--line); color:#fff; border-radius:4px;">
          </div>
          <div style="display: flex; justify-content: space-between; font-size:13px; font-weight:700;">
            <span>${m.tB}</span>
            <input type="number" value="1" style="width:28px; text-align:center; background:#000; border:1px solid var(--line); color:#fff; border-radius:4px;">
          </div>
        </div>
      `).join("")}
    `;
    container.appendChild(col);
  });
}

function resetSimulation() {
  $("#sim-c1-a").value = 0;
  $("#sim-c1-b").value = 0;
  $("#sim-c2-a").value = 0;
  $("#sim-c2-b").value = 0;
  recalculateGroupCSimulation();
  showToast("Simulador reiniciado!");
  trackGAEvent("reset_simulation");
}

// ==========================================================================
// ⏰ REALTIME COUNTDOWN SYSTEM
// ==========================================================================

function initCountdown() {
  const targetDate = new Date("June 11, 2026 20:00:00").getTime();
  
  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      $("#countdown-timer").textContent = "Copa de 2026 Iniciada! ⚽";
      return;
    }
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    const dStr = d.toString().padStart(2, "0");
    const hStr = h.toString().padStart(2, "0");
    const mStr = m.toString().padStart(2, "0");
    const sStr = s.toString().padStart(2, "0");
    
    const display = $("#countdown-timer");
    if (display) {
      display.textContent = `${dStr}d ${hStr}h ${mStr}m ${sStr}s`;
    }
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// --- GLOBAL TOAST NOTIFICATION ---
function showToast(msg) {
  const toast = $("#system-toast");
  if (toast) {
    toast.textContent = msg;
    toast.classList.add("show");
    
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// ==========================================================================
// 🚀 APP START INITIALIZER
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initAppRouter();
  initCountdown();
  renderHighlightMatches();
  renderBrasilDashboard();
  
  if (window.lucide) lucide.createIcons();
  
  // Track App Session Boot
  trackGAEvent("app_session_start", { platform: "Web/PWA" });
});

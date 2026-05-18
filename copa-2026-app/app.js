/**
 * CopaCenter 2026 - SPA Engine Core Logic
 * Suporte completo para PWA, Simulações, Estádios, 48 Seleções, 104 Partidas e MatchZone.
 */

// ==========================================
// 📊 TELEMETRY / ANALYTICS
// ==========================================
function trackGAEvent(eventName, params = {}) {
  console.log(`[GA4 Event] ${eventName}:`, params);
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

// ==========================================
// 🏟️ STADIUMS DATABASE (16 Host Venues)
// ==========================================
const STADIUMS = [
  { id: 1, name: "Estádio Azteca", city: "Cidade do México", country: "México", capacity: 87523, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80", timezone: -3, curiosity: "Primeiro estádio a sediar três aberturas de Copa do Mundo (1970, 1986, 2026)." },
  { id: 2, name: "MetLife Stadium", city: "Nova York/Nova Jersey", country: "EUA", capacity: 82500, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80", timezone: -1, curiosity: "Palco escolhido pela FIFA para receber a Grande Final no dia 19 de Julho de 2026." },
  { id: 3, name: "AT&T Stadium", city: "Dallas (Arlington)", country: "EUA", capacity: 80000, image: "https://images.unsplash.com/photo-1595111028552-f61546741491?w=600&auto=format&fit=crop&q=80", timezone: -2, curiosity: "Possui uma das maiores telas de LED suspensas do mundo no centro do teto retrátil." },
  { id: 4, name: "Arrowhead Stadium", city: "Kansas City", country: "EUA", capacity: 76416, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80", timezone: -2, curiosity: "Registrado no Guinness Book como o estádio mais barulhento do planeta em torcida." },
  { id: 5, name: "NRG Stadium", city: "Houston", country: "EUA", capacity: 72220, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80", timezone: -2, curiosity: "Famoso por seu teto retrátil e por sediar grandes edições do Super Bowl." },
  { id: 6, name: "Mercedes-Benz Stadium", city: "Atlanta", country: "EUA", capacity: 71000, image: "https://images.unsplash.com/photo-1595111028552-f61546741491?w=600&auto=format&fit=crop&q=80", timezone: -1, curiosity: "Inovador design arquitetônico com teto retrátil de pétalas e sustentabilidade selo Platina." },
  { id: 7, name: "SoFi Stadium", city: "Los Angeles", country: "EUA", capacity: 70240, image: "https://images.unsplash.com/photo-1595111028552-f61546741491?w=600&auto=format&fit=crop&q=80", timezone: -4, curiosity: "O mais moderno estádio do mundo, com tela dupla face infinita de 360 graus. Palco de estreia do Brasil." },
  { id: 8, name: "Lumen Field", city: "Seattle", country: "EUA", capacity: 69000, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80", timezone: -4, curiosity: "Famoso por sua acústica que projeta e amplifica o rugido da torcida local." },
  { id: 9, name: "Levi's Stadium", city: "São Francisco (Santa Clara)", country: "EUA", capacity: 68500, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80", timezone: -4, curiosity: "Localizado no coração do Vale do Silício, com ampla infraestrutura tecnológica ecológica." },
  { id: 10, name: "Lincoln Financial Field", city: "Filadélfia", country: "EUA", capacity: 69796, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80", timezone: -1, curiosity: "Equipado com centenas de painéis solares e turbinas eólicas cobrindo parte da energia." },
  { id: 11, name: "Gillette Stadium", city: "Boston (Foxborough)", country: "EUA", capacity: 65878, image: "https://images.unsplash.com/photo-1595111028552-f61546741491?w=600&auto=format&fit=crop&q=80", timezone: -1, curiosity: "Sede histórica de grandes decisões e do New England Patriots da NFL." },
  { id: 12, name: "Hard Rock Stadium", city: "Miami", country: "EUA", capacity: 64767, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80", timezone: -1, curiosity: "Palco de shows globais, finais de tênis de Miami e do Grande Prêmio de Fórmula 1." },
  { id: 13, name: "BC Place", city: "Vancouver", country: "Canadá", capacity: 54500, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80", timezone: -4, curiosity: "Maior estádio coberto do oeste canadense, com belíssima vista para a baía." },
  { id: 14, name: "Estadio Akron", city: "Guadalajara", country: "México", capacity: 48071, image: "https://images.unsplash.com/photo-1595111028552-f61546741491?w=600&auto=format&fit=crop&q=80", timezone: -3, curiosity: "Design futurista simulando um vulcão verde coroado por uma nuvem flutuante." },
  { id: 15, name: "Estadio BBVA", city: "Monterrey", country: "México", capacity: 53500, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80", timezone: -3, curiosity: "Apelidado de 'Gigante de Aço', possui vista magnífica para a montanha Cerro de la Silla." },
  { id: 16, name: "BMO Field", city: "Toronto", country: "Canadá", capacity: 45736, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80", timezone: -1, curiosity: "Localizado no Exhibition Place, expandido com novas arquibancadas para a Copa de 2026." }
];

// ==========================================
// 🌎 48 CLASSIFIED TEAMS DATABASE
// ==========================================
const TEAMS = [
  { name: "Estados Unidos", flag: "🇺🇸", group: "A", region: "North America", rating: 7.8, coach: "Gregg Berhalter", history: "11 participações, semifinalista em 1930", curiosity: "Co-anfitrião do torneio pela segunda vez e com geração jovem na Europa." },
  { name: "México", flag: "🇲🇽", group: "A", region: "North America", rating: 7.5, coach: "Javier Aguirre", history: "17 participações, quartas em 70 e 86", curiosity: "Primeiro país a sediar a Copa pela terceira vez na história." },
  { name: "Canadá", flag: "🇨🇦", group: "A", region: "North America", rating: 7.2, coach: "Jesse Marsch", history: "2 participações", curiosity: "Busca sua primeira vitória e gol histórico em mundiais masculinos." },
  { name: "Marrocos", flag: "🇲🇦", group: "A", region: "Africa", rating: 8.5, coach: "Walid Regragui", history: "6 participações, 4º lugar em 2022", curiosity: "Primeira seleção africana a atingir a semifinal de uma Copa do Mundo." },
  
  { name: "Brasil", flag: "🇧🇷", group: "B", region: "South America", rating: 9.2, coach: "Dorival Júnior", history: "22 participações, único penta-campeão", curiosity: "Único país a disputar absolutamente todas as Copas do Mundo." },
  { name: "Croácia", flag: "🇭🇷", group: "B", region: "Europe", rating: 8.3, coach: "Zlatko Dalić", history: "6 participações, vice-campeã em 2018", curiosity: "Famosos pelo espírito de resiliência extrema em prorrogações e pênaltis." },
  { name: "Camarões", flag: "🇨🇲", group: "B", region: "Africa", rating: 7.0, coach: "Marc Brys", history: "8 participações, quartas em 1990", curiosity: "Lendários Leões Indomáveis, pioneiros do futebol africano nas Copas." },
  { name: "Japão", flag: "🇯🇵", group: "B", region: "Asia", rating: 8.1, coach: "Hajime Moriyasu", history: "7 participações, oitavas de final", curiosity: "Reconhecidos pela inteligência tática rápida e torcedores exemplares." },

  { name: "Argentina", flag: "🇦🇷", group: "C", region: "South America", rating: 9.5, coach: "Lionel Scaloni", history: "18 participações, tricampeã (1978, 1986, 2022)", curiosity: "Atual detentora do título da Copa do Mundo FIFA." },
  { name: "Portugal", flag: "🇵🇹", group: "C", region: "Europe", rating: 8.9, coach: "Roberto Martínez", history: "8 participações, 3º lugar em 1966", curiosity: "Equipe com enorme talento técnico, sob o comando do craque Cristiano Ronaldo." },
  { name: "Senegal", flag: "🇸🇳", group: "C", region: "Africa", rating: 7.9, coach: "Aliou Cissé", history: "3 participações, quartas em 2002", curiosity: "Força física e velocidade notáveis no continente africano." },
  { name: "Uzbequistão", flag: "🇺🇿", group: "C", region: "Asia", rating: 6.8, coach: "Srečko Katanec", history: "Estreante", curiosity: "Primeira classificação histórica do país após excelente campanha asiática." },

  { name: "França", flag: "🇫🇷", group: "D", region: "Europe", rating: 9.4, coach: "Didier Deschamps", history: "16 participações, bicampeã (1998, 2018)", curiosity: "Vice-campeã em 2022 e possuidora de um elenco extremamente veloz." },
  { name: "Alemanha", flag: "🇩🇪", group: "D", region: "Europe", rating: 9.0, coach: "Julian Nagelsmann", history: "20 participações, tetracampeã", curiosity: "Consistência tática formidável e poder mental consolidado." },
  { name: "Coreia do Sul", flag: "🇰🇷", group: "D", region: "Asia", rating: 7.4, coach: "Hong Myung-bo", history: "11 participações, 4º lugar em 2002", curiosity: "Futebol rápido e disciplinado, liderado pelo capitão Son Heung-min." },
  { name: "Jamaica", flag: "🇯🇲", group: "D", region: "North America", rating: 6.5, coach: "Steve McClaren", history: "1 participação (1998)", curiosity: "Conhecidos como os animados Reggae Boyz do Caribe." },

  { name: "Espanha", flag: "🇪🇸", group: "E", region: "Europe", rating: 9.1, coach: "Luis de la Fuente", history: "16 participações, campeã (2010)", curiosity: "Campeã da Eurocopa recente com futebol envolvente de posse de bola." },
  { name: "Itália", flag: "🇮🇹", group: "E", region: "Europe", rating: 8.4, coach: "Luciano Spalletti", history: "18 participações, tetracampeã", curiosity: "Famosa defesa sólida histórica que busca ressurgir no cenário mundial." },
  { name: "Nigéria", flag: "🇳🇬", group: "E", region: "Africa", rating: 7.7, coach: "José Peseiro", history: "6 participações, oitavas de final", curiosity: "As Super Águias detêm uma das torcidas mais vibrantes do planeta." },
  { name: "Costa Rica", flag: "🇨🇷", group: "E", region: "North America", rating: 6.9, coach: "Gustavo Alfaro", history: "6 participações, quartas em 2014", curiosity: "Espírito guerreiro pautado no lema nacional 'Pura Vida'." },

  { name: "Inglaterra", flag: "🏴", group: "F", region: "Europe", rating: 9.2, coach: "Thomas Tuchel", history: "16 participações, campeã (1966)", curiosity: "Inventores do futebol moderno e donos da prestigiada Premier League." },
  { name: "Holanda", flag: "🇳🇱", group: "F", region: "Europe", rating: 8.7, coach: "Ronald Koeman", history: "11 participações, 3 vezes vice-campeã", curiosity: "A Laranja Mecânica busca seu primeiro e inédito título mundial." },
  { name: "Egito", flag: "🇪🇬", group: "F", region: "Africa", rating: 7.3, coach: "Hossam Hassan", history: "3 participações", curiosity: "Sede dos Faraós do futebol africano, liderados por Mohamed Salah." },
  { name: "Honduras", flag: "🇭🇳", group: "F", region: "North America", rating: 6.4, coach: "Reinaldo Rueda", history: "3 participações", curiosity: "Conhecidos pela raça guerreira e garra física nos duelos da Concacaf." },

  { name: "Bélgica", flag: "🇧🇪", group: "G", region: "Europe", rating: 8.2, coach: "Domenico Tedesco", history: "14 participações, 3º em 2018", curiosity: "Os Diabos Vermelhos buscam renovar sua outrora Geração de Ouro." },
  { name: "Uruguai", flag: "🇺🇾", group: "G", region: "South America", rating: 8.8, coach: "Marcelo Bielsa", history: "14 participações, bicampeã (1930, 1950)", curiosity: "Garra Charrua lendária sob o comando dinâmico de 'El Loco' Bielsa." },
  { name: "Argélia", flag: "🇩🇿", group: "G", region: "Africa", rating: 7.2, coach: "Vladimir Petković", history: "4 participações, oitavas em 2014", curiosity: "A Raposa do Deserto conta com toque de bola extremamente técnico." },
  { name: "Panamá", flag: "🇵🇦", group: "G", region: "North America", rating: 6.7, coach: "Thomas Christiansen", history: "1 participação (2018)", curiosity: "Forte evolução física e tática nas eliminatórias das Américas." },

  { name: "Colômbia", flag: "🇨🇴", group: "H", region: "South America", rating: 8.6, coach: "Néstor Lorenzo", history: "6 participações, quartas em 2014", curiosity: "Futebol ofensivo, vistoso e alegre conhecido como 'Los Cafeteros'." },
  { name: "Equador", flag: "🇪🇨", group: "H", region: "South America", rating: 7.9, coach: "Sebastián Beccacece", history: "4 participações, oitavas em 2006", curiosity: "Grande explosão física e defensiva de novos jovens atletas europeus." },
  { name: "Tunísia", flag: "🇹🇳", group: "H", region: "Africa", rating: 6.9, coach: "Jalel Kadri", history: "6 participações", curiosity: "Conhecidos pelo ferrolho tático disciplinado e sólida organização." },
  { name: "Nova Zelândia", flag: "🇳🇿", group: "H", region: "Oceania", rating: 6.3, coach: "Darren Bazeley", history: "2 participações", curiosity: "Os All Whites buscam fazer bonito no mundial como líderes da Oceania." },

  { name: "Paraguai", flag: "🇵🇾", group: "I", region: "South America", rating: 7.1, coach: "Gustavo Alfaro", history: "8 participações, quartas em 2010", curiosity: "Especialistas lendários em jogo aéreo e sistemas de retranca sólida." },
  { name: "Chile", flag: "🇨🇱", group: "I", region: "South America", rating: 7.2, coach: "Ricardo Gareca", history: "9 participações, 3º em 1962", curiosity: "A seleção de 'La Roja' busca reerguer seu prestígio histórico." },
  { name: "Costa do Marfim", flag: "🇨🇮", group: "I", region: "Africa", rating: 7.8, coach: "Emerse Faé", history: "3 participações", curiosity: "Atuais campeões da Copa Africana de Nações em campanha de viradas épicas." },
  { name: "Irã", flag: "🇮🇷", group: "I", region: "Asia", rating: 7.5, coach: "Amir Ghalenoei", history: "6 participações", curiosity: "Um dos sistemas defensivos mais organizados e eficazes do futebol asiático." },

  { name: "Venezuela", flag: "🇻🇪", group: "J", region: "South America", rating: 7.2, coach: "Fernando Batista", history: "Estreante", curiosity: "Buscam classificação histórica na esteira do crescimento da Liga Vinotinto." },
  { name: "Peru", flag: "🇵🇪", group: "J", region: "South America", rating: 6.8, coach: "Jorge Fossati", history: "5 participações, quartas em 1970", curiosity: "Famosos por sua torcida espetacular eleita a melhor do planeta em 2018." },
  { name: "Gana", flag: "🇬🇭", group: "J", region: "Africa", rating: 7.4, coach: "Otto Addo", history: "4 participações, quartas em 2010", curiosity: "Estrelas Negras, marcados por duelos dramáticos na história das Copas." },
  { name: "Austrália", flag: "🇦🇺", group: "J", region: "Asia", rating: 7.3, coach: "Tony Popovic", history: "6 participações, oitavas em 2006 e 22", curiosity: "Migraram para a federação asiática visando aprimoramento de alto nível." },

  { name: "Bolívia", flag: "🇧🇴", group: "K", region: "South America", rating: 6.1, coach: "Oscar Villegas", history: "3 participações", curiosity: "Velozes e letais atuando nos altiplanos geográficos." },
  { name: "Iraque", flag: "🇮🇶", group: "K", region: "Asia", rating: 6.8, coach: "Jesús Casas", history: "1 participação (1986)", curiosity: "Conhecidos na Ásia como os valentes Leões da Mesopotâmia." },
  { name: "África do Sul", flag: "🇿🇦", group: "K", region: "Africa", rating: 7.1, coach: "Hugo Broos", history: "3 participações", curiosity: "Os Bafana Bafana trouxeram a magia das vuvuzelas ao mundo em 2010." },
  { name: "Arábia Saudita", flag: "🇸🇦", group: "K", region: "Asia", rating: 7.2, coach: "Roberto Mancini", history: "6 participações, oitavas em 1994", curiosity: "Causaram o maior choque de 2022 ao derrotar a campeã Argentina na estreia." },

  { name: "Catar", flag: "🇶🇦", group: "L", region: "Asia", rating: 7.0, coach: "Tintín Márquez", history: "1 participação (2022)", curiosity: "Bicampeões recentes da Copa da Ásia com bom jogo de conjunto." },
  { name: "Play-off Europa A", flag: "🇪🇺", group: "L", region: "Europe", rating: 7.5, coach: "UEFA repescagem", history: "A definir", curiosity: "Vaga reservada para a conclusão das dramáticas repescagens europeias." },
  { name: "Play-off Intercontinental A", flag: "🌎", group: "L", region: "Americas", rating: 7.0, coach: "FIFA repescagem", history: "A definir", curiosity: "Vencedor das eliminatórias intercontinentais finais da FIFA." },
  { name: "Play-off Intercontinental B", flag: "🌍", group: "L", region: "World", rating: 7.0, coach: "FIFA repescagem", history: "A definir", curiosity: "Vencedor da chave B dos mata-matas globais intercontinentais." }
];

// ==========================================
// ⚽ 104 MATCHES DATABASE GENERATOR
// ==========================================
let MATCHES = [];
const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function generate104Matches() {
  MATCHES = [];
  let matchId = 1;
  let currentDate = new Date("2026-06-11");
  
  // 1. Group Stage: 72 Matches (12 groups * 6 matches)
  groupsList.forEach((groupLetter) => {
    const groupTeams = TEAMS.filter(t => t.group === groupLetter);
    if (groupTeams.length !== 4) return;
    
    // 6 Matches per group standard schedule order
    const matchOrder = [
      { home: groupTeams[0], away: groupTeams[1] },
      { home: groupTeams[2], away: groupTeams[3] },
      { home: groupTeams[0], away: groupTeams[3] },
      { home: groupTeams[1], away: groupTeams[2] },
      { home: groupTeams[0], away: groupTeams[2] },
      { home: groupTeams[1], away: groupTeams[3] }
    ];
    
    matchOrder.forEach((pair, idx) => {
      // Rotate through our 16 stadiums
      const stadium = STADIUMS[(matchId - 1) % STADIUMS.length];
      
      // Setup schedule times and conversion BRT
      const localTime = idx % 2 === 0 ? "16:00" : "19:00";
      const localHours = parseInt(localTime.split(":")[0]);
      
      // BRT conversion based on timezone
      let brtHours = localHours - stadium.timezone;
      if (brtHours >= 24) brtHours -= 24;
      const brtTime = `${String(brtHours).padStart(2, "0")}:00`;

      // Date increment every 4 matches to span June 11 to 27
      const dateStr = currentDate.toISOString().split("T")[0];
      if (matchId % 4 === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Pre-simulate realistic initial goals based on rating
      const ratingDiff = pair.home.rating - pair.away.rating;
      let homeScore = Math.floor(Math.random() * 3);
      let awayScore = Math.floor(Math.random() * 3);
      if (ratingDiff > 1.5) homeScore += 1;
      if (ratingDiff < -1.5) awayScore += 1;

      MATCHES.push({
        id: matchId++,
        phase: "grupos",
        group: groupLetter,
        homeTeam: pair.home.name,
        awayTeam: pair.away.name,
        homeFlag: pair.home.flag,
        awayFlag: pair.away.flag,
        homeScore: homeScore,
        awayScore: awayScore,
        date: dateStr,
        localTime: localTime,
        brtTime: brtTime,
        stadium: stadium.name,
        city: stadium.city,
        status: "finished" // pre-populated with realistic simulator state
      });
    });
  });

  // 2. Knockout Stage: 32 Matches
  // 2.1 Round of 32 (16 matches: 32avos) - June 28 to July 3
  const r32Stadiums = STADIUMS.slice(0, 16);
  for (let i = 1; i <= 16; i++) {
    const stadium = r32Stadiums[(i - 1) % r32Stadiums.length];
    MATCHES.push({
      id: matchId++,
      phase: "32avos",
      homeTeam: `1º Grupo ${groupsList[(i - 1) % 12]}`,
      awayTeam: `2º Grupo ${groupsList[(i + 3) % 12]}`,
      homeFlag: "🏆",
      awayFlag: "🏆",
      homeScore: null,
      awayScore: null,
      date: `2026-06-${27 + Math.ceil(i/3)}`,
      localTime: "17:00",
      brtTime: `${17 - stadium.timezone}:00`,
      stadium: stadium.name,
      city: stadium.city,
      status: "upcoming"
    });
  }

  // 2.2 Round of 16 (8 matches: oitavas) - July 4 to July 7
  for (let i = 1; i <= 8; i++) {
    const stadium = STADIUMS[i % STADIUMS.length];
    MATCHES.push({
      id: matchId++,
      phase: "oitavas",
      homeTeam: `Vencedor 16avos ${i * 2 - 1}`,
      awayTeam: `Vencedor 16avos ${i * 2}`,
      homeFlag: "⚽",
      awayFlag: "⚽",
      homeScore: null,
      awayScore: null,
      date: `2026-07-0${3 + Math.ceil(i/2)}`,
      localTime: "18:00",
      brtTime: `${18 - stadium.timezone}:00`,
      stadium: stadium.name,
      city: stadium.city,
      status: "upcoming"
    });
  }

  // 2.3 Quarterfinals (4 matches: quartas) - July 9 to July 11
  for (let i = 1; i <= 4; i++) {
    const stadium = STADIUMS[i + 4];
    MATCHES.push({
      id: matchId++,
      phase: "quartas",
      homeTeam: `Vencedor Oitavas ${i * 2 - 1}`,
      awayTeam: `Vencedor Oitavas ${i * 2}`,
      homeFlag: "🏆",
      awayFlag: "🏆",
      homeScore: null,
      awayScore: null,
      date: `2026-07-0${8 + Math.ceil(i/2)}`,
      localTime: "16:00",
      brtTime: `${16 - stadium.timezone}:00`,
      stadium: stadium.name,
      city: stadium.city,
      status: "upcoming"
    });
  }

  // 2.4 Semifinals (2 matches: semis) - July 14 & 15
  for (let i = 1; i <= 2; i++) {
    const stadium = STADIUMS[i + 8];
    MATCHES.push({
      id: matchId++,
      phase: "semis",
      homeTeam: `Vencedor Quartas ${i * 2 - 1}`,
      awayTeam: `Vencedor Quartas ${i * 2}`,
      homeFlag: "👑",
      awayFlag: "👑",
      homeScore: null,
      awayScore: null,
      date: `2026-07-${13 + i}`,
      localTime: "19:00",
      brtTime: `${19 - stadium.timezone}:00`,
      stadium: stadium.name,
      city: stadium.city,
      status: "upcoming"
    });
  }

  // 2.5 3rd Place Play-off - July 18
  const stadium3rd = STADIUMS[11];
  MATCHES.push({
    id: matchId++,
    phase: "final",
    homeTeam: "Perdedor Semifinal 1",
    awayTeam: "Perdedor Semifinal 2",
    homeFlag: "🥉",
    awayFlag: "🥉",
    homeScore: null,
    awayScore: null,
    date: "2026-07-18",
    localTime: "15:00",
    brtTime: `${15 - stadium3rd.timezone}:00`,
    stadium: stadium3rd.name,
    city: stadium3rd.city,
    status: "upcoming"
  });

  // 2.6 Grande Final - July 19
  const stadiumFinal = STADIUMS[1]; // MetLife
  MATCHES.push({
    id: matchId++,
    phase: "final",
    homeTeam: "Vencedor Semifinal 1",
    awayTeam: "Vencedor Semifinal 2",
    homeFlag: "🏆",
    awayFlag: "🏆",
    homeScore: null,
    awayScore: null,
    date: "2026-07-19",
    localTime: "16:00",
    brtTime: `${16 - stadiumFinal.timezone}:00`,
    stadium: stadiumFinal.name,
    city: stadiumFinal.city,
    status: "upcoming"
  });
}

// Load / Save predictions from localStorage
function savePredictionsToStorage() {
  localStorage.setItem("copa_2026_matches", JSON.stringify(MATCHES));
}

function loadPredictionsFromStorage() {
  const stored = localStorage.getItem("copa_2026_matches");
  if (stored) {
    MATCHES = JSON.parse(stored);
  } else {
    generate104Matches();
    savePredictionsToStorage();
  }
}

// ==========================================
// 💡 BRASIL NAS COPAS ENRICHED DATA
// ==========================================
const BRASIL_TIMELINE = [
  { year: 1950, city: "Rio de Janeiro, Brasil", result: "Vice-campeão", coach: "Flávio Costa", stars: "Ademir de Menezes, Zizinho", desc: "A trágica perda do título no Maracanã perante 200 mil pessoas no histórico Maracanazo.", trivia: "Primeira vez que o Brasil jogou de camisas brancas e gola azul nas Copas.", champion: false, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 1958, city: "Estocolmo, Suécia", result: "Campeão 🏆", coach: "Vicente Feola", stars: "Pelé (17 anos), Garrincha, Didi", desc: "A afirmação mundial. Pelé encanta o mundo e o Brasil conquista seu primeiro título de azul.", trivia: "A delegação comprou camisas azuis no comércio local e costurou os escudos na véspera da final.", champion: true, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 1962, city: "Santiago, Chile", result: "Bicampeão 🏆", coach: "Aymoré Moreira", stars: "Garrincha, Amarildo, Didi", desc: "Mesmo com a lesão precoce de Pelé, Garrincha assume o protagonismo absoluto e guia ao bi.", trivia: "Amarildo substituiu Pelé de forma primorosa, sendo apelidado de 'Possesso'.", champion: true, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 1970, city: "Cidade do México, México", result: "Tricampeão 🏆", coach: "Mário Zagallo", stars: "Pelé, Tostão, Rivellino, Jairzinho", desc: "Considerada a maior seleção de todos os tempos. Futebol arte absoluto e posse definitiva da taça Jules Rimet.", trivia: "Jairzinho marcou gols em absolutamente todas as partidas do torneio, o 'Furacão da Copa'.", champion: true, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 1982, city: "Barcelona, Espanha", result: "5º Lugar", coach: "Telê Santana", stars: "Zico, Sócrates, Falcão, Cerezo", desc: "A seleção que encantou o planeta com futebol ofensivo lírico, eliminada pela Itália na Tragédia do Sarriá.", trivia: "Mesmo sem vencer, é lembrada globalmente como um dos times mais brilhantes da história do esporte.", champion: false, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 1994, city: "Los Angeles, EUA", result: "Tetracampeão 🏆", coach: "Carlos Alberto Parreira", stars: "Romário, Bebeto, Dunga, Taffarel", desc: "Fim do jejum de 24 anos. Conquista dramática nos pênaltis contra a Itália após o 0x0 na prorrogação.", trivia: "Bebeto celebrou seu gol contra a Holanda emulando um 'ninar de bebê' que virou febre mundial.", champion: true, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 2002, city: "Yokohama, Japão/Coreia", result: "Pentacampeão 🏆", coach: "Luiz Felipe Scolari", stars: "Ronaldo, Rivaldo, Ronaldinho, Cafu", desc: "A redenção do Fenômeno. Campanha com 100% de aproveitamento (7 vitórias) batendo a Alemanha na final.", trivia: "Ronaldo cortou o cabelo no estilo 'Cascão' para desviar a atenção da imprensa sobre sua lesão física.", champion: true, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 2014, city: "Belo Horizonte, Brasil", result: "4º Lugar", coach: "Luiz Felipe Scolari", stars: "Neymar, Thiago Silva, Oscar", desc: "O fatídico vexame do 7x1 contra a Alemanha nas semifinais jogando em casa.", trivia: "O maior trauma desportivo brasileiro desde o Maracanazo de 1950.", champion: false, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { year: 2022, city: "Doha, Catar", result: "7º Lugar", coach: "Tite", stars: "Neymar, Richarlison, Casemiro", desc: "Eliminação dramática nos pênaltis nas quartas para a Croácia após sofrer empate aos 116 minutos.", trivia: "Richarlison marcou um golaço de voleio contra a Sérvia, eleito o mais bonito da Copa.", champion: false, image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" }
];

const BRASIL_TITULOS = [
  { year: "1958", location: "Suécia", final: "Brasil 5 x 2 Suécia", stars: "Pelé, Garrincha, Vavá, Zagallo", curiosity: "Primeira Copa de Pelé com apenas 17 anos.", fact: "Vicente Feola montou o primeiro esquema 4-2-4 moderno." },
  { year: "1962", location: "Chile", final: "Brasil 3 x 1 Tchecoslováquia", stars: "Garrincha, Amarildo, Zito, Mauro", curiosity: "Garrincha jogou a semifinal com febre alta e foi aclamado de forma unânime.", fact: "Amarildo substituiu Pelé de forma avassaladora." },
  { year: "1970", location: "México", final: "Brasil 4 x 1 Itália", stars: "Pelé, Tostão, Rivellino, Jairzinho, Carlos Alberto", curiosity: "Pelé marcou o centésimo gol do Brasil em Copas na finalíssima.", fact: "Zagallo tornou-se o primeiro a ser campeão como jogador e técnico." },
  { year: "1994", location: "Estados Unidos", final: "Brasil 0 (3) x (2) 0 Itália", stars: "Romário, Bebeto, Dunga, Taffarel, Aldair", curiosity: "Primeira final de Copa decidida na cobrança dramática de penalidades.", fact: "Romário foi eleito bola de ouro após marcar 5 gols primordiais." },
  { year: "2002", location: "Japão & Coreia do Sul", final: "Brasil 2 x 0 Alemanha", stars: "Ronaldo, Rivaldo, Ronaldinho, Cafu, Marcos", curiosity: "Cafu tornou-se o único atleta a disputar 3 finais consecutivas de Copas.", fact: "Ronaldo marcou os dois gols da redenção sobre Kahn." }
];

const LEGENDS = [
  { name: "Pelé", games: 14, goals: 12, champion: "1958, 1962, 1970", quote: "O Rei do Futebol, único tricampeão mundial em campo.", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { name: "Ronaldo Fenômeno", games: 19, goals: 15, champion: "1994, 2002", quote: "Herói do Penta de 2002 e artilheiro implacável.", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { name: "Garrincha", games: 12, goals: 5, champion: "1958, 1962", quote: "A alegria do povo, dribles inesquecíveis e gênio de 62.", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { name: "Romário", games: 8, goals: 5, champion: "1994", quote: "Gênio da grande área que garantiu o Tetra nos EUA.", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { name: "Ronaldinho Gaúcho", games: 10, goals: 3, champion: "2002", quote: "Bruxo que uniu mágica nos gramados e gol antológico de falta contra a Inglaterra.", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" },
  { name: "Cafu", games: 20, goals: 0, champion: "1994, 2002", quote: "Capitão do Penta e único a jogar 3 finais de Copas seguidas.", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" }
];

const HISTORIC_RECORDS = [
  { title: "Mais Vitórias Consecutivas", detail: "11 vitórias seguidas entre as Copas de 2002 e 2006." },
  { title: "Único Presente", detail: "Disputou todas as 22 edições da Copa do Mundo de Futebol de forma consecutiva." },
  { title: "Maior Vencedor", detail: "Detém 5 taças oficiais do torneio (58, 62, 70, 94 e 02)." },
  { title: "Artilheiro Canarinho", detail: "Ronaldo é o segundo maior artilheiro geral das Copas com 15 gols." }
];

const EPIC_MOMENTS = [
  { title: "Gol de Placa de Pelé (1958)", detail: "O lençol genial de Pelé contra a Suécia na grande final com apenas 17 anos." },
  { title: "O Tri do Futebol Arte (1970)", detail: "O antológico gol coletivo de Carlos Alberto após passe milimétrico de Pelé." },
  { title: "O Ninar de Bebeto (1994)", detail: "Comemoração famosa ao lado de Romário e Mazinho em homenagem ao filho recém-nascido." },
  { title: "A Redenção de Ronaldo (2002)", detail: "A superação de joelho operado marcando duas vezes na grande final contra a Alemanha." }
];

const TRIVIA_DATA = [
  { title: "Mascote Fuleco (2014)", detail: "O tatu-bola brasileiro símbolo da proteção ambiental e sustentabilidade." },
  { title: "Bola Telstar de 1970", detail: "Primeira bola costurada com gomos pretos e brancos para melhor visualização na TV em cores." },
  { title: "Camisa Azul de 1958", detail: "O Brasil jogou a final de azul após a Suécia sortear o direito de atuar de amarelo." }
];

// ==========================================
// 💡 INTERACTIVE QUIZ DATA (5 Detailed questions)
// ==========================================
const QUIZ_QUESTIONS = [
  {
    question: "Quem foi o técnico campeão da Copa de 1970 com o Brasil?",
    options: ["Vicente Feola", "Mário Zagallo", "Carlos Alberto Parreira", "Telê Santana"],
    correctIndex: 1,
    emoji: "🏆",
    explanation: "Mário Zagallo assumiu a seleção pouco antes da Copa e se tornou o primeiro campeão como jogador e técnico."
  },
  {
    question: "Quantos gols Ronaldo Fenômeno marcou na campanha vitoriosa do Penta em 2002?",
    options: ["6 gols", "7 gols", "8 gols", "9 gols"],
    correctIndex: 2,
    emoji: "⚽",
    explanation: "Ronaldo foi o grande artilheiro do torneio marcando 8 gols cruciais, sendo 2 na final contra a Alemanha."
  },
  {
    question: "Qual seleção eliminou o lendário time brasileiro de Telê Santana na Copa de 1982?",
    options: ["Itália", "França", "Alemanha Ocidental", "Argentina"],
    correctIndex: 0,
    emoji: "🇮🇹",
    explanation: "A Itália eliminou o Brasil por 3x2 na famosa Tragédia do Sarriá, com hat-trick do atacante Paolo Rossi."
  },
  {
    question: "Qual era a cor da camisa do Brasil no sorteio e final da Copa de 1958 contra a Suécia?",
    options: ["Amarelo Canarinho", "Branco Clássico", "Azul Royal", "Verde Esmeralda"],
    correctIndex: 2,
    emoji: "👕",
    explanation: "O Brasil jogou a final com camisas azuis compradas e costuradas às pressas, pois a Suécia era a mandante oficial de amarelo."
  },
  {
    question: "Quem foi o capitão responsável por erguer a taça do tetracampeonato em 1994 nos Estados Unidos?",
    options: ["Romário", "Dunga", "Raí", "Mauro Silva"],
    correctIndex: 1,
    emoji: "🇺🇸",
    explanation: "O volante Dunga foi o emblemático capitão do Tetra nos Estados Unidos, liderando o grupo com raça indiscutível."
  }
];

// ==========================================
// 🕹️ APP STATE & ROUTING
// ==========================================
let currentView = "home";
let currentSimGroup = "A";
let activeQuizIndex = 0;
let quizScore = 0;

// Navigation engine with GA Events trigger
function navigateTo(viewId) {
  // Hide active views
  document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
  
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add("active");
  }
  
  // Update nav highlights
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`nav-btn-${viewId}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  currentView = viewId;
  window.scrollTo({ top: 0, behavior: "smooth" });

  // GA Tracker Trigger
  trackGAEvent("phase_view", { phase_id: viewId });

  // Load contextual updates
  if (viewId === "stadiums") renderStadiums();
  if (viewId === "teams") renderTeams();
  if (viewId === "simulator") renderSimulator();
  if (viewId === "matches") renderMatches("grupos");
  if (viewId === "brasil") backToBrasilDashboard();
  if (viewId === "social") renderSocialPanel();
}

// Countdown timer to Opening Match (June 11, 2026)
function startCountdown() {
  const openingDate = new Date("2026-06-11T16:00:00-06:00").getTime();
  
  function updateClock() {
    const now = new Date().getTime();
    const diff = openingDate - now;
    
    if (diff <= 0) {
      document.getElementById("countdown-timer").innerText = "A Copa Começou!";
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const timerStr = `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
    const container = document.getElementById("countdown-timer");
    if (container) {
      container.innerText = timerStr;
    }
  }
  
  setInterval(updateClock, 1000);
  updateClock();
}

// ==========================================
// 📅 MATCHES RENDER ENGINE (Filterable by Phase)
// ==========================================
function renderMatches(phase = "grupos") {
  const container = document.getElementById("matches-list-container");
  if (!container) return;
  
  container.innerHTML = "";
  const filtered = MATCHES.filter(m => m.phase === phase);
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="grid-column: 1/-1; padding: 30px; text-align: center; color: var(--text-muted);">
        Nenhum confronto programado ou simulado para esta fase ainda.
      </div>
    `;
    return;
  }
  
  filtered.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel match-card";
    
    // Status badges
    let statusBadge = `<span class="match-status upcoming">Agendado</span>`;
    if (m.status === "finished") {
      statusBadge = `<span class="match-status finished">Finalizado</span>`;
    } else if (m.status === "live") {
      statusBadge = `<span class="match-status live">Ao Vivo</span>`;
    }
    
    // Convert scores display
    const homeScoreVal = m.homeScore !== null ? m.homeScore : "-";
    const awayScoreVal = m.awayScore !== null ? m.awayScore : "-";
    
    card.innerHTML = `
      <div class="match-header">
        <span>Grupo ${m.group || "Eliminatórias"} • Rodada ${m.id}</span>
        ${statusBadge}
      </div>
      
      <div class="match-teams" onclick="trackGAEvent('match_view', { match_id: ${m.id}, teams: '${m.homeTeam} vs ${m.awayTeam}' })">
        <div class="team-display left">
          <span class="team-name">${m.homeTeam}</span>
          <span class="team-flag">${m.homeFlag}</span>
        </div>
        
        <div class="score-display ${m.status === 'upcoming' ? 'upcoming' : ''}">
          ${m.status === 'upcoming' ? m.localTime : `${homeScoreVal} - ${awayScoreVal}`}
        </div>
        
        <div class="team-display right">
          <span class="team-flag">${m.awayFlag}</span>
          <span class="team-name">${m.awayTeam}</span>
        </div>
      </div>
      
      <div class="match-footer">
        <div class="match-details">
          <i data-lucide="map-pin" style="width: 13px; height: 13px;"></i>
          <span>${m.stadium} (${m.city})</span>
        </div>
        <div class="match-details" style="color: var(--secondary); font-weight: 700;">
          <i data-lucide="clock" style="width: 13px; height: 13px; stroke: var(--secondary);"></i>
          <span>${m.brtTime} BRT (Local: ${m.localTime})</span>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Setup phase tabs events
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".phase-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".phase-tab").forEach(t => t.classList.replace("btn-primary", "btn-secondary"));
      tab.classList.replace("btn-secondary", "btn-primary");
      const phase = tab.getAttribute("data-phase");
      renderMatches(phase);
    });
  });
});

// ==========================================
// 🛡️ 48 TEAMS LIST & SEARCH SEARCH
// ==========================================
function renderTeams() {
  const container = document.getElementById("teams-grid-container");
  const searchInput = document.getElementById("team-search-input");
  if (!container) return;
  
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  container.innerHTML = "";
  
  const filtered = TEAMS.filter(t => 
    t.name.toLowerCase().includes(query) || 
    t.region.toLowerCase().includes(query)
  );

  document.getElementById("search-count-badge").innerText = filtered.length;
  
  filtered.forEach(t => {
    const card = document.createElement("div");
    card.className = "glass-panel glass-panel-hover";
    card.style.padding = "16px";
    card.style.cursor = "pointer";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "14px";
    
    card.innerHTML = `
      <span style="font-size: 36px; line-height: 1;">${t.flag}</span>
      <div>
        <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main);">${t.name}</h4>
        <small style="color: var(--text-muted); font-size: 11px;">Continente: ${t.region} • Rank: ${t.rating}</small>
      </div>
    `;
    
    card.onclick = () => showTeamDetails(t.name);
    container.appendChild(card);
  });
}

// Smart local probable roster names generator
function generateRoster(teamName) {
  const localSquads = {
    "Brasil": ["Alisson", "Marquinhos", "Gabriel Magalhães", "Danilo", "Guilherme Arana", "Bruno Guimarães", "João Gomes", "Lucas Paquetá", "Vinícius Júnior", "Rodrygo", "Endrick"],
    "Argentina": ["Emiliano Martínez", "Otamendi", "Romero", "Molina", "Tagliafico", "De Paul", "Enzo Fernández", "Mac Allister", "Lionel Messi", "Julián Álvarez", "Lautaro Martínez"],
    "Portugal": ["Diogo Costa", "Rúben Dias", "Pepe", "Dalot", "Cancelo", "João Palhinha", "Vitinha", "Bruno Fernandes", "Bernardo Silva", "Rafael Leão", "Cristiano Ronaldo"]
  };

  // Fallback realistic generator if squad not explicitly coded
  if (localSquads[teamName]) return localSquads[teamName];

  const regionalAnglo = ["Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Evans", "Thomas", "Roberts", "Wilson", "Johnson"];
  const regionalLatin = ["Sánchez", "Gómez", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "González", "García", "Torres", "Ramírez"];
  const regionalAfrican = ["Mendy", "Koulibaly", "Diallo", "Sarr", "Gueye", "Mané", "Kamara", "Traoré", "Sissoko", "Keïta", "Kouamé"];
  
  const teamObj = TEAMS.find(t => t.name === teamName);
  if (teamObj && teamObj.region === "Africa") return regionalAfrican;
  if (teamObj && (teamObj.region === "South America" || teamObj.region === "North America" && teamObj.name !== "USA" && teamObj.name !== "Canadá")) return regionalLatin;
  return regionalAnglo;
}

function showTeamDetails(teamName) {
  const team = TEAMS.find(t => t.name === teamName);
  if (!team) return;
  
  trackGAEvent("team_view", { team_name: teamName });
  
  const modal = document.getElementById("team-modal");
  const titleRow = document.getElementById("modal-team-title-row");
  const body = document.getElementById("modal-team-body");
  
  titleRow.innerHTML = `
    <span style="font-size: 42px;">${team.flag}</span>
    <div>
      <h3 style="font-size: 20px; font-weight: 900; color: var(--primary);">${team.name}</h3>
      <small style="color: var(--text-muted);">Grupo ${team.group} • Continente: ${team.region}</small>
    </div>
  `;
  
  const squad = generateRoster(teamName);
  let squadHTML = "";
  squad.forEach((player, idx) => {
    const positions = ["GOL", "LAT", "ZAG", "ZAG", "LAT", "MEI", "MEI", "MEI", "ATA", "ATA", "ATA"];
    squadHTML += `
      <div class="roster-item">
        <span class="num">${idx + 1}</span>
        <span style="font-size:12.5px; font-weight:700;">${player}</span>
        <small style="color: var(--accent); font-size:10px; font-weight:800;">${positions[idx]}</small>
      </div>
    `;
  });
  
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 20px;">
      <div class="glass-panel" style="padding: 16px; background: rgba(0,0,0,0.2);">
        <h4 style="font-size: 13px; font-weight: 800; color: var(--secondary); margin-bottom: 6px; text-transform: uppercase;">Dados de Qualificação</h4>
        <p style="font-size: 13.5px; margin-bottom: 4px;"><strong>Técnico:</strong> ${team.coach}</p>
        <p style="font-size: 13.5px; margin-bottom: 4px;"><strong>Histórico:</strong> ${team.history}</p>
        <p style="font-size: 13.5px;"><strong>Força do Elenco:</strong> ⭐ ${team.rating}/10</p>
      </div>
      <div class="glass-panel" style="padding: 16px; border-left: 3px solid var(--accent); background: rgba(0,0,0,0.2);">
        <h4 style="font-size: 13px; font-weight: 800; color: var(--accent); margin-bottom: 6px; text-transform: uppercase;">Curiosidade</h4>
        <p style="font-size: 13px; line-height: 1.5; color: var(--text-main);">${team.curiosity}</p>
      </div>
    </div>
    
    <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 12px; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">Escalação Provável (Titulares)</h4>
    <div class="roster-grid">
      ${squadHTML}
    </div>
  `;
  
  modal.style.display = "block";
}

function closeTeamModal() {
  document.getElementById("team-modal").style.display = "none";
}

// Hook Search Input
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("team-search-input");
  if (search) {
    search.addEventListener("input", renderTeams);
  }
});

// ==========================================
// 🏟️ STADIUMS RENDER ENGINE & EXPLORER
// ==========================================
function renderStadiums() {
  const container = document.getElementById("stadiums-grid-container");
  const searchInput = document.getElementById("stadium-search-input");
  if (!container) return;
  
  const query = searchInput ? searchInput.value.toLowerCase() : "";
  container.innerHTML = "";
  
  const filtered = STADIUMS.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.city.toLowerCase().includes(query) || 
    s.country.toLowerCase().includes(query)
  );

  document.getElementById("stadium-search-count-badge").innerText = filtered.length;
  
  filtered.forEach(s => {
    const card = document.createElement("div");
    card.className = "glass-panel glass-panel-hover stadium-card";
    
    card.innerHTML = `
      <img src="${s.image}" alt="${s.name}" class="stadium-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80';">
      <div class="stadium-info">
        <h3 style="font-size: 15px; font-weight: 900; color: var(--primary);">${s.name}</h3>
        <p style="font-size: 12px; color: var(--text-muted);"><i data-lucide="map-pin" style="width:11px; height:11px; display:inline; margin-right:4px;"></i>${s.city}, ${s.country}</p>
        <span style="font-size: 12px; font-weight: 800; color: var(--secondary); margin-top: auto;">Capacidade: ${s.capacity.toLocaleString()} torcedores</span>
      </div>
    `;
    
    card.onclick = () => showStadiumDetails(s.id);
    container.appendChild(card);
  });
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function showStadiumDetails(stadiumId) {
  const stadium = STADIUMS.find(s => s.id === stadiumId);
  if (!stadium) return;
  
  trackGAEvent("stadium_view", { stadium_name: stadium.name });
  
  const modal = document.getElementById("stadium-modal");
  const body = document.getElementById("modal-stadium-body");
  
  // Custom mock location map coordinates visual
  const mockLat = (30 + Math.random() * 15).toFixed(4);
  const mockLon = (-100 + Math.random() * 20).toFixed(4);

  body.innerHTML = `
    <img src="${stadium.image}" alt="${stadium.name}" style="width:100%; height:200px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:16px; border:1px solid var(--line);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80';">
    
    <div style="display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px;">
      <div class="glass-panel" style="padding:16px;">
        <h4 style="font-size:12px; font-weight:800; color:var(--secondary); text-transform:uppercase; margin-bottom:6px;">Especificações Sedes</h4>
        <p style="font-size:13.5px; margin-bottom:4px;"><strong>Cidade:</strong> ${stadium.city}</p>
        <p style="font-size:13.5px; margin-bottom:4px;"><strong>País:</strong> ${stadium.country}</p>
        <p style="font-size:13.5px; margin-bottom:4px;"><strong>Capacidade:</strong> ${stadium.capacity.toLocaleString()} lugares</p>
        <p style="font-size:13.5px;"><strong>Fuso Horário:</strong> GMT ${stadium.timezone >= 0 ? `+${stadium.timezone}` : stadium.timezone} (Conversão Automática)</p>
      </div>
      <div class="glass-panel" style="padding:16px; border-left:3px solid var(--primary);">
        <h4 style="font-size:12px; font-weight:800; color:var(--primary); text-transform:uppercase; margin-bottom:6px;">Curiosidade Histórica</h4>
        <p style="font-size:12.5px; line-height:1.5; color:var(--text-main);">${stadium.curiosity}</p>
      </div>
    </div>

    <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 8px; color: var(--accent); text-transform: uppercase;">Coordenadas de Localização GPS (Mock)</h4>
    <div class="glass-panel" style="padding: 12px; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3);">
      <div style="font-family: monospace; font-size:12.5px;">
        <span>Lat: <strong>${mockLat}° N</strong></span> • <span>Lon: <strong>${mockLon}° W</strong></span>
      </div>
      <span class="sandbox-alert" style="background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.3); color: var(--accent);">Gps Locker</span>
    </div>
  `;
  
  modal.style.display = "block";
}

function closeStadiumModal() {
  document.getElementById("stadium-modal").style.display = "none";
}

// Hook Stadium search input
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("stadium-search-input");
  if (search) {
    search.addEventListener("input", renderStadiums);
  }
});

// ==========================================
// 🔄 AUTOMATIC CLASSIFICATION SIMULATOR (A-L)
// ==========================================
function renderSimulator() {
  // Render scrollable group selector tabs (Groups A to L)
  const tabList = document.getElementById("sim-group-tabs-list");
  if (tabList) {
    tabList.innerHTML = "";
    groupsList.forEach(letter => {
      const tab = document.createElement("button");
      tab.className = `group-simulator-tab ${letter === currentSimGroup ? 'active' : ''}`;
      tab.innerText = `Grupo ${letter}`;
      tab.onclick = () => {
        currentSimGroup = letter;
        renderSimulator();
      };
      tabList.appendChild(tab);
    });
  }

  // Update Active Group Header
  const header = document.getElementById("sim-active-group-header");
  if (header) {
    header.innerHTML = `<span style="display:inline-block; width:8px; height:8px; background:var(--primary); border-radius:50%;"></span> Classificação do Grupo ${currentSimGroup}`;
  }

  // Calculate and Render Active Group Standings
  renderGroupStandingsTable(currentSimGroup);

  // Render Simulator Matches for the active group
  renderGroupMatchesSimulator(currentSimGroup);

  // Update Bracket View
  renderKnockoutBracket();
}

function calculateGroupStats(groupLetter) {
  const groupTeams = TEAMS.filter(t => t.group === groupLetter);
  const stats = {};
  
  groupTeams.forEach(t => {
    stats[t.name] = { name: t.name, flag: t.flag, pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
  });

  const groupMatches = MATCHES.filter(m => m.phase === "grupos" && m.group === groupLetter);
  
  groupMatches.forEach(m => {
    if (m.homeScore === null || m.awayScore === null) return;
    
    const h = stats[m.homeTeam];
    const a = stats[m.awayTeam];
    if (!h || !a) return;

    h.pj += 1;
    a.pj += 1;
    h.gp += m.homeScore;
    h.gc += m.awayScore;
    a.gp += m.awayScore;
    a.gc += m.homeScore;

    if (m.homeScore > m.awayScore) {
      h.pts += 3;
      h.v += 1;
      a.d += 1;
    } else if (m.homeScore < m.awayScore) {
      a.pts += 3;
      a.v += 1;
      h.d += 1;
    } else {
      h.pts += 1;
      a.pts += 1;
      h.e += 1;
      a.e += 1;
    }
    
    h.sg = h.gp - h.gc;
    a.sg = a.gp - a.gc;
  });

  // Sort: points, goal diff, goals favor, alphabetical
  return Object.values(stats).sort((x, y) => {
    if (y.pts !== x.pts) return y.pts - x.pts;
    if (y.sg !== x.sg) return y.sg - x.sg;
    if (y.gp !== x.gp) return y.gp - x.gp;
    return x.name.localeCompare(y.name);
  });
}

function renderGroupStandingsTable(groupLetter) {
  const container = document.getElementById("simulator-group-standings-table-container");
  if (!container) return;

  const sorted = calculateGroupStats(groupLetter);

  let rowsHTML = "";
  sorted.forEach((row, idx) => {
    rowsHTML += `
      <tr class="${idx < 2 ? 'highlighted' : ''}">
        <td style="font-weight:800; color: var(--secondary);">${idx + 1}º</td>
        <td class="team-cell">
          <span style="font-size:20px; line-height:1;">${row.flag}</span>
          <span style="font-size:12.5px;">${row.name}</span>
        </td>
        <td><strong>${row.pts}</strong></td>
        <td>${row.pj}</td>
        <td>${row.v}</td>
        <td>${row.e}</td>
        <td>${row.d}</td>
        <td>${row.gp}:${row.gc}</td>
        <td style="color:${row.sg > 0 ? 'var(--primary)' : row.sg < 0 ? 'var(--blood)' : 'var(--text-muted)'}; font-weight:700;">
          ${row.sg > 0 ? `+${row.sg}` : row.sg}
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <table class="standings-table glass-panel">
      <thead>
        <tr>
          <th style="width:40px;">Pos</th>
          <th style="text-align:left;">Seleção</th>
          <th>Pts</th>
          <th>PJ</th>
          <th>V</th>
          <th>E</th>
          <th>D</th>
          <th>Gols</th>
          <th>SG</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  `;
}

function renderGroupMatchesSimulator(groupLetter) {
  const container = document.getElementById("simulator-group-matches-container");
  if (!container) return;

  container.innerHTML = "";
  const groupMatches = MATCHES.filter(m => m.phase === "grupos" && m.group === groupLetter);

  groupMatches.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel match-card";
    
    card.innerHTML = `
      <div class="match-header">
        <span>Confronto Simulado #${m.id}</span>
        <span class="match-status finished" style="background:rgba(14,165,233,0.15); color:var(--accent);">Previsão</span>
      </div>
      
      <div class="match-teams">
        <div class="team-display left">
          <span class="team-name" style="font-size:13px;">${m.homeTeam}</span>
          <span class="team-flag" style="font-size:22px;">${m.homeFlag}</span>
        </div>
        
        <div class="prediction-inputs" style="margin: 0 4px;">
          <input type="number" min="0" max="99" value="${m.homeScore}" data-match-id="${m.id}" data-side="home" aria-label="Placar Mandante">
          <span>x</span>
          <input type="number" min="0" max="99" value="${m.awayScore}" data-match-id="${m.id}" data-side="away" aria-label="Placar Visitante">
        </div>
        
        <div class="team-display right">
          <span class="team-flag" style="font-size:22px;">${m.awayFlag}</span>
          <span class="team-name" style="font-size:13px;">${m.awayTeam}</span>
        </div>
      </div>
      
      <div class="match-footer" style="padding-top:6px; font-size:11px;">
        <span>${m.stadium}</span>
        <span>BRT: ${m.brtTime}</span>
      </div>
    `;

    // Listen to changes in simulation inputs
    card.querySelectorAll("input").forEach(input => {
      input.addEventListener("change", (e) => {
        const matchId = parseInt(input.getAttribute("data-match-id"));
        const side = input.getAttribute("data-side");
        const val = parseInt(e.target.value);
        
        const matchObj = MATCHES.find(m => m.id === matchId);
        if (matchObj) {
          if (side === "home") matchObj.homeScore = isNaN(val) ? 0 : val;
          if (side === "away") matchObj.awayScore = isNaN(val) ? 0 : val;
          savePredictionsToStorage();
          
          // Re-render only table and standings
          renderGroupStandingsTable(currentSimGroup);
          renderKnockoutBracket();
        }
      });
    });

    container.appendChild(card);
  });
}

function resetSimulation() {
  generate104Matches();
  savePredictionsToStorage();
  renderSimulator();
  showToast("Simulador da Copa resetado para placares padrão!");
}

// Update Knockout Bracket dynamically based on calculated standings A-L
function renderKnockoutBracket() {
  const container = document.getElementById("simulator-bracket-container");
  if (!container) return;

  // Extract simulated winners from all 12 groups A-L
  const groupWinners = {};
  const groupRunners = {};
  
  groupsList.forEach(letter => {
    const sorted = calculateGroupStats(letter);
    groupWinners[letter] = sorted[0];
    groupRunners[letter] = sorted[1];
  });

  // Dynamically feed the Round of 32 (16 matches) inside MATCHES database
  MATCHES.forEach(m => {
    if (m.phase === "32avos") {
      const idx = (m.id - 73); // 73 is the first R32 match
      const homeLetter = groupsList[idx % 12];
      const awayLetter = groupsList[(idx + 4) % 12];
      
      const homeTeamObj = groupWinners[homeLetter] || { name: `1º Grupo ${homeLetter}`, flag: "🏆" };
      const awayTeamObj = groupRunners[awayLetter] || { name: `2º Grupo ${awayLetter}`, flag: "🏆" };

      m.homeTeam = homeTeamObj.name;
      m.homeFlag = homeTeamObj.flag;
      m.awayTeam = awayTeamObj.name;
      m.awayFlag = awayTeamObj.flag;
    }
  });

  // Render Bracket view columns (R32, R16, QF, SF, Finals)
  let r32HTML = "";
  let r16HTML = "";
  let qfHTML = "";
  let sfHTML = "";
  let finHTML = "";

  const r32Matches = MATCHES.filter(m => m.phase === "32avos");
  const r16Matches = MATCHES.filter(m => m.phase === "oitavas");
  const qfMatches = MATCHES.filter(m => m.phase === "quartas");
  const sfMatches = MATCHES.filter(m => m.phase === "semis");
  const finMatches = MATCHES.filter(m => m.phase === "final");

  r32Matches.forEach(m => {
    r32HTML += renderBracketMatchCard(m);
  });
  
  r16Matches.forEach(m => {
    r16HTML += renderBracketMatchCard(m);
  });

  qfMatches.forEach(m => {
    qfHTML += renderBracketMatchCard(m);
  });

  sfMatches.forEach(m => {
    sfHTML += renderBracketMatchCard(m);
  });

  finMatches.forEach(m => {
    finHTML += renderBracketMatchCard(m);
  });

  container.innerHTML = `
    <div class="bracket-phase">
      <h4 style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--accent); text-align:center;">16avos de Final (32)</h4>
      ${r32HTML}
    </div>
    <div class="bracket-phase">
      <h4 style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--primary); text-align:center;">Oitavas de Final (16)</h4>
      ${r16HTML}
    </div>
    <div class="bracket-phase">
      <h4 style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--secondary); text-align:center;">Quartas de Final (8)</h4>
      ${qfHTML}
    </div>
    <div class="bracket-phase">
      <h4 style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--blood); text-align:center;">Semifinais (4)</h4>
      ${sfHTML}
    </div>
    <div class="bracket-phase">
      <h4 style="font-size:11px; text-transform:uppercase; font-weight:800; color:#fff; text-align:center;">Finais (4)</h4>
      ${finHTML}
    </div>
  `;
}

function renderBracketMatchCard(m) {
  return `
    <div class="glass-panel" style="padding: 10px 14px; font-size:12px; display:flex; flex-direction:column; gap:4px;">
      <div style="font-size:9px; color:var(--text-muted); display:flex; justify-content:space-between;">
        <span>Jogo #${m.id}</span>
        <span>${m.city}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700;">
        <span>${m.homeFlag} ${m.homeTeam.substring(0, 14)}</span>
        <span style="font-family:monospace; color:var(--primary);">${m.homeScore !== null ? m.homeScore : "-"}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700;">
        <span>${m.awayFlag} ${m.awayTeam.substring(0, 14)}</span>
        <span style="font-family:monospace; color:var(--primary);">${m.awayScore !== null ? m.awayScore : "-"}</span>
      </div>
    </div>
  `;
}

// ==========================================
// 🇧🇷 BRASIL NAS COPAS SUBVIEWS ROUTER
// ==========================================
function showBrasilSubView(subviewId) {
  document.getElementById("brasil-dashboard").style.display = "none";
  
  // Hide all subviews
  document.getElementById("subview-brasil-timeline").style.display = "none";
  document.getElementById("subview-brasil-titulos").style.display = "none";
  document.getElementById("subview-brasil-legends").style.display = "none";
  document.getElementById("subview-brasil-records").style.display = "none";
  document.getElementById("subview-brasil-moments").style.display = "none";
  document.getElementById("subview-brasil-trivia").style.display = "none";
  document.getElementById("subview-brasil-quiz").style.display = "none";
  document.getElementById("subview-brasil-favorites").style.display = "none";
  
  // Show active subview
  document.getElementById(`subview-brasil-${subviewId}`).style.display = "block";
  
  trackGAEvent("curiosity_subview", { view: subviewId });

  // Populators
  if (subviewId === "timeline") renderBrasilTimeline();
  if (subviewId === "titulos") renderBrasilTitulos();
  if (subviewId === "legends") renderBrasilLegends();
  if (subviewId === "records") renderBrasilRecords();
  if (subviewId === "moments") renderBrasilMoments();
  if (subviewId === "trivia") renderBrasilTrivia();
  if (subviewId === "favorites") renderBrasilFavorites();
}

function backToBrasilDashboard() {
  document.getElementById("brasil-dashboard").style.display = "block";
  document.getElementById("subview-brasil-timeline").style.display = "none";
  document.getElementById("subview-brasil-titulos").style.display = "none";
  document.getElementById("subview-brasil-legends").style.display = "none";
  document.getElementById("subview-brasil-records").style.display = "none";
  document.getElementById("subview-brasil-moments").style.display = "none";
  document.getElementById("subview-brasil-trivia").style.display = "none";
  document.getElementById("subview-brasil-quiz").style.display = "none";
  document.getElementById("subview-brasil-favorites").style.display = "none";
  updateFavoritesCounter();
}

// 4.1 Render timeline
function renderBrasilTimeline() {
  const container = document.getElementById("brasil-timeline-list");
  if (!container) return;
  container.innerHTML = "";
  
  const savedFavs = getSavedFavorites();

  BRASIL_TIMELINE.forEach(e => {
    const node = document.createElement("div");
    node.className = `timeline-event-node ${e.champion ? 'champion' : ''}`;
    
    const isFav = savedFavs.includes(`timeline-${e.year}`);

    node.innerHTML = `
      <div class="glass-panel timeline-body-card">
        <img src="${e.image}" class="timeline-img-cover" alt="Copa de ${e.year}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80';">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <h4 style="font-size:16px; font-weight:900; color:${e.champion ? 'var(--secondary)' : '#fff'};">Copa de ${e.year}</h4>
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px; border-radius:50%; width:30px; height:30px; display:grid; place-items:center;" onclick="toggleFavorite('timeline-${e.year}')">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <p style="font-size:12px; font-weight:800; color:var(--accent); margin-bottom:4px;">Sede: ${e.city} • Resultado: ${e.result}</p>
        <p style="font-size:12.5px; color:var(--text-muted); line-height:1.5; margin-bottom:8px;">${e.desc}</p>
        <small style="display:block; font-size:11px; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; border-left:2px solid var(--primary);">
          <strong>Fato Secreto:</strong> ${e.trivia}
        </small>
      </div>
    `;
    container.appendChild(node);
  });
}

// 4.2 Render Titulos
function renderBrasilTitulos() {
  const container = document.getElementById("brasil-titulos-list");
  if (!container) return;
  container.innerHTML = "";
  
  BRASIL_TITULOS.forEach(t => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    card.style.borderLeft = "4px solid var(--secondary)";
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h4 style="font-size:16px; font-weight:900; color:var(--secondary);">Conquista em ${t.year}</h4>
        <span class="gold-star-badge">Campeão do Mundo</span>
      </div>
      <p style="font-size:13px; margin-bottom:4px;"><strong>Final:</strong> ${t.final} (${t.location})</p>
      <p style="font-size:13px; margin-bottom:6px;"><strong>Craques:</strong> ${t.stars}</p>
      <div style="padding:8px 12px; background:rgba(0,0,0,0.15); border-radius:6px; font-size:12px; color:var(--text-muted);">
        <strong>Bastidores:</strong> ${t.curiosity}
      </div>
    `;
    container.appendChild(card);
  });
}

// 4.3 Render Legends
function renderBrasilLegends() {
  const container = document.getElementById("brasil-legends-list");
  if (!container) return;
  container.innerHTML = "";
  
  LEGENDS.forEach(l => {
    const card = document.createElement("div");
    card.className = "glass-panel legend-detail-card";
    
    card.innerHTML = `
      <div class="legend-avatar-row">
        <img src="${l.image}" class="legend-avatar-img" alt="${l.name}">
        <div>
          <h4 style="font-size:16px; font-weight:900; color:var(--primary);">${l.name}</h4>
          <small style="color:var(--text-muted); font-size:11px;">Copas: ${l.champion}</small>
        </div>
      </div>
      <p style="font-size:13px; margin-bottom:2px;"><strong>Jogos em Copas:</strong> ${l.games} partidas</p>
      <p style="font-size:13px; margin-bottom:2px;"><strong>Gols em Copas:</strong> ${l.goals} gols</p>
      <div style="font-style:italic; font-size:12.5px; padding:10px; border-radius:6px; background:rgba(255,255,255,0.03); color:var(--text-muted);">
        "${l.quote}"
      </div>
    `;
    container.appendChild(card);
  });
}

// 4.4 Render Records
function renderBrasilRecords() {
  const container = document.getElementById("brasil-records-list");
  if (!container) return;
  container.innerHTML = "";
  
  HISTORIC_RECORDS.forEach(r => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "14px 18px";
    card.style.borderLeft = "3px solid var(--accent)";
    
    card.innerHTML = `
      <h4 style="font-size:14px; font-weight:800; color:var(--accent); margin-bottom:4px;">${r.title}</h4>
      <p style="font-size:13px; color:var(--text-muted);">${r.detail}</p>
    `;
    container.appendChild(card);
  });
}

// 4.5 Render Moments
function renderBrasilMoments() {
  const container = document.getElementById("brasil-moments-list");
  if (!container) return;
  container.innerHTML = "";
  
  EPIC_MOMENTS.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    
    card.innerHTML = `
      <h4 style="font-size:15px; font-weight:800; color:var(--secondary); margin-bottom:6px;">${m.title}</h4>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.4;">${m.detail}</p>
    `;
    container.appendChild(card);
  });
}

// 4.6 Render Trivia
function renderBrasilTrivia() {
  const container = document.getElementById("brasil-trivia-list");
  if (!container) return;
  container.innerHTML = "";
  
  TRIVIA_DATA.forEach(t => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    card.style.borderLeft = "3px solid var(--primary)";
    
    card.innerHTML = `
      <h4 style="font-size:14px; font-weight:800; color:var(--primary); margin-bottom:4px;">${t.title}</h4>
      <p style="font-size:13px; color:var(--text-muted);">${t.detail}</p>
    `;
    container.appendChild(card);
  });
}

// 4.7 INTERACTIVE QUIZ MOTOR
function startQuizChallenge() {
  activeQuizIndex = 0;
  quizScore = 0;
  
  document.getElementById("quiz-intro-box").style.display = "none";
  document.getElementById("quiz-score-box").style.display = "none";
  document.getElementById("quiz-play-box").style.display = "block";
  
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[activeQuizIndex];
  
  document.getElementById("quiz-question-counter").innerText = `Pergunta ${activeQuizIndex + 1} de 5`;
  document.getElementById("quiz-score-badge").innerText = `Score: ${quizScore}`;
  
  // Progress bar fill
  const progressPercent = ((activeQuizIndex) / 5) * 100;
  document.getElementById("quiz-progress-fill").style.width = `${progressPercent}%`;
  
  document.getElementById("quiz-question-emoji").innerText = q.emoji;
  document.getElementById("quiz-question-text").innerText = q.question;
  
  const optionsBox = document.getElementById("quiz-options-container");
  optionsBox.innerHTML = "";
  
  const feedbackBox = document.getElementById("quiz-feedback-box");
  feedbackBox.style.display = "none";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.innerText = opt;
    btn.onclick = () => submitQuizAnswer(idx);
    optionsBox.appendChild(btn);
  });
}

function submitQuizAnswer(selectedIndex) {
  const q = QUIZ_QUESTIONS[activeQuizIndex];
  
  // Disable all options
  document.querySelectorAll(".quiz-option-btn").forEach(btn => {
    btn.disabled = true;
  });
  
  const buttons = document.querySelectorAll(".quiz-option-btn");
  const feedbackBox = document.getElementById("quiz-feedback-box");
  
  if (selectedIndex === q.correctIndex) {
    buttons[selectedIndex].classList.add("correct");
    quizScore += 20; // 20 points per correct answer
    
    feedbackBox.className = "quiz-feedback-success";
    feedbackBox.style.background = "rgba(34,197,94,0.15)";
    feedbackBox.style.border = "1px solid var(--primary)";
    feedbackBox.style.color = "var(--primary)";
    feedbackBox.innerHTML = `<strong>Correto!</strong> ${q.explanation}`;
  } else {
    buttons[selectedIndex].classList.add("incorrect");
    buttons[q.correctIndex].classList.add("correct");
    
    feedbackBox.style.background = "rgba(239,68,68,0.15)";
    feedbackBox.style.border = "1px solid var(--blood)";
    feedbackBox.style.color = "var(--blood)";
    feedbackBox.innerHTML = `<strong>Incorreto.</strong> ${q.explanation}`;
  }
  
  feedbackBox.style.display = "block";
  
  // Slide to next question after 3.5s
  setTimeout(() => {
    activeQuizIndex++;
    if (activeQuizIndex < 5) {
      renderQuizQuestion();
    } else {
      showQuizFinalScore();
    }
  }, 3500);
}

function showQuizFinalScore() {
  document.getElementById("quiz-play-box").style.display = "none";
  
  const scoreBox = document.getElementById("quiz-score-box");
  document.getElementById("quiz-final-performance-text").innerText = `Você acertou ${quizScore / 20} de 5 perguntas desafiadoras.`;
  document.getElementById("quiz-final-score-label").innerText = `${quizScore} pts`;
  
  scoreBox.style.display = "block";
  
  // Log telemetry score
  trackGAEvent("quiz_score_submit", { score: quizScore });
}

// 4.8 Bookmarks & Favorites persist
function getSavedFavorites() {
  const f = localStorage.getItem("copa_brasil_favorites");
  return f ? JSON.parse(f) : [];
}

function toggleFavorite(itemId) {
  let favs = getSavedFavorites();
  if (favs.includes(itemId)) {
    favs = favs.filter(id => id !== itemId);
  } else {
    favs.push(itemId);
  }
  localStorage.setItem("copa_brasil_favorites", JSON.stringify(favs));
  
  // Re-render timeline to update heart color
  renderBrasilTimeline();
  updateFavoritesCounter();
  showToast("Preferências salvas com sucesso!");
  
  trackGAEvent("favorite_item_toggle", { item_id: itemId });
}

function updateFavoritesCounter() {
  const favs = getSavedFavorites();
  const badge = document.getElementById("fav-counter-badge");
  if (badge) {
    badge.innerText = `${favs.length} itens salvos`;
  }
}

function renderBrasilFavorites() {
  const container = document.getElementById("brasil-favorites-list");
  if (!container) return;
  container.innerHTML = "";
  
  const favs = getSavedFavorites();
  if (favs.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="padding:30px; text-align:center; color:var(--text-muted);">
        Você ainda não salvou nenhuma curiosidade ou fato histórico do Brasil nas Copas. Clique no ❤️ de cada card para favoritar!
      </div>
    `;
    return;
  }
  
  favs.forEach(favId => {
    const card = document.createElement("div");
    card.className = "glass-panel";
    card.style.padding = "16px";
    
    if (favId.startsWith("timeline-")) {
      const year = parseInt(favId.split("-")[1]);
      const event = BRASIL_TIMELINE.find(e => e.year === year);
      if (event) {
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h4 style="font-size:14px; font-weight:800; color:var(--secondary);">Copa de ${event.year}</h4>
            <span style="color:var(--blood); cursor:pointer;" onclick="toggleFavorite('${favId}'); renderBrasilFavorites();">❤️</span>
          </div>
          <p style="font-size:12.5px; color:var(--text-muted);">${event.desc}</p>
        `;
      }
    }
    container.appendChild(card);
  });
}

// ==========================================
// 🏆 COMPETITIVE PORTAL: MATCHZONE 2026
// ==========================================
let authenticatedUser = null;
let loginToggleState = true; // true = login, false = signup

function renderSocialPanel() {
  const storedUser = localStorage.getItem("copacenter_user");
  if (storedUser) {
    authenticatedUser = JSON.parse(storedUser);
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("social-dashboard-container").style.display = "block";
    loadUserDashboardDetails();
  } else {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("social-dashboard-container").style.display = "none";
    toggleAuthState(true);
  }
}

function toggleAuthState(isLogin) {
  loginToggleState = isLogin;
  document.getElementById("auth-tab-login").className = isLogin ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
  document.getElementById("auth-tab-register").className = isLogin ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm";
  
  document.getElementById("group-auth-nickname").style.display = isLogin ? "none" : "block";
  document.getElementById("group-auth-favteam").style.display = isLogin ? "none" : "block";
  document.getElementById("auth-submit-btn").innerText = isLogin ? "Entrar na Arena" : "Criar Minha Conta";
  
  document.getElementById("auth-error-msg").innerText = "";
}

function handleAuthSubmit() {
  const email = document.getElementById("auth-email-input").value.trim();
  const password = document.getElementById("auth-password-input").value.trim();
  const nickname = document.getElementById("auth-nickname-input").value.trim();
  const favTeam = document.getElementById("auth-favteam-input").value;
  const errorMsg = document.getElementById("auth-error-msg");

  if (!email || password.length < 6) {
    errorMsg.innerText = "E-mail inválido ou senha com menos de 6 caracteres.";
    return;
  }

  if (loginToggleState) {
    // Simulated Local Auth Match
    const simulatedUser = {
      email: email,
      nickname: nickname || "Competidor Arena",
      favTeam: favTeam || "Brasil",
      score: 160, // realistic mock score
      inviteCode: `MZ-${Math.floor(1000 + Math.random() * 9000)}`
    };
    
    localStorage.setItem("copacenter_user", JSON.stringify(simulatedUser));
    authenticatedUser = simulatedUser;
    
    trackGAEvent("login_submit", { user_email: email });
  } else {
    if (!nickname) {
      errorMsg.innerText = "Por favor, digite seu apelido.";
      return;
    }
    
    const newUser = {
      email: email,
      nickname: nickname,
      favTeam: favTeam,
      score: 0,
      inviteCode: `MZ-${Math.floor(1000 + Math.random() * 9000)}`
    };
    
    localStorage.setItem("copacenter_user", JSON.stringify(newUser));
    authenticatedUser = newUser;
    
    trackGAEvent("signup_submit", { user_email: email, fav_team: favTeam });
  }

  renderSocialPanel();
  showToast("MatchZone Autenticada!");
}

function handleLogout() {
  localStorage.removeItem("copacenter_user");
  authenticatedUser = null;
  renderSocialPanel();
  showToast("Sessão finalizada.");
}

function loadUserDashboardDetails() {
  if (!authenticatedUser) return;
  
  // Header badges update
  document.getElementById("header-username").innerText = authenticatedUser.nickname;
  document.getElementById("header-user-badge").querySelector(".user-avatar-emoji").innerText = "🏆";

  // Profile view updates
  document.getElementById("profile-display-name").innerText = authenticatedUser.nickname;
  document.getElementById("profile-favorite-team").innerText = `Torcedor oficial do ${authenticatedUser.favTeam}`;
  document.getElementById("profile-total-score").innerText = `${authenticatedUser.score} pts`;
  document.getElementById("user-invite-code").innerText = authenticatedUser.inviteCode;

  loadSocialSubView("palpites");
}

// Social tabs router
function loadSocialSubView(subview) {
  document.querySelectorAll(".social-subview").forEach(v => v.style.display = "none");
  document.querySelectorAll(".social-tab").forEach(t => t.classList.replace("btn-primary", "btn-secondary"));

  const targetView = document.getElementById(`social-subview-${subview}`);
  if (targetView) targetView.style.display = "block";

  const activeTab = document.querySelector(`.social-tab[data-subview="${subview}"]`) || document.getElementById(`btn-social-tab-${subview}`);
  if (activeTab) activeTab.classList.replace("btn-secondary", "btn-primary");

  if (subview === "palpites") renderPredictionMatches();
  if (subview === "ranking") renderGlobalLeaderboard();
  if (subview === "groups") renderPrivateGroups();
}

function renderPredictionMatches() {
  const container = document.getElementById("prediction-matches-list");
  if (!container) return;
  
  container.innerHTML = "";
  // Show first 6 matches for prediction
  const groupMatches = MATCHES.slice(0, 6);

  groupMatches.forEach(m => {
    const card = document.createElement("div");
    card.className = "glass-panel match-card";
    
    card.innerHTML = `
      <div class="match-header">
        <span>Confronto MatchZone #${m.id}</span>
        <span class="match-status finished" style="background:rgba(34,197,94,0.15); color:var(--primary);">Palpite Aberto</span>
      </div>
      
      <div class="match-teams">
        <div class="team-display left">
          <span class="team-name" style="font-size:13px;">${m.homeTeam}</span>
          <span class="team-flag" style="font-size:22px;">${m.homeFlag}</span>
        </div>
        
        <div class="prediction-inputs" style="margin: 0 4px;">
          <input type="number" min="0" max="99" value="0" id="predict-home-${m.id}" aria-label="Palpite Mandante">
          <span>x</span>
          <input type="number" min="0" max="99" value="0" id="predict-away-${m.id}" aria-label="Palpite Visitante">
        </div>
        
        <div class="team-display right">
          <span class="team-flag" style="font-size:22px;">${m.awayFlag}</span>
          <span class="team-name" style="font-size:13px;">${m.awayTeam}</span>
        </div>
      </div>
      
      <button class="btn btn-primary btn-sm" style="width:100%; margin-top:8px;" onclick="submitMatchPrediction(${m.id})">Salvar Palpite</button>
    `;
    container.appendChild(card);
  });
}

function submitMatchPrediction(matchId) {
  const homeScore = parseInt(document.getElementById(`predict-home-${matchId}`).value) || 0;
  const awayScore = parseInt(document.getElementById(`predict-away-${matchId}`).value) || 0;

  // Save to telemetry
  trackGAEvent("prediction_submit", { match_id: matchId, prediction: `${homeScore}x${awayScore}` });
  
  showToast(`Palpite [${homeScore}x${awayScore}] salvo com sucesso na MatchZone!`);
}

function renderGlobalLeaderboard() {
  const container = document.getElementById("global-ranking-list");
  if (!container) return;

  const mockUsers = [
    { name: "Fabi Confeiteira", team: "Brasil 🇧🇷", score: 280 },
    { name: "Renan Pires", team: "Brasil 🇧🇷", score: 240 },
    { name: "Claudio Goleiro", team: "Alemanha 🇩🇪", score: 190 },
    { name: "Juliana Neto", team: "Argentina 🇦🇷", score: 160 }
  ];

  if (authenticatedUser) {
    mockUsers.push({ name: authenticatedUser.nickname, team: `${authenticatedUser.favTeam}`, score: authenticatedUser.score });
  }

  // Sort score desc
  mockUsers.sort((x, y) => y.score - x.score);

  container.innerHTML = "";
  mockUsers.forEach((u, idx) => {
    const item = document.createElement("div");
    item.className = `leaderboard-item ${idx === 0 ? 'top-1' : ''}`;
    
    item.innerHTML = `
      <div class="rank-badge">${idx + 1}</div>
      <div class="rank-user-info">
        <span class="name">${u.name}</span>
        <small style="color:var(--text-muted); font-size:11px;">Torcedor: ${u.team}</small>
      </div>
      <div class="rank-score">${u.score} pts</div>
    `;
    container.appendChild(item);
  });
}

// Ligas Privadas
let joinedPrivateGroupsList = [];

function renderPrivateGroups() {
  const container = document.getElementById("private-groups-list");
  if (!container) return;

  if (joinedPrivateGroupsList.length === 0) {
    container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); text-align:center;">Você ainda não participa de nenhuma liga privada. Crie ou entre em uma abaixo!</p>`;
    return;
  }

  container.innerHTML = "";
  joinedPrivateGroupsList.forEach(grp => {
    const row = document.createElement("div");
    row.className = "glass-panel";
    row.style.padding = "12px 16px";
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.cursor = "pointer";

    row.innerHTML = `
      <div>
        <h4 style="font-size:13.5px; font-weight:800; color:var(--primary);">${grp.name}</h4>
        <small style="font-size:11px; color:var(--text-muted);">Código: ${grp.code} • Participantes: 3</small>
      </div>
      <span class="sandbox-alert" style="background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.3); color:var(--primary);">Ver Ligas</span>
    `;

    row.onclick = () => showPrivateGroupDetails(grp);
    container.appendChild(row);
  });
}

function createPrivateGroup() {
  const nameInput = document.getElementById("create-group-name-input");
  const name = nameInput ? nameInput.value.trim() : "";

  if (!name) {
    showToast("Por favor, digite o nome da liga!");
    return;
  }

  const newGroup = {
    name: name,
    code: `MZ-${Math.floor(1000 + Math.random() * 9000)}`
  };

  joinedPrivateGroupsList.push(newGroup);
  if (nameInput) nameInput.value = "";
  
  renderPrivateGroups();
  showToast("Liga Privada criada com sucesso!");
}

function joinPrivateGroup() {
  const codeInput = document.getElementById("join-group-code-input");
  const code = codeInput ? codeInput.value.trim().toUpperCase() : "";

  if (!code) {
    showToast("Por favor, digite o código da liga!");
    return;
  }

  // Simulated code join match
  const newGroup = {
    name: `Liga Secreta ${code}`,
    code: code
  };

  joinedPrivateGroupsList.push(newGroup);
  if (codeInput) codeInput.value = "";
  
  renderPrivateGroups();
  showToast("Você entrou na Liga Privada!");
}

function showPrivateGroupDetails(grp) {
  const panel = document.getElementById("group-details-panel");
  document.getElementById("group-details-title").innerText = grp.name;
  document.getElementById("group-details-code").innerText = grp.code;

  const container = document.getElementById("group-ranking-list");
  container.innerHTML = `
    <div class="leaderboard-item top-1">
      <div class="rank-badge">1</div>
      <div class="rank-user-info"><span class="name">${authenticatedUser ? authenticatedUser.nickname : 'Você'}</span></div>
      <div class="rank-score">${authenticatedUser ? authenticatedUser.score : 0} pts</div>
    </div>
    <div class="leaderboard-item">
      <div class="rank-badge">2</div>
      <div class="rank-user-info"><span class="name">Fabi Confeiteira</span></div>
      <div class="rank-score">140 pts</div>
    </div>
    <div class="leaderboard-item">
      <div class="rank-badge">3</div>
      <div class="rank-user-info"><span class="name">Claudio Goleiro</span></div>
      <div class="rank-score">110 pts</div>
    </div>
  `;

  panel.style.display = "block";
}

function closeGroupDetailsPanel() {
  document.getElementById("group-details-panel").style.display = "none";
}

function shareAppStats() {
  const shareText = `Dispute a Copa de 2026 comigo na MatchZone Oficial! Crie seus palpites e simule chaves! Código Convite: ${authenticatedUser ? authenticatedUser.inviteCode : 'MZ-1234'}`;
  
  if (navigator.share) {
    navigator.share({
      title: "MatchZone CopaCenter 2026",
      text: shareText,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
    showToast("Convite MatchZone copiado para a área de transferência!");
  }
}

// ==========================================
// 🍞 HELPER TOAST SYSTEM
// ==========================================
function showToast(message) {
  const toast = document.getElementById("system-toast");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==========================================
// 🛠️ INITIALIZATION & REGISTRATION SERVICE WORKER
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  // Load / initialize matches
  loadPredictionsFromStorage();

  // Launch countdown clock
  startCountdown();

  // Load highlighting matches on home page
  const highlightContainer = document.getElementById("home-highlight-matches");
  if (highlightContainer) {
    // Show 4 specific matches on Home
    const highlights = MATCHES.filter(m => m.id === 5 || m.id === 7 || m.id === 13 || m.id === 19);
    highlights.forEach(m => {
      const card = document.createElement("div");
      card.className = "glass-panel match-card";
      card.innerHTML = `
        <div class="match-header">
          <span>Grupo ${m.group} • Rodada ${m.id}</span>
          <span class="match-status live">Ao Vivo</span>
        </div>
        <div class="match-teams" onclick="navigateTo('matches')">
          <div class="team-display left">
            <span class="team-name" style="font-size:12.5px;">${m.homeTeam}</span>
            <span class="team-flag" style="font-size:22px;">${m.homeFlag}</span>
          </div>
          <div class="score-display">
            ${m.homeScore} - ${m.awayScore}
          </div>
          <div class="team-display right">
            <span class="team-flag" style="font-size:22px;">${m.awayFlag}</span>
            <span class="team-name" style="font-size:12.5px;">${m.awayTeam}</span>
          </div>
        </div>
        <div class="match-footer" style="font-size:11px;">
          <span>${m.stadium}</span>
          <span style="color:var(--secondary); font-weight:700;">BRT: ${m.brtTime}</span>
        </div>
      `;
      highlightContainer.appendChild(card);
    });
  }

  // Active Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Auto path register Service Worker relative
  if ("serviceWorker" in navigator) {
    const pathname = window.location.pathname;
    const directory = pathname.substring(0, pathname.lastIndexOf('/'));
    const swPath = directory + '/service-worker.js';
    
    navigator.serviceWorker.register(swPath)
      .then(reg => {
        console.log("[Service Worker] Registrado com sucesso sob escopo:", reg.scope);
      })
      .catch(err => {
        console.error("[Service Worker] Falha no registro:", err);
      });
  }
});

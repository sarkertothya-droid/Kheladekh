import { SportEvent } from '../types';

export const CAPTAIN_PORTRAITS = {
  cricketBan: '/src/assets/images/captain_cricket_ban_1795433591748.jpg',
  cricketIntl: '/src/assets/images/captain_cricket_intl_1795433591082.jpg',
  footballPro: '/src/assets/images/captain_football_pro_1795433590899.jpg',
  footballRival: '/src/assets/images/captain_football_rival_1795433589780.jpg',
  courtStar: '/src/assets/images/captain_basketball_tennis_1795433591192.jpg',
};

// Verified 200 OK Live Sports-Only HLS Broadcast URLs (Zero cartoons or test clips)
export const VERIFIED_SPORTS_STREAMS = {
  GTV_LIVE:
    'https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI2/gazibdz.stream/live-orgin/gazibdz.stream/playlist.m3u8',
  ACC_SPORTS: 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
  FIFA_PLUS:
    'https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8',
  RED_BULL_TV: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
  ACI_SPORT_TV: 'https://webstream.multistream.it/memfs/e2cb3629-c1a2-495b-b43a-9eb386f04ed8.m3u8',
  IRAQIA_SPORT: 'https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8',
  ANTENA_SPORT: 'https://stream1.antenaplay.ro/as/AS.ro/chunklist.m3u8',
  ANTENA_EVENTS: 'https://live77cdn2.antenaplay.ro/live2_sport07/live2_sport07_3500k.m3u8',
  GOLF_KINGDOM: 'https://30a-tv.com/feeds/vidaa/golf.m3u8',
};

const KNOWN_TEAM_CAPTAINS: Record<string, { captain: string; photo: string }> = {
  bangladesh: { captain: 'Najmul Hossain Shanto', photo: CAPTAIN_PORTRAITS.cricketBan },
  'bangladesh a': { captain: 'Saif Hassan', photo: CAPTAIN_PORTRAITS.cricketBan },
  'sri lanka': { captain: 'Charith Asalanka', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'sri lanka a': { captain: 'Sahan Arachchige', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'sri lanka women': { captain: 'Chamari Athapaththu', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'pakistan women': { captain: 'Fatima Sana', photo: CAPTAIN_PORTRAITS.cricketBan },
  'zimbabwe women': { captain: 'Mary-Anne Musonda', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'scotland women': { captain: 'Kathryn Bryce', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'ireland women': { captain: 'Gaby Lewis', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'netherlands women': { captain: 'Babette de Leede', photo: CAPTAIN_PORTRAITS.cricketIntl },
  india: { captain: 'Shubman Gill', photo: CAPTAIN_PORTRAITS.cricketIntl },
  australia: { captain: 'Pat Cummins', photo: CAPTAIN_PORTRAITS.cricketIntl },
  england: { captain: 'Jos Buttler', photo: CAPTAIN_PORTRAITS.cricketIntl },
  pakistan: { captain: 'Mohammad Rizwan', photo: CAPTAIN_PORTRAITS.cricketBan },
  'south africa': { captain: 'Temba Bavuma', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'new zealand': { captain: 'Tom Latham', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'west indies': { captain: 'Roston Chase', photo: CAPTAIN_PORTRAITS.cricketIntl },
  afghanistan: { captain: 'Hashmatullah Shahidi', photo: CAPTAIN_PORTRAITS.cricketBan },
  'afghanistan a': { captain: 'Darwish Rasooli', photo: CAPTAIN_PORTRAITS.cricketBan },
  zimbabwe: { captain: 'Craig Ervine', photo: CAPTAIN_PORTRAITS.cricketIntl },
  ireland: { captain: 'Paul Stirling', photo: CAPTAIN_PORTRAITS.cricketIntl },
  'real madrid': { captain: 'Luka Modric', photo: CAPTAIN_PORTRAITS.footballPro },
  'fc barcelona': { captain: 'Marc-André ter Stegen', photo: CAPTAIN_PORTRAITS.footballRival },
  barcelona: { captain: 'Marc-André ter Stegen', photo: CAPTAIN_PORTRAITS.footballRival },
  'manchester city': { captain: 'Kyle Walker', photo: CAPTAIN_PORTRAITS.footballPro },
  liverpool: { captain: 'Virgil van Dijk', photo: CAPTAIN_PORTRAITS.footballRival },
  arsenal: { captain: 'Martin Ødegaard', photo: CAPTAIN_PORTRAITS.footballPro },
  chelsea: { captain: 'Reece James', photo: CAPTAIN_PORTRAITS.footballRival },
  brentford: { captain: 'Christian Nørgaard', photo: CAPTAIN_PORTRAITS.footballPro },
  everton: { captain: 'Séamus Coleman', photo: CAPTAIN_PORTRAITS.footballRival },
  tottenham: { captain: 'Son Heung-min', photo: CAPTAIN_PORTRAITS.footballPro },
  'bayern munich': { captain: 'Manuel Neuer', photo: CAPTAIN_PORTRAITS.footballRival },
  'atlanta hawks': { captain: 'Trae Young', photo: CAPTAIN_PORTRAITS.courtStar },
  'detroit pistons': { captain: 'Cade Cunningham', photo: CAPTAIN_PORTRAITS.courtStar },
  'miami heat': { captain: 'Bam Adebayo', photo: CAPTAIN_PORTRAITS.courtStar },
  'oklahoma city thunder': { captain: 'Shai Gilgeous-Alexander', photo: CAPTAIN_PORTRAITS.courtStar },
  'la lakers': { captain: 'LeBron James', photo: CAPTAIN_PORTRAITS.courtStar },
  'los angeles lakers': { captain: 'LeBron James', photo: CAPTAIN_PORTRAITS.courtStar },
  'golden state warriors': { captain: 'Stephen Curry', photo: CAPTAIN_PORTRAITS.courtStar },
  'boston celtics': { captain: 'Jaylen Brown', photo: CAPTAIN_PORTRAITS.courtStar },
  'carlos alcaraz': { captain: 'Carlos Alcaraz', photo: CAPTAIN_PORTRAITS.courtStar },
  'jannik sinner': { captain: 'Jannik Sinner', photo: CAPTAIN_PORTRAITS.courtStar },
};

export interface ResolvedMatchCaptains {
  teamAName: string;
  teamBName: string;
  teamACaptain: string;
  teamBCaptain: string;
  teamACaptainPhoto: string;
  teamBCaptainPhoto: string;
}

export function resolveMatchCaptains(event: Partial<SportEvent>): ResolvedMatchCaptains {
  let parsedA = event.teamAName || '';
  let parsedB = event.teamBName || '';

  if (!parsedA || !parsedB) {
    const cleanTitle = (event.title || '')
      .split('—')[0]
      .split(' - ')[0]
      .replace(/\(live\)/gi, '')
      .trim();
    const vsParts = cleanTitle.split(/\s+(?:vs\.?|at)\s+/i);
    if (vsParts.length >= 2) {
      parsedA = parsedA || vsParts[0].trim();
      parsedB = parsedB || vsParts[1].trim();
    } else {
      parsedA = parsedA || cleanTitle || 'Home Team';
      parsedB = parsedB || 'Away Team';
    }
  }

  const lookupCaptain = (
    teamName: string,
    explicitCap?: string,
    explicitPhoto?: string,
    side: 'A' | 'B' = 'A'
  ) => {
    const key = teamName.toLowerCase().trim();
    const known =
      KNOWN_TEAM_CAPTAINS[key] ||
      Object.entries(KNOWN_TEAM_CAPTAINS).find(([k]) => key === k || key.startsWith(`${k} `) || key.includes(k))?.[1];

    const fallbackPhoto =
      event.sportId === 'cricket'
        ? side === 'A'
          ? CAPTAIN_PORTRAITS.cricketBan
          : CAPTAIN_PORTRAITS.cricketIntl
        : event.sportId === 'basketball' || event.sportId === 'tennis'
        ? CAPTAIN_PORTRAITS.courtStar
        : side === 'A'
        ? CAPTAIN_PORTRAITS.footballPro
        : CAPTAIN_PORTRAITS.footballRival;

    return {
      captain: explicitCap || known?.captain || `${teamName} Captain`,
      photo: explicitPhoto || known?.photo || fallbackPhoto,
    };
  };

  const capA = lookupCaptain(parsedA, event.teamACaptain, event.teamACaptainPhoto, 'A');
  const capB = lookupCaptain(parsedB, event.teamBCaptain, event.teamBCaptainPhoto, 'B');

  return {
    teamAName: parsedA,
    teamBName: parsedB,
    teamACaptain: capA.captain,
    teamBCaptain: capB.captain,
    teamACaptainPhoto: capA.photo,
    teamBCaptainPhoto: capB.photo,
  };
}

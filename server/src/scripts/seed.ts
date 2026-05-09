/**
 * Seed the database with demo data.
 * 7 teams, 31 users, 50 reports in Espoo / Helsinki, Finland.
 * All user passwords are set to "password".
 *
 * Run:
 *   npx tsx --env-file=.env src/scripts/seed.ts
 *
 * To wipe all existing data first:
 *   npx tsx --env-file=.env src/scripts/seed.ts --fresh
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { Team } from '../models/Team';
import { TeamMembership } from '../models/TeamMembership';
import { Report } from '../models/Report';
import { ReportLike } from '../models/ReportLike';
import { ReportComment } from '../models/ReportComment';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cycling_buddy';
const FRESH = process.argv.includes('--fresh');

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

const TEAM_DEFS = [
  // 0 — peloton grinding uphill through rolling countryside
  { name: 'Tapiola Tamers',    teamCode: 'TAPM24', photoUrl: 'https://images.unsplash.com/photo-1673890704132-9573476ac27c?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
  // 1 — dramatic purple-lit group ride, fast and fierce
  { name: 'Leppävaara Lynxes', teamCode: 'LEPL37', photoUrl: 'https://images.unsplash.com/photo-1735216228027-fe31c23474ce?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
  // 2 — cheerful pack cruising a park path together
  { name: 'Matinkylä Movers',  teamCode: 'MATK48', photoUrl: 'https://images.unsplash.com/photo-1776145674758-ef3124a25bbb?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
  // 3 — tight road-cycling formation, very organised (fitting for Aalto folks)
  { name: 'Otaniemi Owls',     teamCode: 'NTAN59', photoUrl: 'https://images.unsplash.com/photo-1605050825077-289f85b6cf43?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
  // 4 — relaxed group ride on a sunny paved road
  { name: 'Espoo Centre Crew', teamCode: 'ESPC66', photoUrl: 'https://images.unsplash.com/photo-1772439783106-dff24711a71b?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
  // 5 — race-pace cyclists sprinting on a closed road
  { name: 'Kallio Kickers',    teamCode: 'KALL73', photoUrl: 'https://images.unsplash.com/photo-1605050825221-66a810cb6d36?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
  // 6 — moody black-and-white group out on an adventure
  { name: 'Töölö Trekkers',    teamCode: 'TTLK88', photoUrl: 'https://images.unsplash.com/photo-1713937071114-e94d5f8053a0?fm=jpg&q=80&w=800&h=600&fit=crop&auto=format' },
];

// ---------------------------------------------------------------------------
// Users  (team index matches TEAM_DEFS above)
// ---------------------------------------------------------------------------

const USER_DEFS = [
  // --- Tapiola Tamers ---
  { firstName: 'Matti',   lastName: 'Virtanen',    username: 'matti_v',   team: 0, role: 'coach'  },
  { firstName: 'Liisa',   lastName: 'Korhonen',    username: 'liisa_k',   team: 0, role: 'member' },
  { firstName: 'Pekka',   lastName: 'Mäkinen',     username: 'pekka_m',   team: 0, role: 'member' },
  { firstName: 'Aino',    lastName: 'Jokinen',     username: 'aino_j',    team: 0, role: 'member' },
  // --- Leppävaara Lynxes ---
  { firstName: 'Juhani',  lastName: 'Leinonen',    username: 'juhani_l',  team: 1, role: 'coach'  },
  { firstName: 'Sari',    lastName: 'Heikkinen',   username: 'sari_h',    team: 1, role: 'member' },
  { firstName: 'Mikko',   lastName: 'Niemi',       username: 'mikko_n',   team: 1, role: 'member' },
  { firstName: 'Kaisa',   lastName: 'Laine',       username: 'kaisa_l',   team: 1, role: 'member' },
  { firstName: 'Timo',    lastName: 'Koskinen',    username: 'timo_k',    team: 1, role: 'member' },
  // --- Matinkylä Movers ---
  { firstName: 'Riitta',  lastName: 'Hämäläinen',  username: 'riitta_h',  team: 2, role: 'coach'  },
  { firstName: 'Jari',    lastName: 'Turunen',     username: 'jari_t',    team: 2, role: 'member' },
  { firstName: 'Eija',    lastName: 'Räsänen',     username: 'eija_r',    team: 2, role: 'member' },
  { firstName: 'Ville',   lastName: 'Ahonen',      username: 'ville_a',   team: 2, role: 'member' },
  // --- Otaniemi Owls ---
  { firstName: 'Hannu',   lastName: 'Mäkinen',     username: 'hannu_m',   team: 3, role: 'coach'  },
  { firstName: 'Tiina',   lastName: 'Karvonen',    username: 'tiina_k',   team: 3, role: 'member' },
  { firstName: 'Petri',   lastName: 'Salminen',    username: 'petri_s',   team: 3, role: 'member' },
  { firstName: 'Mervi',   lastName: 'Heikkilä',    username: 'mervi_h',   team: 3, role: 'member' },
  { firstName: 'Olli',    lastName: 'Väisänen',    username: 'olli_v',    team: 3, role: 'member' },
  // --- Espoo Centre Crew ---
  { firstName: 'Pirjo',   lastName: 'Ojala',       username: 'pirjo_o',   team: 4, role: 'coach'  },
  { firstName: 'Antti',   lastName: 'Lahtinen',    username: 'antti_l',   team: 4, role: 'member' },
  { firstName: 'Heli',    lastName: 'Leppänen',    username: 'heli_l',    team: 4, role: 'member' },
  { firstName: 'Juha',    lastName: 'Sorvali',     username: 'juha_s',    team: 4, role: 'member' },
  // --- Kallio Kickers ---
  { firstName: 'Marko',   lastName: 'Pitkänen',    username: 'marko_p',   team: 5, role: 'coach'  },
  { firstName: 'Leena',   lastName: 'Saarinen',    username: 'leena_s',   team: 5, role: 'member' },
  { firstName: 'Tero',    lastName: 'Martikainen', username: 'tero_m',    team: 5, role: 'member' },
  { firstName: 'Riikka',  lastName: 'Holopainen',  username: 'riikka_h',  team: 5, role: 'member' },
  { firstName: 'Jaakko',  lastName: 'Sorsa',       username: 'jaakko_s',  team: 5, role: 'member' },
  // --- Töölö Trekkers ---
  { firstName: 'Anne',    lastName: 'Pihlajamäki', username: 'anne_p',    team: 6, role: 'coach'  },
  { firstName: 'Juho',    lastName: 'Kauppinen',   username: 'juho_k',    team: 6, role: 'member' },
  { firstName: 'Marika',  lastName: 'Laukkanen',   username: 'marika_l',  team: 6, role: 'member' },
  { firstName: 'Kari',    lastName: 'Hakkarainen', username: 'kari_h',    team: 6, role: 'member' },
];

// ---------------------------------------------------------------------------
// Reports (50 total)
// ---------------------------------------------------------------------------

type ReportDef = {
  username: string;
  categoryId: string;
  subcategoryId: string | null;
  address: string;
  lat: number;
  lng: number;
  description: string;
  photoUrl?: string;
};

const REPORT_DEFS: ReportDef[] = [
  // ===== Tapiola Tamers — 9 reports =====
  {
    username: 'matti_v',
    categoryId: 'road-hazard', subcategoryId: 'holes-or-cracks',
    address: 'Tapionaukio 1, Espoo',
    lat: 60.1836, lng: 24.8014,
    description: 'big hole on the side of the path nearly fell',
    photoUrl: 'https://picsum.photos/seed/r001/800/600',
  },
  {
    username: 'liisa_k',
    categoryId: 'broken-or-missing', subcategoryId: 'broken-path',
    address: 'Länsituulentie 4, Espoo',
    lat: 60.1812, lng: 24.7998,
    description: 'The cycle path along Länsituulentie is in a very bad condition following the winter months. The surface has cracked in several places and there is a significant amount of loose gravel and debris which makes it extremely difficult and dangerous to cycle on, especially at higher speeds or in wet weather. This section needs urgent resurfacing.',
    photoUrl: 'https://picsum.photos/seed/r002/800/600',
  },
  {
    username: 'pekka_m',
    categoryId: 'felt-scary', subcategoryId: 'scary-crossing',
    address: 'Merituulentie 12, Espoo',
    lat: 60.1789, lng: 24.8042,
    description: 'Cars just go straight through this crossing without stopping for bikes. It is really scary. I made eye contact with one driver and he just shrugged.',
    photoUrl: 'https://picsum.photos/seed/r003/800/600',
  },
  {
    username: 'aino_j',
    categoryId: 'hard-to-get-around', subcategoryId: 'no-bike-parking',
    address: 'Tapiola Liikekeskus, Espoo',
    lat: 60.1851, lng: 24.8039,
    description: 'no bike parking anywhere near the shops!! had to walk like 5 mins to find a fence lol',
    photoUrl: 'https://picsum.photos/seed/r004/800/600',
  },
  {
    username: 'liisa_k',
    categoryId: 'road-hazard', subcategoryId: 'building-works',
    address: 'Itätuulentie 6, Espoo',
    lat: 60.1826, lng: 24.8071,
    description: 'There are large construction barriers completely blocking the cycle path on Itätuulentie. There is absolutely no signage indicating a diversion route, so cyclists are forced into the main road with no warning. I had to ride on a busy road for about 200 metres before I could get back onto a safe path. This is especially dangerous as this route is used by many children cycling to and from school.',
    photoUrl: 'https://picsum.photos/seed/r005/800/600',
  },
  {
    username: 'matti_v',
    categoryId: 'accident-or-close-call', subcategoryId: 'close-call',
    address: 'Tapiolantie 3, Espoo',
    lat: 60.1842, lng: 24.7989,
    description: 'A car reversed out of a driveway and did not look. I had to stop really fast or I would have crashed into it. I screamed a little bit.',
    photoUrl: 'https://picsum.photos/seed/r006/800/600',
  },
  {
    username: 'pekka_m',
    categoryId: 'broken-or-missing', subcategoryId: 'lights-not-working',
    address: 'Otsolahti, Espoo',
    lat: 60.1775, lng: 24.8018,
    description: 'lights r all broken its so dark',
    photoUrl: 'https://picsum.photos/seed/r007/800/600',
  },
  {
    username: 'aino_j',
    categoryId: 'felt-scary', subcategoryId: 'traffic-too-close',
    address: 'Haukilahdentie 8, Espoo',
    lat: 60.1764, lng: 24.8059,
    description: 'I cycle this road every single day on my way to school and the cars here drive way too fast and way too close to the cycle lane. The lane itself is barely wide enough for one bike. I have reported this to my teacher but nothing has happened. Someone is going to get hurt.',
    photoUrl: 'https://picsum.photos/seed/r008/800/600',
  },
  {
    username: 'liisa_k',
    categoryId: 'hard-to-get-around', subcategoryId: 'path-blocked',
    address: 'Pohjantie 2, Espoo',
    lat: 60.1855, lng: 24.7971,
    description: 'A big delivery van was parked right across the cycle path so I had to go on the road to get past.',
    photoUrl: 'https://picsum.photos/seed/r009/800/600',
  },

  // ===== Leppävaara Lynxes — 8 reports =====
  {
    username: 'juhani_l',
    categoryId: 'road-hazard', subcategoryId: 'unsafe-design',
    address: 'Leppävaarankatu 7, Espoo',
    lat: 60.2195, lng: 24.8123,
    description: 'the path just stops?? at the roundabout?? where do i go',
    photoUrl: 'https://picsum.photos/seed/r010/800/600',
  },
  {
    username: 'sari_h',
    categoryId: 'broken-or-missing', subcategoryId: 'broken-path',
    address: 'Turuntie 22, Espoo',
    lat: 60.2178, lng: 24.8089,
    description: 'The surface of the path on Turuntie has multiple large cracks running across the full width of the lane. Some sections have been pushed up unevenly by frost damage over the winter. There are also raised edges at the joins which could easily catch a front wheel and cause a fall. I measured one crack which was about 4 cm wide. This is a very busy cycle route and needs to be repaired as a priority.',
    photoUrl: 'https://picsum.photos/seed/r011/800/600',
  },
  {
    username: 'mikko_n',
    categoryId: 'felt-scary', subcategoryId: 'hard-to-see',
    address: 'Säterinkatu 4, Espoo',
    lat: 60.2212, lng: 24.8142,
    description: 'The bushes are so overgrown that you cannot see around the corner at all. I had no idea if anything was coming.',
    photoUrl: 'https://picsum.photos/seed/r012/800/600',
  },
  {
    username: 'kaisa_l',
    categoryId: 'hard-to-get-around', subcategoryId: 'no-signs',
    address: 'Ruukinkatu 3, Espoo',
    lat: 60.2201, lng: 24.8105,
    description: 'no signs at all at this junction. got lost. not happy',
    photoUrl: 'https://picsum.photos/seed/r013/800/600',
  },
  {
    username: 'timo_k',
    categoryId: 'accident-or-close-call', subcategoryId: 'accident',
    address: 'Leppävaara Railway Bridge, Espoo',
    lat: 60.2187, lng: 24.8133,
    description: 'I slipped on the metal bit on the bridge because it was wet and fell off and hurt my knee. My friend thought it was funny but it was NOT funny.',
    photoUrl: 'https://picsum.photos/seed/r014/800/600',
  },
  {
    username: 'sari_h',
    categoryId: 'road-hazard', subcategoryId: 'holes-or-cracks',
    address: 'Opinmäki, Espoo',
    lat: 60.2162, lng: 24.8156,
    description: 'puddle was hiding a massive pothole. hit it SO hard. my water bottle flew out',
    photoUrl: 'https://picsum.photos/seed/r015/800/600',
  },
  {
    username: 'mikko_n',
    categoryId: 'broken-or-missing', subcategoryId: 'something-missing',
    address: 'Leppävaara Sports Park, Espoo',
    lat: 60.2223, lng: 24.8098,
    description: 'The bike pump at the sports park has the end bit missing so you cannot pump up your tyres at all. Who even steals the end of a pump. Why would you do that.',
    photoUrl: 'https://picsum.photos/seed/r016/800/600',
  },
  {
    username: 'kaisa_l',
    categoryId: 'felt-scary', subcategoryId: 'traffic-too-close',
    address: 'Kehä I underpass, Espoo',
    lat: 60.2149, lng: 24.8071,
    description: 'The tunnel is so narrow that me and a pedestrian could not fit through at the same time. It is dangerous.',
    photoUrl: 'https://picsum.photos/seed/r017/800/600',
  },

  // ===== Matinkylä Movers — 7 reports =====
  {
    username: 'riitta_h',
    categoryId: 'hard-to-get-around', subcategoryId: 'path-blocked',
    address: 'Matinkatu 10, Espoo',
    lat: 60.1592, lng: 24.7403,
    description: 'roadworks blocking the entire path. had to go on the road which was scary. there wasnt even a sign or anything',
    photoUrl: 'https://picsum.photos/seed/r018/800/600',
  },
  {
    username: 'jari_t',
    categoryId: 'broken-or-missing', subcategoryId: 'broken-path',
    address: 'Piispansilta, Espoo',
    lat: 60.1621, lng: 24.7378,
    description: 'The path near the bridge is all broken with sharp bits sticking up. It makes your whole bike shake really badly.',
    photoUrl: 'https://picsum.photos/seed/r019/800/600',
  },
  {
    username: 'eija_r',
    categoryId: 'felt-scary', subcategoryId: 'scary-crossing',
    address: 'Niittykumpu Metro, Espoo',
    lat: 60.1608, lng: 24.7421,
    description: 'Cars do not stop at the crossing near the metro even when I am already on it. There are no markings for bikes.',
    photoUrl: 'https://picsum.photos/seed/r020/800/600',
  },
  {
    username: 'ville_a',
    categoryId: 'road-hazard', subcategoryId: 'holes-or-cracks',
    address: 'Merituulentie 33, Espoo',
    lat: 60.1577, lng: 24.7441,
    description: 'There are loads of potholes one after the other along this bit. It is impossible to avoid all of them.',
    photoUrl: 'https://picsum.photos/seed/r021/800/600',
  },
  {
    username: 'jari_t',
    categoryId: 'accident-or-close-call', subcategoryId: 'close-call',
    address: 'Matinkartanontie 5, Espoo',
    lat: 60.1634, lng: 24.7389,
    description: 'A dog ran onto the cycle path right in front of me from someone\'s garden. I nearly crashed into it. The dog looked like it was having a great time though.',
    photoUrl: 'https://picsum.photos/seed/r022/800/600',
  },
  {
    username: 'eija_r',
    categoryId: 'hard-to-get-around', subcategoryId: 'no-bike-parking',
    address: 'Matinkylä Shopping Centre, Espoo',
    lat: 60.1599, lng: 24.7413,
    description: 'There are only a few bike spaces outside the shopping centre and they are always completely full when I get there.',
    photoUrl: 'https://picsum.photos/seed/r023/800/600',
  },
  {
    username: 'ville_a',
    categoryId: 'broken-or-missing', subcategoryId: 'lights-not-working',
    address: 'Kivenlahti Coastal Path, Espoo',
    lat: 60.1561, lng: 24.7363,
    description: 'Three street lights on the path by the sea are broken. It is way too dark when I cycle home after school.',
    photoUrl: 'https://picsum.photos/seed/r024/800/600',
  },

  // ===== Otaniemi Owls — 8 reports =====
  {
    username: 'hannu_m',
    categoryId: 'road-hazard', subcategoryId: 'building-works',
    address: 'Otakaari 1, Espoo',
    lat: 60.1875, lng: 24.8293,
    description: 'Big lorries from the building site keep driving across the cycle path and there are no signs warning you.',
    photoUrl: 'https://picsum.photos/seed/r025/800/600',
  },
  {
    username: 'tiina_k',
    categoryId: 'felt-scary', subcategoryId: 'traffic-too-close',
    address: 'Tietotie 4, Espoo',
    lat: 60.1863, lng: 24.8311,
    description: 'cars go SO fast here. the cycle lane is basically nothing',
    photoUrl: 'https://picsum.photos/seed/r026/800/600',
  },
  {
    username: 'petri_s',
    categoryId: 'broken-or-missing', subcategoryId: 'broken-path',
    address: 'Servinmaantie 12, Espoo',
    lat: 60.1891, lng: 24.8278,
    description: 'The edge of the path has crumbled away and you have to swerve towards the cars to get around it.',
    photoUrl: 'https://picsum.photos/seed/r027/800/600',
  },
  {
    username: 'mervi_h',
    categoryId: 'hard-to-get-around', subcategoryId: 'no-signs',
    address: 'Aalto University Campus, Espoo',
    lat: 60.1847, lng: 24.8246,
    description: 'There are no signs for the cycle path anywhere on the campus. I had no idea which way I was supposed to go. I went around the same building three times.',
    photoUrl: 'https://picsum.photos/seed/r028/800/600',
  },
  {
    username: 'olli_v',
    categoryId: 'accident-or-close-call', subcategoryId: 'close-call',
    address: 'Otaranta, Espoo',
    lat: 60.1852, lng: 24.8329,
    description: 'A person stepped onto the cycle path without looking and I nearly crashed straight into them. They said sorry but they did not look very sorry.',
    photoUrl: 'https://picsum.photos/seed/r029/800/600',
  },
  {
    username: 'tiina_k',
    categoryId: 'road-hazard', subcategoryId: 'holes-or-cracks',
    address: 'Maarintie 8, Espoo',
    lat: 60.1879, lng: 24.8302,
    description: 'There is a really long crack going diagonally across the path. If your front wheel goes in it you could fall off.',
    photoUrl: 'https://picsum.photos/seed/r030/800/600',
  },
  {
    username: 'petri_s',
    categoryId: 'felt-scary', subcategoryId: 'hard-to-see',
    address: 'Otaniemi Bay Path, Espoo',
    lat: 60.1836, lng: 24.8257,
    description: 'Trees hang right over the path and when it is sunny in the evening the glare is so bad you cannot see where you are going.',
    photoUrl: 'https://picsum.photos/seed/r031/800/600',
  },
  {
    username: 'mervi_h',
    categoryId: 'broken-or-missing', subcategoryId: 'something-missing',
    address: 'Aalto Metro Station, Espoo',
    lat: 60.1863, lng: 24.8278,
    description: 'There is no roof over the bike parking at the metro so all the bikes get completely soaked when it rains. My seat was like a swimming pool. It was disgusting.',
    photoUrl: 'https://picsum.photos/seed/r032/800/600',
  },

  // ===== Espoo Centre Crew — 7 reports =====
  {
    username: 'pirjo_o',
    categoryId: 'hard-to-get-around', subcategoryId: 'path-blocked',
    address: 'Espoonkatu 4, Espoo',
    lat: 60.2052, lng: 24.6559,
    description: 'market stalls take up the whole cycle lane on saturdays. completely blocked',
    photoUrl: 'https://picsum.photos/seed/r033/800/600',
  },
  {
    username: 'antti_l',
    categoryId: 'road-hazard', subcategoryId: 'unsafe-design',
    address: 'Siltakatu 2, Espoo',
    lat: 60.2038, lng: 24.6572,
    description: 'The cycle lane suddenly turns into a path for walkers too and there is no sign to warn you before it happens.',
    photoUrl: 'https://picsum.photos/seed/r034/800/600',
  },
  {
    username: 'heli_l',
    categoryId: 'broken-or-missing', subcategoryId: 'broken-path',
    address: 'Espoo City Hall, Espoo',
    lat: 60.2061, lng: 24.6547,
    description: 'whoever fixed the road works did a terrible job. there is a massive ridge across the whole path. my teeth nearly fell out when i went over it',
    photoUrl: 'https://picsum.photos/seed/r035/800/600',
  },
  {
    username: 'juha_s',
    categoryId: 'felt-scary', subcategoryId: 'scary-crossing',
    address: 'Kivimäentie crossing, Espoo',
    lat: 60.2044, lng: 24.6589,
    description: 'Cars come really fast from the right at this crossing and it is not clear at all who is supposed to go first.',
    photoUrl: 'https://picsum.photos/seed/r036/800/600',
  },
  {
    username: 'antti_l',
    categoryId: 'accident-or-close-call', subcategoryId: 'close-call',
    address: 'Koskikuja, Espoo',
    lat: 60.2029, lng: 24.6533,
    description: 'A person stepped out from behind a parked bus right in front of me and I had to swerve really fast.',
    photoUrl: 'https://picsum.photos/seed/r037/800/600',
  },
  {
    username: 'heli_l',
    categoryId: 'hard-to-get-around', subcategoryId: 'no-bike-parking',
    address: 'Espoo Train Station',
    lat: 60.2055, lng: 24.6568,
    description: 'The bike racks at the station are always completely full. I had to leave my bike really far away and then run. I missed my train. This is the worst.',
    photoUrl: 'https://picsum.photos/seed/r038/800/600',
  },
  {
    username: 'juha_s',
    categoryId: 'road-hazard', subcategoryId: 'holes-or-cracks',
    address: 'Viiskulma, Espoo',
    lat: 60.2073, lng: 24.6512,
    description: 'There are loads of potholes right next to the junction. I went through them fast and nearly fell off.',
    photoUrl: 'https://picsum.photos/seed/r039/800/600',
  },

  // ===== Kallio Kickers — 6 reports =====
  {
    username: 'marko_p',
    categoryId: 'felt-scary', subcategoryId: 'traffic-too-close',
    address: 'Fleminginkatu 14, Helsinki',
    lat: 60.1833, lng: 24.9513,
    description: 'The tram tracks and the cycle lane are squished really close together here. My wheel nearly got stuck in the track. I did a massive wobble. Several people saw.',
    photoUrl: 'https://picsum.photos/seed/r040/800/600',
  },
  {
    username: 'leena_s',
    categoryId: 'broken-or-missing', subcategoryId: 'broken-path',
    address: 'Hämeentie 26, Helsinki',
    lat: 60.1812, lng: 24.9487,
    description: 'big section of the lane is all broken up. been like this for ages',
    photoUrl: 'https://picsum.photos/seed/r041/800/600',
  },
  {
    username: 'tero_m',
    categoryId: 'road-hazard', subcategoryId: 'holes-or-cracks',
    address: 'Siltasaarenkatu 2, Helsinki',
    lat: 60.1789, lng: 24.9521,
    description: 'There are three really deep potholes right at the start of the cycle lane. They are very hard to miss.',
    photoUrl: 'https://picsum.photos/seed/r042/800/600',
  },
  {
    username: 'riikka_h',
    categoryId: 'hard-to-get-around', subcategoryId: 'no-signs',
    address: 'Kallio Library, Helsinki',
    lat: 60.1821, lng: 24.9498,
    description: 'There are no signs for cyclists anywhere at this junction. I went the wrong way two times already.',
    photoUrl: 'https://picsum.photos/seed/r043/800/600',
  },
  {
    username: 'jaakko_s',
    categoryId: 'accident-or-close-call', subcategoryId: 'close-call',
    address: 'Vaasankatu 8, Helsinki',
    lat: 60.1844, lng: 24.9501,
    description: 'A car door swung open right into the cycle lane in front of me. I had to swerve into the road so I would not get hit.',
    photoUrl: 'https://picsum.photos/seed/r044/800/600',
  },
  {
    username: 'leena_s',
    categoryId: 'felt-scary', subcategoryId: 'scary-crossing',
    address: 'Porthaninkatu, Helsinki',
    lat: 60.1853, lng: 24.9479,
    description: 'The crossing is not very bright and the green light for bikes is so short that cars just kept going through.',
    photoUrl: 'https://picsum.photos/seed/r045/800/600',
  },

  // ===== Töölö Trekkers — 5 reports =====
  {
    username: 'anne_p',
    categoryId: 'hard-to-get-around', subcategoryId: 'path-blocked',
    address: 'Mannerheimintie 40, Helsinki',
    lat: 60.1731, lng: 24.9198,
    description: 'Big tourist buses are parked right across the cycle lane near the stadium. One tourist took a photo of me trying to squeeze past. I am probably in someone\'s holiday album now.',
    photoUrl: 'https://picsum.photos/seed/r046/800/600',
  },
  {
    username: 'juho_k',
    categoryId: 'road-hazard', subcategoryId: 'building-works',
    address: 'Sibeliuksenkatu 6, Helsinki',
    lat: 60.1752, lng: 24.9213,
    description: 'scaffolding over the path with no diversion. had to go under it which felt unsafe',
    photoUrl: 'https://picsum.photos/seed/r047/800/600',
  },
  {
    username: 'marika_l',
    categoryId: 'broken-or-missing', subcategoryId: 'lights-not-working',
    address: 'Töölönlahti lakeside path, Helsinki',
    lat: 60.1769, lng: 24.9187,
    description: 'Lots of the lights are broken on the path next to the lake. It is really dark in the evenings.',
    photoUrl: 'https://picsum.photos/seed/r048/800/600',
  },
  {
    username: 'kari_h',
    categoryId: 'felt-scary', subcategoryId: 'hard-to-see',
    address: 'Helsinginkatu 2, Helsinki',
    lat: 60.1788, lng: 24.9221,
    description: 'A giant advertising board is blocking the view just before the junction. It is an advert for a car. I think the car people put it there on purpose.',
    photoUrl: 'https://picsum.photos/seed/r049/800/600',
  },
  {
    username: 'anne_p',
    categoryId: 'accident-or-close-call', subcategoryId: 'accident',
    address: 'Töölö Sports Hall, Helsinki',
    lat: 60.1745, lng: 24.9204,
    description: 'I hit a manhole cover that was sticking up at the edge of the lane and it burst my front tyre completely.',
    photoUrl: 'https://picsum.photos/seed/r050/800/600',
  },
];

// ---------------------------------------------------------------------------
// Engagement (likes + comments seeded on ~40 % of reports)
// ---------------------------------------------------------------------------

const COMMENT_TEXTS = [
  'scary!!',
  'so dangerous omg',
  'I cycled here with my dad and he said a bad word lol',
  'this is literally on the way to my school and i have to go through it every single day and its SO bad. my mum says she will write a letter',
  'fell here once. not fun.',
  'me and my friends all go round the long way now because of this 😭',
  'WHY HAS NOBODY FIXED THIS YET',
  'i reported this with my mum and we got an email back but then nothing happened and that was like 3 months ago',
  'nearly crashed here yesterday. there was a big puddle hiding the pothole and i went straight into it. my bike is fine but i was not fine',
  'yes same!!!',
  'my brother says it was like this last year too. just leave it forever i guess 🙄',
  'the drain sticks up really high here and your wheel gets caught. happened to me twice',
  'this is right outside the chip shop so its always busy and really hard to get past safely',
  'agree',
  'I told my teacher about this and she said to report it on here so here i am reporting it. please fix it thank you',
  'cars park on the path here and you have to go into the road which is scary when its busy',
  'its worse in the rain',
  'my grandad says this street has always been bad and he used to cycle here when he was a kid too!! how has it not been fixed in that long!!',
  'yes this one is bad',
  '👎👎👎',
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  if (FRESH) {
    console.log('--fresh: dropping all collections…');
    await Promise.all([
      User.deleteMany({}),
      UserProfile.deleteMany({}),
      Team.deleteMany({}),
      TeamMembership.deleteMany({}),
      Report.deleteMany({}),
      ReportLike.deleteMany({}),
      ReportComment.deleteMany({}),
    ]);
    console.log('Collections cleared.');
  }

  const passwordHash = await bcrypt.hash('password', 10);

  // Teams
  console.log('Creating teams…');
  const teamDocs = await Team.insertMany(
    TEAM_DEFS.map(t => ({ name: t.name, teamCode: t.teamCode, photoUrl: t.photoUrl, totalPoints: 0 })),
  );

  // Users
  console.log('Creating users…');
  const userDocs = await User.insertMany(
    USER_DEFS.map(u => ({
      username: u.username,
      passwordHash,
      isCoach: u.role === 'coach',
    })),
  );

  // Profiles
  console.log('Creating user profiles…');
  await UserProfile.insertMany(
    userDocs.map((doc, i) => ({
      userId: doc._id,
      firstName: USER_DEFS[i].firstName,
      lastName: USER_DEFS[i].lastName,
    })),
  );

  // Memberships
  console.log('Creating team memberships…');
  await TeamMembership.insertMany(
    userDocs.map((doc, i) => ({
      userId: doc._id,
      teamId: teamDocs[USER_DEFS[i].team]._id,
      role: USER_DEFS[i].role,
      joinedAt: new Date(),
      leftAt: null,
    })),
  );

  // Build username → { userId, teamIdx } lookup
  const userMap = new Map<string, { userId: mongoose.Types.ObjectId; teamIdx: number }>();
  userDocs.forEach((doc, i) => {
    userMap.set(USER_DEFS[i].username, {
      userId: doc._id as mongoose.Types.ObjectId,
      teamIdx: USER_DEFS[i].team,
    });
  });

  // Reports + track points per team
  console.log('Creating reports…');
  const pointsPerTeam = new Map<number, number>();

  const reportInserts = REPORT_DEFS.map(r => {
    const user = userMap.get(r.username)!;
    pointsPerTeam.set(user.teamIdx, (pointsPerTeam.get(user.teamIdx) ?? 0) + 50);
    return {
      userId: user.userId,
      categoryId: r.categoryId,
      subcategoryId: r.subcategoryId,
      address: r.address,
      coords: { lat: r.lat, lng: r.lng },
      location: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      description: r.description,
      photoUrl: r.photoUrl ?? '',
    };
  });

  const reportDocs = await Report.insertMany(reportInserts);

  // Update totalPoints on each team
  console.log('Updating team points…');
  await Promise.all(
    Array.from(pointsPerTeam.entries()).map(([teamIdx, points]) =>
      Team.updateOne({ _id: teamDocs[teamIdx]._id }, { $set: { totalPoints: points } }),
    ),
  );

  // Likes and comments on ~40 % of reports (indices where i % 5 < 2)
  console.log('Adding likes and comments…');
  const likesToInsert: { reportId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }[] = [];
  const commentsToInsert: { reportId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId; text: string }[] = [];
  const likeCountById   = new Map<string, number>();
  const commentCountById = new Map<string, number>();

  for (let i = 0; i < reportDocs.length; i++) {
    if (i % 5 >= 4) continue;

    const reportDoc = reportDocs[i];
    const reportId  = reportDoc._id as mongoose.Types.ObjectId;
    const authorId  = reportDoc.userId.toString();
    const others    = userDocs.filter(u => u._id.toString() !== authorId);

    // 1–3 likes, deterministically chosen
    const likeCount = (i % 3) + 1;
    const likersSeen = new Set<string>();
    for (let j = 0; j < likeCount; j++) {
      const liker = others[(i + j * 7) % others.length];
      const lid   = liker._id.toString();
      if (!likersSeen.has(lid)) {
        likersSeen.add(lid);
        likesToInsert.push({ reportId, userId: liker._id as mongoose.Types.ObjectId });
      }
    }
    likeCountById.set(reportId.toString(), likersSeen.size);

    // 1–2 comments, deterministically chosen
    const numComments = (i % 2) + 1;
    for (let j = 0; j < numComments; j++) {
      const commenter = others[(i + j * 11) % others.length];
      const text      = COMMENT_TEXTS[(i + j * 3) % COMMENT_TEXTS.length];
      commentsToInsert.push({ reportId, userId: commenter._id as mongoose.Types.ObjectId, text });
    }
    commentCountById.set(reportId.toString(), numComments);
  }

  await ReportLike.insertMany(likesToInsert);
  await ReportComment.insertMany(commentsToInsert);

  await Promise.all([
    ...Array.from(likeCountById.entries()).map(([id, count]) =>
      Report.updateOne({ _id: id }, { $set: { likeCount: count } }),
    ),
    ...Array.from(commentCountById.entries()).map(([id, count]) =>
      Report.updateOne({ _id: id }, { $set: { commentCount: count } }),
    ),
  ]);

  const engagedCount = likeCountById.size;
  console.log(
    `Done. ${teamDocs.length} teams, ${userDocs.length} users, ${reportInserts.length} reports ` +
    `(${engagedCount} with likes/comments, ${likesToInsert.length} likes, ${commentsToInsert.length} comments).`,
  );
  console.log('\nTeam codes:');
  TEAM_DEFS.forEach(t => console.log(`  ${t.name.padEnd(22)} ${t.teamCode}`));
  console.log('\nAll passwords: "password"');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

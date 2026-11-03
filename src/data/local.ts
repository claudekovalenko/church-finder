import type { Church } from '../domain/types';

/**
 * The long list: Protestant churches from Buena Park out to Huntington Beach,
 * gathered in November 2026 from church directories, network listings (TGC
 * Orange County, Founders, Sovereign Grace, SCARBC, the OPC), Biola's local
 * church list, and SermonAudio pages.
 *
 * The same rule as the shortlist applies, and matters more here: **no
 * doctrinal values are filled in.** A name and a directory entry say almost
 * nothing about what is preached. Each church starts at zero confidence with
 * the stage "Not yet looked at"; moving one to Shortlist is how it enters the
 * question list.
 *
 * Addresses come from directories and some disagree with each other — where
 * they did, the note says so. `traditionId` is set only where the church or a
 * network listing states the affiliation, never from the name alone.
 *
 * Deliberately left out: Roman Catholic, Orthodox, Latter-day Saint, Jehovah's
 * Witness, Seventh-day Adventist, Christian Science, Oneness Pentecostal, and
 * progressive mainline congregations. The Networks tab says why.
 */
function local(
  id: string,
  name: string,
  locale: string,
  affiliation: string,
  summary: string,
  notes: string,
  extra: Partial<Church> = {},
): Church {
  return {
    id,
    name,
    kind: 'candidate',
    stage: 'long-list',
    locale,
    affiliation,
    summary,
    notes,
    values: {},
    visits: [],
    ...extra,
  };
}

export const LOCAL_CHURCHES: Church[] = [
  // ------------------------------------------------- Reformed Baptist (1689)
  local(
    'branches-fullerton',
    'Branches Fullerton',
    '1601 W Malvern Ave, Fullerton',
    'Listed as Reformed Baptist (Biola local church list)',
    'Listed as Reformed Baptist by Biola — a short drive from Buena Park.',
    [
      'Biola’s church list files it as Reformed Baptist. A directory shows Temple Baptist',
      'Church at the same address, so it may be a renamed or replanted congregation —',
      'worth asking its history.',
      '',
      'Confirm the confession (1689?), and ask the same question as at Trinity: is',
      'continuationism a permitted position here?',
    ].join('\n'),
    { traditionId: 'reformed-baptist-1689' },
  ),

  // --------------------------------------------------------- Sovereign Grace
  local(
    'cross-of-grace-santa-ana',
    'Cross of Grace Church (Santa Ana)',
    'Santa Ana',
    'Sovereign Grace Churches',
    'A Sovereign Grace church plant, described by the network as cross-cultural in mission.',
    [
      'Planted out of Sovereign Grace Church of Orange. Network posts name it both',
      '“Cross of Grace” and “Sovereign Grace Church of Santa Ana” — confirm the',
      'current name and pastor.',
      '',
      'A young plant is worth watching for a different reason than an established',
      'church: you would see planting up close.',
    ].join('\n'),
    { traditionId: 'sovereign-grace-churches' },
  ),

  // ------------------------------------------------------- TGC Orange County
  local(
    'fountain-of-life-fellowship',
    'Fountain of Life Fellowship',
    '9120 Heil Ave, Fountain Valley',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory. About 20 minutes from Buena Park.',
    'Lead pastor Matt Ford, per the TGC directory. TGC membership means the pastor affirms its foundation documents; it says nothing about baptism or the gifts.',
  ),
  local(
    'roots-community-church',
    'Roots Community Church',
    '150 Paularino Ave, Bldg B, Costa Mesa',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory.',
    'Lead pastor Dylan Budd, per the TGC directory.',
  ),
  local(
    'village-church-irvine',
    'Village Church',
    '77 Post, Irvine',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory.',
    'Lead pastor Matt Kyser, per the TGC directory. Further than most of this list.',
  ),
  local(
    'redeemer-church-oc',
    'Redeemer Church OC',
    'Orange County',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory.',
    'The directory page did not give a location in search results. Find it before anything else — it may be too far.',
  ),
  local(
    'cross-of-christ',
    'Cross of Christ',
    'Orange County',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory.',
    'Location not confirmed yet.',
  ),
  local(
    'christ-community-laguna-hills',
    'Christ Community Church',
    '25382 Mackenzie St, Laguna Hills',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory. South County — a long drive.',
    'Lead pastor Ric Rodeheaver, per the TGC directory.',
  ),
  local(
    'saving-grace-lake-forest',
    'Saving Grace Community Church',
    '22882 Loumont Dr, Lake Forest',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory. South County — a long drive.',
    'Lead pastor Bill Foote, per the TGC directory.',
  ),
  local(
    'grace-church-laguna-niguel',
    'Grace Church',
    '24600 La Plata Dr, Laguna Niguel',
    'TGC Orange County chapter',
    'Listed in the Gospel Coalition’s Orange County church directory. South County — a long drive.',
    'Lead pastor James Wenger, per the TGC directory.',
  ),

  // ---------------------------------------------------------- Baptist (SBC etc.)
  local(
    'first-southern-baptist-buena-park',
    'First Southern Baptist Church of Buena Park',
    '6801 Western Ave, Buena Park',
    'Southern Baptist (by name)',
    'The Southern Baptist church in Buena Park itself.',
    'Southern Baptist churches range from Founders-Reformed to revivalist. Ask about soteriology and whether it is elder-led or pastor-and-deacons.',
    { traditionId: 'southern-baptist' },
  ),
  local(
    'first-southern-baptist-cypress',
    'First Southern Baptist Church of Cypress',
    'Cypress',
    'Southern Baptist (by name)',
    'Southern Baptist, next door to Buena Park.',
    'Listed in a Cypress church directory; address not confirmed.',
    { traditionId: 'southern-baptist' },
  ),
  local(
    'first-southern-baptist-anaheim',
    'First Southern Baptist Church of Anaheim',
    'Anaheim',
    'Southern Baptist',
    'Pastored by the Orange County Southern Baptist Association’s missions strategist, per Baptist Press.',
    'Hosted sports outreach during the 2022 SBC Crossover in Anaheim. A church whose pastor leads the association’s missions work is worth asking about local evangelism and planting.',
    { traditionId: 'southern-baptist' },
  ),
  local(
    'first-baptist-garden-grove',
    'First Baptist Church of Garden Grove',
    '12761 Euclid St, Garden Grove',
    'Listed in the Founders Ministries church search',
    'On the Founders church search, which lists churches holding to the doctrines of grace.',
    'Founders listing is a strong hint toward Reformed soteriology and Baptist practice. Confirm the confession and whether it is elder-led.',
  ),
  local(
    'huntington-beach-baptist',
    'Huntington Beach Baptist Church',
    '8121 Ellis Ave, Huntington Beach',
    'Baptist (affiliation not confirmed)',
    'Baptist church in Huntington Beach.',
    'Find out which Baptist family: independent fundamental, SBC, or other.',
  ),
  local(
    'first-baptist-los-alamitos',
    'First Baptist Church of Los Alamitos',
    '4000 Green Ave, Los Alamitos',
    'Baptist (affiliation not confirmed)',
    'Baptist church in Los Alamitos.',
    'Affiliation not confirmed.',
  ),
  local(
    'whittier-area-community',
    'Whittier Area Community Church',
    'Whittier',
    'Converge (formerly Baptist General Conference)',
    'Converge church, per Biola’s list. Converge is the network Bethlehem Baptist (Piper’s church) belongs to.',
    'Converge is broad. Ask about the gifts, soteriology and who may be an elder.',
  ),

  // ------------------------------------------------------- Bible churches
  local(
    'bible-church-buena-park',
    'Bible Church of Buena Park',
    '8041 7th St, Buena Park',
    'Independent (by name)',
    'A Bible church in Buena Park itself.',
    'Bible churches are often expository and elder-led, and often dispensational and cessationist. Ask about both.',
  ),
  local(
    'community-bible-anaheim',
    'Community Bible Church',
    '2930 W Ball Rd, Anaheim',
    'Independent',
    'Bible church with sermons on SermonAudio — so you can hear the preaching before you visit.',
    'Listen to a few sermons first; they will answer the preaching axis faster than any visit.',
  ),
  local(
    'cornerstone-bible-fullerton',
    'Cornerstone Bible Church',
    'Fullerton',
    'Non-denominational (Biola local church list)',
    'Listed on Biola’s local church list.',
    'Address not confirmed.',
  ),
  local(
    'grace-community-long-beach',
    'Grace Community Church of Long Beach',
    '10911 Oak St, Los Alamitos',
    'Independent, non-denominational',
    'Founded in 1975 as an independent Bible-teaching church; sermons on SermonAudio.',
    'Despite the name it meets in Los Alamitos, which is closer to you than Long Beach.',
  ),
  local(
    'seacoast-grace-cypress',
    'SeaCoast Grace Church',
    '5100 Cerritos Ave, Cypress',
    'Not confirmed',
    'Grace Community Church of Cypress, now known as SeaCoast Grace Church.',
    'A few minutes from Buena Park. Affiliation not confirmed.',
  ),
  local(
    'family-bible-la-habra',
    'Family Bible Church',
    '123 E 2nd Ave, La Habra',
    'Independent (by name)',
    'Bible church in La Habra.',
    'Affiliation not confirmed.',
  ),
  local(
    'compass-bible-aliso-viejo',
    'Compass Bible Church',
    'Aliso Viejo',
    'Independent',
    'Mike Fabarez’s church: expository, and known for evangelism training. Has planted several churches.',
    [
      'A long drive from Buena Park, so likely a reference point rather than a home —',
      'but worth knowing whether it has a plant or campus nearer you. Generally',
      'understood to be cessationist; confirm.',
    ].join('\n'),
  ),

  // ---------------------------------------------- Presbyterian and Reformed
  local(
    'calvary-opc-la-mirada',
    'Calvary Orthodox Presbyterian Church',
    '12206 La Mirada Blvd, La Mirada',
    'Orthodox Presbyterian Church',
    'Confessional OPC congregation in La Mirada since the late 1950s. Morning and afternoon worship.',
    'Paedobaptist, so it costs points on baptism without being ruled out. Very close to Trinity — a good comparison.',
    { traditionId: 'presbyterian-pca' },
  ),
  local(
    'theophilus-opc-anaheim',
    'Theophilus Orthodox Presbyterian Church',
    'Anaheim',
    'Orthodox Presbyterian Church',
    'OPC congregation in Anaheim, organised in 2000.',
    'Address and service times not confirmed.',
    { traditionId: 'presbyterian-pca' },
  ),
  local(
    'faith-presbyterian-long-beach',
    'Faith Presbyterian Church',
    '500 E San Antonio Dr, Long Beach',
    'Orthodox Presbyterian Church (per its SermonAudio listing)',
    'Confessional Presbyterian church in Long Beach with morning and evening worship.',
    'Paedobaptist.',
    { traditionId: 'presbyterian-pca' },
  ),
  local(
    'christ-reformed-anaheim',
    'Christ Reformed Church',
    'Anaheim',
    'United Reformed Churches (URCNA), unconfirmed',
    'A URC congregation in Anaheim, mentioned by attenders online.',
    'Not confirmed from an official listing. Paedobaptist and confessionally Reformed (Three Forms of Unity).',
    { traditionId: 'presbyterian-pca' },
  ),
  local(
    'new-life-mission-fullerton',
    'New Life Mission Church',
    'Fullerton',
    'PCA (Korean Southwest presbytery); TGC Orange County chapter',
    'Korean-American PCA church, also in the TGC Orange County directory.',
    'Ask about English-language ministry and whether a non-Korean family would be fully at home.',
    { traditionId: 'presbyterian-pca' },
  ),
  local(
    'long-beach-crc',
    'Long Beach Christian Reformed Church',
    '5559 E Wardlow Rd, Long Beach',
    'Christian Reformed Church in North America',
    'CRC congregation in Long Beach.',
    'The CRCNA permits congregations to open every office to women, which would cross your line on who may be an elder. Confirm this congregation’s practice before visiting.',
  ),

  // ------------------------------------------------ Evangelical Free (EFCA)
  local(
    'evfree-fullerton',
    'First Evangelical Free Church of Fullerton (EvFree Fullerton)',
    '2801 N Brea Blvd, Fullerton',
    'Evangelical Free Church of America',
    'Large, long-established EFCA church in Fullerton.',
    'Directories also give 2904 N Brea Blvd. The EFCA leaves eldership, baptism and the gifts largely to each congregation — ask how this one has settled them.',
  ),
  local(
    'grace-evfree-la-mirada',
    'Grace Evangelical Free Church of La Mirada',
    '12717 Santa Gertrudes Ave, La Mirada',
    'Evangelical Free Church of America',
    'EFCA church in La Mirada with Spanish services and a weekly food pantry.',
    'Near Biola, so likely a lot of students and staff.',
  ),
  local(
    'neighborhood-church-cypress',
    'Neighborhood Church',
    'Cypress',
    'Evangelical Free Church of America',
    'EFCA church in Cypress.',
    'Address not confirmed.',
  ),
  local(
    'evfree-huntington-beach',
    'Evangelical Free Church of Huntington Beach',
    'Huntington Beach',
    'Evangelical Free Church of America',
    'EFCA church in Huntington Beach.',
    'Address not confirmed.',
  ),

  // ------------------------------------------------------ Calvary Chapel
  local(
    'calvary-chapel-la-palma',
    'Calvary Chapel La Palma',
    '8300 Valley View St, Buena Park (meets at St. Joseph’s)',
    'Calvary Chapel',
    'Calvary Chapel meeting in Buena Park.',
    'Calvary Chapels are usually verse-by-verse and pastor-led rather than elder-led, and generally not Reformed in soteriology. Ask about both.',
  ),
  local(
    'calvary-chapel-anaheim',
    'Calvary Chapel Anaheim',
    '270 E Palais Rd, Anaheim',
    'Calvary Chapel',
    'Calvary Chapel in Anaheim.',
    'Same questions as any Calvary Chapel: oversight and soteriology.',
  ),
  local(
    'refuge-calvary-hb',
    'Refuge Calvary Chapel',
    '7800 Edinger Ave, Huntington Beach',
    'Calvary Chapel',
    'Calvary Chapel in Huntington Beach.',
    'Same questions as any Calvary Chapel: oversight and soteriology.',
  ),
  local(
    'calvary-chapel-beachside',
    'Calvary Chapel Beachside',
    '19400 Beach Blvd, Ste 26, Huntington Beach',
    'Calvary Chapel',
    'Calvary Chapel in Huntington Beach.',
    'Same questions as any Calvary Chapel: oversight and soteriology.',
  ),
  local(
    'calvary-homestead',
    'Calvary Homestead',
    '15144 Leffingwell Rd, La Mirada',
    'Not confirmed',
    'Bible-teaching church near Biola.',
    'Affiliation not confirmed.',
  ),

  // ------------------------------------------- Other evangelical families
  local(
    'redeemer-alliance-fullerton',
    'Redeemer Alliance Church',
    '620 S Roosevelt Ave, Fullerton',
    'Christian and Missionary Alliance',
    'C&MA church in Fullerton. The Alliance has a strong historic missions-sending culture.',
    'C&MA practises believer baptism. Ask about women in eldership — the denomination has revisited women’s roles in recent years.',
  ),
  local(
    'los-altos-grace-brethren',
    'Los Altos Grace Brethren Church',
    '6565 E Stearns St, Long Beach',
    'Fellowship of Grace Brethren Churches',
    'Grace Brethren church in east Long Beach.',
    'Grace Brethren practise believer baptism (trine immersion) and are generally complementarian.',
  ),
  local(
    'antioch-fullerton',
    'Antioch Community Church Fullerton',
    '524 W Commonwealth Ave, Ste C, Fullerton',
    'Non-denominational (Biola local church list)',
    'Listed on Biola’s local church list.',
    'If it belongs to the Antioch network out of Waco, expect a strong missions and planting culture and charismatic practice. Confirm.',
  ),
  local(
    'southlands-brea',
    'Southlands Church',
    'Brea',
    'Non-denominational, with its own planting network',
    'Founded 1967. Reports planting 12 churches in 14 years, and leads a regional network of partner churches.',
    'One of the few local churches with a demonstrable planting record. Ask about the gifts, eldership and size — it is multisite.',
  ),
  local(
    'cottonwood-los-alamitos',
    'Cottonwood Church',
    '3311 Sausalito St, Los Alamitos',
    'Non-denominational',
    'Large non-denominational church.',
    'Probably too big to be known in, by your own size preference — but it is close.',
  ),
  local(
    'seabreeze-hb',
    'Seabreeze Church',
    'Huntington Beach',
    'Not confirmed',
    'Church in Huntington Beach.',
    'Affiliation not confirmed.',
  ),
];

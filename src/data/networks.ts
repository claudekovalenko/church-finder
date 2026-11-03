/**
 * The national picture: denominations, networks and well-known congregations
 * across the US, sorted against your convictions.
 *
 * This is reference material, not scoring. A network tells you what a church
 * has promised; only the congregation tells you what it does. Where a family
 * has an archetype in the Traditions list, `traditionId` links to it so it can
 * be scored properly.
 *
 * Written November 2026 from general knowledge of these bodies. Positions
 * shift — the PCA, SBC, C&MA and others have all revisited questions in the
 * last decade — so check a body's current statement before relying on a line
 * here.
 */

export type Fit = 'aligned' | 'partly' | 'outside';

export interface Network {
  id: string;
  name: string;
  fit: Fit;
  /** What kind of body it is: a denomination, an association, a directory. */
  kind: string;
  /** One line on baptism, offices, soteriology and the gifts, as they bear on you. */
  stance: string;
  /** Why it sits where it does for you. */
  note: string;
  /** Where to find its churches. */
  finder?: string;
  traditionId?: string;
}

export interface NotableChurch {
  name: string;
  city: string;
  family: string;
  why: string;
  caution?: string;
}

export const FIT_LABEL: Record<Fit, string> = {
  aligned: 'Closest to you',
  partly: 'Sound, with a real difference',
  outside: 'Ruled out',
};

export const FIT_HELP: Record<Fit, string> = {
  aligned: 'Credobaptist, complementarian, Reformed in soteriology — the families where your convictions are normal.',
  partly:
    'Orthodox and worth knowing, but each differs from you somewhere that matters: baptism, eldership, soteriology, or the gifts.',
  outside:
    'Outside historic Protestant orthodoxy, or bound to an authority beside Scripture. Not churches to evaluate for membership.',
};

export const NETWORKS: Network[] = [
  // --------------------------------------------------------------- aligned
  {
    id: 'arbca',
    name: 'Association of Reformed Baptist Churches of America (ARBCA)',
    fit: 'aligned',
    kind: 'Association',
    stance: '1689 confessional, credobaptist, complementarian, elder-led. Mostly cessationist.',
    note: 'The largest US association of 1689 churches. Expect settled doctrine and careful ecclesiology; ask about the gifts.',
    finder: 'https://www.arbca.com',
    traditionId: 'reformed-baptist-1689',
  },
  {
    id: 'scarbc',
    name: 'Southern California Association of Reformed Baptist Churches (SCARBC)',
    fit: 'aligned',
    kind: 'Regional association',
    stance: '1689 confessional. Trinity Reformed Baptist in La Mirada is a member.',
    note: 'Your nearest Reformed Baptist fellowship. Its member list is the best local starting point for 1689 churches.',
    finder: 'https://scarbc.org',
    traditionId: 'reformed-baptist-1689',
  },
  {
    id: 'reformed-baptist-network',
    name: 'Reformed Baptist Network',
    fit: 'aligned',
    kind: 'Network',
    stance: '1689 confessional, credobaptist, elder-led.',
    note: 'A newer 1689 network, smaller than ARBCA. Worth comparing with ARBCA on how each handles the gifts and church planting.',
    finder: 'https://reformedbaptistnetwork.com',
    traditionId: 'reformed-baptist-1689',
  },
  {
    id: 'sovereign-grace',
    name: 'Sovereign Grace Churches',
    fit: 'aligned',
    kind: 'Denomination',
    stance: 'Reformed, credobaptist, complementarian, continuationist, elder-led with regional oversight.',
    note: 'The rare family that matches you on all four at once, gifts included. It plants deliberately and trains men through its Pastors College. Read the history around abuse allegations and ask the local elders about it directly.',
    finder: 'https://sovereigngrace.com',
    traditionId: 'sovereign-grace-churches',
  },
  {
    id: 'founders',
    name: 'Founders Ministries',
    fit: 'aligned',
    kind: 'Ministry with a church search',
    stance: 'Doctrines of grace within Baptist life, mostly SBC. Generally credobaptist, complementarian, elder-led.',
    note: 'Its church search is one of the best ways to find Reformed Baptist churches inside the SBC. It is also outspoken on critical theory, which fits your concern — check that a given church is clear without being entrenched.',
    finder: 'https://church.founders.org',
  },
  {
    id: 'converge',
    name: 'Converge (formerly Baptist General Conference)',
    fit: 'aligned',
    kind: 'Denomination',
    stance: 'Baptist, broadly evangelical. Bethlehem Baptist, Piper’s church, is a member.',
    note: 'Not Reformed as a denomination — Bethlehem is unusual within it. Each church has to be checked on soteriology, the gifts, and eldership.',
    finder: 'https://converge.org',
  },
  {
    id: '9marks',
    name: '9Marks church search',
    fit: 'aligned',
    kind: 'Directory',
    stance: 'Churches committed to expository preaching, biblical membership and discipline, and plural eldership. Mostly Baptist.',
    note: 'Listing is not endorsement, but it is the best single directory for the ecclesiology you want. Search by ZIP code.',
    finder: 'https://www.9marks.org/church-search/',
  },
  {
    id: 'acts-29',
    name: 'Acts 29',
    fit: 'aligned',
    kind: 'Church-planting network',
    stance: 'Reformed, complementarian, continuationist-friendly. Mixed on baptism.',
    note: 'Exists to plant churches and assess planters — directly relevant if you are called to plant. Congregations vary widely; some are young and staff-driven.',
    finder: 'https://www.acts29.com',
    traditionId: 'acts-29',
  },

  // ---------------------------------------------------------------- partly
  {
    id: 'sbc',
    name: 'Southern Baptist Convention',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Credobaptist and complementarian (BF&M 2000). Mixed on soteriology; many churches are pastor-and-deacon rather than elder-led.',
    note: 'Huge and varied, from Founders churches to revivalist ones. A strong missions-sending structure (IMB, NAMB Send Network) is a real plus.',
    finder: 'https://www.sbc.net',
    traditionId: 'southern-baptist',
  },
  {
    id: 'tgc',
    name: 'The Gospel Coalition church directory',
    fit: 'partly',
    kind: 'Directory',
    stance: 'Pastors affirm TGC’s confessional statement: Reformed and complementarian. Baptism and the gifts are left open.',
    note: 'A good way to find gospel-centred churches across families, including Presbyterian ones. The Orange County chapter has its own list.',
    finder: 'https://www.thegospelcoalition.org/churches/',
  },
  {
    id: 'pca',
    name: 'Presbyterian Church in America (PCA)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Westminster Confession, paedobaptist, complementarian, elder-led by presbytery. Kevin DeYoung is PCA.',
    note: 'Sound and accountable. The difference is baptism, which costs you points without ruling it out.',
    finder: 'https://pcaac.org',
    traditionId: 'presbyterian-pca',
  },
  {
    id: 'opc',
    name: 'Orthodox Presbyterian Church (OPC)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Westminster Confession, paedobaptist, complementarian, cessationist.',
    note: 'Confessionally strict and small. Two differences from you: baptism and the gifts.',
    finder: 'https://opc.org',
    traditionId: 'presbyterian-pca',
  },
  {
    id: 'urcna',
    name: 'United Reformed Churches in North America (URCNA)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Three Forms of Unity, paedobaptist, complementarian, cessationist.',
    note: 'Continental Reformed. Same two differences as the OPC.',
    finder: 'https://www.urcna.org',
    traditionId: 'presbyterian-pca',
  },
  {
    id: 'efca',
    name: 'Evangelical Free Church of America (EFCA)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Inerrancy, believer baptism common but not required; soteriology, gifts and eldership left largely to each church.',
    note: 'A lot of sound churches, but the denomination settles less than you want settled, so each one has to be checked.',
    finder: 'https://www.efca.org',
  },
  {
    id: 'calvary-chapel',
    name: 'Calvary Chapel',
    fit: 'partly',
    kind: 'Association',
    stance: 'Verse-by-verse preaching, credobaptist, complementarian. Generally not Reformed; usually led by a senior pastor rather than a plurality of elders.',
    note: 'Started in Costa Mesa and still everywhere in Orange County. Its accountability model is the main question for you.',
    finder: 'https://calvarychapel.com',
  },
  {
    id: 'cma',
    name: 'Christian and Missionary Alliance (C&MA)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Believer baptism, a historic missions-sending culture. Not Reformed in soteriology.',
    note: 'Strong on global missions. Check soteriology and who may be an elder.',
    finder: 'https://www.cmalliance.org',
  },
  {
    id: 'acna',
    name: 'Anglican Church in North America (ACNA)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Historic Anglican, paedobaptist. Dioceses differ on women’s ordination.',
    note: 'Some strongly evangelical dioceses. Baptism and the offices both need checking.',
    finder: 'https://anglicanchurch.net',
    traditionId: 'anglican-acna',
  },
  {
    id: 'lcms',
    name: 'Lutheran Church–Missouri Synod (LCMS)',
    fit: 'partly',
    kind: 'Denomination',
    stance: 'Confessional Lutheran, paedobaptist, complementarian. Liturgical.',
    note: 'Sound on Scripture, but Lutheran sacramental theology is a large difference from Baptist convictions.',
    finder: 'https://www.lcms.org',
    traditionId: 'lutheran-lcms',
  },
  {
    id: 'pentecostal',
    name: 'Assemblies of God and Foursquare',
    fit: 'partly',
    kind: 'Denominations',
    stance: 'Credobaptist, continuationist with tongues as initial evidence. Arminian. Women may be ordained.',
    note: 'Its view of who may hold office crosses one of your lines. Large missions-sending bodies.',
    traditionId: 'pentecostal-classical',
  },

  // --------------------------------------------------------------- outside
  {
    id: 'lds',
    name: 'The Church of Jesus Christ of Latter-day Saints',
    fit: 'outside',
    kind: 'Restorationist',
    stance: 'Additional scripture and continuing prophetic authority; a non-Trinitarian doctrine of God.',
    note: 'Not a Christian church in the historic sense.',
  },
  {
    id: 'jw',
    name: 'Jehovah’s Witnesses',
    fit: 'outside',
    kind: 'Restorationist',
    stance: 'Denies the Trinity and the deity of Christ; the Governing Body binds interpretation.',
    note: 'Not a Christian church in the historic sense.',
  },
  {
    id: 'sda',
    name: 'Seventh-day Adventist Church',
    fit: 'outside',
    kind: 'Adventist',
    stance: 'Ellen G. White’s writings are treated as an authoritative prophetic voice; Saturday Sabbath and investigative judgment are binding doctrine.',
    note: 'Ruled out at your request, and on the authority question: a second voice alongside Scripture.',
  },
  {
    id: 'christian-science',
    name: 'Christian Science',
    fit: 'outside',
    kind: 'Metaphysical',
    stance: 'Mary Baker Eddy’s writings beside the Bible; denies the reality of sin, sickness and matter.',
    note: 'Not Christian in doctrine.',
  },
  {
    id: 'oneness',
    name: 'Oneness Pentecostalism (UPCI and others)',
    fit: 'outside',
    kind: 'Pentecostal, non-Trinitarian',
    stance: 'Denies the Trinity; baptism in Jesus’ name only and tongues required for salvation.',
    note: 'Outside historic orthodoxy on the doctrine of God.',
  },
  {
    id: 'unitarian',
    name: 'Unitarian Universalist',
    fit: 'outside',
    kind: 'Non-creedal',
    stance: 'No binding doctrine; denies the Trinity and the exclusivity of Christ.',
    note: 'Not a Christian church.',
  },
  {
    id: 'iglesia-ni-cristo',
    name: 'Iglesia ni Cristo',
    fit: 'outside',
    kind: 'Restorationist',
    stance: 'Denies the deity of Christ.',
    note: 'Not a Christian church in the historic sense.',
  },
  {
    id: 'prosperity',
    name: 'Word of Faith / prosperity gospel',
    fit: 'outside',
    kind: 'Movement, across many independent churches',
    stance: 'Health and wealth as the promise of the atonement; positive confession; apostolic authority with little accountability.',
    note: 'A different gospel. Not a denomination, so it has to be spotted church by church.',
    traditionId: 'revivalist-charismatic',
  },
  {
    id: 'progressive-mainline',
    name: 'Progressive mainline (PC(USA), ELCA, Episcopal Church, UCC, most UMC)',
    fit: 'outside',
    kind: 'Denominations',
    stance: 'Historically Protestant, but have revised the doctrine of Scripture and the historic sexual ethic, and ordain women.',
    note: 'Individual congregations can be more conservative than their denomination, but they still answer to it.',
    traditionId: 'progressive-mainline',
  },
];

/**
 * Well-known congregations in your corner of the evangelical world. Not
 * candidates — none is near Buena Park — but reference points for what a
 * healthy church in each family looks like, and for whose preaching you
 * might sit under online.
 */
export const NOTABLE_CHURCHES: NotableChurch[] = [
  {
    name: 'Bethlehem Baptist Church',
    city: 'Minneapolis, MN',
    family: 'Converge · Reformed Baptist in practice',
    why: 'John Piper pastored here from 1980 to 2013. Reformed, credobaptist, complementarian, continuationist, missions-driven.',
  },
  {
    name: 'Cities Church',
    city: 'Saint Paul, MN',
    family: 'Reformed Baptist in practice',
    why: 'Planted in 2014 with roots in Bethlehem, and closely tied to Piper and Desiring God. A picture of what a Piper-shaped church plant looks like.',
  },
  {
    name: 'Capitol Hill Baptist Church',
    city: 'Washington, DC',
    family: 'Southern Baptist · 9Marks',
    why: 'Mark Dever’s church and the home of 9Marks: membership, discipline, plural eldership, and expository preaching as a model.',
  },
  {
    name: 'Third Avenue Baptist Church',
    city: 'Louisville, KY',
    family: 'Southern Baptist · 9Marks',
    why: 'Greg Gilbert’s church; a widely cited example of 9Marks ecclesiology outside DC.',
  },
  {
    name: 'Grace Baptist Church',
    city: 'Cape Coral, FL',
    family: 'Southern Baptist · Founders',
    why: 'Tom Ascol’s church and the home of Founders Ministries.',
    caution: 'Founders is outspoken on politics and culture — read for clarity, and judge for yourself whether it is entrenched.',
  },
  {
    name: 'Christ Covenant Church',
    city: 'Matthews, NC',
    family: 'PCA',
    why: 'Kevin DeYoung’s church. Confessional, careful, pastoral — a model of the PCA at its best.',
    caution: 'Paedobaptist.',
  },
  {
    name: 'Grace Community Church',
    city: 'Sun Valley, CA',
    family: 'Independent',
    why: 'Long pastored by John MacArthur. Expository preaching, elder-led, a seminary (The Master’s Seminary) and a large missions training arm.',
    caution: 'Firmly cessationist.',
  },
  {
    name: 'Sovereign Grace Church of Louisville',
    city: 'Louisville, KY',
    family: 'Sovereign Grace Churches',
    why: 'The network’s Pastors College and many of its leaders are in Louisville. Reformed, credobaptist and continuationist together.',
  },
  {
    name: 'The Village Church',
    city: 'Flower Mound, TX',
    family: 'Southern Baptist · Acts 29 history',
    why: 'Matt Chandler’s church; Chandler led Acts 29 for years. A large church that planted out its campuses as independent churches.',
    caution: 'Large. Read up on how its leadership handled discipline and abuse cases before treating it as a model.',
  },
];

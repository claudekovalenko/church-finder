import type { Axis, AxisId } from './types';

/**
 * The fifteen axes this app reasons about.
 *
 * Two design notes worth keeping in mind when editing these:
 *
 * 1. Each axis is oriented so that 0 and 100 are both *coherent positions held
 *    by real churches*, not "bad" and "good". Scoring decides which end you
 *    want; the axis itself stays neutral. That keeps the model reusable for
 *    someone whose convictions differ.
 *
 * 2. `diagnostic` is the question you would actually ask a pastor over coffee.
 *    The app turns unanswered high-weight axes into a question list, so these
 *    strings do real work — keep them askable out loud, not academic.
 */
export const AXES: Axis[] = [
  // ---------------------------------------------------------------- gates
  {
    id: 'baptism',
    name: 'Baptism',
    category: 'non-negotiable',
    question: 'Who is baptism for?',
    diagnostic:
      'Do you baptize infants, and can someone be a member here without having been baptized as a believer?',
    lowLabel: 'Credobaptist only',
    highLabel: 'Paedobaptism required',
    anchors: [
      {
        value: 0,
        label: 'Credobaptist, by conviction',
        description:
          'Baptism follows profession of faith. Infant baptism is not recognized as baptism.',
      },
      {
        value: 25,
        label: 'Credobaptist, open membership',
        description:
          'Practices believer baptism, but will receive members baptized as infants elsewhere.',
      },
      {
        value: 50,
        label: 'Dual practice',
        description:
          'Leaves the mode and subject of baptism to the conscience of the family.',
      },
      {
        value: 75,
        label: 'Paedobaptist, normative',
        description:
          'Covenant baptism of the children of believers is the expected practice.',
      },
      {
        value: 100,
        label: 'Paedobaptism required',
        description:
          'Withholding baptism from covenant children is treated as disobedience.',
      },
    ],
  },
  {
    id: 'authority',
    name: 'Authority of Scripture',
    category: 'non-negotiable',
    question: 'What is the final court of appeal?',
    diagnostic:
      'When tradition, a prophetic word, or a leader’s conviction conflicts with Scripture, what settles it — and who decides?',
    lowLabel: 'Scripture alone',
    highLabel: 'Scripture plus a second authority',
    anchors: [
      {
        value: 0,
        label: 'Sola Scriptura',
        description:
          'Scripture is the sole infallible rule of faith and practice; everything else is tested by it.',
      },
      {
        value: 30,
        label: 'Scripture first, tradition weighty',
        description:
          'Creeds and historic practice carry real authority but remain subordinate to Scripture.',
      },
      {
        value: 65,
        label: 'Scripture and living voice',
        description:
          'Ongoing prophecy or apostolic office functions as a parallel authority in practice.',
      },
      {
        value: 100,
        label: 'Magisterial or revelatory authority',
        description:
          'A magisterium, or a leader’s fresh revelation, can bind the conscience alongside Scripture.',
      },
    ],
  },
  {
    id: 'gender-roles',
    name: 'Men and women in office',
    category: 'non-negotiable',
    question: 'Who may hold the office of elder or pastor?',
    diagnostic:
      'Are the offices of elder and pastor open to women, and where is that written down?',
    lowLabel: 'Complementarian',
    highLabel: 'Egalitarian',
    anchors: [
      {
        value: 0,
        label: 'Complementarian, defined',
        description:
          'Eldership is restricted to qualified men; the position is stated and taught.',
      },
      {
        value: 35,
        label: 'Complementarian in practice',
        description:
          'All elders are men, but the church has not articulated why and does not press it.',
      },
      {
        value: 70,
        label: 'Soft egalitarian',
        description:
          'Women serve in most teaching and leadership roles; the senior office is contested.',
      },
      {
        value: 100,
        label: 'Egalitarian, defined',
        description:
          'Every office is open to women as a matter of stated conviction.',
      },
    ],
  },
  {
    id: 'soteriology',
    name: 'Doctrines of grace',
    category: 'non-negotiable',
    question: 'How does a person come to be saved?',
    diagnostic:
      'How would you describe the church’s position on election and the extent of human ability in salvation?',
    lowLabel: 'Monergistic / Reformed',
    highLabel: 'Synergistic / decisional',
    anchors: [
      {
        value: 0,
        label: 'Confessionally Reformed',
        description:
          'Unconditional election and effectual calling are taught positively and regularly.',
      },
      {
        value: 30,
        label: 'Broadly Reformed',
        description:
          'Sovereign grace is affirmed and assumed, though not a defining emphasis.',
      },
      {
        value: 60,
        label: 'Classical Arminian',
        description:
          'Prevenient grace and libertarian free will are taught; salvation is resistible.',
      },
      {
        value: 85,
        label: 'Decisional',
        description:
          'Conversion is framed chiefly as a decision the hearer makes; the altar call is central.',
      },
      {
        value: 100,
        label: 'Semi-Pelagian',
        description:
          'Human ability is assumed and total depravity is functionally denied.',
      },
    ],
  },

  // ----------------------------------------------------------- convictions
  {
    id: 'spiritual-gifts',
    name: 'Spiritual gifts',
    category: 'conviction',
    question: 'How are the manifestations of the Spirit practised?',
    diagnostic:
      'Are prophecy and tongues practised in the gathering, and what happens when someone gives a word that does not hold up?',
    lowLabel: 'Cessationist',
    highLabel: 'Unbounded charismatic',
    anchors: [
      {
        value: 0,
        label: 'Cessationist',
        description:
          'The miraculous gifts ceased with the apostolic age; they are not sought or practised.',
      },
      {
        value: 30,
        label: 'Open but cautious',
        description:
          'The gifts are not denied in principle, but are not sought or practised in the gathering.',
      },
      {
        value: 55,
        label: 'Ordered continuationist',
        description:
          'The gifts are practised, governed by 1 Corinthians 14, weighed by elders, and always subordinate to Scripture.',
      },
      {
        value: 80,
        label: 'Charismatic',
        description:
          'Manifestations are a central and expected feature of gathered worship, with lighter vetting.',
      },
      {
        value: 100,
        label: 'Revelatory',
        description:
          'New revelation carries binding authority; words are not tested against Scripture in practice.',
      },
    ],
  },
  {
    id: 'preaching',
    name: 'Preaching',
    category: 'conviction',
    question: 'What happens in the pulpit?',
    diagnostic:
      'What has the church preached through in the last two years, and who decides what gets preached?',
    lowLabel: 'Expository',
    highLabel: 'Topical / therapeutic',
    anchors: [
      {
        value: 0,
        label: 'Consecutive exposition',
        description:
          'Preaching works through books of the Bible; the text sets the agenda of the sermon.',
      },
      {
        value: 30,
        label: 'Expository series',
        description:
          'Largely text-driven, with topical series interspersed and a clear exegetical spine.',
      },
      {
        value: 65,
        label: 'Topical, biblically framed',
        description:
          'Sermons are built around themes and needs, with Scripture supporting the theme.',
      },
      {
        value: 100,
        label: 'Therapeutic or motivational',
        description:
          'The text illustrates the talk; application and felt needs drive the content.',
      },
    ],
  },
  {
    id: 'confession',
    name: 'Confessional clarity',
    category: 'conviction',
    question: 'Is the doctrine written down and binding?',
    diagnostic:
      'Does the church hold a historic confession, and are the elders required to subscribe to it?',
    lowLabel: 'No stated doctrine',
    highLabel: 'Subscribes to a historic confession',
    anchors: [
      {
        value: 0,
        label: 'Unstated',
        description:
          'No published doctrinal standard beyond a few generic affirmations.',
      },
      {
        value: 35,
        label: 'Short statement of faith',
        description:
          'A brief evangelical statement covering the essentials, not enforced on officers.',
      },
      {
        value: 70,
        label: 'Detailed statement',
        description:
          'A long-form doctrinal statement that leaders are held to.',
      },
      {
        value: 100,
        label: 'Confessional subscription',
        description:
          'Holds a historic confession — 1689 Second London Baptist, or similar — and officers subscribe to it.',
      },
    ],
  },
  {
    id: 'cultural-posture',
    name: 'Ethics and culture',
    category: 'conviction',
    question: 'Where does the church stand on contested ethical questions?',
    diagnostic:
      'What does the church teach on sexuality and marriage, and is it written down or only assumed?',
    lowLabel: 'Revisionist',
    highLabel: 'Historic and stated',
    anchors: [
      {
        value: 0,
        label: 'Revisionist',
        description:
          'Has departed from the historic Christian ethic on sexuality and marriage.',
      },
      {
        value: 35,
        label: 'Unstated',
        description:
          'Holds no public position; the question is deliberately left unaddressed.',
      },
      {
        value: 70,
        label: 'Historic, quiet',
        description:
          'Holds the historic position but rarely teaches it publicly.',
      },
      {
        value: 100,
        label: 'Historic, taught',
        description:
          'Holds and teaches the historic Christian ethic clearly and pastorally.',
      },
    ],
  },

  // -------------------------------------------------------------- practice
  {
    id: 'polity',
    name: 'Oversight and eldership',
    category: 'practice',
    question: 'Who is accountable, and to whom?',
    diagnostic:
      'Who are the elders, how were they appointed, and what happens when one of them has to be corrected?',
    lowLabel: 'No formal oversight',
    highLabel: 'Plurality of qualified elders',
    anchors: [
      {
        value: 0,
        label: 'Movement / no structure',
        description:
          'Decentralised multiplication with no recognised elders or formal accountability.',
      },
      {
        value: 30,
        label: 'Loose network',
        description:
          'Facilitators and coaches rather than ordained officers; oversight is relational and informal.',
      },
      {
        value: 55,
        label: 'Single pastor',
        description:
          'One pastor leads, supported by deacons or a board; accountability rests largely on him.',
      },
      {
        value: 85,
        label: 'Plurality of elders',
        description:
          'A plurality of examined, qualified elders shares rule, with a stated process for discipline.',
      },
      {
        value: 100,
        label: 'Plurality with external accountability',
        description:
          'Elder plurality plus an association or presbytery that can be appealed to from outside.',
      },
    ],
  },
  {
    id: 'membership',
    name: 'Membership and discipline',
    category: 'practice',
    question: 'What does belonging actually commit you to?',
    diagnostic:
      'What is required to become a member, and when did the church last practise formal discipline?',
    lowLabel: 'Attendance only',
    highLabel: 'Covenanted membership',
    anchors: [
      {
        value: 0,
        label: 'No membership',
        description: 'Attenders and members are not distinguished.',
      },
      {
        value: 40,
        label: 'Nominal membership',
        description:
          'A membership roll exists, but it carries no real obligations either way.',
      },
      {
        value: 75,
        label: 'Meaningful membership',
        description:
          'A membership process, a covenant, and expectations of ongoing participation.',
      },
      {
        value: 100,
        label: 'Covenant and discipline',
        description:
          'A written covenant, an interview process, and corrective discipline actually practised.',
      },
    ],
  },
  {
    id: 'leader-development',
    name: 'Raising up leaders',
    category: 'practice',
    question: 'Can an ordinary member become an elder here?',
    diagnostic:
      'How does someone go from member to elder here, and who is currently in that pipeline?',
    lowLabel: 'No pathway',
    highLabel: 'Defined elder pipeline',
    anchors: [
      {
        value: 0,
        label: 'Closed',
        description:
          'Leadership is hired from outside or fixed; there is no route in.',
      },
      {
        value: 35,
        label: 'Informal',
        description:
          'Leaders emerge by relationship, with no stated training or examination.',
      },
      {
        value: 70,
        label: 'Training offered',
        description:
          'A cohort, institute, or reading programme exists for men aspiring to office.',
      },
      {
        value: 100,
        label: 'Defined pipeline',
        description:
          'A stated pathway from member to deacon to elder, with examination, apprenticeship, and real handoff.',
      },
    ],
  },
  {
    id: 'lay-mobilisation',
    name: 'Every-member ministry',
    category: 'practice',
    question: 'Is ministry the staff’s job or the body’s?',
    diagnostic:
      'What proportion of the congregation is actively discipling someone, and how is that supported?',
    lowLabel: 'Staff-delivered',
    highLabel: 'Priesthood of all believers',
    anchors: [
      {
        value: 0,
        label: 'Staff-delivered',
        description:
          'Ministry is done by professionals; members attend and give.',
      },
      {
        value: 40,
        label: 'Volunteer-supported',
        description:
          'Members serve in programmes that staff design and run.',
      },
      {
        value: 75,
        label: 'Members discipling members',
        description:
          'Ordinary members are expected and equipped to disciple, counsel, and open the Word with others.',
      },
      {
        value: 100,
        label: 'Every-member priesthood',
        description:
          'The congregation carries the ministry; staff exist mainly to equip, not to perform.',
      },
    ],
  },

  // --------------------------------------------------------------- mission
  {
    id: 'local-evangelism',
    name: 'Local evangelism',
    category: 'mission',
    question: 'Is the gospel taken to people outside the room?',
    diagnostic:
      'How are members trained and sent to share the gospel with neighbours here, not just invited to bring them?',
    lowLabel: 'Gathered only',
    highLabel: 'Actively evangelistic',
    anchors: [
      {
        value: 0,
        label: 'Inward',
        description: 'Effort is directed at the gathered congregation.',
      },
      {
        value: 40,
        label: 'Invitational',
        description:
          'Outreach means inviting outsiders to services and events.',
      },
      {
        value: 75,
        label: 'Trained and sent',
        description:
          'Members are equipped to share the gospel and regularly do so outside church programmes.',
      },
      {
        value: 100,
        label: 'Evangelistic culture',
        description:
          'Personal evangelism is normal, expected, resourced, and talked about openly.',
      },
    ],
  },
  {
    id: 'global-missions',
    name: 'Global missions and sending',
    category: 'mission',
    question: 'Does this church send its own people to the nations?',
    diagnostic:
      'Who has this church sent to the unreached in the last five years, and how were they trained and supported?',
    lowLabel: 'Not a priority',
    highLabel: 'Sends its own',
    anchors: [
      {
        value: 0,
        label: 'Absent',
        description: 'Missions is not part of the church’s life or budget.',
      },
      {
        value: 35,
        label: 'Supports financially',
        description:
          'Gives to missionaries and agencies, without a sending culture of its own.',
      },
      {
        value: 70,
        label: 'Sends occasionally',
        description:
          'Has sent members to the field, with real ongoing care and accountability.',
      },
      {
        value: 100,
        label: 'Sending church',
        description:
          'Identifies, trains, sends, and shepherds its own members to the unreached as a settled practice.',
      },
    ],
  },

  // ----------------------------------------------------------------- style
  {
    id: 'worship-style',
    name: 'Worship style',
    category: 'style',
    question: 'What does the singing sound like?',
    diagnostic:
      'What does a normal Sunday gathering look like from call to worship to benediction?',
    lowLabel: 'Traditional / hymnody',
    highLabel: 'Contemporary / modern',
    anchors: [
      {
        value: 0,
        label: 'Traditional',
        description: 'Hymns, piano or organ, a fixed liturgy.',
      },
      {
        value: 35,
        label: 'Blended',
        description: 'Hymns and modern songs together, with a light liturgy.',
      },
      {
        value: 70,
        label: 'Contemporary',
        description: 'A modern worship band leads current songs.',
      },
      {
        value: 100,
        label: 'Production-led',
        description:
          'Extended sets, a designed room, and a strong production aesthetic.',
      },
    ],
  },
];

export const AXES_BY_ID: Record<AxisId, Axis> = Object.fromEntries(
  AXES.map((axis) => [axis.id, axis]),
);

export function getAxis(id: AxisId): Axis {
  const axis = AXES_BY_ID[id];
  if (!axis) throw new Error(`Unknown axis: ${id}`);
  return axis;
}

/**
 * The nearest anchor to a value, so the UI can say "Ordered continuationist"
 * instead of "55".
 */
export function describeValue(axisId: AxisId, value: number): AxisAnchorMatch {
  const axis = getAxis(axisId);
  let best = axis.anchors[0];
  for (const anchor of axis.anchors) {
    if (Math.abs(anchor.value - value) < Math.abs(best.value - value)) {
      best = anchor;
    }
  }
  return { label: best.label, description: best.description, exact: best.value === value };
}

export interface AxisAnchorMatch {
  label: string;
  description: string;
  exact: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
  'non-negotiable': 'Non-negotiables',
  conviction: 'Convictions',
  practice: 'Church practice',
  mission: 'Mission',
  style: 'Style and feel',
};

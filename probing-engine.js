/* CallFlow's training playbooks reviewed against public Toronto 311 pages.
 * Educational guidance ONLY, not live City procedure or an approved internal KB.
 * Works in a browser and in the optional Vercel serverless endpoint.
 */
(function(root, factory) {
  const engine = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  if (root) root.CallFlowProbing = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const make = (id, label, question, why, condition) => ({id,label,question,why,condition});
  const followup = make('priorReference','Previous report','Do you have a reference number from your earlier report?','Connects the new conversation to a previous report.', 'priorContact');
  const incidentLocation = (question='Where exactly is the issue happening?') => make('location','Location',question,'Identifies the specific service location.');
  const timeline = (question='When did you first notice the problem?') => make('timeline','Timeline',question,'Establishes when the issue began.');
  const playbooks = [
    {id:'streetlight', label:'Street lighting', pattern:/street\s?lights?|lamp\s?posts?|light\s?poles?|street\s?lamps?/i,
      gaps:[followup, incidentLocation('What is the nearest address or intersection to the affected streetlight?'), timeline('When did you first notice the light was out?'), make('scope','Affected lights','Is it one streetlight or are several lights affected?','Clarifies the extent of the outage.'), make('poleId','Identifying details','Is there a pole number or another detail that identifies the streetlight?','Helps locate the reported streetlight.')]},
    {id:'waste', label:'Waste collection', pattern:/garbage|recycl\w*|waste\s?collect|green\s?bin|blue\s?bin|organic\s?collect|missed\s?pickup|trash\s?pickup/i,
      gaps:[make('collectionType','Collection type','Which collection is involved: garbage, organics, or recycling?','Determines the kind of collection being discussed.'), incidentLocation('What is the service address for the collection issue?'), make('collectionDay','Collection day','On which day was the collection expected?','Establishes when the collection was due.'),followup,make('setOut','Set-out details','Were the bins placed at the usual collection point for the scheduled collection?','Helps check collection eligibility.')]},
    {id:'noise', label:'Noise concern', pattern:/noise|loud\s?music|disturbance|construction\s?sound|barking/i,
      gaps:[make('noiseSource','Type of noise','What kind of noise are you hearing?','Clarifies the source of the concern.'),incidentLocation('Where is the noise coming from?'),make('noiseTime','Time and frequency','When does this usually happen, and how often?','Identifies the timing and pattern.')]},
    {id:'roads', label:'Road or sidewalk',pattern:/pothole|sidewalk|road\s?damage|road\s?repair|cracked\s?pavement|sinkhole|fallen\s?sign|traffic\s?sign/i,
      gaps:[incidentLocation('What is the nearest address or intersection to the road issue?'),make('roadCondition','Condition','Could you describe the damage or obstruction?','Clarifies what needs attention.'),timeline()]},
    {id:'water', label:'Water or drainage',pattern:/water\s?leak|burst\s?pipe|flood\w*|sewer|drain\w*|water\s?main|no\s?water|low\s?water\s?pressure/i,
      gaps:[incidentLocation('Where is the water or drainage problem happening?'),make('waterType','Type of issue','Can you describe what is happening with the water or drainage?','Clarifies the problem being reported.'),make('activeIssue','Current status','Is the issue still happening right now?','Clarifies whether the condition is ongoing.')]},
    {id:'parking',label:'Parking concern',pattern:/parking|parked\s?vehicle|blocked\s?driveway|parking\s?ticket|parking\s?permit/i,
      gaps:[make('parkingType','Parking issue','What specifically is happening with the parking situation?','Distinguishes the concern.'),incidentLocation('Where is the parking issue occurring?'), timeline('When did this happen or begin?')]},
    {id:'parks',label:'Parks and public spaces',pattern:/park\s?equipment|playground|public\s?park|park\s?path|park\s?bench|tree\s?branch|fallen\s?tree/i,
      gaps:[incidentLocation('Which park or public location is affected?'),make('parkIssue','What happened','What is damaged or needs attention?','Identifies the specific concern.'),timeline()]},
    {id:'billing',label:'Billing concern',pattern:/bill\w*|invoice|charge\w*|refund|overcharg\w*|payment\s?issue|payment\s?disput/i,
      gaps:[make('billingIssue','Discrepancy','What specifically looks incorrect on the bill or charge?','Clarifies the discrepancy.'),make('billingPeriod','Billing period','Which billing period or transaction date is involved?','Identifies the relevant period.'),make('billingReference','Reference','Do you have an invoice or transaction reference number?','Helps identify the record without requesting payment credentials.'), followup]},
    {id:'technical',label:'Technical support',pattern:/login|log\s?in|website|app\s?error|technical\s?issue|password\s?reset|site\s?crash|page\s?load|software\s?bug|error\s?\d{3}|service\s?down/i,
      gaps:[make('techSymptom','Error or symptom','What happens when you try to use the service?','Clarifies the observable problem.'),make('techSteps','Steps tried','What have you already tried?','Avoids repeating troubleshooting steps.'),make('techScope','Who is affected','Is this happening for you only, or are others affected too?','Clarifies the scope.'),timeline('When did this issue start?')]},
    {id:'general',label:'General inquiry',pattern:/.*/,
      gaps:[make('description','Issue details','Could you describe what happened in a little more detail?','Builds an accurate understanding of the issue.'), timeline(),followup]}
  ];

  // Sources were checked against publicly accessible City guidance in Nov 2026.
  // External providers are explicitly marked (e.g., Toronto Hydro).
  // This is a curated reference index, NOT a live, exhaustive 311 KB integration.
  const resourceIndex = {
    hub:{title:'Search 311 service information',url:'https://www.toronto.ca/home/311-toronto-at-your-service/find-service-information/',detail:'Official City service information directory',origin:'City of Toronto'},
    streetlight:{title:'Streetlight map & reporting',url:'https://www.torontohydro.com/en/streetlight-map',detail:'Locate and report streetlights maintained by Toronto Hydro',origin:'Toronto Hydro'},
    waste:{title:'Report missed waste collection',url:'https://www.toronto.ca/services-payments/recycling-organics-garbage/report-missed-waste-collection/',detail:'Collection type, service eligibility, set-out and timing',origin:'City of Toronto'},
    noise:{title:'Noise complaints & rules',url:'https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/noise/',detail:'Types of noise, timing and which complaints City staff may investigate',origin:'City of Toronto'},
    roads:{title:'Potholes & road repairs',url:'https://www.toronto.ca/services-payments/streets-parking-transportation/road-maintenance/potholes/',detail:'Pothole reporting for roads, expressways and bike lanes',origin:'City of Toronto'},
    waterPressure:{title:'No water or low water pressure',url:'https://www.toronto.ca/services-payments/water-environment/your-water-pipes-meter/water-related-help-advice/no-water-or-low-water-pressure/',detail:'Troubleshooting water pressure and reporting water supply concerns',origin:'City of Toronto'},
    sidewalks:{title:'Sidewalks & road repairs',url:'https://www.toronto.ca/services-payments/streets-parking-transportation/road-maintenance/road-sidewalk-repair/',detail:'City road and sidewalk maintenance',origin:'City of Toronto'},
    recreation:{title:'Report recreation facility maintenance',url:'https://www.toronto.ca/home/311-toronto-at-your-service/find-service-information/article/?kb=kA0Vt000000QRnlKAG',detail:'Reporting repair and cleanliness concerns in recreation facilities',origin:'City of Toronto'},
    water:{title:'Pipe leaks & bursts',url:'https://www.toronto.ca/services-payments/water-environment/your-water-pipes-meter/water-related-help-advice/pipe-leak-or-burst/',detail:'How leak location changes who handles repairs',origin:'City of Toronto'},
    parking:{title:'Make the right call',url:'https://www.toronto.ca/home/311-toronto-at-your-service/make-the-right-call/',detail:'Which services are handled by 311 or other providers',origin:'City of Toronto'},
    parks:{title:'City-owned tree maintenance',url:'https://www.toronto.ca/services-payments/water-environment/trees/city-owned-tree-maintenance/',detail:'Reporting City tree maintenance and ownership questions',origin:'City of Toronto'}
  };
  const resourceKeys = {
    streetlight:['streetlight','hub'],waste:['waste','hub'],noise:['noise','hub'],roads:['roads','hub'],
    water:['water','hub'],parking:['parking','hub'],parks:['parks','hub'],
    billing:['hub'],technical:['hub'],general:['hub']
  };
  const known = {
    location: /(?:\b\d{1,6}\s+[\w.'-]+(?:\s+[\w.'-]+){0,3}\s+(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|crescent)\b|\b(?:intersection of|at the corner of|near the intersection|[a-z]+ (?:st|street|ave|avenue|road|rd) and [a-z]+ (?:st|street|ave|avenue|road|rd))\b|\[location provided\])/i,
    timeline:/\b(?:yesterday|today|this morning|last night|last week|last month|since\s+(?:\w+day|yesterday|last|\d)|\d+\s*(?:hours?|days?|nights?|weeks?|months?)\s*(?:ago|now)?|on\s+\w+day)\b/i,
    scope:/\b(?:one|single|only one|two|three|multiple|several|all|many)\s+(?:streetlights?|lights?|lamps?)\b/i,
    priorReference:/\b(?:reference|ticket|case|request|report)\s*(?:(?:number|no\.?|#|id|:)\s*)?[:#-]?\s*(?=[A-Z0-9-]{4,}\b)(?=[A-Z-]*\d)[A-Z0-9-]{4,}\b/i,
    collectionType:/\b(?:garbage|trash|recycling|recyclables|organics|green bin|blue bin|compost)\b/i,
    poleId:/\b(?:pole(?: number| no\.?| #)?\s*[:#-]?\s*[A-Z0-9-]{3,})\b/i,
    setOut:/\b(?:at the curb|at the usual (?:collection )?point|set out|put (?:my|the) bins out|bins? (?:were|was) out)\b/i,
    collectionDay:/\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|yesterday|today|\d{4}-\d\d-\d\d)\b/i,
    noiseSource:/\b(?:music|party|construction|bark\w*|machinery|engine|shouting|alarm|traffic)\b/i,
    noiseTime:/\b(?:every\s+night|every\s+morning|daily|weekend|late\s+night|during\s+the\s+day|\d\s*(?:am|pm)|\d+\s*times|since\s+\d)/i,
    roadCondition:/\b(?:pothole|crack\w*|hole|broken|obstruct\w*|fallen|blocked|sinkhole|debris|damaged)\b/i,
    waterType:/\b(?:leak\w*|burst|flood\w*|drain\w*|sewer|no water|pressure|backflow)\b/i,
    activeIssue:/\b(?:still (?:happening|leaking|flooding|going on)|currently|ongoing|stopped|no longer|right now)\b/i,
    parkingType:/\b(?:blocked|illegal\w*|double[- ]parked|ticket|permit|parked|no parking)\b/i,
    parkIssue:/\b(?:broken|damage\w*|missing|fell|fallen|unsafe|blocked|litter|graffiti|tree)\b/i,
    billingIssue:/\b(?:duplicate|twice|incorrect|wrong|overcharg\w*|missing refund|not recognized|unexpected|too high|disput\w*)\b/i,
    billingPeriod:/\b(?:last month|this month|\w+\s+\d{4}|\d{4}-\d\d|yesterday|last week|\d{4}-\d\d-\d\d)\b/i,
    billingReference:/\b(?:invoice|transaction)\s*(?:number|no\.?|#|id|:)\s*[:#-]?\s*[A-Z0-9-]{3,}\b/i,
    techSymptom:/\b(?:error|freeze\w*|crash\w*|loading|cannot log|won't open|not work\w*|blank page|timed out)\b/i,
    techSteps:/\b(?:already tried|i tried|restarted|cleared cache|reinstalled|reset the|tried again|rebooted)\b/i,
    techScope:/\b(?:only me|everyone|all users|my account only|other users|colleagues also|just me)\b/i,
    description:/\b(?:because|when|after|broken|error|missed|damaged|twice|report|can't|cannot|failed|problem with)\b/i
  };
  const priorContact=/(?:already\s+(?:reported|called|contacted)|reported\s+(?:it|this)\s+(?:last|before)|spoke\s+with\s+someone|(?:second|third)\s+time|previous\s+report|called\s+(?:twice|before)|followed\s+up|contacted\s+you\s+before)/i;
  const urgent=/(?:smell\s+(?:of\s+)?gas|gas\s+leak|fire\s+(?:right\s+now|spreading)|medical\s+emergency|electrical\s+sparks|person\s+(?:is\s+)?(?:unconscious|not\s+breathing)|immediate\s+danger)/i;
  const normalize = s => String(s||'').toLowerCase().replace(/[^a-z\d]+/g,' ').trim();
  const clip = (s,n=1800) => String(s||'').slice(0,n);
  function classify(text) {return playbooks.find(p=>p.pattern.test(text)) || playbooks[playbooks.length-1];}
  function analyzeFallback(input={}) {
    const issue=clip(input.issue),details=clip(input.details),probes=Array.isArray(input.probes)?input.probes.slice(0,20):[];
    const answered=probes.filter(p=>String(p.a||'').trim());
    const context=[issue,details,...answered.map(p=>p.a)].join(' ').trim();
    const playbook=classify(issue+' '+details);
    const answeredIds=new Set(answered.map(p=>String(p.id||p.gapId||'')));
    const safetyNote=urgent.test(context)?'Potential immediate safety concern. Follow your organization’s emergency procedures rather than relying on AI probing suggestions.':'';
    const eligible=(safetyNote?[]:playbook.gaps).filter(g=>{
      if(g.condition==='priorContact'&&!priorContact.test(context))return false;
      if(answeredIds.has(g.id))return false;
      const re=known[g.id];
      if(re && re.test(context))return false;
      if(g.id==='description' && issue.trim().split(/\s+/).length>=10)return false;
      if(answered.some(p=>normalize(p.q)===normalize(g.question)))return false;
      return true;
    });
    let keys=resourceKeys[playbook.id]||['hub'];
    if(playbook.id==='water' && /\b(?:no water|low water|low pressure|water pressure)\b/i.test(issue+' '+details))keys=['waterPressure','hub'];
    if(playbook.id==='roads' && /sidewalk/i.test(issue+' '+details))keys=['sidewalks','hub'];
    if(playbook.id==='parks' && !/tree|branch/i.test(issue+' '+details))keys=/\b(?:rec centre|recreation centre|arena|pool)\b/i.test(issue+' '+details)?['recreation','hub']:['hub'];
    return {
      category:playbook.id,categoryLabel:playbook.label,
      candidates:eligible.map(g=>({id:g.id,gap:g.label,question:g.question,why:g.why})),
      questions:eligible.slice(0,2).map(g=>({id:g.id,gap:g.label,question:g.question,why:g.why})),
      resources:keys.map(key=>resourceIndex[key]),
      referenceCoverage:keys.length===1?'directory':'topic',
      safetyNote,
      source:'guided'
    };
  }
  // Phase 2: The owner's approved 20-guide knowledge library takes precedence
  // over the earlier sample playbooks. Source refreshes never publish automatically.
  const library=(typeof globalThis!=='undefined' && globalThis.CallFlowGuides)
    || (typeof require==='function' ? require('./data/311-guides.json') : null);
  const approvedGuides=library?.guides || [];
  const extraFacts={
    taxYear:/\b(?:tax(?:ation)?\s*year\s*[:=-]?\s*)?(?:202[0-9])\b/i,
    location:known.location,
    collectionType:known.collectionType,
    collectionDay:known.collectionDay,
    noiseTime:known.noiseTime,
    animalType:/\b(?:raccoon|squirrel|bird|pigeon|fox|coyote|skunk|deer|cat|dog|rabbit|opossum|rodent)\b/i,
    parkingType:/\b(?:parked|no.parking|blocking|double.parked|illegally parked|permit|fire hydrant|parking violation)\b/i,
    taxPurpose:/\b(?:due date|due dates|due|instalment|bill amount|payment|overdue|balance|tax notice)\b/i,
    vhtPurpose:/\b(?:declar(?:ation|e)|correct(?:ion)?|tax notice|dispute|exemption|appeal)\b/i,
    paymentStatus:/\b(?:already paid|payment made|pay now|trying to pay|missing payment|payment not showing)\b/i,
    paymentMethod:/\b(?:credit card|debit|e.?transfer|online banking|pre.?authorized|cheque|cash|bank transfer)\b/i,
    waterBillIssue:/\b(?:estimated|estimate|meter replaced|meter replacement|new meter)\b/i,
    meterReading:/\b(?:read(?:ing)? (?:was )?(?:submitted|taken|provided)|submitted (?:the )?(?:meter )?reading)\b/i,
    ownershipType:/\b(?:new owner|sold (?:my|the)|purchased|bought|mailing address|ownership|moved)\b/i,
    changeDate:/\b(?:since\s+\w+|effective\s+\w+|last (?:week|month|year)|\w+\s+\d{1,2},?\s+202\d)\b/i,
    paymentPlanAction:/\b(?:enrol|enroll|cancel|change|update|set up|stop)\b/i,
    withdrawal:/\b(?:scheduled withdrawal|deducted on|debit on|withdrawal\s+(?:on|date))\b/i,
    itemType:/\b(?:mattress|sofa|couch|fridge|stove|washing machine|dryer|appliance|chair|table)\b/i,
    buildingType:/\b(?:house|condo|apartment|multi.?residential|townhouse)\b/i,
    chargeType:/\b(?:water charge|waste charge|solid waste|garbage fee)\b/i,
    chargeIssue:/\b(?:new fee|adjustment|incorrect|wrong|overcharged|dispute|too high)\b/i,
    materialType:/\b(?:mattress|paint|wood|metal|electronics|battery|yard waste|hazardous waste|garbage|debris)\b/i,
    depotLocation:/\b(?:depot|transfer station|north york|scarborough|etobicoke|downtown|[a-z ]+ depot)\b/i,
    binSerial:/\b(?:serial|bin\s*(?:#|number|no\.?|id))\s*[:#-]?\s*[A-Z0-9-]{3,}\b/i,
    propertyIssue:/\b(?:broken|leaking|cracked|pest|mould|mold|graffiti|overgrown|collapsed|unsafe|unmaintained)\b/i,
    animalCondition:/\b(?:bleeding|limping|wing|unable to fly|wounded|not moving|injured|hurt|disoriented)\b/i,
    treeOwnership:/\b(?:city.?owned|private|city tree|my tree|my property)\b/i,
    treeMaintenance:/\b(?:trim|prun|overgrown|branch|dead limb|cut back|broken limb)\b/i,
    timeline:known.timeline,
    roadType:/\b(?:expressway|bike lane|roadway|street lane|highway|local road)\b/i,
    blockageScope:/\b(?:one (?:drain|fixture|toilet)|multiple drains|several drains|all (?:drains|fixtures))\b/i,
    backupPresent:/\b(?:backing up|backed up|sewage (?:in|inside)|no backup|not backing up|wastewater)\b/i
  };
  // Match common spoken language without requiring agents to know official titles.
  // A call-type hint is a tie-breaker, never a substitute for the caller's facts.
  const byId = id => approvedGuides.find(g => g.id===id) || null;
  const hasPhrase = (hay,phrase) => hay.includes(' '+normalize(phrase)+' ');
  const specificSignals = [
    ['G02', /\b(?:declare (?:an? )?empty (?:house|home)|empty (?:house|home) (?:tax|declaration)|vacant home tax|vacancy tax|vht|occupancy declaration|vacant property declaration|vacancy declaration)\b/],
    ['G07', /\b(?:pre authorized|preauthorized|auto(?:matic)? tax pay|tax (?:payment )?plan|monthly (?:property )?tax pay|automatic (?:property )?tax withdrawal|ptp|tax direct debit)\b/],
    ['G05', /\b(?:water meter|meter reading|estimated (?:water )?bill|estimate on (?:my )?water bill)\b/],
    ['G09', /\b(?:water bill (?:is )?(?:too high|wrong|incorrect)|water (?:charge|fee|rate)|solid waste (?:charge|fee)|garbage (?:charge|fee)|utility charge|water bill (?:too high|incorrect|wrong)|charged too much for water)\b/],
    ['G03', /\b(?:pay(?:ing)? (?:my |the )?(?:water|utility) bill|(?:water|utility) bill payment|utility payment|pay (?:my )?utilities|paid (?:my )?utilities)\b/],
    ['G06', /\b(?:change (?:my )?mailing address|new home ?owner|bought (?:a|my) house|sold (?:my|the) (?:house|property)|ownership change)\b/],
    ['G11', /\b(?:(?:broken|damaged|cracked|replace|repair|fix) (?:my |the )?(?:garbage |green |blue |recycling )?bin|bin (?:is )?(?:broken|cracked|damaged)|bin lid (?:is )?(?:broken|missing|cracked)|wheel fell off (?:the )?bin)\b/],
    ['G18', /\b(?:(?:missed|skipped|didnt take|didnt collect) (?:my |the )?(?:garbage|trash|recycling|green bin|blue bin|pickup|collection)|(?:garbage|trash|recycling|green bin|blue bin) (?:was |were |is |has |not )*(?:not collected|not picked up|left behind|missed|wasnt collected|not emptied))\b/],
    ['G10', /\b(?:drop off|dropoff|waste depot|transfer station|city dump|where (?:can|do) i (?:dump|bring)|dispose of)\b/],
    ['G08', /\b(?:(?:old |my )?(?:couch|sofa|mattress|fridge|appliance|furniture)\b.{0,35}\b(?:pickup|pick up|collection|collect|take away)|(?:pick up|take away|collect|remove) (?:old |my )?(?:couch|sofa|mattress|fridge|appliance|furniture)|(?:couch|sofa|mattress|furniture|fridge|appliance|oversized|bulky) (?:pickup|pick up|collection|removal))\b/],
    ['G12', /\b(?:dead (?:animal|wildlife|raccoon|squirrel|bird|fox)|animal carcass|roadkill|found a dead animal)\b/],
    ['G14', /\b(?:injured|hurt|wounded|bleeding|limping) (?:animal|wildlife|raccoon|bird|squirrel)|(?:animal|bird) (?:is )?(?:injured|hurt|bleeding|limping)|broken wing\b/],
    ['G16', /\b(?:snow|ice|icy|slippery|shovel|salting|not cleared)\b.{0,40}\b(?:sidewalk|footpath|walkway)\b|\b(?:sidewalk|footpath|walkway)\b.{0,40}\b(?:snow|ice|icy|slippery|shovel|not cleared)\b/],
    ['G17', /\b(?:road.{0,35}hole|street.{0,35}hole|pothole|hole in (?:the )?(?:road|street)|road crater|broken pavement|road damage|road surface cracked)\b/],
    ['G20', /\b(?:drains? (?:are |is )?(?:backing up|backed up)|blocked sewer|sewer backup|sewer backed up|sewage (?:in|coming)|blocked (?:basement|main) drain|drains backed up|sewer (?:line )?clogged|wastewater backing up)\b/],
    ['G19', /\b(?:noise complaint|loud (?:music|party|neighbou?r|construction)|noise (?:late|at night)|music blasting|barking dog|noisy neighbou?r|party noise)\b/],
    ['G15', /\b(?:tree (?:prun|trim|branch|limb)|prun(?:e|ing) (?:a|the|city) tree|trim (?:a|the|city) tree|overgrown tree|branches (?:over|hanging|blocking))\b/],
    ['G13', /\b(?:property standards|landlord (?:is not fixing|isnt fixing|wont|will not|not) (?:fix|repair)?|rental maintenance|mould in rental|mold in rental|property (?:maintenance|in bad condition)|building falling apart)\b/],
    ['G04', /\b(?:parking enforcement|illegally parked|illegal parking|car (?:is )?blocking (?:my )?driveway|parked in front of (?:my )?driveway|parking complaint|parking violation|double parked)\b/],
    ['G01', /\b(?:property tax|property taxes|house taxes|city taxes|tax bill|tax due date|tax statement)\b/]
  ];
  // When a phrase is too broad to route safely, ask a clarifying question
  // rather than confidently choosing a potentially incorrect City service.
  const ambiguityGroups = [
    {id:'billing',pattern:/\b(?:bill|billing|payment|charge|water bill|utility bill)\b/,clear:/\b(?:property tax|vacant home tax|pre authorized|preauthorized|tax (?:payment )?plan|tax plan|pay(?:ing)? (?:my |the )?(?:water|utility)|water meter|estimated (?:water )?bill|solid waste (?:fee|charge)|water (?:fee|charge)|water bill (?:is )?too high|water bill (?:is )?incorrect|water bill (?:is )?wrong)\b/,
      label:'Clarify billing',kind:'general_inquiry',guideIds:['G01','G03','G05','G09'],questions:[['billingType','Is this about property tax, a water/utility bill, or another City charge?'],['billingNeed','Is the caller asking about paying, an amount charged, or a meter reading?']]},
    {id:'tax',pattern:/\b(?:tax|taxes)\b/,clear:/\b(?:property tax|property taxes|house taxes|city taxes|vacant home|vht|payment plan|pre authorized|preauthorized)\b/,
      label:'Clarify taxes',kind:'general_inquiry',guideIds:['G01','G02','G07'],questions:[['taxService','Is this about property tax, Vacant Home Tax, or a tax payment plan?'],['taxNeed','Does the caller need a bill, a due date, or help with a declaration?']]},
    {id:'waste',pattern:/\b(?:garbage|trash|waste|green bin|blue bin|recycling|bin|bins|pickup|pick up)\b/,clear:/\b(?:missed|skipped|not collected|not picked up|not emptied|broken|damaged|cracked|repair|replace|lid|drop off|dropoff|depot|furniture|mattress|sofa|couch|fridge|appliance|oversized|large item|solid waste fee)\b/,
      label:'Clarify waste service',kind:'service_request',guideIds:['G11','G18','G08','G10'],questions:[['wasteService','Is the issue a missed collection, a damaged bin, or something that needs disposing of?'],['wasteType','Is this about garbage, green bin organics, or recycling?']]},
    {id:'animal',pattern:/\b(?:animal|animals|wildlife|raccoon|squirrel|bird)\b/,clear:/\b(?:dead|roadkill|carcass|injured|hurt|wounded|bleeding|limping|broken wing)\b/,
      label:'Clarify animal concern',kind:'service_request',guideIds:['G12','G14'],questions:[['animalStatus','Is the animal injured, deceased, or is there another concern?'],['animalLocation','Where is the animal located?']]},
    {id:'roads',pattern:/\b(?:road|street|sidewalk|pavement)\b/,clear:/\b(?:snow|ice|icy|shovel|not cleared|pothole|hole|crater|crack|damage|broken)\b/,
      label:'Clarify road service',kind:'service_request',guideIds:['G16','G17'],questions:[['roadIssue','Is this about road damage, a pothole, or snow/ice on a sidewalk?'],['roadLocation','Where is the issue located?']]},
    {id:'property',pattern:/\b(?:property|building|house)\b/,clear:/\b(?:property tax|property taxes|house taxes|city taxes|vacant home|empty house|declare|occupancy|landlord|maintenance|bylaw|standards|mailing|address change|owner|sold|bought|broken)\b/,
      label:'Clarify property service',kind:'general_inquiry',guideIds:['G01','G06','G13'],questions:[['propertyTopic','Is this about property taxes, ownership/address details, or a maintenance complaint?'],['propertyNeed','What information or assistance does the caller need?']]},
    {id:'water',pattern:/\b(?:water|drain|sewer)\b/,clear:/\b(?:bill|meter|charge|fee|payment|drain blocked|blocked drain|sewer backed up|sewage|backup|backing up)\b/,
      label:'Clarify water service',kind:'general_inquiry',guideIds:['G03','G05','G20'],questions:[['waterTopic','Is this about a water bill, water meter, or a drainage/sewer issue?'],['waterNeed','Is the caller requesting information or reporting a problem?']]}
  ];
  function findAmbiguous(context) {
    const t=normalize(context);
    return ambiguityGroups.find(g=>g.pattern.test(t)&&!g.clear.test(t))||null;
  }
  function guideScore(guide,hay,callType) {
    const terms=[...(guide.aliases||[]),...(guide.casualAliases||[])];
    const found=terms.filter(a=>hasPhrase(hay,a));
    if(!found.length)return 0;
    const specificity=Math.max(...found.map(a=>normalize(a).split(' ').length));
    const longest=Math.max(...found.map(a=>normalize(a).length));
    return 18 + Math.min(longest,45) + 8*Math.min(specificity,4) + Math.min(found.length,4)*3 + (callType&&callType!=='unsure'&&guide.kind===callType?12:0);
  }
  function findApprovedGuide(context,callType='unsure') {
    const normalized=normalize(context),hay=' '+normalized+' ';
    // Specific intents win when a generic phrase appears earlier in the call.
    for(const [id,pattern] of specificSignals) if(pattern.test(normalized))return byId(id);
    const matches=approvedGuides.map(guide=>({guide,score:guideScore(guide,hay,callType)})).filter(x=>x.score>0);
    matches.sort((a,b)=>b.score-a.score||a.guide.number-b.guide.number);
    return matches[0]?.guide||null;
  }
  function clarifyFromGroup(group,callType,context,answeredIds) {
    const kind=callType==='unsure'?group.kind:callType;
    const questions=group.questions.filter(([id])=>!answeredIds.has('clarify-'+group.id+'-'+id)).slice(0,2).map(([id,question])=>({id:'clarify-'+group.id+'-'+id,gap:'Clarification',question,why:'Helps identify the appropriate service before giving specific instructions.'}));
    const resources=group.guideIds.map(byId).filter(Boolean).map(g=>({title:g.title,url:g.sources[0].url,origin:g.sources[0].publisher,detail:'Possible service · Confirm with caller'})).slice(0,3);
    if(!resources.length)resources.push(resourceIndex.hub);
    return {category:'clarify-'+group.id,categoryLabel:group.label,guideId:null,questions,candidates:questions,resources,referenceCoverage:'possible-guides',source:'approved-library',safetyNote:'',routingNote:''};
  }
  const extraResources={
    taxPay:{title:'Pay Your Property Tax Bill',url:'https://www.toronto.ca/services-payments/property-taxes-utilities/property-tax/pay-your-property-tax-bill/',detail:'Property tax payment options',origin:'City of Toronto'},
    taxDates:{title:'Property Tax Due Dates',url:'https://www.toronto.ca/services-payments/property-taxes-utilities/property-tax/property-tax-due-dates/',detail:'Tax instalments and payment dates',origin:'City of Toronto'},
    taxBill:{title:'Property Tax Bill Types',url:'https://www.toronto.ca/services-payments/property-taxes-utilities/property-tax/property-tax-bill-types/',detail:'Understand tax bills and statements',origin:'City of Toronto'},
    taxPTP:{title:'Pre-Authorized Tax Payment Program',url:'https://www.toronto.ca/services-payments/property-taxes-utilities/property-tax/pay-your-property-tax-bill/pre-authorized-tax-payment-ptp-program/',detail:'Enrolment, changes and withdrawals',origin:'City of Toronto'},
    vhtDeclaration:{title:'Vacant Home Tax Declarations',url:'https://www.toronto.ca/services-payments/property-taxes-utilities/vacant-home-tax/vacant-home-tax-declaration-of-occupancy-status/',detail:'Annual property occupancy declaration',origin:'City of Toronto'}
  };
  function appendRelevantResources(guide,context,baseResources) {
    const text=normalize(context);
    const additions=[];
    if(guide.id==='G01') {
      if(/\b(?:due|due dates?|deadline|instalments?|installments?|schedule)\b/.test(text))additions.push(extraResources.taxDates);
      if(/\b(?:pay|payment|paid|paying|refund|method|online banking)\b/.test(text))additions.push(extraResources.taxPay);
      if(/\b(?:bill|amount|balance|statement|assessment)\b/.test(text))additions.push(extraResources.taxBill);
    }
    if(guide.id==='G07') {
      additions.push(extraResources.taxPTP);
      if(/\b(?:withdrawal|deduction|schedule|due|date)\b/.test(text))additions.push(extraResources.taxDates);
    }
    if(guide.id==='G02'&&/\b(?:declar|occupancy|occupied|vacant|submit|submission)\b/.test(text))additions.push(extraResources.vhtDeclaration);
    const result=[];const seen=new Set();
    for(const r of [...additions,...baseResources]){
      if(!seen.has(r.url)){seen.add(r.url);result.push(r);}
    }
    return result.slice(0,3);
  }
  function analyze(input={}) {
    const issue=clip(input.issue),details=clip(input.details);
    const probes=Array.isArray(input.probes)?input.probes.slice(0,30):[];
    const answers=probes.filter(p=>String(p.a||'').trim());
    // Re-evaluate the local guide match as agents record details and probing answers.
    const context=[issue,details,...answers.map(p=>p.a)].join(' ');
    const callType=['general_inquiry','service_request'].includes(input.callType)?input.callType:'unsure';
    const answeredIds=new Set(answers.map(p=>String(p.id||p.gapId||'')));
    const broad=findAmbiguous(context);
    const narrowed=answers.some(p=>String(p.id||'').startsWith('clarify-') && String(p.a||'').trim());
    // A broad topic needs clarification before assigning a specific guide.
    if(broad&&!narrowed)return clarifyFromGroup(broad,callType,context,answeredIds);
    const guide=findApprovedGuide(context,callType);
    if(!guide){
      const fallback=analyzeFallback(input);
      if(callType==='general_inquiry'){
        fallback.categoryLabel='General inquiry · Needs clarification';
        fallback.questions=[{id:'general-service',gap:'Service',question:'Which City service is the caller asking about?',why:'Identifies where to direct the caller.'},{id:'general-request',gap:'Question',question:'What information does the caller need?',why:'Clarifies their request.'}];
      } else if(callType==='service_request'){
        fallback.categoryLabel='Service request · Needs clarification';
        fallback.questions=[{id:'request-issue',gap:'Issue',question:'What specifically needs to be reported or fixed?',why:'Identifies the appropriate service request.'},{id:'request-location',gap:'Location',question:'Where is the issue located?',why:'Identifies the service location.'}];
      } else {
        fallback.categoryLabel='Service type not yet identified';
        fallback.questions=[{id:'unsure-type',gap:'Call type',question:'Does the caller need information or to report something that needs attention?',why:'Helps determine the call type.'},{id:'unsure-issue',gap:'Service',question:'Which City service or issue are they calling about?',why:'Narrows the service category.'}];
      }
      fallback.candidates=fallback.questions;
      return fallback;
    }
    const safetyNote=urgent.test(context)?'Potential immediate safety concern. Follow your organization’s emergency procedures rather than relying on probing suggestions.':'';
    const candidates=safetyNote?[]:guide.questions.filter(q=>{
      if(answeredIds.has(q.id))return false;
      if(answers.some(p=>normalize(p.q)===normalize(q.question)))return false;
      const check=extraFacts[q.gapId];
      // Do not ask a factual question already answered in the call notes.
      return !(check&&check.test(context));
    }).map(q=>({id:q.id,gap:q.gap,question:q.question,why:q.why}));
    const isRecycling=/\b(?:recycl\w*|blue bin|blue box)\b/i.test(issue+' '+details);
    const needsRecyclingRoute=isRecycling && ['G11','G18'].includes(guide.id);
    const baseResources=guide.sources.map(s=>({title:s.title,url:s.url,detail:'Reviewed service guide · Verify current details',origin:s.publisher}));
    const resources=appendRelevantResources(guide,context,baseResources);
    let routingNote='';
    if(needsRecyclingRoute){
      routingNote='2026 service change: residential recycling, missed Blue Bin collection and Blue Bin repairs are handled by Circular Materials. Check provider guidance before advising the caller.';
      resources.unshift({title:'Toronto recycling changes (2026)',url:'https://www.toronto.ca/services-payments/recycling-organics-garbage/houses/changes-to-recycling-program/',detail:'City notice: residential Blue Bin inquiries transferred January 1, 2026',origin:'City of Toronto'});
      resources.push({title:'Circular Materials Toronto',url:'https://www.circularmaterials.ca/toronto/',detail:'Residential recycling service provider',origin:'Circular Materials'});
    }
    return {
      category:guide.id,categoryLabel:guide.title,
      guideId:guide.id,guideVolume2025:guide.volume2025,
      candidates,questions:candidates.slice(0,2),resources,
      referenceCoverage:'approved-guide',safetyNote,routingNote,
      source:'approved-library'
    };
  }
  function validateGenerated(candidates,generated) {
    const allowed=new Map(candidates.map(c=>[c.id,c]));
    const seen=new Set();const result=[];
    for(const item of Array.isArray(generated)?generated:[]) {
      const id=String(item?.id||'');const ref=allowed.get(id);
      if(!ref||seen.has(id))continue;
      seen.add(id);
      // AI ranks and chooses relevant gap IDs, but the wording always comes from
      // the reviewed question bank. This prevents off-topic model inventions.
      result.push({...ref,question:ref.question});
      if(result.length===2) break;
    }
    return result;
  }
  return {analyze,validateGenerated,findApprovedGuide,approvedGuides,playbookLabels:playbooks.map(p=>p.label),resourceIndex};
});

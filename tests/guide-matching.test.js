const assert=require('node:assert/strict');
const {analyze,approvedGuides,findApprovedGuide}=require('../probing-engine.js');
assert.equal(approvedGuides.length,20);
const cases=[
['I need help with house taxes','G01'],
['I need to declare an empty house','G02'],
['How can I pay my water bill','G03'],
['A car is blocking my driveway','G04'],
['My meter reading is wrong','G05'],
['I want to update my mailing address','G06'],
['I need a tax payment plan','G07'],
['I have an old sofa to pick up','G08'],
['My water bill is too high','G09'],
['Where is the city dump','G10'],
['My bin is broken','G11'],
['There is a dead animal outside','G12'],
['My landlord is not fixing my apartment','G13'],
['There is a hurt bird','G14'],
['The city tree needs trimming','G15'],
['The sidewalk is icy','G16'],
['There is a big hole in the road','G17'],
['The garbage truck skipped me','G18'],
['My neighbor has loud music','G19'],
['My drains are backing up','G20'],
];
for(const [issue,id] of cases){
 const result=analyze({issue});
 assert.equal(result.guideId,id,`Wrong match for ${issue}; got ${result.categoryLabel}`);
 assert(result.questions.length<=2);
 assert(result.resources.length>=1);
 assert(!result.questions.some(q=>/how (?:does|is) this (?:affect|impact)/i.test(q.question)));
}
const ambiguous=[
 ['I have a problem with a water bill','clarify-billing'],
 ['I need help with my garbage','clarify-waste'],
 ['I found an animal','clarify-animal'],
 ['I have a problem on my street','clarify-roads'],
 ['I have a question about taxes','clarify-tax'],
];
for(const [issue,id] of ambiguous){
 const result=analyze({issue,callType:'unsure'});
 assert.equal(result.category,id,issue);
 assert.equal(result.questions.length,2);
 assert(result.resources.length>=1);
}
let initial=analyze({issue:'I have a question about water bill',callType:'general_inquiry'});
assert.equal(initial.category,'clarify-billing');
let narrowed=analyze({issue:'I have a question about water bill',callType:'general_inquiry',probes:[{id:initial.questions[1].id,q:initial.questions[1].question,a:'It is about a meter reading that was estimated.'}]});
assert.equal(narrowed.guideId,'G05');
assert(narrowed.resources.some(r=>r.url.includes('water-meter')));
let tax=analyze({issue:'Property taxes',callType:'general_inquiry',probes:[{id:'G01-taxPurpose',q:'Is your question about the bill amount, a due date, or a payment?',a:'I want pre-authorized tax payments.'}]});
assert.equal(tax.guideId,'G07');
assert(tax.resources.some(r=>/Pre-Authorized Tax Payment/i.test(r.title)));
let recycling=analyze({issue:'My blue bin was not collected',callType:'service_request'});
assert.equal(recycling.guideId,'G18');
assert(recycling.routingNote && recycling.resources.some(r=>/Circular Materials/.test(r.title)));
assert.equal(analyze({issue:'Something has happened',callType:'service_request'}).questions[0].id,'request-issue');
assert.equal(analyze({issue:'Something has happened',callType:'general_inquiry'}).questions[0].id,'general-service');
assert.equal(analyze({issue:'Something has happened',callType:'unsure'}).questions[0].id,'unsure-type');
console.log('PASS: 20 casual intents, 5 ambiguous topics, refinements, call type, recycling, 2-question cap');

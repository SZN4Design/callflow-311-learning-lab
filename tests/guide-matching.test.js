// Run with: node tests/guide-matching.test.js
const assert=require("node:assert/strict");
const {analyze,approvedGuides}=require("../probing-engine.js");
function check(issue, expectedId) {
  const result=analyze({issue,details:"",probes:[]});
  assert.equal(result.guideId,expectedId,issue);
  assert(result.questions.length<=2,issue+" returned more than two questions");
  assert(result.resources.length>=1,issue+" has no resources");
}
assert.equal(approvedGuides.length,20);
for(const guide of approvedGuides) check(guide.aliases[0],guide.id);
check("Sabrina wants to know information about property tax","G01");
check("Sabrina is calling about property tax","G01");
check("I want a pre-authorized property tax payment plan","G07");
check("Vacant Home Tax declaration question","G02");
let due=analyze({
 issue:"Sabrina is calling about property tax",
 probes:[{id:"G01-taxPurpose",q:"Is your question about the bill amount, a due date, or a payment?",a:"When is my property tax payment due?"}]
});
assert.equal(due.guideId,"G01");
assert(due.resources.some(x=>/due dates/i.test(x.title)));
let ptp=analyze({
 issue:"Sabrina is calling about property tax",
 probes:[{id:"G01-taxPurpose",q:"Is your question about the bill amount, a due date, or a payment?",a:"I want to enrol in pre-authorized payments."}]
});
assert.equal(ptp.guideId,"G07");
assert(ptp.resources.some(x=>/Pre-Authorized/.test(x.title)));
console.log("All 20 guide matches and property-tax refinement scenarios passed.");

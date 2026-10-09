"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const files = {
  ai: "app/assets/data-ai.js",
  robotics: "app/assets/data-robotics.js",
  intelligence: "app/assets/data-jd-intelligence.js",
  app: "app/assets/app.js",
};

const errors = [];
const warn = [];

function fail(message) { errors.push(message); }
function loadFile(name) {
  const file = path.join(ROOT, files[name]);
  const source = fs.readFileSync(file, "utf8");
  const context = { console };
  vm.createContext(context);
  const exportName = { ai: "AI_DOMAIN", robotics: "ROBOTICS_DOMAIN", intelligence: "JD_INTELLIGENCE" }[name];
  vm.runInContext(`${source};globalThis.__EXPORT__=${exportName}`, context, { filename: files[name] });
  return context.__EXPORT__;
}

function checkSyntax(name) {
  const file = path.join(ROOT, files[name]);
  new vm.Script(fs.readFileSync(file, "utf8"), { filename: files[name] });
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array`);
    return [];
  }
  return value;
}

const ai = loadFile("ai");
const robotics = loadFile("robotics");
const intel = loadFile("intelligence");
checkSyntax("app");

const domains = { ai, robotics };
const validGrades = new Set(intel.evidencePolicy.map((x) => x.grade));
const validStatuses = new Set(intel.sourceStatusPolicy.map((x) => x.id));
const sourceIds = new Set();
requireArray(intel.sources, "intelligence.sources").forEach((source) => {
  if (!source.id || !source.name || !source.url || !source.grade) fail(`invalid source metadata: ${JSON.stringify(source)}`);
  if (sourceIds.has(source.id)) fail(`duplicate source id: ${source.id}`);
  sourceIds.add(source.id);
  if (!validGrades.has(source.grade)) fail(`invalid source grade ${source.grade}: ${source.id}`);
  if (!/^https?:\/\//.test(source.url)) fail(`source URL must be http(s): ${source.id}`);
  if (source.searchUrl && !source.searchUrl.includes("{query}")) fail(`searchUrl must contain {query}: ${source.id}`);
  if (!Array.isArray(source.domains) || source.domains.some((d) => !(d in domains))) fail(`invalid source domains: ${source.id}`);
  const status = (source.access || {}).status || "unknown";
  if (!validStatuses.has(status)) fail(`invalid source status ${status}: ${source.id}`);
});

for (const [domainId, domain] of Object.entries(domains)) {
  const nodeIds = new Set();
  const moduleIds = new Set();
  requireArray(domain.nodes, `${domainId}.nodes`).forEach((node) => {
    if (!node.id || !node.name || !node.layer || !node.priority || !node.level) fail(`invalid node: ${JSON.stringify(node)}`);
    if (nodeIds.has(node.id)) fail(`duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
  });
  requireArray(domain.modules, `${domainId}.modules`).forEach((mod) => {
    if (!mod.id || !mod.name || !Array.isArray(mod.nodes) || !mod.priority || !mod.hours || !mod.goal) fail(`invalid module: ${mod.id}`);
    if (moduleIds.has(mod.id)) fail(`duplicate module id: ${mod.id}`);
    moduleIds.add(mod.id);
    mod.nodes.forEach((id) => { if (!nodeIds.has(id)) fail(`module ${mod.id} references missing node ${id}`); });
  });
  requireArray(domain.quizzes, `${domainId}.quizzes`).forEach((quiz) => {
    if (!quiz.node || !quiz.level || !quiz.q || !quiz.a) fail(`invalid quiz in ${domainId}`);
    if (!nodeIds.has(quiz.node)) fail(`quiz references missing node ${quiz.node}`);
  });
  requireArray(domain.interviews, `${domainId}.interviews`).forEach((item) => {
    if (!item.company || !item.level || !item.q || !item.framework || !Array.isArray(item.nodes)) fail(`invalid interview: ${item.q}`);
    item.nodes.forEach((id) => { if (!nodeIds.has(id)) fail(`interview references missing node ${id}`); });
  });
  requireArray(domain.glossary, `${domainId}.glossary`).forEach((item) => {
    if (!item.term || !item.def) fail(`invalid glossary term: ${item.term}`);
    (item.related || []).forEach((id) => { if (!nodeIds.has(id)) fail(`glossary ${item.term} references missing node ${id}`); });
  });
  requireArray(domain.jds, `${domainId}.jds`).forEach((item) => {
    if (!item.company || !item.role || !item.points) fail(`invalid JD summary: ${item.company}`);
  });
  for (const key of ["details", "knowledge", "qaBank"]) {
    if (!domain[key] || typeof domain[key] !== "object") fail(`${domainId}.${key} must be an object`);
  }
  Object.keys(domain.details).forEach((id) => { if (!nodeIds.has(id)) fail(`${domainId}.details references missing node ${id}`); });
  Object.keys(domain.knowledge).forEach((id) => { if (!nodeIds.has(id)) fail(`${domainId}.knowledge references missing node ${id}`); });
  Object.keys(domain.qaBank).forEach((id) => { if (!moduleIds.has(id)) fail(`${domainId}.qaBank references missing module ${id}`); });
}

const corpusIds = new Set();
const validTrends = new Set(["new", "rising", "stable", "fading"]);
requireArray(intel.corpus, "intelligence.corpus").forEach((record) => {
  if (!record.id || !record.domain || !record.company || !record.role || !record.capturedAt || !record.sourceId) fail(`invalid corpus record: ${JSON.stringify(record)}`);
  if (corpusIds.has(record.id)) fail(`duplicate corpus id: ${record.id}`);
  corpusIds.add(record.id);
  if (!(record.domain in domains)) fail(`invalid corpus domain: ${record.id}`);
  if (!sourceIds.has(record.sourceId)) fail(`corpus ${record.id} references missing source ${record.sourceId}`);
  if (!validGrades.has(record.evidenceGrade)) fail(`invalid corpus grade: ${record.id}`);
  if (!validTrends.has(record.trend)) fail(`invalid corpus trend: ${record.id}`);
  if (record.url && !/^https?:\/\//.test(record.url)) fail(`corpus URL must be http(s): ${record.id}`);
  const nodeIds = new Set(domains[record.domain].nodes.map((x) => x.id));
  (record.nodes || []).forEach((id) => { if (!nodeIds.has(id)) fail(`corpus ${record.id} references missing node ${id}`); });
  for (const key of ["hardRequirements", "niceToHave", "skills", "tools", "scenarios", "metrics"]) {
    if (!Array.isArray(record[key])) fail(`corpus ${record.id}.${key} must be an array`);
  }
  if (!record.skills.length) warn(`corpus ${record.id} has no skills`);
});

requireArray(intel.leads, "intelligence.leads").forEach((lead) => {
  if (!lead.domain || !lead.company || !lead.role || !lead.sourceId || !lead.nextAction) fail(`invalid lead: ${JSON.stringify(lead)}`);
  if (!(lead.domain in domains)) fail(`invalid lead domain: ${lead.company}`);
  if (!sourceIds.has(lead.sourceId)) fail(`lead ${lead.company} references missing source ${lead.sourceId}`);
  if (!validGrades.has(lead.evidenceGrade)) fail(`invalid lead grade: ${lead.company}`);
});

for (const [domainId, terms] of Object.entries(intel.taxonomy || {})) {
  if (!(domainId in domains)) fail(`invalid taxonomy domain: ${domainId}`);
  const seen = new Set();
  terms.forEach((term) => {
    if (seen.has(term)) fail(`duplicate taxonomy term ${term} in ${domainId}`);
    seen.add(term);
  });
}
if (!Array.isArray(intel.coverageMatrix) || intel.coverageMatrix.length < 5) fail("coverageMatrix must contain at least five dimensions");

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors, warn }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, domains: { ai: ai.nodes.length, robotics: robotics.nodes.length }, sources: intel.sources.length, corpus: intel.corpus.length, leads: intel.leads.length, warnings: warn.length }, null, 2));

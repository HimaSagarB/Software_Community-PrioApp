import { CATEGORY_BONUS, LOCATION_BONUS, RESOURCE_NEEDS } from '../data/seed.js';

export function calcPriority(issue) {
  const severity  = issue.severity * 20;
  const affected  = Math.min(issue.affectedPeople / 10, 30);
  const location  = LOCATION_BONUS[issue.locationType] ?? 5;
  const category  = CATEGORY_BONUS[issue.category] ?? 5;
  const voteBoost = Math.min((issue.votes?.length ?? 0) * 0.5, 15);
  return Math.min(Math.round(severity + affected + location + category + voteBoost), 100);
}

export function getScoreBreakdown(issue) {
  return {
    severity:  issue.severity * 20,
    affected:  Math.min(Math.round(issue.affectedPeople / 10), 30),
    location:  LOCATION_BONUS[issue.locationType] ?? 5,
    category:  CATEGORY_BONUS[issue.category] ?? 5,
    votes:     Math.min(Math.round((issue.votes?.length ?? 0) * 0.5), 15),
    total:     calcPriority(issue),
  };
}

export function getLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export const LEVEL_META = {
  critical:{ label:'Critical', color:'#d4402a', bg:'#fde8e5', border:'#d4402a' },
  high:    { label:'High',     color:'#e07b20', bg:'#fef3e5', border:'#e07b20' },
  medium:  { label:'Medium',   color:'#c8972a', bg:'#fff9e5', border:'#c8972a' },
  low:     { label:'Low',      color:'#2a8c4a', bg:'#e8f5ec', border:'#2a8c4a' },
};

export function runOptimizer(issues, res) {
  const pool = issues
    .filter(i => i.status !== 'resolved')
    .map(i => ({ ...i, score: calcPriority(i) }))
    .sort((a,b) => b.score - a.score);

  const rem = { ...res };
  const scheduled = [], deferred = [];

  for (const issue of pool) {
    const need = RESOURCE_NEEDS[issue.category] ?? { workers:2,vehicles:1,equipment:0,budget:50 };
    const ok = need.workers<=rem.workers && need.vehicles<=rem.vehicles &&
               need.equipment<=rem.equipment && need.budget<=rem.budget;
    if (ok) {
      rem.workers-=need.workers; rem.vehicles-=need.vehicles;
      rem.equipment-=need.equipment; rem.budget-=need.budget;
      scheduled.push({ issue, need, rank: scheduled.length+1 });
    } else {
      const why=[];
      if(need.workers>rem.workers)   why.push(`${need.workers} workers needed, ${rem.workers} available`);
      if(need.vehicles>rem.vehicles) why.push(`${need.vehicles} vehicles needed, ${rem.vehicles} available`);
      if(need.equipment>rem.equipment) why.push(`${need.equipment} equipment needed, ${rem.equipment} available`);
      if(need.budget>rem.budget)     why.push(`₹${need.budget}K needed, ₹${rem.budget}K available`);
      deferred.push({ issue, need, reason: why.join(' · ') });
    }
  }
  return { scheduled, deferred, remaining: rem };
}

export function sortIssues(list, by) {
  const s = list.map(i => ({ ...i, _score: calcPriority(i) }));
  if (by==='score')    return s.sort((a,b)=>b._score-a._score);
  if (by==='votes')    return s.sort((a,b)=>(b.votes?.length??0)-(a.votes?.length??0));
  if (by==='newest')   return s.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if (by==='oldest')   return s.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  if (by==='affected') return s.sort((a,b)=>b.affectedPeople-a.affectedPeople);
  return s;
}

export function filterIssues(list, { status, level, category, search }) {
  return list.filter(i => {
    if (status && status!=='all' && i.status!==status) return false;
    if (category && category!=='all' && i.category!==category) return false;
    if (level && level!=='all' && getLevel(calcPriority(i))!==level) return false;
    if (search) {
      const q=search.toLowerCase();
      if (!i.title.toLowerCase().includes(q) &&
          !i.description.toLowerCase().includes(q) &&
          !i.category.toLowerCase().includes(q) &&
          !i.reporter.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' });
}

export function genId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

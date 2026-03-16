// ── Constants ────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  'Infrastructure','Public Safety','Sanitation',
  'Environment','Healthcare','Education','Transport','Utilities',
];

export const LOCATION_TYPES = [
  'Residential','Commercial','Industrial',
  'Park/Recreation','School Zone','Hospital Zone','Highway',
];

export const SEVERITY_LABELS = { 1:'Minor', 2:'Moderate', 3:'Serious', 4:'Severe', 5:'Critical' };

export const CATEGORY_BONUS = {
  'Public Safety':15,'Healthcare':12,'Infrastructure':10,
  'Utilities':8,'Environment':6,'Sanitation':6,'Transport':5,'Education':4,
};
export const LOCATION_BONUS = {
  'Hospital Zone':15,'School Zone':12,'Highway':10,
  'Residential':6,'Commercial':5,'Industrial':4,'Park/Recreation':3,
};
export const RESOURCE_NEEDS = {
  'Utilities':     { workers:4,vehicles:2,equipment:1,budget:80  },
  'Public Safety': { workers:2,vehicles:1,equipment:0,budget:30  },
  'Infrastructure':{ workers:5,vehicles:2,equipment:2,budget:120 },
  'Environment':   { workers:6,vehicles:3,equipment:2,budget:150 },
  'Sanitation':    { workers:4,vehicles:2,equipment:1,budget:70  },
  'Transport':     { workers:3,vehicles:2,equipment:1,budget:60  },
  'Healthcare':    { workers:2,vehicles:1,equipment:0,budget:50  },
  'Education':     { workers:2,vehicles:1,equipment:0,budget:40  },
};
export const RESOURCE_CONFIG = [
  { id:'workers',  name:'Field Workers',    icon:'👷', total:20,  unit:'workers'  },
  { id:'vehicles', name:'Service Vehicles', icon:'🚛', total:8,   unit:'vehicles' },
  { id:'equipment',name:'Heavy Equipment',  icon:'🏗️', total:4,   unit:'units'    },
  { id:'budget',   name:'Daily Budget (₹K)',icon:'💰', total:500, unit:'K'        },
];

// ── Pre-seeded Users (password stored as plain text for demo) ─────────────────
export const SEED_USERS = [
  { id:'u1', name:'Admin User',     email:'admin@civic.gov',   password:'admin123',  role:'admin',  avatar:'AU', joined:'2024-01-01' },
  { id:'u2', name:'Priya Sharma',   email:'priya@email.com',   password:'priya123',  role:'member', avatar:'PS', joined:'2024-06-15' },
  { id:'u3', name:'Rahul Mehta',    email:'rahul@email.com',   password:'rahul123',  role:'member', avatar:'RM', joined:'2024-08-20' },
  { id:'u4', name:'Fatima Okonkwo', email:'fatima@email.com',  password:'fatima123', role:'member', avatar:'FO', joined:'2024-09-10' },
  { id:'u5', name:'David Chen',     email:'david@email.com',   password:'david123',  role:'member', avatar:'DC', joined:'2025-01-02' },
];

// ── Seed Issues ───────────────────────────────────────────────────────────────
export const SEED_ISSUES = [
  {
    id:1, title:'Burst Water Main — Main Street',
    category:'Utilities', description:'Large water main has burst flooding three blocks. Multiple properties affected, road completely impassable. Ongoing since early morning with no municipal response.',
    severity:5, affectedPeople:450, locationType:'Residential',
    status:'open', votes:[], reporterId:'u2',
    createdAt:'2025-01-15', reporter:'Priya Sharma',
    comments:[{ id:101,authorId:'u1',author:'Admin User',text:'Crew dispatched. ETA 2 hours.',date:'2025-01-15' }],
  },
  {
    id:2, title:'Broken Traffic Signal — Oak Ave & 5th St',
    category:'Public Safety', description:'Traffic light completely dark. Located near primary school, creating dangerous crossing situations during school hours. Several near-misses already reported by parents.',
    severity:4, affectedPeople:200, locationType:'School Zone',
    status:'inprogress', votes:['u3','u4'], reporterId:'u3',
    createdAt:'2025-01-16', reporter:'Rahul Mehta',
    comments:[],
  },
  {
    id:3, title:'Pothole Cluster — Highway North Ramp',
    category:'Infrastructure', description:'Series of deep potholes on the highway on-ramp causing vehicle damage and creating accident risk for commuters travelling at high speed.',
    severity:3, affectedPeople:1200, locationType:'Highway',
    status:'open', votes:['u2'], reporterId:'u4',
    createdAt:'2025-01-17', reporter:'Fatima Okonkwo',
    comments:[],
  },
  {
    id:4, title:'Illegal Dumping — Riverside Park',
    category:'Environment', description:'Large volume of industrial waste illegally dumped near river bank. Contamination risk to municipal water supply. Chemical smell reported by multiple residents.',
    severity:4, affectedPeople:3000, locationType:'Park/Recreation',
    status:'open', votes:['u2','u3','u4','u5'], reporterId:'u5',
    createdAt:'2025-01-18', reporter:'David Chen',
    comments:[],
  },
  {
    id:5, title:'Street Lighting Outage — North Quarter',
    category:'Infrastructure', description:'Entire block of street lights non-functional for two weeks. Crime reports have increased significantly. Residents feel unsafe walking home after dark.',
    severity:3, affectedPeople:180, locationType:'Residential',
    status:'open', votes:['u5'], reporterId:'u2',
    createdAt:'2025-01-19', reporter:'Priya Sharma',
    comments:[],
  },
  {
    id:6, title:'Sewage Overflow — Commercial District',
    category:'Sanitation', description:'Raw sewage overflowing manhole covers near restaurant area. Severe public health hazard. Multiple businesses have been forced to temporarily close operations.',
    severity:5, affectedPeople:600, locationType:'Commercial',
    status:'inprogress', votes:['u2','u3','u4','u5'], reporterId:'u4',
    createdAt:'2025-01-20', reporter:'Fatima Okonkwo',
    comments:[{ id:201,authorId:'u1',author:'Admin User',text:'Health inspection underway. Restaurants advised to close temporarily.',date:'2025-01-20' }],
  },
  {
    id:7, title:'Collapsed Footbridge — Community Park',
    category:'Infrastructure', description:'Wooden footbridge has partially collapsed. Access to east section of park is cut off. Risk of injury to pedestrians who do not notice the damage.',
    severity:4, affectedPeople:350, locationType:'Park/Recreation',
    status:'open', votes:['u3'], reporterId:'u3',
    createdAt:'2025-01-21', reporter:'Rahul Mehta',
    comments:[],
  },
  {
    id:8, title:'Hospital Generator Fault',
    category:'Healthcare', description:'Backup generator at district hospital showing fault codes. Risk of power failure during surgeries if main grid goes down. Urgent inspection required by certified engineers.',
    severity:5, affectedPeople:800, locationType:'Hospital Zone',
    status:'resolved', votes:['u2','u3','u4','u5'], reporterId:'u1',
    createdAt:'2025-01-12', reporter:'Admin User',
    comments:[{ id:301,authorId:'u1',author:'Admin User',text:'Generator fully replaced. System operational.',date:'2025-01-14' }],
  },
];

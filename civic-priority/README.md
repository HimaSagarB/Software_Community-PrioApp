# CivicPriority — Community Issue Prioritization & Resource Allocation Platform

A full-stack-ready React web application for transparent, community-driven civic issue management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 👥 Demo Accounts

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@civic.gov     | admin123   |
| Member | priya@email.com     | priya123   |
| Member | rahul@email.com     | rahul123   |
| Member | fatima@email.com    | fatima123  |
| Member | david@email.com     | david123   |

## 📁 Project Structure

```
src/
├── components/
│   ├── IssueCard.jsx          # Auth-aware issue card with voting
│   ├── IssueCard.module.css
│   └── layout/
│       ├── Navbar.jsx         # Sticky nav with user avatar & dropdown
│       ├── Navbar.module.css
│       ├── Toast.jsx          # Global toast notifications
│       └── Toast.module.css
├── context/
│   ├── AuthContext.jsx        # Login, register, logout, session
│   ├── IssuesContext.jsx      # Issue CRUD, voting, comments
│   └── ToastContext.jsx       # Global notification state
├── data/
│   └── seed.js                # Demo users, seed issues, constants
├── pages/
│   ├── Auth.jsx               # Login / Register page
│   ├── Dashboard.jsx          # Stats, charts, top issues
│   ├── Issues.jsx             # Filterable issue registry
│   ├── Report.jsx             # Submit issue (members only)
│   ├── Ranking.jsx            # Full priority ranking table
│   ├── Optimizer.jsx          # Greedy resource allocator
│   └── Profile.jsx            # User votes & reports
├── utils/
│   └── scoring.js             # Priority formula, optimizer, helpers
├── App.jsx                    # Router + providers
└── main.jsx                   # Entry point
```

## ✨ Key Features

### 🔐 Authentication
- Member registration and login
- Session persistence via sessionStorage
- Role-based access: **Admin** vs **Member**
- Protected routes (report issue requires login)

### 🗳️ Community Voting
- Only **logged-in members** can vote on issues
- Each user gets **one vote per issue** (no duplicates)
- Votes contribute up to **+15 priority points** via transparent formula
- Unregistered users are prompted to sign in

### 📊 Transparent Priority Scoring
```
Score = (Severity × 20) + min(AffectedPeople÷10, 30) + LocationBonus + CategoryBonus + min(Votes×0.5, 15)
```
- Score capped at 100, no ML black-box
- Live preview while filling report form

### ⚡ Resource Optimizer
- Priority-based greedy algorithm (replaces FIFO)
- Configure workers, vehicles, equipment, budget
- Issues sorted by score before allocation
- Clear scheduled vs deferred results

### 👤 User Profile
- View all issues you've reported
- See every issue you've voted on
- Track priority points contributed via votes
- Admin users can update issue status

## 🛠 Tech Stack

- **React 18** + **Vite 5**
- **React Router v6** for navigation
- **CSS Modules** for scoped styling
- **localStorage** for data persistence
- **sessionStorage** for auth session

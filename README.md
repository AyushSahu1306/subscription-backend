Production-grade subscription and access-control backend built with Node.js, PostgreSQL, and transactional design principles.

subscription-backend/
│
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server bootstrap
│   │
│   ├── config/
│   │   ├── env.ts          # Environment variables
│   │   └── db.ts           # PostgreSQL connection
│   │
│   ├── db/
│   │   └── migrations/     # SQL files (manual for now)
│   │
│   ├── modules/            # Feature-based structure (later)
│   │
│   └── shared/
│       └── logger.ts       # Minimal logging
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

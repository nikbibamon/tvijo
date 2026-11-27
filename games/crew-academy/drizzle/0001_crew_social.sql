CREATE TABLE crew_players (
  id TEXT PRIMARY KEY, callsign TEXT NOT NULL, hero TEXT NOT NULL, focus TEXT NOT NULL DEFAULT 'explore',
  visible INTEGER NOT NULL DEFAULT 0 CHECK (visible IN (0,1))
);
--> statement-breakpoint
CREATE TABLE crew_sessions (
  digest TEXT PRIMARY KEY, player TEXT NOT NULL REFERENCES crew_players(id), until INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX crew_sessions_expiry ON crew_sessions(until);
--> statement-breakpoint
CREATE TABLE crew_marks (
  player TEXT NOT NULL REFERENCES crew_players(id), stage TEXT NOT NULL, action TEXT NOT NULL,
  PRIMARY KEY(player,stage,action)
);
--> statement-breakpoint
CREATE TABLE crew_pairs (
  low TEXT NOT NULL REFERENCES crew_players(id), high TEXT NOT NULL REFERENCES crew_players(id),
  sender TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('waiting','accepted','declined')),
  touched INTEGER NOT NULL, PRIMARY KEY(low,high)
);
--> statement-breakpoint
CREATE INDEX crew_pairs_high ON crew_pairs(high,status);
--> statement-breakpoint
CREATE TABLE crew_muted (
  owner TEXT NOT NULL, other TEXT NOT NULL, PRIMARY KEY(owner,other)
);
--> statement-breakpoint
CREATE TABLE crew_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT NOT NULL, recipient TEXT NOT NULL,
  phrase TEXT NOT NULL, world TEXT, sent INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX crew_notes_pair ON crew_notes(sender,recipient,id);
--> statement-breakpoint
CREATE TABLE crew_identities (
  subject TEXT PRIMARY KEY, player TEXT UNIQUE NOT NULL REFERENCES crew_players(id)
);
--> statement-breakpoint
CREATE TABLE crew_challenges (
  session TEXT PRIMARY KEY REFERENCES crew_sessions(digest) ON DELETE CASCADE, nonce TEXT UNIQUE NOT NULL, until INTEGER NOT NULL
);

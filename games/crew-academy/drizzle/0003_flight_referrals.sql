CREATE TABLE crew_invite_codes (
 owner TEXT PRIMARY KEY REFERENCES crew_players(id),
 code TEXT NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE crew_referrals (
 guest TEXT PRIMARY KEY REFERENCES crew_players(id),
 host TEXT NOT NULL REFERENCES crew_players(id),
 joined INTEGER NOT NULL,
 qualified INTEGER,
 CHECK (guest <> host)
);
--> statement-breakpoint
CREATE INDEX crew_referrals_host ON crew_referrals(host,qualified);

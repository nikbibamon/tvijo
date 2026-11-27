CREATE TABLE crew_beacon_links (
 code TEXT PRIMARY KEY,
 host TEXT NOT NULL REFERENCES crew_players(id),
 guest TEXT REFERENCES crew_players(id),
 mission TEXT,
 state TEXT NOT NULL CHECK (state IN ('open','joining','paired','declined','closed')),
 CHECK (guest IS NULL OR host <> guest)
);
--> statement-breakpoint
CREATE UNIQUE INDEX crew_beacon_open_host ON crew_beacon_links(host) WHERE state='open';
--> statement-breakpoint
CREATE INDEX crew_beacon_host ON crew_beacon_links(host);
--> statement-breakpoint
CREATE INDEX crew_beacon_guest ON crew_beacon_links(guest);

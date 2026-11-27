ALTER TABLE crew_players ADD COLUMN avatar TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE crew_notes ADD COLUMN body TEXT;
--> statement-breakpoint
CREATE TABLE crew_relays (
 low TEXT NOT NULL, high TEXT NOT NULL, mission TEXT NOT NULL UNIQUE, scout TEXT NOT NULL,
 sequence TEXT NOT NULL, phase TEXT NOT NULL CHECK(phase IN ('scout','found','sent','done')),
 PRIMARY KEY(low,high)
);
--> statement-breakpoint
CREATE TABLE crew_beacons (low TEXT NOT NULL, high TEXT NOT NULL, finished INTEGER NOT NULL, PRIMARY KEY(low,high));
--> statement-breakpoint
CREATE INDEX crew_beacons_high ON crew_beacons(high);
--> statement-breakpoint
CREATE TABLE crew_reports (note INTEGER NOT NULL, reporter TEXT NOT NULL, sender TEXT NOT NULL, reason TEXT NOT NULL, excerpt TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(note,reporter));

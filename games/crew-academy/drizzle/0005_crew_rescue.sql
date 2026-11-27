CREATE TABLE crew_rescues (
  low TEXT NOT NULL REFERENCES crew_players(id),
  high TEXT NOT NULL REFERENCES crew_players(id),
  mission TEXT NOT NULL UNIQUE,
  drone TEXT NOT NULL,
  lane TEXT NOT NULL CHECK (lane IN ('upper','lower')),
  phase TEXT NOT NULL CHECK (phase IN ('survey','mark','anchor','cross','pull','done')),
  finished INTEGER,
  PRIMARY KEY (low,high),
  CHECK (low < high),
  CHECK (drone IN (low,high)),
  CHECK ((phase='done') = (finished IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX crew_rescues_high ON crew_rescues(high);

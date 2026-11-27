CREATE TABLE crew_pilot_first (
  session_id text NOT NULL,
  event text NOT NULL,
  seconds integer NOT NULL,
  day text NOT NULL,
  PRIMARY KEY (session_id, event)
);
--> statement-breakpoint
CREATE INDEX crew_pilot_day_idx ON crew_pilot_first (day, event);

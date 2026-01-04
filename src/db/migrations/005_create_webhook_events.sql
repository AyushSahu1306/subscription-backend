CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  provider_event_id TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ
);

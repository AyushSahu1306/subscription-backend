CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL CHECK (
    status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')
  ),
  started_at TIMESTAMPTZ NOT NULL,
  trail_ends_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX one_active_subscription_per_user
ON subscriptions (user_id)
WHERE status IN ('trialing', 'active', 'past_due');

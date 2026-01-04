CREATE TABLE plans (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price_cents INTEGER NOT NULL CHECK(price_cents>=0),
    billing_interval TEXT NOT NULL CHECK(
        billing_interval IN ('monthly', 'yearly')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

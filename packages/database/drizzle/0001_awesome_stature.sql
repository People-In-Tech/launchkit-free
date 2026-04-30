CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'paid' NOT NULL,
	"stripe_customer_id" text,
	"stripe_checkout_session_id" text,
	"amount_cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"github_username" text,
	"invited_at" timestamp,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "purchases_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);

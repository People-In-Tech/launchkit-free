CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" varchar(100) DEFAULT 'unknown' NOT NULL,
	"page" varchar(255),
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"converted_at" timestamp,
	"email_sent_at" timestamp,
	"sequence_step" integer DEFAULT 0 NOT NULL,
	"unsubscribed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "lk_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_public" boolean DEFAULT false,
	"category" text DEFAULT 'general',
	"model" text,
	"usage_count" text DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lk_ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text,
	"model" text NOT NULL,
	"provider" text,
	"feature" text DEFAULT 'chat',
	"prompt_tokens" integer DEFAULT 0,
	"completion_tokens" integer DEFAULT 0,
	"total_tokens" integer DEFAULT 0,
	"cost_usd" real DEFAULT 0,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lk_agent_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text,
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"model_id" text DEFAULT 'gpt-5.4-mini',
	"tools" jsonb DEFAULT '[]'::jsonb,
	"is_public" boolean DEFAULT false,
	"enable_memory" boolean DEFAULT false,
	"max_steps" text DEFAULT '10',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_user_id_unique";--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "product_id" text DEFAULT 'launchkit-pro' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "product_type" varchar(20) DEFAULT 'boilerplate' NOT NULL;--> statement-breakpoint
CREATE INDEX "lk_prompts_user_idx" ON "lk_prompts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lk_prompts_org_idx" ON "lk_prompts" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "lk_prompts_category_idx" ON "lk_prompts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "lk_ai_usage_user_idx" ON "lk_ai_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lk_ai_usage_org_idx" ON "lk_ai_usage" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "lk_ai_usage_date_idx" ON "lk_ai_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lk_ai_usage_model_idx" ON "lk_ai_usage" USING btree ("model");--> statement-breakpoint
CREATE INDEX "lk_agent_configs_user_idx" ON "lk_agent_configs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lk_agent_configs_org_idx" ON "lk_agent_configs" USING btree ("org_id");
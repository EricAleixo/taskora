ALTER TABLE "profile" ALTER COLUMN "timezone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "bio" varchar(255);--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "theme" varchar(20) DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "receive_email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
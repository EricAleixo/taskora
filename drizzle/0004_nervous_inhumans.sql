ALTER TABLE "user" DROP CONSTRAINT "user_profile_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "theme" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "profile_id";--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_unique" UNIQUE("user_id");
ALTER TABLE "profile" DROP CONSTRAINT "profile_user_id_unique";--> statement-breakpoint
ALTER TABLE "profile" DROP CONSTRAINT "profile_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profile_id" integer;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "user_id";
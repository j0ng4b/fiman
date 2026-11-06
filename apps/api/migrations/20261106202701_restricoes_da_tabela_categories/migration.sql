ALTER TABLE "categories" ADD CONSTRAINT "categories_id_type_uq" UNIQUE("id","type");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_type_name_uq" UNIQUE("user_id","type","name");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_system_active_ck" CHECK (NOT "is_system" OR "active");
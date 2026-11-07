ALTER TABLE "transfers" DROP CONSTRAINT "transfers_from_account_id_accounts_id_fkey";--> statement-breakpoint
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_to_account_id_accounts_id_fkey";--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_account_user_fk" FOREIGN KEY ("from_account_id","user_id") REFERENCES "accounts"("id","user_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_account_user_fk" FOREIGN KEY ("to_account_id","user_id") REFERENCES "accounts"("id","user_id") ON DELETE RESTRICT;
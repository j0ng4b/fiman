CREATE INDEX "transfers_from_account_date_idx" ON "transfers" ("from_account_id","date");--> statement-breakpoint
CREATE INDEX "transfers_to_account_date_idx" ON "transfers" ("to_account_id","date");--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_amount_positive_ck" CHECK ("amount" > 0);--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_distinct_accounts_ck" CHECK ("from_account_id" <> "to_account_id");
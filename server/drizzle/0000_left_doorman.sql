CREATE TYPE "public"."poll_status" AS ENUM('draft', 'active', 'expired', 'published');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single_choice', 'image_choice');--> statement-breakpoint
CREATE TABLE "polls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(120) DEFAULT 'general' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"accent_color" varchar(40) DEFAULT '#B6FF3B' NOT NULL,
	"completion_message" text DEFAULT 'Your response has been recorded. Thanks for weighing in.' NOT NULL,
	"status" "poll_status" DEFAULT 'draft' NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"show_live_results" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" varchar(255),
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"question" text NOT NULL,
	"question_type" "question_type" DEFAULT 'single_choice' NOT NULL,
	"options" text NOT NULL,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"user_id" uuid,
	"respondent_name" varchar(255),
	"respondent_email" varchar(255),
	"submission_token" varchar(255),
	"user_agent" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "responses_submission_token_unique" UNIQUE("submission_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "polls_created_by_idx" ON "polls" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "polls_status_idx" ON "polls" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "polls_slug_idx" ON "polls" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "qr_question_id_idx" ON "question_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "qr_response_id_idx" ON "question_responses" USING btree ("response_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_answer_per_question_per_response_idx" ON "question_responses" USING btree ("response_id","question_id");--> statement-breakpoint
CREATE INDEX "questions_poll_id_idx" ON "questions" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "responses_poll_id_idx" ON "responses" USING btree ("poll_id");--> statement-breakpoint
CREATE INDEX "responses_user_id_idx" ON "responses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_response_per_user_per_poll_idx" ON "responses" USING btree ("poll_id","user_id");

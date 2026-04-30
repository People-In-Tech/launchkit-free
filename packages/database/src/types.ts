import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { users, organizations, organizationMemberships, subscriptions, userCredits, creditTransactions, aiChats, documents } from "./schema";

// Select types (reading from DB)
export type User = InferSelectModel<typeof users>;
export type Organization = InferSelectModel<typeof organizations>;
export type OrganizationMembership = InferSelectModel<typeof organizationMemberships>;
export type Subscription = InferSelectModel<typeof subscriptions>;
export type UserCredit = InferSelectModel<typeof userCredits>;
export type CreditTransaction = InferSelectModel<typeof creditTransactions>;
export type AiChat = InferSelectModel<typeof aiChats>;
export type DocumentRecord = InferSelectModel<typeof documents>;

// Insert types (writing to DB)
export type NewUser = InferInsertModel<typeof users>;
export type NewOrganization = InferInsertModel<typeof organizations>;
export type NewOrganizationMembership = InferInsertModel<typeof organizationMemberships>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
export type NewUserCredit = InferInsertModel<typeof userCredits>;
export type NewCreditTransaction = InferInsertModel<typeof creditTransactions>;
export type NewAiChat = InferInsertModel<typeof aiChats>;
export type NewDocumentRecord = InferInsertModel<typeof documents>;

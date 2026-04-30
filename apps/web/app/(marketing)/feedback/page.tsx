import { FeedbackBoard } from "@/components/plugins/feedback/feedback-board";

export const metadata = {
  title: "Feedback",
  description: "Help us improve by sharing your feedback",
};

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Feedback</h1>
        <p className="text-muted-foreground">
          Help us improve by sharing your feedback
        </p>
      </div>
      <FeedbackBoard />
    </div>
  );
}

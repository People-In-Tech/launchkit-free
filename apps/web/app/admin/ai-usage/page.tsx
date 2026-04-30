import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAIUsagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Usage</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Credits Used", value: "284,500" },
          { title: "Active AI Users", value: "312" },
          { title: "Avg Credits/User", value: "912" },
          { title: "Est. AI Cost", value: "$1,845" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Usage by Model</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { model: "GPT-4o", usage: "45%", credits: "128,025" },
              { model: "Claude 3.5 Sonnet", usage: "30%", credits: "85,350" },
              { model: "Gemini Pro", usage: "15%", credits: "42,675" },
              { model: "Groq (Llama)", usage: "10%", credits: "28,450" },
            ].map((item) => (
              <div key={item.model} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.model}</div>
                  <div className="text-xs text-muted-foreground">{item.credits} credits</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: item.usage }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-10">{item.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

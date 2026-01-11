import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingScreen() {
  return (
    <Card className="flex flex-col items-center justify-center p-8 border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center justify-center gap-4">
            <Flame className="w-16 h-16 text-accent animate-spin" />
            <p className="text-muted-foreground text-lg tracking-wider">Loading...</p>
        </CardContent>
    </Card>
  );
}

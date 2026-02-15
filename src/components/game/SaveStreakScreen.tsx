import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Flame, ShieldCheck } from "lucide-react";

type SaveStreakScreenProps = {
  streak: number;
  onSave: () => void;
  onEnd: () => void;
};

export function SaveStreakScreen({ streak, onSave, onEnd }: SaveStreakScreenProps) {
  return (
    // The GameScreen is still rendered behind this dialog
    <AlertDialog open={true} onOpenChange={(open) => !open && onEnd()}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit mb-4">
            <Flame className="w-12 h-12 text-accent" />
          </div>
          <AlertDialogTitle className="text-2xl font-headline">Save Your Streak?</AlertDialogTitle>
          <AlertDialogDescription>
            You have a streak of {streak}. An ad will open in the background to
            save your streak and continue playing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-1 gap-2">
          <AlertDialogAction onClick={onSave} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Save Streak & Continue
          </AlertDialogAction>
          <AlertDialogCancel onClick={onEnd} className="w-full">End Game</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { Waves } from "@/lib/icons";

export function HeaderLeft() {
    return (
        <div className="flex items-center space-x-2">
            <Waves className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground text-sm">Sea of Freedom</span>
        </div>
    );
}

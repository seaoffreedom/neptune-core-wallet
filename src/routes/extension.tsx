import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/extension")({
    component: Extension,
});

function Extension() {
    return (
        <div className="p-8 space-y-4">
            <h3 className="text-2xl font-bold">Neptune Accomplice</h3>
            <p className="text-muted-foreground">
                Configure browser extension integration and manage allowed
                hosts. Click the extension icon again to toggle the sidebar.
            </p>
            <div className="space-y-2">
                <div className="w-full h-8 bg-muted rounded"></div>
                <div className="w-full h-8 bg-muted rounded"></div>
                <div className="w-full h-8 bg-muted rounded"></div>
            </div>
        </div>
    );
}

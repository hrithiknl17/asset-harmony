import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

const EmptyState = ({ icon: Icon = Inbox, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
  </div>
);

export default EmptyState;

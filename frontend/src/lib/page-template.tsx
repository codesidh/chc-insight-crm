// Standard page template structure for all pages
// This ensures consistent typography and spacing across the application

export const PAGE_STRUCTURE = {
  // Main container with proper flex layout
  mainContainer: "flex flex-1 flex-col",
  
  // Container query wrapper
  containerWrapper: "@container/main flex flex-1 flex-col gap-2",
  
  // Content wrapper with proper spacing
  contentWrapper: "flex flex-col gap-8 py-6 md:py-8",
  
  // Padding container with section spacing
  paddingContainer: "px-4 lg:px-6 space-y-8",
  
  // Typography classes
  typography: {
    pageTitle: "text-3xl font-bold tracking-tight",
    pageDescription: "text-muted-foreground text-lg",
    sectionTitle: "text-2xl font-semibold tracking-tight",
    sectionDescription: "text-muted-foreground",
    cardTitle: "text-lg font-semibold",
    cardDescription: "text-sm text-muted-foreground"
  },
  
  // Spacing classes
  spacing: {
    headerSection: "space-y-2",
    statsGrid: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
    cardsGrid: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    twoColumnGrid: "grid gap-4 lg:grid-cols-2",
    listSpacing: "space-y-4",
    itemSpacing: "space-y-3"
  }
};

// Standard header component structure
export interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className={PAGE_STRUCTURE.spacing.headerSection}>
        <h1 className={PAGE_STRUCTURE.typography.pageTitle}>{title}</h1>
        <p className={PAGE_STRUCTURE.typography.pageDescription}>
          {description}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
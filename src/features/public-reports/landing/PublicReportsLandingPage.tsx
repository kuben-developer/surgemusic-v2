export function PublicReportsLandingPage() {
  return (
    <div className="container relative flex items-center justify-center min-h-[75vh]">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Surge Music Reports</h1>
        <p className="text-muted-foreground">
          To view a shared report, please use the direct link provided to you. 
          The URL should include a share ID in the format:
        </p>
        <pre className="bg-muted p-3 rounded-md mt-2 text-sm overflow-x-auto">
          /public/reports/[share_id]
        </pre>
      </div>
    </div>
  );
}
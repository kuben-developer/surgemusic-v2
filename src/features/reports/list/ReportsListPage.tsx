"use client";

import { ReportsTable } from './components/ReportsTable';
import { DeleteReportDialog } from './components/DeleteReportDialog';
import { ReportsListHeader } from './components/ReportsListHeader';
import { ReportsListStates } from './components/ReportsListStates';
import { useReportsList } from './hooks/useReportsList';

export default function ReportsListPage() {
    const {
        reports,
        isLoading,
        error,
        refetch,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        reportToDelete,
        handleDelete,
        openDeleteDialog,
    } = useReportsList();

    const hasReports = reports && reports.length > 0;
    const isEmpty = !isLoading && !error && reports && reports.length === 0;
    const shouldShowTable = !isLoading && !error && hasReports;

    return (
        <>
            <div className="container max-w-7xl mx-auto py-12 px-4">
                <ReportsListHeader />

                <ReportsListStates
                    isLoading={isLoading}
                    error={error}
                    isEmpty={isEmpty}
                    onRetry={refetch}
                />

                {shouldShowTable && (
                    <ReportsTable 
                        reports={reports} 
                        onDeleteClick={openDeleteDialog}
                    />
                )}
            </div>
            
            <DeleteReportDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                report={reportToDelete}
                onConfirm={handleDelete}
            />
        </>
    );
}
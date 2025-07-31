"use client";

import React from 'react';
import { ReportForm } from '../shared/components/ReportForm';
import { useCreateReport } from './hooks/useCreateReport';

export default function ReportCreatePage() {
    const { createReport, isCreating } = useCreateReport();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Create New Report</h1>
            <ReportForm 
                onSubmit={createReport} 
                isLoading={isCreating}
                submitButtonText="Create Report"
            />
        </div>
    );
}
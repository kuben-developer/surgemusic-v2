"use client";

import React from 'react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Report } from '../../shared/types/report.types';
import { formatDate } from '../../shared/utils/report.utils';

interface ReportsTableProps {
    reports: Report[];
    onDeleteClick: (report: Report) => void;
}

export function ReportsTable({ reports, onDeleteClick }: ReportsTableProps) {
    return (
        <TooltipProvider>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[40%]">Name</TableHead>
                            <TableHead className="text-center">Campaigns</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report._id} className="hover:bg-muted/20">
                                <TableCell className="font-medium py-3">{report.name}</TableCell>
                                <TableCell className="text-center py-3">{report.campaigns?.length || 0}</TableCell>
                                <TableCell className="text-muted-foreground py-3">
                                    {formatDate(new Date(report._creationTime))}
                                </TableCell>
                                <TableCell className="text-right py-2 pr-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    asChild 
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50"
                                                >
                                                    <Link href={`/reports/${report._id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View Report</span>
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View Report</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    asChild 
                                                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100/50"
                                                >
                                                    <Link href={`/reports/${report._id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit Report</span>
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Report</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => onDeleteClick(report)} 
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-100/50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete Report</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Report</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
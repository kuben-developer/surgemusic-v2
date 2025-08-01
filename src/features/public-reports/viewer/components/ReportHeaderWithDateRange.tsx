'use client';

import { motion } from "framer-motion";
import { ReportHeader } from './ReportHeader';
import { DateRangeSelector } from './DateRangeSelector';
import { animationVariants } from '../constants/animations.constants';

interface ReportHeaderWithDateRangeProps {
  reportName: string;
  reportCreatedAt: string;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}

/**
 * Combined header component with report info and date range selector
 * Handles the responsive layout and animation for the top section
 */
export function ReportHeaderWithDateRange({
  reportName,
  reportCreatedAt,
  dateRange,
  onDateRangeChange
}: ReportHeaderWithDateRangeProps) {
  return (
    <motion.div 
      variants={animationVariants.fadeInUp} 
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6"
    >
      <ReportHeader 
        reportName={reportName} 
        reportCreatedAt={reportCreatedAt}
      />
      <DateRangeSelector 
        value={dateRange} 
        onChange={onDateRangeChange}
      />
    </motion.div>
  );
}
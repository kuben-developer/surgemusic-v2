// Common UI component prop interfaces

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading state variants
export type LoadingVariant = 'spinner' | 'skeleton' | 'pulse' | 'dots';

// Empty state configuration
export interface EmptyStateConfig {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

// Pagination configuration
export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

// Date range selector options
export interface DateRangeOption {
  label: string;
  value: string;
  days: number;
}

// Card variants for consistent styling
export type CardVariant = 'default' | 'outline' | 'ghost' | 'destructive';

// Button sizes for consistent sizing
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Modal configuration
export interface ModalConfig {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
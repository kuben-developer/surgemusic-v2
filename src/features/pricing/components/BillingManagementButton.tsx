'use client';

import { Button } from '@/components/ui/button';
import { CreditCardIcon } from 'lucide-react';

interface BillingManagementButtonProps {
  onManageBilling: () => void;
}

export function BillingManagementButton({ onManageBilling }: BillingManagementButtonProps) {
  return (
    <div className="mb-8 text-center">
      <Button
        onClick={onManageBilling}
        className="inline-flex items-center gap-2"
      >
        <CreditCardIcon className="h-4 w-4" />
        Manage Billing
      </Button>
    </div>
  );
}
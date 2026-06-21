'use client';

import React from 'react';
import { Button } from './button';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="h-10">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} className="h-10">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

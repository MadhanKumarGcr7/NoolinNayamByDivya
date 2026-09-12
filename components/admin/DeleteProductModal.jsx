'use client';

import Button from '@/components/ui/Button';

export default function DeleteProductModal({ isOpen, onClose, onConfirm, productName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream border border-border max-w-md w-full p-6 lg:p-8 shadow-warm-xl space-y-5 text-left">
        <div className="w-12 h-12 rounded-full bg-warmBrown/10 text-warmBrown flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <div>
          <h3 className="font-serif font-light text-charcoal text-2xl mb-2">Delete Product</h3>
          <p className="text-body-sm text-charcoal-600 font-light leading-relaxed">
            Are you sure you want to permanently delete <strong className="font-medium text-charcoal">{productName}</strong>?
          </p>
          <p className="text-body-xs text-charcoal-400 font-light mt-2 italic">
            This will remove the item from the storefront. Past customer order history will remain 100% intact.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-3 text-label-md uppercase tracking-[0.14em] font-sans font-medium text-charcoal-600 hover:text-charcoal transition-colors border border-border"
          >
            Cancel
          </button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            loading={loading}
            className="bg-warmBrown hover:bg-charcoal border-warmBrown"
          >
            CONFIRM DELETE
          </Button>
        </div>
      </div>
    </div>
  );
}

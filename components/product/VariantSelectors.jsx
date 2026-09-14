'use client';

export function SizeSelector({ sizes = [], selectedSize, onSelectSize, isSizeDisabled, onOpenSizeGuide }) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal">
          Select Size: <span className="font-light text-charcoal-600">{selectedSize}</span>
        </label>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="text-body-xs font-sans text-warmBrown underline hover:text-charcoal transition-colors cursor-pointer"
        >
          Size Guide
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Product Size Options">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isDisabled = isSizeDisabled ? isSizeDisabled(size) : false;

          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => onSelectSize(size)}
              className={`min-w-[48px] px-4 py-2.5 text-label-md font-sans transition-all border relative ${
                isDisabled
                  ? 'opacity-40 bg-oatmeal text-charcoal-400 border-border cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-ivory text-charcoal border-border hover:border-charcoal-400'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ColorSelector({ colors = [], selectedColor, onSelectColor, isColorDisabled }) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal">
        Color: <span className="font-light text-charcoal-600">{typeof selectedColor === 'string' ? selectedColor : selectedColor?.name}</span>
      </label>

      <div className="flex items-center gap-3" role="radiogroup" aria-label="Product Color Options">
        {colors.map((colorObj) => {
          const colorName = typeof colorObj === 'string' ? colorObj : colorObj.name;
          const colorHex  = typeof colorObj === 'string' ? '#FAF7F2' : colorObj.hex;
          const isSelected = (typeof selectedColor === 'string' ? selectedColor : selectedColor?.name) === colorName;
          const isDisabled = isColorDisabled ? isColorDisabled(colorName) : false;

          return (
            <button
              key={colorName}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => onSelectColor(colorObj)}
              title={isDisabled ? `${colorName} (Out of Stock)` : colorName}
              aria-label={`Select color ${colorName}`}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all relative ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed border-border'
                  : isSelected
                  ? 'border-charcoal ring-2 ring-warmBrown/40 ring-offset-2 scale-110'
                  : 'border-border hover:scale-105'
              }`}
              style={{ backgroundColor: colorHex }}
            >
              {isDisabled && (
                <span className="w-full h-0.5 bg-charcoal/60 rotate-45 absolute" />
              )}
              {isSelected && !isDisabled && (
                <span className={`w-2.5 h-2.5 rounded-full ${['#FAF7F2', '#F5EFE4', '#FFFFFF'].includes(colorHex) ? 'bg-charcoal' : 'bg-ivory'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import mongoose from 'mongoose';

const FilterOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    hex:   { type: String, trim: true, default: '' }, // For color-swatch type
  },
  { _id: true }
);

const FilterSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    type:      {
      type: String,
      enum: ['single-select', 'multi-select', 'color-swatch', 'range'],
      required: true,
      default: 'multi-select',
    },
    options:   [FilterOptionSchema],
    rangeMin:  { type: Number, default: 0 },
    rangeMax:  { type: Number, default: 10000 },
    rangeUnit: { type: Number, default: '₹' },
    rangeUnit: { type: String, default: '₹' },
    rangeStep: { type: Number, default: 100 },
    active:    { type: Boolean, default: true },
    order:     { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Filter || mongoose.model('Filter', FilterSchema);

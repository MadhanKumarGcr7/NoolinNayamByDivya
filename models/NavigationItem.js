import mongoose from 'mongoose';

const AssignedFilterSchema = new mongoose.Schema(
  {
    filterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Filter', required: true },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

const NavigationItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    linkType: {
      type: String,
      enum: ['category', 'page', 'external'],
      required: true,
      default: 'page',
    },
    categorySlug:    { type: String, trim: true, default: '' },
    pageSlug:        { type: String, trim: true, default: '' },
    externalUrl:     { type: String, trim: true, default: '' },
    order:           { type: Number, default: 0, index: true },
    visible:         { type: Boolean, default: true },
    isFixed:         { type: Boolean, default: false },
    assignedFilters: [AssignedFilterSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.NavigationItem || mongoose.model('NavigationItem', NavigationItemSchema);

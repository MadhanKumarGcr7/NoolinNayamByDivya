const fs = require('fs');
const mongoose = require('mongoose');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/MONGODB_URI=(.+)/);
const uri = match ? match[1].trim() : '';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const filterCol = db.collection('filters');
  const navCol = db.collection('navigationitems');
  const prodCol = db.collection('products');
  const catCol = db.collection('productcategories');

  // Find saree filter
  const sareeFilters = await filterCol.find({
    $or: [
      { name: { $regex: /saree|sarree/i } },
      { slug: { $regex: /saree|sarree/i } }
    ]
  }).toArray();

  console.log('Found Saree filters to remove:', sareeFilters.map(f => ({ id: f._id, name: f.name })));

  for (const f of sareeFilters) {
    const fId = f._id;
    await filterCol.deleteOne({ _id: fId });
    await navCol.updateMany({}, { $pull: { assignedFilters: { filterId: fId } } });
    await prodCol.updateMany({}, { $pull: { filterValues: { filterId: fId } } });
  }

  // Also check if any Nav items or Product categories are saree
  const sareeNavs = await navCol.find({
    $or: [
      { label: { $regex: /saree|sarree/i } },
      { categorySlug: { $regex: /saree|sarree/i } }
    ]
  }).toArray();

  if (sareeNavs.length > 0) {
    console.log('Found Saree nav items to remove:', sareeNavs.map(n => ({ id: n._id, label: n.label })));
    for (const n of sareeNavs) {
      await navCol.deleteOne({ _id: n._id });
    }
  }

  await catCol.deleteMany({
    $or: [
      { label: { $regex: /saree|sarree/i } },
      { slug: { $regex: /saree|sarree/i } }
    ]
  });

  console.log('Saree filter and nav cleanup completed successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});

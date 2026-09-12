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

  // Find color filters
  const colorFilters = await filterCol.find({
    $or: [
      { name: { $regex: /color|colour/i } },
      { slug: { $regex: /color|colour/i } }
    ]
  }).toArray();

  console.log('Found Color filters to remove:', colorFilters.map(f => ({ id: f._id, name: f.name, slug: f.slug })));

  for (const f of colorFilters) {
    const fId = f._id;
    await filterCol.deleteOne({ _id: fId });
    await navCol.updateMany({}, { $pull: { assignedFilters: { filterId: fId } } });
    await prodCol.updateMany({}, { $pull: { filterValues: { filterId: fId } } });
  }

  // Also reset colors array in all products to empty array
  const updatedProd = await prodCol.updateMany({}, { $set: { colors: [] } });
  console.log(`Reset colors array on ${updatedProd.modifiedCount} products.`);

  console.log('Color filter and product cleanup completed successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});

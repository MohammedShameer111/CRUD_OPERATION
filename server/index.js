const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CRUD')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Entity Schema
const entitySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  purpose: { type: String, required: true },
  timeIn: { type: String, required: true },
  timeOut: { type: String, required: true },
  status: { type: String, default: 'Active' }, // Active, Inactive, Deleted
  isDeleted: { type: Boolean, default: false }, // Soft delete flag
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date },
});

// Error Logging Schema
const exlogSchema = new mongoose.Schema({
  error: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Entity = mongoose.model('Entity', entitySchema);
const Exlog = mongoose.model('Exlog', exlogSchema);

// CRUD Routes

// Get all entities with optional search, pagination, and "show deleted" toggle
app.get('/api/entities', async (req, res) => {
  const { page = 1, limit = 10, search = '', showDeleted = false } = req.query;
  const filter = { isDeleted: showDeleted === 'true' };
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }
  try {
    const entities = await Entity.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Entity.countDocuments(filter);
    res.json({ entities, total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entities' });
  }
});

// Create a new entity
app.post('/api/entities', async (req, res) => {
  try {
    const entity = new Entity(req.body);
    await entity.save();
    res.status(201).json(entity);
  } catch (error) {
    await Exlog.create({ error: error.message });
    res.status(400).json({ message: 'Failed to create entity' });
  }
});

// Fetch a single entity by ID
app.get('/api/entities/:id', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);
    if (!entity) {
      return res.status(404).json({ message: 'Entity not found' });
    }
    res.json(entity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entity' });
  }
});

// Update an entity
app.put('/api/entities/:id', async (req, res) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entity);
  } catch (error) {
    await Exlog.create({ error: error.message });
    res.status(400).json({ message: 'Failed to update entity' });
  }
});

// Bulk Activate Entities
app.put('/api/entities/bulk/activate', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    // Update status to Active for multiple entities
    await Entity.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'Active' } }
    );

    res.json({ message: 'Entities activated successfully' });
  } catch (error) {
    console.error('❌ Server Error:', error);
    await Exlog.create({ error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Bulk Deactivate Entities
app.put('/api/entities/bulk/deactivate', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    // Update status to Inactive for multiple entities
    await Entity.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'Inactive' } }
    );

    res.json({ message: 'Entities deactivated successfully' });
  } catch (error) {
    console.error('❌ Server Error:', error);
    await Exlog.create({ error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Bulk Delete Entities (Soft delete)
app.put('/api/entities/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    // Soft delete entities (set isDeleted to true)
    await Entity.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    res.json({ message: 'Entities deleted successfully' });
  } catch (error) {
    console.error('❌ Server Error:', error);
    await Exlog.create({ error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a single entity (soft delete)
app.delete('/api/entities/:id', async (req, res) => {
  try {
    await Entity.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ message: 'Record deleted' });
  } catch (error) {
    await Exlog.create({ error: error.message });
    res.status(500).json({ message: 'Failed to delete record' });
  }
});

// Export entities to Excel
app.get("/export", async (req, res) => {
  const { showDeleted = false } = req.query;
  const filter = { isDeleted: showDeleted === "true" };

  try {
    const entities = await Entity.find(filter).select("-_id -isDeleted"); // Exclude _id and isDeleted
    const jsonData = entities.map((entity) => entity.toObject());

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entities");

    // Convert workbook to a buffer and send as response
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for download
    res.setHeader("Content-Disposition", "attachment; filename=entities.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return res.send(excelBuffer);
  } catch (error) {
    console.error("❌ Error exporting Excel:", error);
    res.status(500).json({ message: "Error exporting data to Excel" });
  }
});

module.exports = app;

// Error Logging
app.get('/api/exlogs', async (req, res) => {
  try {
    const logs = await Exlog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Restore a soft-deleted entity
app.put('/api/entities/:id/restore', async (req, res) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!entity) return res.status(404).json({ message: 'Entity not found' });

    res.json({ message: 'Entity restored successfully', entity });
  } catch (error) {
    await Exlog.create({ error: error.message });
    res.status(500).json({ message: 'Failed to restore entity' });
  }
});

// Permanently delete an entity
app.delete('/api/entities/:id/permanent', async (req, res) => {
  try {
    const entity = await Entity.findByIdAndDelete(req.params.id);
    if (!entity) return res.status(404).json({ message: 'Entity not found' });

    res.json({ message: 'Entity permanently deleted' });
  } catch (error) {
    await Exlog.create({ error: error.message });
    res.status(500).json({ message: 'Failed to delete entity' });
  }
});


// Server Listening
app.listen(5000, () => console.log('Server running on port 5000'));

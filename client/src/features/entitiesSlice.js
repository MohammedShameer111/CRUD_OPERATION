import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import FileSaver from "file-saver";

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api/entities';

// Async Thunks

// Fetch entities with pagination, search, and showDeleted filters
export const fetchEntities = createAsyncThunk(
  'entities/fetchEntities',
  async ({ page = 1, search = '', showDeleted = false }) => {
    const response = await axios.get(API_BASE_URL, {
      params: { page, search, showDeleted },
    });
    return response.data;
  }
);

// Add a new entity
export const addEntity = createAsyncThunk('entities/addEntity', async (entity) => {
  const response = await axios.post(API_BASE_URL, entity);
  return response.data;
});

// Update an entity
export const updateEntity = createAsyncThunk(
  'entities/updateEntity',
  async ({ id, entity }) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, entity);
    return response.data;
  }
);

// Soft delete a single entity
export const deleteEntity = createAsyncThunk('entities/deleteEntity', async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return { id }; // Return the deleted entity's ID for state update
});

// Export entities to Excel
export const exportToExcel = createAsyncThunk("entities/exportToExcel", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      responseType: "blob", // Important for file download
    });

    const blob = new Blob([response.data], { type: response.headers["content-type"] });
    FileSaver.saveAs(blob, "entities.xlsx");

    return "Export successful";
  } catch (error) {
    console.error(" Export failed:", error);
    return rejectWithValue(error.response?.data?.message || "Export failed");
  }
});

// Bulk Activate Entities
export const bulkActivateEntities = createAsyncThunk(
  'entities/bulkActivateEntities',
  async (ids) => {
    const response = await axios.put(`${API_BASE_URL}/bulk/activate`, { ids });
    return response.data;
  }
);

// Bulk Deactivate Entities
export const bulkDeactivateEntities = createAsyncThunk(
  'entities/bulkDeactivateEntities',
  async (ids) => {
    const response = await axios.put(`${API_BASE_URL}/bulk/deactivate`, { ids });
    return response.data;
  }
);

// Bulk Delete Entities (Soft delete)
export const bulkDeleteEntities = createAsyncThunk(
  'entities/bulkDeleteEntities',
  async (ids) => {
    const response = await axios.put(`${API_BASE_URL}/bulk/delete`, { ids });
    return response.data;
  }
);

// Slice
const entitiesSlice = createSlice({
  name: 'entities',
  initialState: {
    entities: [], // List of entities
    total: 0, // Total count for pagination
    status: 'idle', // Status for fetching entities
    operationStatus: 'idle', // Status for other operations (add, update, delete)
    error: null, // Error messages (if any)
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Entities
      .addCase(fetchEntities.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entities = action.payload.entities;
        state.total = action.payload.total;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // Add Entity
      .addCase(addEntity.pending, (state) => {
        state.operationStatus = 'loading';
        state.error = null;
      })
      .addCase(addEntity.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        state.entities.push(action.payload);
      })
      .addCase(addEntity.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.error.message;
      })

      // Update Entity
      .addCase(updateEntity.pending, (state) => {
        state.operationStatus = 'loading';
        state.error = null;
      })
      .addCase(updateEntity.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        const index = state.entities.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.entities[index] = action.payload;
        }
      })
      .addCase(updateEntity.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.error.message;
      })

      // Bulk Activate
      .addCase(bulkActivateEntities.pending, (state) => {
        state.operationStatus = 'loading';
        state.error = null;
      })
      .addCase(bulkActivateEntities.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
        // You might want to update the state entities list here if needed
      })
      .addCase(bulkActivateEntities.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.error.message;
      })

      // Bulk Deactivate
      .addCase(bulkDeactivateEntities.pending, (state) => {
        state.operationStatus = 'loading';
        state.error = null;
      })
      .addCase(bulkDeactivateEntities.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
        // You might want to update the state entities list here if needed
      })
      .addCase(bulkDeactivateEntities.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.error.message;
      })

      // Bulk Delete
      .addCase(bulkDeleteEntities.pending, (state) => {
        state.operationStatus = 'loading';
        state.error = null;
      })
      .addCase(bulkDeleteEntities.fulfilled, (state) => {
        state.operationStatus = 'succeeded';
        // You might want to update the state entities list here if needed
      })
      .addCase(bulkDeleteEntities.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.error.message;
      })

      // Delete Entity
      .addCase(deleteEntity.pending, (state) => {
        state.operationStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteEntity.fulfilled, (state, action) => {
        state.operationStatus = 'succeeded';
        state.entities = state.entities.filter((e) => e._id !== action.payload.id);
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.operationStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export default entitiesSlice.reducer;

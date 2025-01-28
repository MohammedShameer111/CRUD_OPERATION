import { configureStore } from '@reduxjs/toolkit';
import entitiesReducer from '../features/entitiesSlice';

export const store = configureStore({
  reducer: {
    entities: entitiesReducer,
  },
});
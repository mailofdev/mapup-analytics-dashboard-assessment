import { configureStore } from '@reduxjs/toolkit';
import vehicleDataReducer from './vehicleDataSlice';

export const store = configureStore({
  reducer: {
    vehicleData: vehicleDataReducer,
  },
});

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Papa from 'papaparse';
import Data from '../data/Electric_Vehicle_Population_Data.csv';

export const fetchVehicleData = createAsyncThunk(
  'vehicleData/fetchVehicleData',
  async () => {
    const response = await fetch(Data);
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder("utf-8");
    const csvData = decoder.decode(result.value);
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    }).data;
    return parsedData;
  }
);

const vehicleDataSlice = createSlice({
  name: 'vehicleData',
  initialState: {
    data: [],
    filteredData: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVehicleData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.filteredData = action.payload;
      })
      .addCase(fetchVehicleData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setFilteredData } = vehicleDataSlice.actions;

export const selectAllData = (state) => state.vehicleData.data;
export const selectFilteredData = (state) => state.vehicleData.filteredData;
export const selectStatus = (state) => state.vehicleData.status;

export default vehicleDataSlice.reducer;

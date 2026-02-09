import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPublicData } from "../api/authFetch";
import { GET_LIVE_DATA } from "../constants";

export const fetchLiveQuotes = createAsyncThunk(
  "market/fetchLiveQuotes",
  async () => {
    const res = await getPublicData(GET_LIVE_DATA);
    const data = await res.json();
    return data;
  }
);

const marketSlice = createSlice({
  name: "market",
  initialState: {
    quotes: [],
    loading: false,
    lastUpdated: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLiveQuotes.pending, state => {
        state.loading = true;
      })
      .addCase(fetchLiveQuotes.fulfilled, (state, action) => {
        // console.log("API Payload:", action.payload);
        state.quotes = action.payload;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchLiveQuotes.rejected, state => {
        state.loading = false;
      });
  }
});

export default marketSlice.reducer;
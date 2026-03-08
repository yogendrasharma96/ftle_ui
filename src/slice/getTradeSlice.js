import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GET_TRADE_STATS, TRADE } from "../constants";
import { getPublicData } from "../api/authFetch";

export const fetchTrades = createAsyncThunk(
  "trade/fetchTrades",
  async ({ page = 0, size = 10 }, { getState }) => {
    const fy = getState().utilities.financialYear;
    console.log("Fetching trades for financial year:", fy);
    const res = await fetch(
      TRADE+`?page=${page}&size=${size}&financialYear=${fy}`
    );
    return res.json();
  }
);

export const fetchTradeStats = createAsyncThunk(
  "trade/fetchTradeStats",
  async (_,{ getState }) => {
    const fy = getState().utilities.financialYear;
    console.log(GET_TRADE_STATS+`?financialYear=${fy}`);
    const res = await getPublicData(GET_TRADE_STATS+`?financialYear=${fy}`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  }
);

const getTradeSlice = createSlice({
  name: "trade",
  initialState: {
    trades: [],
    stats: {
      realizedPnL: 0,
      roi: 0,
      totalClosed: 0,
      totalOpen: 0,
      openPositionsEntryValue: 0,
      openPositionDtos: [],
    },
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrades.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.loading = false;
        state.trades = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTradeStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchTradeStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload; // Updates with TradeStatsDTO from Spring Boot
      })
      .addCase(fetchTradeStats.rejected, (state, action) => {
        state.statsLoading = false;
        // You can handle stats error separately if needed
      });
  }
});

export default getTradeSlice.reducer;
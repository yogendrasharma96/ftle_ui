import { configureStore } from "@reduxjs/toolkit";
import tradeReducer from "../slice/getTradeSlice";
import authReducer from "../slice/authSlice";
import marketReducer from "../slice/marketSlice";
import utilitiesReducer from "../slice/utilitiesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trade: tradeReducer,
    market: marketReducer,
    utilities: utilitiesReducer
  },
});

export default store;
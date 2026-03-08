import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
  financialYear: "ALL"
}

const utilitiesSlice = createSlice({
  name: "utilites",
  initialState,
  reducers: {
    setTheme(state, action) {
      console.log(action.payload);
      state.theme = action.payload;
      return state
    }
    ,
    setFY(state, action) {
      console.log(action.payload);
      state.financialYear = action.payload;
      return state
    }
  }
});

export const { setTheme,setFY } = utilitiesSlice.actions;
export default utilitiesSlice.reducer;
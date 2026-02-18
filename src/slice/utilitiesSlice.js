import { createSlice } from "@reduxjs/toolkit";

const initialState={
    theme: "light"
}

const utilitiesSlice=createSlice({
    name:"utilites",
    initialState,
    reducers:{
        setTheme(state, action) {
            console.log(action.payload);
          state.theme = action.payload;
          return state
        }
      }
    });
    
    export const { setTheme } = utilitiesSlice.actions;
    export default utilitiesSlice.reducer;
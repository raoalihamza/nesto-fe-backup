import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import listingFormReducer from "./slices/listingFormSlice";
import { draftMiddleware } from "./middleware/draftMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    listingForm: listingFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(draftMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

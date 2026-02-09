import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchLiveQuotes } from "../slice/marketSlice";

export const useLiveMarketData = (interval = 5000) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLiveQuotes());

    const timer = setInterval(() => {
      dispatch(fetchLiveQuotes());
    }, interval);

    return () => clearInterval(timer);
  }, [dispatch, interval]);
};
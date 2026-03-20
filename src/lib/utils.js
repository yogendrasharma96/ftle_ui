import { Autocomplete, Paper, styled } from "@mui/material";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    paddingLeft: '35px',
    borderRadius: '1rem',
    backgroundColor: 'transparent',
    '& fieldset': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'inherit',
    fontFamily: 'inherit',
  },
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "1rem",
  marginTop: 8,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
}));

export const sectors = ["IT", "Banking", "Pharma", "FMCG", "Auto", "Metal", "Energy", "Realty", "Telecom", "Infrastructure", "Other"];

export const calculateFY = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
};

export const calculatePL = (trade, currentPrice) => {
  if (trade.status === "Closed" && trade.exitPrice) {
      return (trade.exitPrice - trade.entryPrice) * trade.quantity;
  }
  if (!currentPrice) return 0;
  return (currentPrice - trade.entryPrice) * trade.quantity;
};

export const calculatePercentageChange = (trade, currentPrice) => {
  const base = trade.entryPrice;
  if (trade.status === "Closed" && trade.exitPrice) {
      return ((trade.exitPrice - base) / base) * 100;
  }
  if (!currentPrice) return 0;
  return ((currentPrice - base) / base) * 100;
};
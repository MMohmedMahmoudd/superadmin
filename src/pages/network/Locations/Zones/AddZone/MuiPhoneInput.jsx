import React from "react";
import { MuiTelInput } from "mui-tel-input";
import { styled } from "@mui/material/styles";

const StyledMuiTelInput = styled(MuiTelInput)(({ theme }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: "var(--menu-bg)", // ✅ Matches other fields
    color: "var(--text)", // ✅ Ensures white text in dark mode
    borderRadius: "8px", // ✅ Rounded corners to match other fields
    border: "2px solid var(--border-colorr)", // ✅ Same border as others
    padding: "0", // ✅ Ensures height consistency
    fontSize: "1rem", // ✅ Matches text size
    height: "40px", // ✅ Matches other inputs' height
    transition: "border-color 0.3s ease",
    "&:hover": {
      borderColor: "var(--color-border-focus)", // ✅ Hover effect
    },
    "&:focus-within": {
      boxShadow: "0 0 0 3px var(--shadow-focus)", // ✅ Focus effect
      borderColor: "var(--color-border-focus)",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiInputAdornment-root": {
    backgroundColor: "var(--menu-bg)", // ✅ Background for country code section
    borderRadius: "8px 0 0 8px",
    padding: "6px 8px",
    color: "var(--text)", // ✅ Text color for country code
  },
  "& .MuiSvgIcon-root": {
    color: "var(--text)", // ✅ Icon color matches dark mode
  },
  "& .MuiOutlinedInput-input": {
    paddingLeft: "0",
    color: "var(--text)", // ✅ Ensures text visibility
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--border-hover-border)", // ✅ Focus border color
  },
  // 🔥 Fix dropdown menu background in dark mode
  "& .MuiPaper-root": {
    backgroundColor: "var(--menu-bg) !important", // ✅ Fix dropdown white issue
    border: "1px solid var(--border-border) !important",
    borderRadius: "8px",
    // height:"50px",
    minHeight: "180px !important", // ✅ Set a minimum height
    maxHeight: "250px !important", // ✅ Limit dropdown height
    overflowY: "auto", // ✅ Enable scrolling if needed
    position: "absolute",
    zIndex: "9999 !important",
    Bottom:"0",
    // transform: "translateY(40px) !important", // ✅ Push dropdown below the phone input
  },
  "& .MuiMenuItem-root": {
    color: "var(--text) !important", // ✅ Ensures text color is correct
    display: "flex",
    alignItems: "center",
    padding: "4px",
    "& img": {
      width: "20px", // ✅ Ensure flag size is correct
      marginRight: "10px",
    },
    "&:hover": {
      backgroundColor: "var(--border-hover-border) !important", // ✅ Hover effect
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--border-hover-border) !important",
      },
    
  },
  "& .MuiPopper-root": {
    zIndex: "9999 !important",
    position: "absolute",

     // ✅ Ensure dropdown appears above everything
  },

}));

const MuiPhoneInput = ({ value, onChange }) => {
  return (
    <StyledMuiTelInput
      defaultCountry="EG" // ✅ Default to Saudi Arabia
      value={value}
      typeof="tel"
      onChange={onChange}
      preferredCountries={["SA", "AE", "US", "IN"]} // ✅ Most used countries
      forceCallingCode={false} // ✅ Let users change country code
      fullWidth
      autoComplete="off" // ✅ Prevent browser autofill
    />
  );
};

export default MuiPhoneInput;

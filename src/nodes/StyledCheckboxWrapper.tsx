import { styled } from "@mui/material"

export const StyledCheckboxWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  paddingTop: theme.spacing(1),

  input: {
    marginLeft: 0,
  },
}))

import { Toaster } from "react-hot-toast"
import { CssBaseline, Theme, ThemeProvider } from "@mui/material"
import theme from "./theme"
import { InPersonMeetingEditor } from "./InPersonMeetingEditor"

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <InPersonMeetingEditor />
      <Toaster position='bottom-right' toastOptions={getToastOptions(theme)} />
    </ThemeProvider>
  )
}

const getToastOptions = (theme: Theme) => ({
  success: {
    iconTheme: {
      primary: "#fff",
      secondary: theme.palette.success.main,
    },
    style: {
      background: theme.palette.success.main,
      color: theme.palette.success.contrastText,
    },
  },
  error: {
    iconTheme: {
      primary: "#fff",
      secondary: theme.palette.error.main,
    },
    style: {
      background: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
  },
})

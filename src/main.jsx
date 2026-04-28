import { StrictMode }    from 'react'
import { createRoot }    from 'react-dom/client'
// import { checkConnection } from './services/api'
import { ThemeProvider } from './context/ThemeProvider'  // ✅ ເພີ່ມ
import { AuthProvider }  from './context/AuthContext'   // ✅ ເພີ່ມ
import App               from './App.jsx'
import './index.css'

// checkConnection()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>   {/* ✅ ນອກສຸດ */}
      <AuthProvider>  {/* ✅ ໃນ ThemeProvider */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
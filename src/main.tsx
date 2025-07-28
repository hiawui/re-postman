import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App/App'
import 'antd/dist/reset.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

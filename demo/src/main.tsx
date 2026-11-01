import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'
import App from './App'

/** 标注工具只在本地开发时按需加载，不会进生产包 */
const Agentation = import.meta.env.DEV ? lazy(() => import('agentation').then((m) => ({ default: m.Agentation }))) : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
    {Agentation && (
      <Suspense fallback={null}>
        <Agentation />
      </Suspense>
    )}
  </StrictMode>,
)

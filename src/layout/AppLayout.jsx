import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

export default function AppLayout() {
  return (
    <div className="flex min-h-full bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-6 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

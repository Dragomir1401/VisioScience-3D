import React from 'react'
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  UsersIcon,
  BarChart2Icon,
  SettingsIcon,
  LogOutIcon,
  HelpCircleIcon,
} from 'lucide-react'
export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#4f46e5] flex items-center justify-center">
              <BookOpenIcon size={16} color="white" />
            </div>
            <h1 className="text-xl font-bold text-[#690375]">QuizMaster</h1>
          </div>
        </div>
        <div className="flex-1 py-6">
          <div className="px-4 mb-4">
            <p className="text-sm text-[#888888] font-medium">MAIN</p>
          </div>
          <div className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboardIcon size={18} />}
              label="Dashboard"
              active
            />
            <SidebarItem icon={<BookOpenIcon size={18} />} label="Quizzes" />
            <SidebarItem icon={<UsersIcon size={18} />} label="Students" />
            <SidebarItem icon={<BarChart2Icon size={18} />} label="Analytics" />
          </div>
          <div className="px-4 mt-8 mb-4">
            <p className="text-sm text-[#888888] font-medium">OTHER</p>
          </div>
          <div className="space-y-1">
            <SidebarItem icon={<SettingsIcon size={18} />} label="Settings" />
            <SidebarItem
              icon={<HelpCircleIcon size={18} />}
              label="Help Center"
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <SidebarItem icon={<LogOutIcon size={18} />} label="Log Out" />
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 bg-[#fdf4ff] overflow-y-auto">{children}</div>
    </div>
  )
}
const SidebarItem = ({ icon, label, active = false }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f3e8ff] ${active ? 'bg-[#f3e8ff] text-[#690375] font-medium' : 'text-[#888888]'}`}
    >
      <div className={active ? 'text-[#690375]' : 'text-[#888888]'}>{icon}</div>
      <span>{label}</span>
    </div>
  )
}

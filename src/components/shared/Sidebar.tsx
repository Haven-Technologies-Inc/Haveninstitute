import { LucideIcon, PanelLeft, PanelLeftClose, ChevronLeft } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export interface MenuGroup {
  id: string;
  label: string;
}

export interface SidebarProps {
  variant: 'user' | 'admin';
  menuItems: MenuItem[];
  menuGroups: MenuGroup[];
  activeItem: string;
  collapsed: boolean;
  onItemClick: (id: string) => void;
  onToggleCollapse: () => void;
  footerContent?: React.ReactNode;
}

export function Sidebar({
  variant,
  menuItems,
  menuGroups,
  activeItem,
  collapsed,
  onItemClick,
  onToggleCollapse,
  footerContent,
}: SidebarProps) {
  const gradientClass = variant === 'admin' 
    ? 'from-purple-600 to-blue-600' 
    : 'from-blue-600 to-purple-600';
  
  const hoverAccentClass = variant === 'admin' 
    ? 'group-hover:text-purple-600' 
    : 'group-hover:text-blue-600';

  return (
    <aside className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-64px)] sticky top-16 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className={`size-5 text-gray-600 dark:text-gray-400 ${hoverAccentClass}`} />
          ) : (
            <PanelLeftClose className={`size-5 text-gray-600 dark:text-gray-400 ${hoverAccentClass}`} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-3">
            {/* Group Label */}
            {!collapsed && group.label && (
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 py-2">
                {group.label}
              </p>
            )}
            {collapsed && group.id !== 'home' && group.id !== 'main' && (
              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 my-2"></div>
            )}

            {/* Menu Items */}
            <div className="space-y-0.5">
              {menuItems
                .filter((item) => item.group === group.id)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group ${
                        isActive
                          ? `bg-gradient-to-r ${gradientClass} text-white shadow-md`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.label : ''}
                    >
                      <Icon className={`size-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      {!collapsed && (
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                          {item.label}
                        </span>
                      )}
                      {/* Tooltip for collapsed mode */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footerContent && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {footerContent}
        </div>
      )}
    </aside>
  );
}

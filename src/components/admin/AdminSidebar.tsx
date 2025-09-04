import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  MessageSquare,
  BookOpen,
  Settings,
  Shield
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/PFLGMANEGER',
    icon: LayoutDashboard
  },
  {
    title: 'Usuários',
    url: '/PFLGMANEGER/users',
    icon: Users
  },
  {
    title: 'Profissionais',
    url: '/PFLGMANEGER/professionals',
    icon: UserCheck
  },
  {
    title: 'Serviços',
    url: '/PFLGMANEGER/services',
    icon: Briefcase
  },
  {
    title: 'Comunidade',
    url: '/PFLGMANEGER/community',
    icon: MessageSquare
  },
  {
    title: 'Recursos',
    url: '/PFLGMANEGER/resources',
    icon: BookOpen
  },
  {
    title: 'Configurações',
    url: '/PFLGMANEGER/settings',
    icon: Settings
  }
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/PFLGMANEGER') {
      return currentPath === '/PFLGMANEGER';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-4 py-3">
            <Shield className="h-5 w-5 text-primary" />
            {!collapsed && <span className="font-semibold text-primary">Admin AutHelp</span>}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/PFLGMANEGER'}
                      className={getNavCls(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
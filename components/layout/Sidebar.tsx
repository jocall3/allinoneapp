// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React, { useState } from 'react';
import Icon from '../ui/Icon'; // Assuming Icon component takes a 'name' prop for different icons

// --- New Interfaces ---

/**
 * Represents a generic navigation item in the sidebar.
 */
export interface SidebarNavItem {
  id: string;
  name: string;
  iconName: string; // Corresponds to the 'name' prop of the Icon component
  path: string; // Path or identifier for navigation
  onClick?: (path: string) => void; // Optional custom click handler
  isCallToAction?: boolean; // Highlight as a primary action
}

/**
 * Represents a folder item in a tree view.
 */
export interface SidebarFolderItem {
  id: string;
  name: string;
  path: string; // Full path of the folder
  iconName?: string; // Optional custom icon, defaults to 'folder'
  children?: SidebarFolderItem[];
  isExpanded?: boolean; // For initial state or controlled expansion
}

/**
 * Represents user profile information.
 */
export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string; // Optional URL for user's avatar image
}

// --- New Exported Components/Functions ---

/**
 * Reusable button for primary navigation items in the sidebar.
 */
export const SidebarNavButton: React.FC<{
  item: SidebarNavItem;
  onNavigate: (path: string) => void;
  isActive?: boolean;
}> = ({ item, onNavigate, isActive }) => {
  const classes = `w-full flex items-center p-2 rounded-lg text-left transition-colors ${
    isActive
      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
  }`;
  return (
    <li className="mb-1">
      <button onClick={() => item.onClick ? item.onClick(item.path) : onNavigate(item.path)} className={classes}>
        <Icon name={item.iconName} className="mr-3" /> {item.name}
      </button>
    </li>
  );
};

/**
 * A recursive component to display folder structure.
 */
export const SidebarFolderTreeItem: React.FC<{
  folder: SidebarFolderItem;
  level?: number;
  onSelectFolder: (path: string) => void;
  isActive?: boolean;
}> = ({ folder, level = 0, onSelectFolder, isActive }) => {
  const [isExpanded, setIsExpanded] = useState(folder.isExpanded || false);

  const paddingLeft = { paddingLeft: `${16 + level * 16}px` }; // 16px base + 16px per level

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent folder selection
    if (folder.children && folder.children.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFolder(folder.path); // If no children, just select the folder
    }
  };

  const handleSelect = () => {
    onSelectFolder(folder.path);
  };

  const hasChildren = folder.children && folder.children.length > 0;

  const itemClasses = `flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
    isActive
      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
  }`;

  return (
    <div>
      <div
        className={itemClasses}
        style={paddingLeft}
        onClick={handleSelect}
      >
        {hasChildren && (
          <Icon
            name={isExpanded ? 'chevronDown' : 'chevronRight'}
            size={16}
            className="mr-1 text-gray-500 dark:text-gray-400"
            onClick={handleToggle}
          />
        )}
        <Icon name={folder.iconName || (isExpanded && hasChildren ? 'folderOpen' : 'folder')} className={`mr-2 ${hasChildren ? '' : 'ml-5'}`} />
        <span className="flex-grow">{folder.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4 border-l border-gray-200 dark:border-gray-700">
          {folder.children!.map((childFolder) => (
            <SidebarFolderTreeItem
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              onSelectFolder={onSelectFolder}
              isActive={isActive && childFolder.path === folder.path} // Simple active logic, can be enhanced
            />
          ))}
        </div>
      )}
    </div>
  );
};


/**
 * Displays user profile information.
 */
export const UserProfileSection: React.FC<{ user: UserProfile; onProfileClick?: () => void }> = ({ user, onProfileClick }) => {
  return (
    <div className="flex items-center mb-6 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={onProfileClick}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3 border border-gray-300 dark:border-gray-600 object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-3">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-grow">
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>
      <Icon name="chevronDown" className="text-gray-500 dark:text-gray-400 ml-2" />
    </div>
  );
};

/**
 * Displays storage usage with a progress bar.
 */
export const StorageUsageDisplay: React.FC<{ usedGB: number; totalGB: number; onUpgradeClick?: () => void }> = ({ usedGB, totalGB, onUpgradeClick }) => {
  const usagePercentage = (usedGB / totalGB) * 100;
  const isNearlyFull = usagePercentage > 85;

  return (
    <div className="p-2 mt-auto mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Storage</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{usedGB.toFixed(2)} GB of {totalGB} GB</p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${isNearlyFull ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${usagePercentage > 100 ? 100 : usagePercentage}%` }}
          role="progressbar"
          aria-valuenow={usagePercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      {onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full text-left text-blue-600 dark:text-blue-400 text-xs hover:underline mt-1"
        >
          Upgrade Storage
        </button>
      )}
    </div>
  );
};

// --- Main Sidebar Component ---

interface SidebarProps {
  onNavigate: (path: string) => void; // A generic handler for all sidebar navigation
  user: UserProfile;
  storage: {
    usedGB: number;
    totalGB: number;
  };
  navigationItems?: SidebarNavItem[];
  folderTree?: SidebarFolderItem[];
  onSignOut?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onUpgradeStorageClick?: () => void;
  onUserProfileClick?: () => void;
  activePath?: string; // To highlight the currently active navigation item/folder
}

const defaultNavigationItems: SidebarNavItem[] = [
  { id: 'recent', name: 'Recent', iconName: 'clock', path: '/recent' },
  { id: 'starred', name: 'Starred', iconName: 'star', path: '/starred' },
  { id: 'shared', name: 'Shared with me', iconName: 'share2', path: '/shared' }, // Assuming a 'share2' icon
  { id: 'trash', name: 'Trash', iconName: 'trash', path: '/trash' },
];

const defaultFolderTree: SidebarFolderItem[] = [
  {
    id: 'my-files-root',
    name: 'My Files',
    path: '/my-files',
    iconName: 'folder',
    isExpanded: true,
    children: [
      {
        id: 'documents',
        name: 'Documents',
        path: '/my-files/documents',
        children: [
          { id: 'work', name: 'Work Projects', path: '/my-files/documents/work' },
          { id: 'personal', name: 'Personal', path: '/my-files/documents/personal' },
        ],
      },
      { id: 'photos', name: 'Photos', path: '/my-files/photos', iconName: 'image' },
      { id: 'videos', name: 'Videos', path: '/my-files/videos', iconName: 'video' },
      { id: 'downloads', name: 'Downloads', path: '/my-files/downloads' },
    ],
  },
  {
    id: 'shared-drives-root',
    name: 'Shared Drives',
    path: '/shared-drives',
    iconName: 'hardDrive',
    children: [
      { id: 'team-drive-a', name: 'Team A Projects', path: '/shared-drives/team-a' },
      { id: 'marketing', name: 'Marketing Assets', path: '/shared-drives/marketing' },
    ],
  },
];


const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  user,
  storage,
  navigationItems = defaultNavigationItems,
  folderTree = defaultFolderTree,
  onSignOut,
  onSettingsClick,
  onHelpClick,
  onUpgradeStorageClick,
  onUserProfileClick,
  activePath,
}) => {

  const checkIsActive = (itemPath: string) => {
    if (!activePath) return false;
    // For folder tree, check if activePath starts with itemPath (e.g., /my-files/documents active when /my-files is the itemPath)
    if (itemPath === '/my-files' && activePath.startsWith('/my-files')) return true;
    return activePath === itemPath;
  };

  return (
    <aside className="w-72 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 p-4 flex flex-col">
      {/* User Profile Section */}
      <UserProfileSection user={user} onProfileClick={onUserProfileClick} />

      {/* Main File Manager Title - Kept for branding */}
      <div className="flex items-center mb-6 pl-2">
        <Icon name="hardDrive" className="text-blue-500" size={24} />
        <h1 className="text-lg font-bold ml-2 text-gray-800 dark:text-white">File Manager</h1>
      </div>

      <nav className="flex-grow flex flex-col">
        {/* Primary Navigation - My Files */}
        <ul className="mb-4">
          <SidebarNavButton
            item={{ id: 'my-files-primary', name: 'My Files', iconName: 'folderOpen', path: '/my-files', isCallToAction: true }}
            onNavigate={onNavigate}
            isActive={checkIsActive('/my-files')}
          />
        </ul>

        {/* Dynamic Navigation Items */}
        <ul className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          {navigationItems.map(item => (
            <SidebarNavButton
              key={item.id}
              item={item}
              onNavigate={onNavigate}
              isActive={checkIsActive(item.path)}
            />
          ))}
        </ul>

        {/* Folder Tree View */}
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {folderTree.map((folder) => (
            <SidebarFolderTreeItem
              key={folder.id}
              folder={folder}
              onSelectFolder={onNavigate}
              isActive={activePath?.startsWith(folder.path)} // Highlight active parent folder
            />
          ))}
        </div>
      </nav>

      {/* Storage Usage */}
      <StorageUsageDisplay
        usedGB={storage.usedGB}
        totalGB={storage.totalGB}
        onUpgradeClick={onUpgradeStorageClick}
      />

      {/* Footer Utility Links */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <ul>
          {onSettingsClick && (
            <SidebarNavButton
              item={{ id: 'settings', name: 'Settings', iconName: 'settings', path: '/settings' }}
              onNavigate={onSettingsClick}
              isActive={activePath === '/settings'}
            />
          )}
          {onHelpClick && (
            <SidebarNavButton
              item={{ id: 'help', name: 'Help & Feedback', iconName: 'helpCircle', path: '/help' }}
              onNavigate={onHelpClick}
              isActive={activePath === '/help'}
            />
          )}
          {onSignOut && (
            <SidebarNavButton
              item={{ id: 'signOut', name: 'Sign Out', iconName: 'logOut', path: '/signout' }}
              onNavigate={onSignOut}
              isActive={activePath === '/signout'}
            />
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
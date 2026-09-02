export interface NavItem {
  label: string;
  path: string;
}

// Single core navigation configuration shared between desktop and mobile
export const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Movies", path: "/movies" },
  { label: "TV Shows", path: "/tv-shows" },
  { label: "Music", path: "/music" },
  { label: "New & Popular", path: "/new-popular" },
  { label: "My List", path: "/my-list" },
  { label: "History", path: "/history" },
];

// Complete application navigation items (includes Search and Profile)
export const allNavItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Movies", path: "/movies" },
  { label: "TV Shows", path: "/tv-shows" },
  { label: "Music", path: "/music" },
  { label: "New & Popular", path: "/new-popular" },
  { label: "My List", path: "/my-list" },
  { label: "History", path: "/history" },
  { label: "Search", path: "/search" },
  { label: "Profile", path: "/profile" },
];

// Visible primary navigation on mobile:
// Primary visible items (Home | Movies | TV Shows | Music | My List | Search | Profile)
// followed by additional items (New & Popular | History) accessible via scroll and drawer
export const mobilePrimaryNavItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Movies", path: "/movies" },
  { label: "TV Shows", path: "/tv-shows" },
  { label: "Music", path: "/music" },
  { label: "My List", path: "/my-list" },
  { label: "Search", path: "/search" },
  { label: "Profile", path: "/profile" },
  { label: "New & Popular", path: "/new-popular" },
  { label: "History", path: "/history" },
];

"use client";

import { useMemo } from "react";
import { Link, useLocation, useRouteLoaderData } from "react-router-dom";
import {
  Bell,
  Home,
  Users,
  Bookmark,
  PlusSquare,
  Menu,
  Settings,
  LogOut,
  UserIcon,
  LogInIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { logout, parseJWT } from "@/utils/auth";
import IconButton from "./ui/icon-button";

export default function Header() {
  const location = useLocation();
  const token = useRouteLoaderData("root");

  const user = useMemo(() => {
    if (!token) return null;
    const user = parseJWT(token);
    return {
      name: user.username,
      username: user.email,
      // avatarUrl: `/placeholder.svg?height=40&width=40`,
      notificationCount: 2,
    };
  }, [token]);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    // { name: "Explore", href: "/explore", icon: Search },
    { name: "Friends", href: "/friends", icon: Users },
    // { name: "Messages", href: "/messages", icon: MessageSquare, badge: 2 },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  ];

  const isActive = (path: string) => location.pathname === path;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl w-full p-2 flex items-center h-14 md:mx-auto md:w-[90%]">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">SocialApp</span>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle className="text-left">SocialApp</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 py-6">
              {navItems.map((item) => (
                <SheetClose asChild key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${
                      isActive(item.href)
                        ? "bg-accent font-medium"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                    {/* {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )} */}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Logo (Mobile) */}
        <Link to="/" className="md:hidden">
          <span className="font-bold text-lg">SocialApp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 ml-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                isActive(item.href)
                  ? "bg-accent font-medium"
                  : "hover:bg-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden lg:block">{item.name}</span>
              {/* {item.badge && <Badge variant="secondary">{item.badge}</Badge>} */}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* TODO: implement global search */}
          {/* <SearchInput /> */}

          <IconButton Icon={PlusSquare} text="Create" />

          <NotificationButton
            notificationCount={user?.notificationCount || 0}
          />

          <ThemeToggleButton />

          {token && <UserButton user={user as Extract<typeof user, "null">} />}
          {!token && (
            <Link to="/login">
              <IconButton Icon={LogInIcon} text="Login" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// function SearchInput() {
//   const [showMobileSearch, setShowMobileSearch] = useState(false);

//   return (
//     <>
//       {/* Desktop Search */}
//       <div className="hidden md:flex w-full max-w-sm items-center space-x-2 mr-4">
//         <div className="relative w-full">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             type="search"
//             placeholder="Search..."
//             className="pl-8 w-full"
//           />
//         </div>
//       </div>

//       {/* Mobile Search Toggle */}
//       <Button
//         variant="ghost"
//         size="icon"
//         className="md:hidden"
//         onClick={() => setShowMobileSearch(!showMobileSearch)}
//       >
//         {showMobileSearch ? (
//           <X className="h-5 w-5" />
//         ) : (
//           <Search className="h-5 w-5" />
//         )}
//         <span className="sr-only">Toggle search</span>
//       </Button>

//       {/* Mobile Search Bar (Expandable) */}
//       {showMobileSearch && (
//         <div className="container py-2 md:hidden">
//           <div className="relative w-full">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search..."
//               className="pl-8 w-full"
//               autoFocus
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

function NotificationButton({
  notificationCount,
}: {
  notificationCount: number;
}) {
  return (
    <>
      <DropdownMenu>
        {/* <DropdownMenuTrigger asChild> */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            toast.info("Coming soon!");
          }}
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        {/* </DropdownMenuTrigger> */}
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-auto">
            {/* Sample notifications */}
            <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="/placeholder.svg?height=36&width=36"
                  alt="User"
                />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Alex Johnson</span> liked your
                  post
                </p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="/placeholder.svg?height=36&width=36"
                  alt="User"
                />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Sam Wilson</span> commented on
                  your photo
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="/placeholder.svg?height=36&width=36"
                  alt="User"
                />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Emily Chen</span> started
                  following you
                </p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <Button variant="outline" className="w-full">
              View all notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
function UserButton({
  user,
}: {
  user: {
    name: string;
    username: string;
    avatarUrl: string;
  };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

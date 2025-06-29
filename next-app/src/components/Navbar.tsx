'use client'

import { useAuth } from "@/context/AuthContext"
import { Button } from "./ui/button";
import AuthPopup from "./AuthPopup";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { post } from "@/lib/apiCallClient";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useEffect, useState } from "react";



function Navbar() {

  const { user, authLoading, setUser, setAuthLoading } = useAuth();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);

  const getActiveTab = () => {
    const active_tab = searchParams.get('tab');
    if ((!active_tab || active_tab == 'all_projects') && user) return 'my_projects';
    if (!user) return 'all_projects';
    return active_tab as string;
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const activeTab = getActiveTab();
  const isParentPath = pathName === '/projects' || pathName === '/';

  const handleTabChange = (value: string) => {
    if (searchParams.get('tab') === value) return;
    setAuthLoading(true);
    router.push(`?tab=${value}`, { scroll: false });
    // Add more navigation logic for other tabs
  };
  // authLoading
  if ( (authLoading && !user) || !hasMounted) {
    return <div className="sticky top-0 w-full flex items-center justify-between py-2 bg-primary-foreground">
      <div className="w-full bg-slate-100 h-7 animate-pulse">
      </div>
    </div>
  }
  return (
    <div className="sticky top-0 w-full flex items-center justify-between py-2 bg-primary-foreground">
      {
        isParentPath &&
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-[400px]">
          <TabsList>
            {!user && <TabsTrigger value="all_projects">Projects ( All )</TabsTrigger>}
            {
              user &&
              <>
                <TabsTrigger value="open_projects">Projects ( Open )</TabsTrigger>
                <TabsTrigger value="my_projects">My Projects</TabsTrigger>
                <TabsTrigger value="bids">Bids</TabsTrigger>
                <TabsTrigger value="active_bids">Active Bids</TabsTrigger>
              </>
            }
          </TabsList>
        </Tabs>
      }
      {
        !isParentPath &&
        <Button variant="outline" onClick={() => { setAuthLoading(false); router.back() }}>
          <FaArrowLeft />
        </Button>
      }
      {
        !user && <div className="">
          <AuthPopup />
        </div>
      }
      {
        user &&
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full aspect-square" variant="outline">
              <FaUser />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" >
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
            <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              post('/logout').then(() => {
                setUser(null);
                router.refresh();
              });
            }}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    </div>
  )
}

export default Navbar

'use client'

import { get } from "@/lib/apiCallClient";
import { IUser } from "@/types";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

// context/AuthContext.tsx
export const AuthContext = createContext<{
  user: IUser | null,
  setUser: Dispatch<SetStateAction<IUser | null>>,
  authLoading: boolean
}>({ user: null, setUser: ()=> {}, authLoading: false });

export const AuthProvider = ({ children }: { children : React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    setAuthLoading(true);
    get('/')
    .then(res => {
      if (res?.user) setUser(res.user);
    })
    .finally(()=> {
      setAuthLoading(false);
    });
  }, [setAuthLoading]);

  return <AuthContext.Provider value={{ user, setUser, authLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

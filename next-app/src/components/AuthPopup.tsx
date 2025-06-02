'use-client'

import React from 'react'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { postNextUrl, get } from '@/lib/apiCallClient'; // Import the apiCall functions
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IUser } from '@/types';



interface User {
  username: string,
  email: string,
  password: string
}

function AuthPopup() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const { setUser } = useAuth()

  const router = useRouter();
  // Function to check if user is logged in on page load
  const checkAuthStatus = async () => {
    const response = await get<{ user: User }>('/'); // Check / endpoint
    if (response && response.user) {
      // User is logged in, redirect to dashboard or home
      // router.push('/dashboard'); // Or wherever your main app page is
    }
  };

  // Run on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []); // Only run once on mount

  // Due to Next.js's server components and hydration,
  // it's often better to handle initial auth check in a layout or a higher-order component
  // or use a client-side effect for this particular use case if it needs to happen
  // after the component mounts and is interactive.
  // For simplicity here, we'll assume the login page is shown if not logged in.
  // A better approach for routing based on auth would be middleware or
  // checking auth in a root layout for client-side pages.


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await postNextUrl<{ user: User; token: string }>('/login', {
      email: loginEmail,
      password: loginPassword,
    });
    if (response && response.token && response.user) {
      localStorage.setItem('authToken', response.token);
      setUser(response.user as IUser);
      router.refresh();
    } else {
      // Error is handled by apiCall, no need for toast here
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await postNextUrl<{ user: User; token: string }>('/register', {
      name: registerName,
      username: registerUsername,
      email: registerEmail,
      password: registerPassword,
    });

    if (response && response.token && response.user) {
      localStorage.setItem('authToken', response.token);
      setUser(response.user as IUser);
      router.refresh(); // Redirect to dashboard
    } else {
      // Error is handled by apiCall, no need for toast here
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Login / Register</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="registerName">Name</Label>
                <Input
                  id="registerName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerUsername">Username</Label>
                <Input
                  id="registerUsername"
                  type="text"
                  placeholder="johndoe"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Register
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AuthPopup

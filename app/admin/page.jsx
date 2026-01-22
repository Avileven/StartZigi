"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Venture,
  FundingEvent,
  VentureMessage
} from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Briefcase, Trash2, Search, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ventures: 0, funding: 0, users: 0, messages: 0 });
  const [ventures, setVentures] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerms, setSearchTerms] = useState({ ventures: '', users: '' });
  const router = useRouter();

  // פונקציית משיכת נתונים יסודית
  const fetchData = async () => {
    try {
      console.log("Admin: Starting data fetch...");
      
      // שימוש ב-list() נקי ללא מיון כדי למנוע שגיאת 400
      const [allVentures, allUsers, allMessages, allEvents] = await Promise.all([
        Venture.list().catch(() => []),
        User.list().catch(() => []),
        VentureMessage.list().catch(() => []),
        FundingEvent.list().catch(() => [])
      ]);

      console.log("Data Stats:", {
        ventures: allVentures.length,
        users: allUsers.length,
        messages: allMessages.length
      });

      // הצמדת מיזמים למשתמשים לפי אימייל
      const venturesByEmail = {};
      allVentures.forEach(v => {
        if (v?.created_by) {
          if (!venturesByEmail[v.created_by]) venturesByEmail[v.created_by] = [];
          venturesByEmail[v.created_by].push(v.name);
        }
      });

      const processedUsers = allUsers.map(u => ({
        ...u,
        linkedVentures: venturesByEmail[u.email] || []
      }));

      setVentures(allVentures);
      setUsers(processedUsers);
      setMessages(allMessages);

      // חישוב סכום גיוסים
      const totalFunding = allEvents.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      setStats({
        ventures: allVentures.length,
        users: allUsers.length,
        messages: allMessages.length,
        funding: totalFunding
      });

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const me = await User.me();
        if (me && me.role === 'admin') {
          setIsAdmin(true);
          await fetchData();
        } else {
          router.replace('/');
        }
      } catch (err) {
        router.replace('/');
      }
    };
    checkAdmin();
  }, [router]);

  // פילטרים חסינים (מוודאים שהערך קיים לפני toLowerCase)
  const filteredVentures = useMemo(() => 
    ventures.filter(v => 
      (v?.name || "").toLowerCase().includes(searchTerms.ventures.toLowerCase()) ||
      (v?.created_by || "").toLowerCase().includes(searchTerms.ventures.toLowerCase())
    ), [ventures, searchTerms.ventures]);

  const filteredUsers = useMemo(() => 
    users.filter(u => 
      (u?.email || "").toLowerCase().includes(searchTerms.users.toLowerCase())
    ), [users, searchTerms.users]);

  if (!isAdmin || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-black font-sans">
      <div className="flex items-center gap-3 border-b pb-6">
        <Shield className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold italic">SYSTEM ADMIN</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6">
          <p className="text-sm text-gray-500">TOTAL VENTURES</p>
          <p className="text-3xl font-bold">{stats.ventures}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-gray-500">TOTAL USERS</p>
          <p className="text-3xl font-bold">{stats.users}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-gray-500">FEEDBACK</p>
          <p className="text-3xl font-bold">{stats.messages}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="ventures">
        <TabsList className="mb-4">
          <TabsTrigger value="ventures">Ventures</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="ventures">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ventures List</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8" 
                  value={searchTerms.ventures}
                  onChange={(e) => setSearchTerms({...searchTerms, ventures: e.target.value})}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Phase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVentures.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold text-blue-600">{v.name || "N/A"}</TableCell>
                      <TableCell>{v.created_by || "Unknown"}</TableCell>
                      <TableCell><Badge variant="outline">{v.phase || "Idea"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users List</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8" 
                  value={searchTerms.users}
                  onChange={(e) => setSearchTerms({...searchTerms, users: e.target.value})}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Ventures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge>{u.role}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {u.linkedVentures?.map(v => (
                            <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Venture,
  FundingEvent,
  VentureMessage,
  CoFounderInvitation,
  VCFirm
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
import { Loader2, Users, Briefcase, Trash2, Search, Shield, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ventures: 0, funding: 0, users: 0, messages: 0 });
  const [ventures, setVentures] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerms, setSearchTerms] = useState({ ventures: '', users: '' });
  const router = useRouter();

  const fetchData = async () => {
    try {
      console.log("Admin: Requesting ALL global data...");
      
      // שימוש ב-filter({}) כדי לעקוף הגבלות יוזר אישיות ולהביא את כל מסד הנתונים
      const [allVentures, allUsers, allMessages, allEvents] = await Promise.all([
        Venture.filter({}).catch(() => []), 
        User.filter({}).catch(() => []), 
        VentureMessage.filter({}).catch(() => []),
        FundingEvent.filter({}).catch(() => [])
      ]);

      console.log("Admin Data Received:", {
        ventures: allVentures.length,
        users: allUsers.length,
        messages: allMessages.length
      });

      // הצמדת שמות מיזמים למשתמשים
      const venturesByEmail = {};
      allVentures.forEach(v => {
        const owner = v?.created_by || v?.owner_email;
        if (owner) {
          if (!venturesByEmail[owner]) venturesByEmail[owner] = [];
          venturesByEmail[owner].push(v.name);
        }
      });

      const processedUsers = allUsers.map(u => ({
        ...u,
        linkedVentures: venturesByEmail[u.email] || []
      }));

      setVentures(allVentures);
      setUsers(processedUsers);
      setMessages(allMessages);

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

  const filteredVentures = useMemo(() => 
    ventures.filter(v => 
      (v?.name || "").toLowerCase().includes(searchTerms.ventures.toLowerCase()) ||
      (v?.created_by || "").toLowerCase().includes(searchTerms.ventures.toLowerCase())
    ), [ventures, searchTerms.ventures]);

  const filteredUsers = useMemo(() => 
    users.filter(u => 
      (u?.email || "").toLowerCase().includes(searchTerms.users.toLowerCase())
    ), [users, searchTerms.users]);

  const handleDeleteVenture = async (id) => {
    if (confirm("Delete this venture permanently?")) {
      try {
        await Venture.delete(id);
        setVentures(prev => prev.filter(v => v.id !== id));
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-gray-500 font-medium">Syncing Global Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-black bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-10 h-10 text-red-600" />
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-gray-900">SYSTEM CONTROL</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">StartZig Administrative Hub</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-400 font-bold uppercase">Ventures</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black">{stats.ventures}</p></CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-400 font-bold uppercase">Total Users</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black">{stats.users}</p></CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-400 font-bold uppercase">Feedback</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black">{stats.messages}</p></CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-indigo-600 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-indigo-200 font-bold uppercase">Portfolio Value</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-black">${(stats.funding / 1000000).toFixed(1)}M</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ventures" className="w-full">
        <TabsList className="bg-white border p-1 mb-8">
          <TabsTrigger value="ventures" className="px-8 font-bold">VENTURES</TabsTrigger>
          <TabsTrigger value="users" className="px-8 font-bold">USERS</TabsTrigger>
          <TabsTrigger value="messages" className="px-8 font-bold">FEEDBACK</TabsTrigger>
        </TabsList>

        <TabsContent value="ventures">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Venture Directory</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Filter by name or email..." 
                  className="pl-10 bg-gray-50 border-none h-10" 
                  value={searchTerms.ventures}
                  onChange={(e) => setSearchTerms({...searchTerms, ventures: e.target.value})}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-gray-900">NAME</TableHead>
                    <TableHead className="font-bold text-gray-900">FOUNDER</TableHead>
                    <TableHead className="font-bold text-gray-900">PHASE</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVentures.map((v) => (
                    <TableRow key={v.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-black text-indigo-600">{v.name || "UNNAMED"}</TableCell>
                      <TableCell className="text-sm font-medium">{v.created_by}</TableCell>
                      <TableCell><Badge variant="outline" className="font-bold uppercase text-[10px]">{v.phase}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVenture(v.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight">User Base</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search user email..." 
                  className="pl-10 bg-gray-50 border-none h-10" 
                  value={searchTerms.users}
                  onChange={(e) => setSearchTerms({...searchTerms, users: e.target.value})}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-gray-900">EMAIL</TableHead>
                    <TableHead className="font-bold text-gray-900">ROLE</TableHead>
                    <TableHead className="font-bold text-gray-900">LINKED VENTURES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-bold">{u.email}</TableCell>
                      <TableCell>
                        <Badge className={u.role === 'admin' ? "bg-red-100 text-red-600 border-none" : "bg-gray-100 text-gray-600 border-none"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.linkedVentures?.map(v => (
                            <Badge key={v} variant="secondary" className="text-[9px] font-bold">{v}</Badge>
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

        <TabsContent value="messages">
          <div className="grid gap-4">
            {messages.map(m => (
              <Card key={m.id} className="border-none shadow-sm bg-white">
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="text-indigo-600">{m.created_by}</Badge>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{m.message_type}</span>
                  </div>
                  <CardTitle className="text-lg font-black">{m.title}</CardTitle>
                  <p className="text-gray-600 pt-2">{m.content}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
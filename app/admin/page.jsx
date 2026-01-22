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
import {
  Loader2, Users, Briefcase, DollarSign, Trash2,
  MessageSquare, Search, Shield
} from 'lucide-react';

// פונקציות עזר
const formatMoney = (amount) => {
  if (!amount) return '$0';
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
  return `$${amount.toLocaleString()}`;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ventures: 0, funding: 0, users: 0, messages: 0 });
  const [ventures, setVentures] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerms, setSearchTerms] = useState({ ventures: '', users: '', messages: '' });
  const router = useRouter();

  const fetchData = async () => {
    try {
      // משיכת נתונים ללא המיון שגרם לשגיאה 400
      const [allVentures, allUsers, allMessages, allEvents] = await Promise.all([
        Venture.list().catch(() => []),
        User.list().catch(() => []),
        VentureMessage.list().catch(() => []),
        FundingEvent.list().catch(() => [])
      ]);

      const venturesByUser = allVentures.reduce((acc, venture) => {
        if (venture?.created_by) {
          if (!acc[venture.created_by]) acc[venture.created_by] = [];
          acc[venture.created_by].push(venture.name);
        }
        return acc;
      }, {});

      const usersWithVentures = allUsers.map(user => ({
        ...user,
        ventures: venturesByUser[user.email] || []
      }));
     
      const userFeedbackMessages = allMessages.filter(msg => msg.message_type === 'user_feedback');
     
      setVentures(allVentures);
      setUsers(usersWithVentures);
      setMessages(userFeedbackMessages);

      const totalFunding = allEvents.reduce((sum, event) => sum + (event.amount || 0), 0);
      setStats({
        ventures: allVentures.length,
        funding: totalFunding,
        users: allUsers.length,
        messages: userFeedbackMessages.length,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.role === 'admin') {
          setIsAdmin(true);
          await fetchData();
        } else {
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };
    checkAdmin();
  }, [router]);

  // לוגיקת חיפוש חסינת שגיאות (עם בדיקת קיום ערכים)
  const filteredVentures = useMemo(() =>
    ventures.filter(v =>
      (v?.name?.toLowerCase() || "").includes(searchTerms.ventures.toLowerCase()) ||
      (v?.created_by?.toLowerCase() || "").includes(searchTerms.ventures.toLowerCase())
    ), [ventures, searchTerms.ventures]);

  const filteredUsers = useMemo(() =>
    users.filter(u => 
      (u?.email?.toLowerCase() || "").includes(searchTerms.users.toLowerCase())
    ), [users, searchTerms.users]);

  const handleVentureClick = (ventureId) => {
    localStorage.setItem('admin_selected_venture_id', ventureId);
    router.push('/dashboard');
  };

  const handleDeleteVenture = async (id) => {
    if (confirm("Are you sure you want to delete this venture?")) {
      try {
        await Venture.delete(id);
        setVentures(v => v.filter(item => item.id !== id));
      } catch (err) {
        alert("Failed to delete venture");
      }
    }
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading System Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-6">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
            <p className="text-sm text-gray-500 uppercase">StartZig Global Management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Total Ventures</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.ventures}</div></CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Portfolio Funding</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatMoney(stats.funding)}</div></CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Active Users</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.users}</div></CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">Feedback items</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.messages}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ventures" className="w-full">
          <TabsList className="bg-white border border-gray-200 mb-6">
            <TabsTrigger value="ventures">Ventures</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="messages">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="ventures">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ventures Directory</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search name or founder..." 
                    className="pl-8 bg-gray-50" 
                    value={searchTerms.ventures}
                    onChange={(e) => setSearchTerms({...searchTerms, ventures: e.target.value})} 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venture Name</TableHead>
                      <TableHead>Founder</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Burn Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentures.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <button 
                            onClick={() => handleVentureClick(v.id)} 
                            className="text-indigo-600 font-bold hover:underline text-left"
                          >
                            {v.name || 'Unnamed Venture'}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">{v.created_by}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{v.phase}</Badge></TableCell>
                        <TableCell>{formatMoney(v.monthly_burn_rate)}</TableCell>
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
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Accounts</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search email..." 
                    className="pl-8 bg-gray-50" 
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
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.ventures?.map(vName => (
                              <Badge key={vName} variant="outline" className="text-[10px]">{vName}</Badge>
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
               {messages.length > 0 ? messages.map(m => (
                 <Card key={m.id} className="border-none shadow-sm bg-white">
                   <CardHeader>
                     <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold">{m.title}</CardTitle>
                        <Badge variant="outline">{m.created_by}</Badge>
                     </div>
                     <CardDescription className="text-gray-700 pt-2">{m.content}</CardDescription>
                   </CardHeader>
                 </Card>
               )) : (
                 <div className="text-center py-12 text-gray-400 bg-white rounded-lg border">No feedback available.</div>
               )}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
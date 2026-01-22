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
  MessageSquare, Search, Mail, ExternalLink, Building2
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
  const [invitations, setInvitations] = useState([]);
  const [fundingEvents, setFundingEvents] = useState([]);
  const [vcFirms, setVcFirms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerms, setSearchTerms] = useState({ ventures: '', users: '', messages: '', invitations: '', vcs: '' });
  const router = useRouter();

  const fetchData = async () => {
    try {
      // ✅ תיקון: הסרנו את המיון ("-created_date") שגרם לשגיאה 400
      const [allVentures, allUsers, allMessages, allEvents, allInvitations, allVCFirms] = await Promise.all([
        Venture.list().catch(() => []),
        User.list().catch(() => []),
        VentureMessage.list().catch(() => []),
        FundingEvent.list().catch(() => []),
        CoFounderInvitation.list().catch(() => []),
        VCFirm.list().catch(() => [])
      ]);

      const venturesByUser = allVentures.reduce((acc, venture) => {
        if (!acc[venture.created_by]) acc[venture.created_by] = [];
        acc[venture.created_by].push(venture.name);
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
      setFundingEvents(allEvents);
      setInvitations(allInvitations);
      setVcFirms(allVCFirms);

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
        console.error("Admin check error:", error);
        router.replace('/');
      }
    };
    checkAdmin();
  }, [router]);

  // לוגיקת חיפוש (נשאר כפי שהיה)
  const filteredVentures = useMemo(() =>
    ventures.filter(v =>
      v.name.toLowerCase().includes(searchTerms.ventures.toLowerCase()) ||
      v.created_by.toLowerCase().includes(searchTerms.ventures.toLowerCase())
    ), [ventures, searchTerms.ventures]);

  const filteredUsers = useMemo(() =>
    users.filter(u => u.email.toLowerCase().includes(searchTerms.users.toLowerCase())),
    [users, searchTerms.users]);

  const handleVentureClick = (venture) => {
    localStorage.setItem('admin_selected_venture_id', venture.id);
    router.push('/dashboard');
  };

  const handleDeleteVenture = async (id) => {
    if (confirm("Delete this venture?")) {
      await Venture.delete(id);
      setVentures(v => v.filter(item => item.id !== id));
    }
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium font-sans">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-black font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8 uppercase text-xs tracking-widest">Platform management and insights</p>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">VENTURES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.ventures}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">TOTAL FUNDING</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatMoney(stats.funding)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">USERS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">FEEDBACK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.messages}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ventures">
          <TabsList className="bg-white border border-gray-200 mb-6 p-1">
            <TabsTrigger value="ventures" className="px-6">Ventures</TabsTrigger>
            <TabsTrigger value="users" className="px-6">Users</TabsTrigger>
            <TabsTrigger value="messages" className="px-6">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="ventures">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-xl font-bold">Ventures List</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search ventures..." 
                    className="pl-8 bg-gray-50" 
                    onChange={(e) => setSearchTerms({...searchTerms, ventures: e.target.value})} 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-bold">Venture Name</TableHead>
                      <TableHead className="font-bold">Founder</TableHead>
                      <TableHead className="font-bold">Phase</TableHead>
                      <TableHead className="font-bold">Burn Rate</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentures.map((v) => (
                      <TableRow key={v.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <button 
                            onClick={() => handleVentureClick(v)} 
                            className="text-indigo-600 font-bold hover:underline text-left"
                          >
                            {v.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{v.created_by}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium bg-white capitalize">
                            {v.phase}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{formatMoney(v.monthly_burn_rate)}</TableCell>
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
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-xl font-bold">Platform Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by email..." 
                    className="pl-8 bg-gray-50" 
                    onChange={(e) => setSearchTerms({...searchTerms, users: e.target.value})} 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-bold">User Email</TableHead>
                      <TableHead className="font-bold">Role</TableHead>
                      <TableHead className="font-bold">Associated Ventures</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          <Badge className={u.role === 'admin' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.ventures?.map(vName => (
                              <Badge key={vName} variant="secondary" className="text-[10px]">{vName}</Badge>
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
                 <Card key={m.id} className="border-none shadow-sm">
                   <CardHeader>
                     <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-indigo-900">{m.title}</CardTitle>
                        <Badge variant="outline">{m.created_by}</Badge>
                     </div>
                     <CardDescription className="text-gray-700 pt-2 leading-relaxed">
                       {m.content}
                     </CardDescription>
                   </CardHeader>
                 </Card>
               )) : (
                 <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium">No feedback messages yet.</p>
                 </div>
               )}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
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
import { format } from "date-fns";


// פונקציות עזר מחוץ לקומפוננטה
const formatMoney = (amount) => {
  if (!amount) return '$0';
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
  return `$${amount.toLocaleString()}`;
};


const ScreeningParameterBadges = ({ params }) => {
  if (!params) return <Badge variant="secondary">None</Badge>;
  const activeParams = Object.entries(params)
    .filter(([key, value]) => key !== 'rejection_messages' && value === true)
    .map(([key]) => {
      switch (key) {
        case 'freeze_investment': return 'Freeze';
        case 'phase_focus': return 'Phase Focus';
        case 'sector_focus': return 'Sector Focus';
        case 'team_focus': return 'Team Focus';
        default: return null;
      }
    })
    .filter(Boolean);


  if (activeParams.length === 0) return <Badge variant="secondary">None</Badge>;
  return (
    <div className="flex flex-wrap gap-1">
      {activeParams.map(param => (
        <Badge key={param} variant="destructive" className="text-xs">{param}</Badge>
      ))}
    </div>
  );
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


  // מחיקת קאץ
  const fetchData = async () => {
    try {
      const [allVentures, allUsers, allMessages, allEvents, allInvitations, allVCFirms] = await Promise.all([
        Venture.list("-created_date"),
        User.list("-created_date"),
        VentureMessage.list("-created_date"),
        FundingEvent.list("-created_date"),
        CoFounderInvitation.list("-created_date"),
        VCFirm.list("-created_date")
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


  // לוגיקת חיפוש
  const filteredVentures = useMemo(() =>
    ventures.filter(v =>
      v.name.toLowerCase().includes(searchTerms.ventures.toLowerCase()) ||
      v.created_by.toLowerCase().includes(searchTerms.ventures.toLowerCase())
    ), [ventures, searchTerms.ventures]);


  const filteredUsers = useMemo(() =>
    users.filter(u => u.email.toLowerCase().includes(searchTerms.users.toLowerCase())),
    [users, searchTerms.users]);


  const filteredMessages = useMemo(() =>
    messages.filter(m =>
      m.title.toLowerCase().includes(searchTerms.messages.toLowerCase()) ||
      m.content.toLowerCase().includes(searchTerms.messages.toLowerCase())
    ), [messages, searchTerms.messages]);


  const filteredVCs = useMemo(() =>
    vcFirms.filter(vc => vc.name.toLowerCase().includes(searchTerms.vcs.toLowerCase())),
    [vcFirms, searchTerms.vcs]);


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
          <p className="text-gray-500 font-medium">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Platform management and insights</p>


        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ventures</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.ventures}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Funding</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatMoney(stats.funding)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.users}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Feedback</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.messages}</div></CardContent></Card>
        </div>


        <Tabs defaultValue="ventures">
          <TabsList className="bg-white border mb-6">
            <TabsTrigger value="ventures">Ventures</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vcs">VC Firms</TabsTrigger>
            <TabsTrigger value="messages">Feedback</TabsTrigger>
          </TabsList>


          <TabsContent value="ventures">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ventures List</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search..." className="pl-8" onChange={(e) => setSearchTerms({...searchTerms, ventures: e.target.value})} />
                  </div>
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
                          <button onClick={() => handleVentureClick(v)} className="text-blue-600 font-semibold hover:underline">
                            {v.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{v.created_by}</TableCell>
                        <TableCell><Badge variant="outline">{v.phase}</Badge></TableCell>
                        <TableCell>{formatMoney(v.monthly_burn_rate)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" onClick={() => handleDeleteVenture(v.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>


          {/* שאר הטאבים (Users, VCs וכו') דומים במבנה שלהם לזה של ה-Ventures */}
        </Tabs>
      </div>
    </div>
  );
}


//ADMIN - FIXED FOR NEXT.JS
"use client";
if (typeof window !== 'undefined') {
  console.log("🟢 Admin page module loaded");
}
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';  // ✅ Next.js Link
import { User } from '@/api/entities';
import { Venture } from '@/api/entities';
import { FundingEvent } from '@/api/entities';
import { VentureMessage } from '@/api/entities';
import { CoFounderInvitation } from '@/api/entities';
import { VCFirm } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Briefcase, DollarSign, Trash2, MessageSquare, UserCheck, Search, Mail, ExternalLink, Building2 } from 'lucide-react';
import { format } from "date-fns";

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
   console.log("🔵 AdminDashboard component rendering");
  const [stats, setStats] = useState({ ventures: 0, funding: 0, users: 0, messages: 0 });
  const [ventures, setVentures] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [fundingEvents, setFundingEvents] = useState([]);
  const [vcFirms, setVcFirms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState({ ventures: '', users: '', messages: '', invitations: '', vcs: '' });
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allVentures, allUsers, allMessages, allEvents, allInvitations, allVCFirms] = await Promise.all([
        Venture.list("-created_date"),
        User.list("-created_date"),
        VentureMessage.list("-created_date"),
        FundingEvent.list("-created_date"),
        CoFounderInvitation.list("-created_date"),
        VCFirm.list("-created_date")
      ]);

      const validFundingEvents = allEvents;
      
      const venturesByUser = allVentures.reduce((acc, venture) => {
        if (!acc[venture.created_by]) {
          acc[venture.created_by] = [];
        }
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
      setFundingEvents(validFundingEvents);
      setInvitations(allInvitations);
      setVcFirms(allVCFirms);

      const totalFunding = validFundingEvents.reduce((sum, event) => sum + event.amount, 0);
      
      setStats({
        ventures: allVentures.length,
        funding: totalFunding,
        users: allUsers.length,
        messages: userFeedbackMessages.length,
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await User.me();
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/');
          return;
        }
        fetchData();
      } catch (error) {
        console.error("Admin check error:", error);
        router.push('/');
      }
    };
    checkAdmin();
  }, [router]);

  const handleDeleteVenture = async (ventureId) => {
    if (confirm("Are you sure you want to permanently delete this venture? This action cannot be undone.")) {
      try {
        await Venture.delete(ventureId);
        setVentures(prev => prev.filter(v => v.id !== ventureId));
        console.log('Venture deleted successfully.');
      } catch (error) {
        console.error("Error deleting venture:", error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await VentureMessage.delete(messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
        console.log('Message deleted successfully.');
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };
  
  const handleSearchChange = (tab, value) => {
    setSearchTerms(prev => ({ ...prev, [tab]: value }));
  };

  const handleVentureClick = (venture) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('admin_selected_venture_id', venture.id); 
    }
    router.push('/dashboard');  // ✅ Fixed
  };

  const filteredVentures = useMemo(() => 
    ventures.filter(v => 
      v.name.toLowerCase().includes(searchTerms.ventures.toLowerCase()) || 
      v.created_by.toLowerCase().includes(searchTerms.ventures.toLowerCase())
    ), [ventures, searchTerms.ventures]);

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.email.toLowerCase().includes(searchTerms.users.toLowerCase())
    ), [users, searchTerms.users]);

  const filteredMessages = useMemo(() =>
    messages.filter(m =>
      m.title.toLowerCase().includes(searchTerms.messages.toLowerCase()) ||
      m.content.toLowerCase().includes(searchTerms.messages.toLowerCase())
    ), [messages, searchTerms.messages]);
  
  const filteredInvitations = useMemo(() =>
    invitations.filter(i =>
      i.invitee_email.toLowerCase().includes(searchTerms.invitations.toLowerCase()) ||
      i.inviter_email.toLowerCase().includes(searchTerms.invitations.toLowerCase())
    ), [invitations, searchTerms.invitations]);

  const filteredVCs = useMemo(() =>
    vcFirms.filter(vc =>
      vc.name.toLowerCase().includes(searchTerms.vcs.toLowerCase()) ||
      (vc.background && vc.background.toLowerCase().includes(searchTerms.vcs.toLowerCase()))
    ), [vcFirms, searchTerms.vcs]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Platform-wide analytics and management tools.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventures</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ventures}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(stats.funding)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total User Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ventures">
          <TabsList className="mb-4">
            <TabsTrigger value="ventures"><Briefcase className="w-4 h-4 mr-2" />Ventures</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
            <TabsTrigger value="invitations"><Mail className="w-4 h-4 mr-2" />Co-Founder Invites</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 mr-2" />User Feedback</TabsTrigger>
            <TabsTrigger value="vcs"><Building2 className="w-4 h-4 mr-2" />VC Firms</TabsTrigger>
            <TabsTrigger value="funding"><DollarSign className="w-4 h-4 mr-2" />Funding Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ventures">
            <Card>
              <CardHeader>
                <CardTitle>All Ventures</CardTitle>
                <CardDescription>Manage all ventures on the platform. Click on venture names to view their dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by venture or founder email..." 
                    className="pl-8" 
                    value={searchTerms.ventures}
                    onChange={(e) => handleSearchChange('ventures', e.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venture</TableHead>
                      <TableHead>Founder</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Burn Rate/month</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentures.map((venture) => (
                      <TableRow key={venture.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => handleVentureClick(venture)}
                              className="text-left hover:underline text-indigo-600 font-medium"
                            >
                              {venture.name}
                            </button>
                            {venture.landing_page_url && (
                              <a href={venture.landing_page_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline flex items-center gap-1">
                                View Landing Page <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]">{venture.created_by}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{venture.phase.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{formatMoney(venture.monthly_burn_rate || 0)}</TableCell>
                        <TableCell>{format(new Date(venture.created_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteVenture(venture.id)}>
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
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>All registered users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by user email..." 
                            className="pl-8"
                            value={searchTerms.users}
                            onChange={(e) => handleSearchChange('users', e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                               <TableHead>Email</TableHead>
                               <TableHead>Role</TableHead>
                               <TableHead>Joined</TableHead>
                               <TableHead>Ventures</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium truncate max-w-[200px]">{user.email}</TableCell>
                                <TableCell><Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge></TableCell>
                                <TableCell>{format(new Date(user.created_date), "MMM d, yyyy")}</TableCell>
                                <TableCell className="truncate max-w-[200px]">{user.ventures.join(', ')}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invitations">
             <Card>
                <CardHeader>
                    <CardTitle>Co-Founder Invitations</CardTitle>
                    <CardDescription>Track all co-founder invitations sent on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by email..." 
                        className="pl-8" 
                        value={searchTerms.invitations}
                        onChange={(e) => handleSearchChange('invitations', e.target.value)}
                      />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                               <TableHead>Inviter</TableHead>
                               <TableHead>Invitee</TableHead>
                               <TableHead>Status</TableHead>
                               <TableHead>Date Sent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvitations.map((invite) => (
                            <TableRow key={invite.id}>
                                <TableCell className="truncate max-w-[200px]">{invite.inviter_email}</TableCell>
                                <TableCell className="truncate max-w-[200px]">{invite.invitee_email}</TableCell>
                                <TableCell>
                                    <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'declined' ? 'destructive' : 'secondary'}>
                                        {invite.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(invite.created_date), "MMM d, yyyy")}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
                <CardHeader>
                    <CardTitle>User Feedback</CardTitle>
                    <CardDescription>User feedback messages from landing pages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search messages..." 
                        className="pl-8" 
                        value={searchTerms.messages}
                        onChange={(e) => handleSearchChange('messages', e.target.value)}
                      />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMessages.map((message) => (
                            <TableRow key={message.id}>
                                <TableCell><Badge variant="outline">{message.message_type.replace('_',' ')}</Badge></TableCell>
                                <TableCell className="font-medium truncate max-w-[150px]">{message.title}</TableCell>
                                <TableCell className="truncate max-w-[250px]">{message.content}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteMessage(message.id)}>
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

          <TabsContent value="vcs">
            <Card>
              <CardHeader>
                <CardTitle>VC Firms Management</CardTitle>
                <CardDescription>Manage VC firms and their internal screening parameters.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search VC firms..." 
                    className="pl-8" 
                    value={searchTerms.vcs}
                    onChange={(e) => handleSearchChange('vcs', e.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firm Name</TableHead>
                      <TableHead>Screening Parameters</TableHead>
                      <TableHead>Rejection Message(s)</TableHead>
                      <TableHead>Typical Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVCs.map((vc) => (
                      <TableRow key={vc.id}>
                        <TableCell className="font-medium">{vc.name}</TableCell>
                        <TableCell>
                            <ScreeningParameterBadges params={vc.screening_parameters} />
                        </TableCell>
                        <TableCell className="text-xs max-w-sm">
                          {vc.screening_parameters?.rejection_messages && Object.values(vc.screening_parameters.rejection_messages).length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {Object.entries(vc.screening_parameters.rejection_messages).map(([key, msg]) => (
                                <li key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {msg}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{vc.typical_check || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funding">
            <Card>
                <CardHeader>
                    <CardTitle>Funding Events</CardTitle>
                    <CardDescription>A log of all simulated investments made on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Venture</TableHead>
                                <TableHead>Investor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fundingEvents.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.venture_name}</TableCell>
                                <TableCell>{event.investor_name}</TableCell>
                                <TableCell><Badge>{event.investment_type}</Badge></TableCell>
                                <TableCell>{formatMoney(event.amount)}</TableCell>
                                <TableCell>{format(new Date(event.created_date), "MMM d, yyyy")}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
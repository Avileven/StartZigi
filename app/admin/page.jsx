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
  MessageSquare, Search, Shield, Building2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ventures: 0, funding: 0, users: 0, messages: 0 });
  const [ventures, setVentures] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [vcFirms, setVcFirms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [allVentures, allUsers, allMessages, allEvents, allVCFirms] = await Promise.all([
        Venture.list("-created_date").catch(() => []),
        User.list("-created_date").catch(() => []),
        VentureMessage.list("-created_date").catch(() => []),
        FundingEvent.list("-created_date").catch(() => []),
        VCFirm.list("-created_date").catch(() => [])
      ]);

      setVentures(allVentures);
      setUsers(allUsers);
      setMessages(allMessages.filter(m => m.message_type === 'user_feedback'));
      setVcFirms(allVCFirms);

      const totalFunding = allEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
      setStats({
        ventures: allVentures.length,
        users: allUsers.length,
        messages: allMessages.length,
        funding: totalFunding
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const me = await User.me();
        if (me && me.role === 'admin') {
          setAuthorized(true);
          await fetchData();
        } else {
          router.replace('/');
        }
      } catch (err) {
        router.replace('/');
      }
    }
    init();
  }, [router]);

  const filteredVentures = useMemo(() => 
    ventures.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.created_by.toLowerCase().includes(search.toLowerCase())), 
    [ventures, search]
  );

  const formatMoney = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(0)}K`;

  if (!authorized || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Access Only</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900">System Control</h1>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-green-600">{formatMoney(stats.funding)}</p>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ventures', val: stats.ventures, icon: Briefcase, color: 'blue' },
          { label: 'Total Users', val: stats.users, icon: Users, color: 'purple' },
          { label: 'Feedback', val: stats.messages, icon: MessageSquare, color: 'orange' },
          { label: 'VC Firms', val: vcFirms.length, icon: Building2, color: 'indigo' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 bg-${s.color}-100 rounded-lg text-${s.color}-600`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold">{s.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="ventures" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="ventures">Ventures</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="vcs">VC Firms</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search everything..." 
              className="pl-10 bg-white" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="ventures">
          <Card>
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
                    <TableCell className="font-bold text-indigo-600 cursor-pointer" onClick={() => {
                      localStorage.setItem('admin_selected_venture_id', v.id);
                      router.push('/dashboard');
                    }}>{v.name}</TableCell>
                    <TableCell className="text-sm">{v.created_by}</TableCell>
                    <TableCell><Badge variant="outline">{v.phase}</Badge></TableCell>
                    <TableCell>{formatMoney(v.monthly_burn_rate || 0)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if(confirm("Delete venture?")) {
                          await Venture.delete(v.id);
                          setVentures(list => list.filter(x => x.id !== v.id));
                        }
                      }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => u.email.includes(search)).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={u.role === 'admin' ? "bg-red-100 text-red-700" : ""}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{new Date(u.created_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <div className="grid gap-4">
            {messages.map(m => (
              <Card key={m.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{m.title}</CardTitle>
                    <Badge>{m.created_by}</Badge>
                  </div>
                  <CardDescription>{m.content}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// ייבוא בסיסי בלי סיומות קבצים
import { User, Venture, FundingEvent, VentureMessage, CoFounderInvitation, VCFirm } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Trash2, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(null); // null = בודק, true = אדמין, false = לא אדמין
  const [data, setData] = useState({ ventures: [], users: [], isLoading: true });
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // בדיקת הרשאות - פעם אחת בלבד בטעינה
  useEffect(() => {
    async function verify() {
      try {
        const me = await User.me();
        if (me && me.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.replace('/'); 
        }
      } catch (e) {
        setIsAdmin(false);
        router.replace('/');
      }
    }
    verify();
  }, [router]);

  // טעינת נתונים - רק אם אדמין
  useEffect(() => {
    if (isAdmin === true) {
      async function load() {
        try {
          const [v, u] = await Promise.all([
            Venture.list("-created_date").catch(() => []),
            User.list("-created_date").catch(() => [])
          ]);
          setData({ ventures: v, users: u, isLoading: false });
        } catch (err) {
          console.error("Load error", err);
          setData(prev => ({ ...prev, isLoading: false }));
        }
      }
      load();
    }
  }, [isAdmin]);

  // הגנה: אם עוד לא בדקנו אדמין, אל תרנדר כלום חוץ מטעינה
  if (isAdmin === null || (isAdmin === true && data.isLoading)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // הגנה: אם לא אדמין, אל תרנדר את ה-HTML של הדשבורד בכלל
  if (isAdmin === false) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="ventures">
          <TabsList className="mb-4">
            <TabsTrigger value="ventures">Ventures ({data.ventures.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({data.users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ventures">
            <Card>
              <CardHeader>
                <Input 
                  placeholder="Search venture name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Founder</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.ventures
                      .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell>{v.created_by}</TableCell>
                        <TableCell>
                           <Button variant="ghost" size="sm" onClick={async () => {
                             if(confirm("Delete?")) {
                               await Venture.delete(v.id);
                               setData(prev => ({...prev, ventures: prev.ventures.filter(i => i.id !== v.id)}));
                             }
                           }}>
                             <Trash2 className="h-4 w-4 text-red-500" />
                           </Button>
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
    </div>
  );
}
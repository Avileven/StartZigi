"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ייבוא הישויות - וודא שהנתיב הזה נכון אצלך
import { User, Venture, FundingEvent, VentureMessage, VCFirm } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState({ ventures: [], users: [], loading: true });
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function initAdmin() {
      try {
        // 1. בדיקה אם המשתמש הוא אדמין
        const me = await User.me();
        if (me && me.role === 'admin') {
          setAuthorized(true);
          
          // 2. משיכת נתונים ללא מיון (כדי למנוע את שגיאת created_date)
          const [v, u] = await Promise.all([
            Venture.list().catch(() => []),
            User.list().catch(() => [])
          ]);
          
          setData({ ventures: v, users: u, loading: false });
        } else {
          router.replace('/');
        }
      } catch (err) {
        console.error("Admin init error:", err);
        router.replace('/');
      }
    }
    initAdmin();
  }, [router]);

  // מסך טעינה
  if (!authorized || data.loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-500 font-medium">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-black">
      <div className="flex items-center gap-3 border-b pb-4">
        <Shield className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold">ניהול מערכת</h1>
      </div>

      <Tabs defaultValue="ventures">
        <TabsList className="mb-6">
          <TabsTrigger value="ventures">מיזמים ({data.ventures.length})</TabsTrigger>
          <TabsTrigger value="users">משתמשים ({data.users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ventures">
          <Card>
            <CardHeader><CardTitle>רשימת מיזמים</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם המיזם</TableHead>
                    <TableHead>אימייל מייסד</TableHead>
                    <TableHead>שלב</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.ventures.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold text-indigo-600">{v.name}</TableCell>
                      <TableCell>{v.created_by}</TableCell>
                      <TableCell><Badge variant="outline">{v.phase}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>משתמשים רשומים</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>אימייל</TableHead>
                    <TableHead>תפקיד</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className={u.role === 'admin' ? "bg-red-100 text-red-700" : ""}>
                          {u.role}
                        </Badge>
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
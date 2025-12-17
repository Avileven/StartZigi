"use client";
import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities.js';
import { CoFounderInvitation } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Mail, 
  Users, 
  CheckCircle,
  Clock,
  X,
  Loader2
} from 'lucide-react';

export default function InviteCoFounder() {
  const [venture, setVenture] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
     const userVentures = await Venture.list("-created_date");
      
      if (userVentures.length > 0) {
        const currentVenture = userVentures[0];
        setVenture(currentVenture);
        
        // Load existing invitations
        const existingInvitations = await CoFounderInvitation.filter({ 
          venture_id: currentVenture.id 
        }, "-created_date");
        setInvitations(existingInvitations);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setInviteForm(prev => ({ ...prev, [field]: value }));
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    if (!venture || !inviteForm.email || !inviteForm.name) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSending(true);
    try {
      const user = await User.me();
      const invitationToken = Math.random().toString(36).substring(2, 15);
      
      // Create invitation record
      await CoFounderInvitation.create({
        venture_id: venture.id,
        inviter_email: user.email,
        invitee_email: inviteForm.email,
        invitee_name: inviteForm.name,
        custom_message: inviteForm.message,
        invitation_token: invitationToken,
        status: 'pending',
        created_by: user.id  // ← הוסף את זה!
      });

      // Send actual email via Resend
const emailResponse = await fetch('/api/send-invite', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: inviteForm.email,
    ventureName: venture.name,
    inviterName: user.name || user.email,
  }),
});

if (emailResponse.ok) {
  alert("Co-founder invitation sent successfully! An email has been sent to " + inviteForm.email);
} else {
  alert("Invitation created but email sending failed. The invitation is still recorded.");
}

      /// ** שינוי זמני: ביטול ספירת המייסדים המיידית **
// הקוד להלן בוטל, מכיוון שהספירה צריכה להתבצע רק לאחר אישור בדף הנחיתה (/join).
/*
await Venture.update(venture.id, {
  founders_count: (venture.founders_count || 1) + 1
});
*/

      // Create board message
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'co_founder_invite',
        title: '👥 Co-Founder Invited!',
        content: `You've sent a co-founder invitation to ${inviteForm.name} (${inviteForm.email}). Your team is growing stronger!`,
        priority: 2
      });

      // Reset form and reload data
      setInviteForm({ email: '', name: '', message: '' });
      loadData();

    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Failed to send invitation. Please try again.");
    }
    setIsSending(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Venture Found</h1>
        <p className="text-gray-600">You need to create a venture before inviting co-founders.</p>
      </div>
    );
  }

  const hasAcceptedCoFounder = invitations.some(inv => inv.status === 'accepted');

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Invite a Co-Founder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A strong founding team is crucial for success. Invite someone to join your venture and build something amazing together.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Invitation Form */}
          <div className="lg:col-span-2">
            {!hasAcceptedCoFounder ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    Send Co-Founder Invitation
                  </CardTitle>
                  <CardDescription>
                    Invite someone to join {venture.name} as a co-founder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={sendInvitation} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={inviteForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter their full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter their email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={inviteForm.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Add a personal message explaining why you'd like them to join..."
                        className="h-24"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSending} 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Invitation...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-green-900 mb-2">Co-Founder Added!</h3>
                  <p className="text-green-700">
                    Great news! You already have a co-founder on your team. Your venture is stronger with multiple founders.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Founders</span>
                    <Badge>{venture.founders_count || 1}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Invitations Sent</span>
                    <Badge variant="outline">{invitations.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invitations List */}
            {invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sent Invitations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="p-3 border-b last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{invitation.invitee_name}</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(invitation.status)}
                            <Badge className={getStatusColor(invitation.status)}>
                              {invitation.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{invitation.invitee_email}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

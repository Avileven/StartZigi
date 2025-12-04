"use client";
import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { PromotionCampaign } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Send, Info } from 'lucide-react';

// Mock for createPageUrl - assuming it constructs paths based on page names
// In a real application, this would likely come from a router helper or configuration.
const createPageUrl = (pageName) => {
  switch (pageName) {
    case 'BetaTesting':
      return '/beta-testing'; // Example path for beta testing page
    // Add other cases as needed for different page names
    default:
      return '/'; // Default path
  }
};

// Mock for SendEmail - simulating an async API call to an email service
// In a real application, this would be an actual API call to a backend service that dispatches emails.
const SendEmail = async ({ from_name, to, subject, body }) => {
  console.log(`--- Simulating Email Send ---`);
  console.log(`From: ${from_name}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: \n${body}`);
  console.log(`------------------------------`);
  // Simulate network delay for API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: `Email simulated and "sent" to ${to}` };
};


export default function EmailPromotion({ goBack }) {
  const [currentVenture, setCurrentVenture] = useState(null);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [senderName, setSenderName] = useState('');
  const [personalNote, setPersonalNote] = useState(''); // Note: This state is not currently used in the email body as per the implementation outline.
  const [emailSubject, setEmailSubject] = useState(''); // Note: This state is not currently used in the email subject as per the implementation outline.
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // Renamed from isLaunching to reflect "sending" action

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        const userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (userVentures.length > 0) {
          const venture = userVentures[0];
          setCurrentVenture(venture);
          setSenderName(user.full_name);
          // Initial subject, but the actual email subject will be hardcoded as per the outline's logic below.
          setEmailSubject(`${user.full_name} invites you to check out ${venture.name}`);
        }
      } catch (error) {
        console.error("Error loading ventures:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleLaunch = async () => { // Renamed from handleLaunch to handleSend in outline, but keeping handleLaunch to align with existing component structure.
    // Ensure a venture is selected
    if (!currentVenture) {
        alert("No active venture found. Please ensure you have created one.");
        return;
    }

    // Parse recipient emails
    const emails = recipientEmails.split(/[\n,]+/).map(e => e.trim()).filter(e => e);

    // Validate sender name and recipients
    if (!senderName.trim() || emails.length === 0) {
      alert('Please enter your name and at least one recipient email address.');
      return;
    }
    
    setIsSending(true); // Start sending process

    try {
      // Create campaign record
      const campaign = await PromotionCampaign.create({
        venture_id: currentVenture.id,
        campaign_type: 'email',
        audience_size: emails.length,
        cost: 0,
        sender_name: senderName,
      });

      // Determine the correct URL based on venture phase
      const inviteUrl = currentVenture.phase === 'beta' 
        ? `${window.location.origin}${createPageUrl('BetaTesting')}?id=${currentVenture.id}`
        : currentVenture.landing_page_url;

      // Prepare email sending promises for all recipients
      const emailPromises = emails.map(email => 
        SendEmail({
          from_name: senderName,
          to: email.trim(),
          // Subject line is hardcoded as per the outline's specification
          subject: `Check out ${currentVenture.name} - I'd love your feedback!`,
          // Email body is a standard template as per the outline's specification
          body: `Hi!

I'm working on an exciting new project called ${currentVenture.name} and would really value your opinion.

${currentVenture.description}

Could you take a quick look and let me know what you think? Your feedback would mean a lot to me.

Check it out here: ${inviteUrl}

Thanks!
${senderName}`
        })
      );

      // Execute all email sending simulations concurrently
      await Promise.all(emailPromises);

      // Success alert as per the outline
      alert(`Invitations sent successfully to ${emails.length} contacts!`);
      
      goBack(); // Navigate back after successful campaign launch

    } catch (error) {
      console.error("Error sending invitations:", error); // Updated error message
      alert("Failed to send invitations. Please try again."); // Updated user-facing message
    } finally {
      setIsSending(false); // Ensure loading state is reset
    }
  };
  
  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>;
  }

  if (!currentVenture) {
    return (
       <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-4">No Venture Found</h1>
        <p className="text-gray-600 mb-6">You need to create a venture before you can promote it.</p>
        <Button onClick={goBack} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button onClick={goBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Promotion Center
        </Button>
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Simulation Mode</p>
            <p>This feature simulates sending emails to external contacts. The emails won't actually be sent, but you'll get realistic campaign metrics and experience the full promotion workflow.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Email Invite</CardTitle>
            <CardDescription>Simulate direct email outreach to your external contacts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>1. Your Active Venture</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{currentVenture.name}</p>
                    <p className="text-sm text-gray-600">{currentVenture.description}</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">2. Email Subject Line</Label>
              <Input 
                id="email-subject" 
                value={emailSubject} 
                onChange={e => setEmailSubject(e.target.value)} 
                placeholder="Subject line for your invitation email" 
                disabled={isSending}
              />
              <p className="text-xs text-gray-500">
                This will appear as the subject of the email your contacts receive. 
                <span className="font-medium text-red-600"> Currently, the subject is a standard template: "Check out [Venture Name] - I'd love your feedback!"</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-name">3. Your Name / Team for Signature</Label>
              <Input 
                id="sender-name" 
                value={senderName} 
                onChange={e => setSenderName(e.target.value)} 
                placeholder="e.g., Avi from QuitFlow" 
                disabled={isSending}
              />
              <p className="text-xs text-gray-500">This is how you'll be identified in the email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personal-note">4. Personal Note (Optional)</Label>
              <Textarea 
                id="personal-note" 
                value={personalNote} 
                onChange={e => setPersonalNote(e.target.value)} 
                placeholder="Add a personal message to help recipients understand why you're reaching out..."
                className="h-24"
                disabled={isSending}
              />
              <p className="text-xs text-gray-500">
                This personal note will be included in the email to make it more meaningful for your contacts. 
                <span className="font-medium text-red-600"> Currently, the email body is a standard template and this note is not included.</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-emails">5. Recipient Email Addresses</Label>
              <Textarea 
                id="recipient-emails" 
                value={recipientEmails} 
                onChange={e => setRecipientEmails(e.target.value)} 
                placeholder="Enter emails separated by commas or new lines&#10;example@gmail.com&#10;friend@hotmail.com&#10;colleague@company.com" 
                className="h-32" 
                disabled={isSending}
              />
              <p className="text-xs text-gray-500">These emails will be simulated, not actually sent</p>
            </div>

            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
              <p className="font-medium">This service is currently free!</p>
            </div>

            <Button onClick={handleLaunch} disabled={isSending} className="w-full">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {isSending ? 'Sending invitations...' : 'Simulate Email Campaign'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

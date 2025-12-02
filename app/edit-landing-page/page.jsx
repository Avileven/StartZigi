"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Venture } from '@/src/api/entities';
import { User } from '@/src/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ExternalLink, Lightbulb, Target } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EditLandingPage() {
  const [venture, setVenture] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problem: '',
    solution: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadVentureData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        setFormData({
          name: currentVenture.name || '',
          description: currentVenture.description || '',
          problem: currentVenture.problem || '',
          solution: currentVenture.solution || '',
        });
      }
    } catch (error) {
      console.error("Error loading venture data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadVentureData();
  }, [loadVentureData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!venture) return;
    setIsSaving(true);
    try {
      await Venture.update(venture.id, formData);
      alert("Landing page updated successfully!");
      // Optionally refresh data
      setVenture(prev => ({ ...prev, ...formData }));
    } catch (error) {
      console.error("Error saving landing page data:", error);
      alert("Failed to save changes. Please try again.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Venture Found</h1>
        <p className="text-gray-600 mb-6">You need to create a venture before you can edit its landing page.</p>
        <RouterLink to={createPageUrl("CreateVenture")}>
          <Button>Create Your Venture</Button>
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Edit Venture Landing Page</h1>
            <p className="text-lg text-gray-600">Update the core content of your public-facing venture page.</p>
          </div>
          <a href={venture.landing_page_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Page
            </Button>
          </a>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Venture Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your venture's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Brief Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="A short, catchy summary of your venture."
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem" className="text-base">The Problem</Label>
              <Textarea
                id="problem"
                value={formData.problem}
                onChange={(e) => handleChange('problem', e.target.value)}
                placeholder="Describe the pain point your venture is solving."
                className="h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution" className="text-base">Your Solution</Label>
              <Textarea
                id="solution"
                value={formData.solution}
                onChange={(e) => handleChange('solution', e.target.value)}
                placeholder="Explain how your venture solves the problem."
                className="h-32"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
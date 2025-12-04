"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import MentorButton from "@/components/mentor/MentorButton";
import MentorModal from "@/components/mentor/MentorModal";

export default function MentorDemo() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    problem: "",
    solution: ""
  });
  const [mentorModal, setMentorModal] = useState({
    isOpen: false,
    sectionId: '',
    sectionTitle: '',
    fieldKey: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
    setMentorModal({
      isOpen: true,
      sectionId,
      sectionTitle,
      fieldKey
    });
  };

  const closeMentorModal = () => {
    setMentorModal({
      isOpen: false,
      sectionId: '',
      sectionTitle: '',
      fieldKey: ''
    });
  };

  const handleMentorUpdate = (newValue) => {
    if (mentorModal.fieldKey) {
      setFormData(prev => ({ ...prev, [mentorModal.fieldKey]: newValue }));
    }
  };

  const handleComplete = () => {
    console.log("Form data captured:", formData);
    alert("Demo complete! Check console for captured data.");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link 
              to={createPageUrl("Dashboard")} 
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">AI Mentor Demo</CardTitle>
              <p className="text-center text-gray-600">
                Test the mentor system with the four key venture fields
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="name">Venture Name</Label>
                  <MentorButton 
                    onClick={() => openMentorModal('venture_name', 'Venture Name', 'name')}
                  />
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your venture name..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Brief Description</Label>
                  <MentorButton 
                    onClick={() => openMentorModal('brief_description', 'Brief Description', 'description')}
                  />
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your venture..."
                  className="h-24"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="problem">What Problem Are You Solving?</Label>
                  <MentorButton 
                    onClick={() => openMentorModal('problem_statement', 'Problem Statement', 'problem')}
                  />
                </div>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(e) => handleChange("problem", e.target.value)}
                  placeholder="Describe the problem..."
                  className="h-32"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="solution">Your Proposed Solution</Label>
                  <MentorButton 
                    onClick={() => openMentorModal('proposed_solution', 'Proposed Solution', 'solution')}
                  />
                </div>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => handleChange("solution", e.target.value)}
                  placeholder="Describe your solution..."
                  className="h-32"
                />
              </div>

              <Button 
                onClick={handleComplete}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Complete Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <MentorModal
        isOpen={mentorModal.isOpen}
        onClose={closeMentorModal}
        sectionId={mentorModal.sectionId}
        sectionTitle={mentorModal.sectionTitle}
        fieldValue={formData[mentorModal.fieldKey]}
        onUpdateField={handleMentorUpdate}
      />
    </>
  );
}
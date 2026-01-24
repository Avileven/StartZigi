"use client";
import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Loader2, Upload, FileText, CheckCircle, Rocket, Heart, Repeat, Info } from 'lucide-react';
import MentorButton from '@/components/mentor/MentorButton.jsx';
import MentorModal from '@/components/mentor/MentorModal';
import StaticGuidanceViewer from '@/components/mentor/StaticGuidanceViewer';

export default function MLPDevelopment() {
  const [venture, setVenture] = useState(null);
  const [mlpData, setMlpData] = useState({
    product_evolution: '',
    refinement_roadmap: '',
    uploaded_files: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [staticGuidanceModal, setStaticGuidanceModal] = useState({
    isOpen: false,
    sectionId: ''
  });
  const [mentorModal, setMentorModal] = useState({
    isOpen: false,
    sectionId: '',
    sectionTitle: '',
    fieldKey: ''
  });
  const router = useRouter();

  useEffect(() => {
    const loadVenture = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          if (currentVenture.mlp_data) {
            setMlpData({
              product_evolution: currentVenture.mlp_data.product_evolution || '',
              refinement_roadmap: currentVenture.mlp_data.refinement_roadmap || '',
              uploaded_files: currentVenture.mlp_data.uploaded_files || []
            });
          }
        }
      } catch (error) {
        console.error("Error loading venture:", error);
      }
      setIsLoading(false);
    };
    loadVenture();
  }, []);

  const handleInputChange = (field, value) => {
    setMlpData(prev => ({ ...prev, [field]: value }));
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
      setMlpData(prev => ({ ...prev, [mentorModal.fieldKey]: newValue }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await UploadFile({ file });
        uploadedUrls.push({ name: file.name, url: file_url });
      }
      setMlpData(prev => ({
        ...prev,
        uploaded_files: [...prev.uploaded_files, ...uploadedUrls]
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
    }
    setIsUploading(false);
  };

  const handleRemoveFile = (fileIndex) => {
    setMlpData(prev => ({
      ...prev,
      uploaded_files: prev.uploaded_files.filter((_, index) => index !== fileIndex)
    }));
  };

  const handleSave = async () => {
    if (!venture) return;

    setIsSaving(true);
    try {
      await Venture.update(venture.id, {
        mlp_data: mlpData
      });
      alert("MLP Development saved successfully!");
    } catch (error) {
      console.error("Error saving MLP data:", error);
      alert("Error saving data. Please try again.");
    }
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!venture) return;

    if (!mlpData.product_evolution.trim() || !mlpData.refinement_roadmap.trim()) {
      alert("Please complete all required sections before submitting.");
      return;
    }

    setIsSaving(true);
    try {
      await Venture.update(venture.id, {
        mlp_data: mlpData,
        mlp_completed: true,
        phase: 'beta'
      });

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_complete',
        title: '💖 MLP Phase Complete!',
        content: `Congratulations! You've completed your Minimum Lovable Product development. You're now ready to enter the Beta phase and gather more extensive user feedback.`,
        phase: 'mlp',
        priority: 3
      });

      router.push(createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Error submitting MLP:", error);
      alert("Error submitting MLP. Please try again.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please create a venture first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = (() => {
    let completed = 0;
    if (mlpData.product_evolution.trim()) completed += 50;
    if (mlpData.refinement_roadmap.trim()) completed += 50;
    return completed;
  })();

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">MLP Development Center</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your MVP into a Minimum Lovable Product by refining based on user feedback and planning your next iteration.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                <span className="text-sm font-bold text-indigo-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Section 1: Product Evolution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-pink-500" />
                  1️⃣ Product Evolution
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_product_evolution' })}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <Info className="w-4 h-4" />
                      Tips
                    </Button>
                    <MentorButton 
                      onClick={() => openMentorModal('mlp_product_evolution', 'Product Evolution', 'product_evolution')}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="product_evolution">
                  How has your product evolved based on MVP feedback? What improvements have you made?
                </Label>
                <Textarea
                  id="product_evolution"
                  value={mlpData.product_evolution}
                  onChange={(e) => handleInputChange('product_evolution', e.target.value)}
                  placeholder="Describe the changes and improvements you've implemented based on user feedback from the MVP phase..."
                  className="mt-2 min-h-[150px]"
                />
              </CardContent>
            </Card>

            {/* Section 2: Refinement Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-indigo-500" />
                  2️⃣ Refinement Roadmap
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_refinement_roadmap' })}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <Info className="w-4 h-4" />
                      Tips
                    </Button>
                    <MentorButton 
                      onClick={() => openMentorModal('mlp_refinement_roadmap', 'Refinement Roadmap', 'refinement_roadmap')}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="refinement_roadmap">
                  What is your plan for continued product refinement? What features or improvements are next?
                </Label>
                <Textarea
                  id="refinement_roadmap"
                  value={mlpData.refinement_roadmap}
                  onChange={(e) => handleInputChange('refinement_roadmap', e.target.value)}
                  placeholder="Outline your roadmap for the next iteration, including planned features, improvements, and timeline..."
                  className="mt-2 min-h-[150px]"
                />
              </CardContent>
            </Card>

            {/* Section 3: Upload Revised Mockups/Designs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-500" />
                  3️⃣ Upload Revised Mockups & Designs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Upload updated mockups, designs, or prototypes that reflect your MLP improvements.
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.fig,.sketch"
                    onChange={handleFileUpload}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                </div>

                {mlpData.uploaded_files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-900">Uploaded Files:</h4>
                    {mlpData.uploaded_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {file.name}
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Progress'}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSaving || completionPercentage < 100}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Complete MLP & Move to Beta</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StaticGuidanceViewer
        isOpen={staticGuidanceModal.isOpen}
        onClose={() => setStaticGuidanceModal({ isOpen: false, sectionId: '' })}
        sectionId={staticGuidanceModal.sectionId}
      />

      <MentorModal
        isOpen={mentorModal.isOpen}
        onClose={closeMentorModal}
        sectionId={mentorModal.sectionId}
        sectionTitle={mentorModal.sectionTitle}
        fieldValue={mlpData[mentorModal.fieldKey]}
        onUpdateField={handleMentorUpdate}
        ventureId={venture?.id} // השורה שהחזירה לנו את הפוקוס
      />
    </>
  );
}
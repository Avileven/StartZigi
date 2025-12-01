
import React, { useState, useEffect } from 'react';
import { Venture } from '@/src/api/entities';
import { VentureMessage } from '@/src/api/entities';
import { User } from '@/src/api/entities';
import { UploadFile } from '@/src/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Loader2, Upload, FileText, CheckCircle, Rocket, Wrench, Plus, Trash2, Info, ExternalLink } from 'lucide-react';
import MentorButton from '@/components/mentor/MentorButton';
import MentorModal from '@/components/mentor/MentorModal';
import StaticGuidanceViewer from '@/components/mentor/StaticGuidanceViewer';

export default function MVPDevelopment() {
  const [venture, setVenture] = useState(null);
  const [mvpData, setMvpData] = useState({
    product_definition: '',
    technical_specs: '',
    user_testing: '',
    feature_matrix: [],
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productDefinition: '',
    technicalSpecs: '',
    userTesting: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [featureMatrix, setFeatureMatrix] = useState([]);

  useEffect(() => {
    const loadVenture = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          if (currentVenture.mvp_data) {
            setFormData({
              productDefinition: currentVenture.mvp_data.product_definition || '',
              technicalSpecs: currentVenture.mvp_data.technical_specs || '',
              userTesting: currentVenture.mvp_data.user_testing || ''
            });
            setUploadedFiles(currentVenture.mvp_data.uploaded_files || []);
            setFeatureMatrix(currentVenture.mvp_data.feature_matrix || []);
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
    setFormData(prev => ({ ...prev, [field]: value }));
    setMvpData(prev => ({ ...prev, [field]: value }));
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
      setMvpData(prev => ({ ...prev, [mentorModal.fieldKey]: newValue }));
    }
  };

  const handleAddFeature = () => {
    const newFeature = {
      id: `feature_${Date.now()}`,
      featureName: '',
      userCriticality: 5,
      implementationEase: 5,
      priorityScore: 25,
      isSelected: false
    };
    setFeatureMatrix(prev => [...prev, newFeature]);
    setMvpData(prev => ({
      ...prev,
      feature_matrix: [...prev.feature_matrix, newFeature]
    }));
  };

  const handleRemoveFeature = (featureId) => {
    setFeatureMatrix(prev => prev.filter(f => f.id !== featureId));
    setMvpData(prev => ({
      ...prev,
      feature_matrix: prev.feature_matrix.filter(f => f.id !== featureId)
    }));
  };

  const handleFeatureChange = (featureId, field, value) => {
    setFeatureMatrix(prev =>
      prev.map(f => {
        if (f.id === featureId) {
          const updated = { ...f, [field]: value };
          if (field === 'userCriticality' || field === 'implementationEase') {
            const criticality = field === 'userCriticality' ? value : updated.userCriticality;
            const ease = field === 'implementationEase' ? value : updated.implementationEase;
            updated.priorityScore = criticality * ease;
          }
          return updated;
        }
        return f;
      })
    );
    setMvpData(prev => ({
      ...prev,
      feature_matrix: prev.feature_matrix.map(f => {
        if (f.id === featureId) {
          const updated = { ...f, [field]: value };
          if (field === 'userCriticality' || field === 'implementationEase') {
            const criticality = field === 'userCriticality' ? value : updated.userCriticality;
            const ease = field === 'implementationEase' ? value : updated.implementationEase;
            updated.priorityScore = criticality * ease;
          }
          return updated;
        }
        return f;
      })
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url,
          uploaded_at: new Date().toISOString()
        };
      });

      const uploadedFilesResult = await Promise.all(uploadPromises);
      
      setUploadedFiles(uploadedFilesResult);
      setMvpData(prev => ({
        ...prev,
        uploaded_files: uploadedFilesResult
      }));

      alert(`${files.length} file(s) uploaded successfully! Previous files have been replaced.`);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("There was an error uploading your files. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSaveDraft = async () => {
    if (!venture) return;
    setIsSaving(true);
    try {
      await Venture.update(venture.id, { mvp_data: mvpData });
      alert('Draft saved successfully!');
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft.");
    }
    setIsSaving(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const mvpPayload = {
        product_definition: formData.productDefinition,
        technical_specs: formData.technicalSpecs,
        user_testing: formData.userTesting,
        uploaded_files: uploadedFiles,
        feature_matrix: featureMatrix
      };

      await Venture.update(venture.id, {
        mvp_uploaded: true,
        mvp_data: mvpPayload,
        phase: 'mvp'
      });

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_complete',
        title: '🎉 MVP Uploaded Successfully!',
        content: `Great work! Your MVP for "${venture.name}" has been documented and uploaded. You can now proceed to revenue modeling.`,
        phase: 'mvp',
        priority: 3
      });

      alert("MVP submitted successfully! You can now proceed to Revenue Modeling.");
      navigate(createPageUrl('Dashboard'));

    } catch (error) {
      console.error("Error submitting MVP:", error);
      alert("There was an error submitting your MVP. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Define the criteria for submission based on the new handleSubmit logic
  const canSubmit = formData.productDefinition.trim() && formData.technicalSpecs.trim() && formData.userTesting.trim();

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MVP Development Center</h1>
            <p className="text-gray-600">Build and document your Minimum Viable Product</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                1️⃣ Product Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Label>Describe what your MVP does and what problem it solves</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mvp_definition' })}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    <Info className="w-4 h-4" />
                    Tips
                  </Button>
                  <MentorButton 
                    onClick={() => openMentorModal('mvp_definition', 'Product Definition', 'productDefinition')}
                  />
                </div>
              </div>
              <Textarea
                value={formData.productDefinition}
                onChange={(e) => handleInputChange('productDefinition', e.target.value)}
                placeholder="Describe what your MVP does and what problem it solves..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                2️⃣ Technical Approach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Label>Describe the technology stack and development approach</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'technical_approach' })}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    <Info className="w-4 h-4" />
                    Tips
                  </Button>
                  <MentorButton 
                    onClick={() => openMentorModal('technical_approach', 'Technical Approach', 'technicalSpecs')}
                  />
                </div>
              </div>
              <Textarea
                value={formData.technicalSpecs}
                onChange={(e) => handleInputChange('technicalSpecs', e.target.value)}
                placeholder="Describe the technology stack and development approach..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                3️⃣ User Testing Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Label>Explain how you will test your MVP with users</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'user_testing' })}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    <Info className="w-4 h-4" />
                    Tips
                  </Button>
                  <MentorButton 
                    onClick={() => openMentorModal('user_testing', 'User Testing Plan', 'userTesting')}
                  />
                </div>
              </div>
              <Textarea
                value={formData.userTesting}
                onChange={(e) => handleInputChange('userTesting', e.target.value)}
                placeholder="Explain how you will test your MVP with users..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                4️⃣ Feature Evaluation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      List potential features and prioritize them to define the scope of your MVP.
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      Priority Score Formula: User Criticality × Implementation Ease. A higher score indicates a higher priority feature.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'feature_evaluation_matrix' })}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <Info className="w-4 h-4" />
                      Tips
                    </Button>
                    <MentorButton 
                      onClick={() => openMentorModal('feature_evaluation_matrix', 'Feature Evaluation Matrix', 'feature_matrix')}
                    />
                  </div>
                </div>
                
                {featureMatrix.map((feature) => (
                  <Card key={feature.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={feature.isSelected}
                            onCheckedChange={(checked) => handleFeatureChange(feature.id, 'isSelected', checked)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Input
                              value={feature.featureName}
                              onChange={(e) => handleFeatureChange(feature.id, 'featureName', e.target.value)}
                              placeholder="Feature name..."
                              className="font-semibold mb-3"
                            />
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs mb-2 block">User Criticality (1-10)</Label>
                                <Slider
                                  value={[feature.userCriticality || 5]}
                                  onValueChange={(value) => handleFeatureChange(feature.id, 'userCriticality', value[0])}
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="mb-2"
                                />
                                <div className="text-center text-sm font-semibold text-indigo-600">
                                  {feature.userCriticality || 5}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-2 block">Implementation Ease (1-10)</Label>
                                <Slider
                                  value={[feature.implementationEase || 5]}
                                  onValueChange={(value) => handleFeatureChange(feature.id, 'implementationEase', value[0])}
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="mb-2"
                                />
                                <div className="text-center text-sm font-semibold text-indigo-600">
                                  {feature.implementationEase || 5}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-2 block">Priority Score</Label>
                                <div className="h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl font-bold text-green-800">
                                    {feature.priorityScore || 25}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFeature(feature.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  onClick={handleAddFeature}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>

                {featureMatrix.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-900 mb-2">Selected MVP Features:</h4>
                    <p className="text-xs text-blue-700 mb-2">This is the core feature set for your initial product launch.</p>
                    <div className="space-y-1">
                      {featureMatrix.filter(f => f.isSelected).map(feature => (
                        <div key={feature.id} className="text-sm text-blue-700">
                          ✓ {feature.featureName || 'Unnamed Feature'} (Priority Score: {feature.priorityScore})
                        </div>
                      ))}
                      {featureMatrix.filter(f => f.isSelected).length === 0 && (
                        <p className="text-sm text-blue-600">No features selected yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                5️⃣ Upload MVP Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="file-upload">Upload mockups, prototypes, or demo files</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mvp_files_demos' })}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    <Info className="w-4 h-4" />
                    Tips
                  </Button>
                </div>

                <div className="mb-4">
                  <a 
                    href="https://venture-launch-ai-copy-117d4499.base44.app/MVPBuilder" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      size="lg"
                    >
                      <Wrench className="w-5 h-5 mr-2" />
                      Launch MVP Prototype Builder
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>

                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-2"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading files...
                  </div>
                )}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <FileText className="w-4 h-4 text-gray-500" />
                        {file.url ? (
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {file.name}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-700">{file.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleSaveDraft}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting} // Button disabled if not 'canSubmit' or if 'isSaving'
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit MVP Documentation
            </Button>
          </div>

          {/* Display warning if not all required fields for submission are filled */}
          {!canSubmit && (
            <p className="text-sm text-amber-600 text-center mt-4">
              Please complete at least the Product Definition, Technical Approach, and User Testing Plan sections to enable submission.
            </p>
          )}
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
        fieldValue={formData[mentorModal.fieldKey]}
        onUpdateField={handleMentorUpdate}
      />
    </>
  );
}

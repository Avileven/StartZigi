//business plan 25126
"use client"
import React, { useState, useEffect, useCallback } from "react";
import { businessPlan as businessPlanEntity } from "@/api/entities";
import { Budget } from "@/api/entities";
import { Venture } from "@/api/entities";
import { VentureMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createPageUrl } from "@/lib/utils";
import MentorButton from "@/components/mentor/MentorButton";
import MentorModal from "@/components/mentor/MentorModal";
import StaticGuidanceViewer from "@/components/mentor/StaticGuidanceViewer";


export default function businessPlan() {
  const [venture, setVenture] = useState(null);
  const [mission, setMission] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [marketSize, setMarketSize] = useState("");
  const [targetCustomers, setTargetCustomers] = useState("");
  const [competition, setCompetition] = useState("");
  const [entrepreneurBackground, setEntrepreneurBackground] = useState("");
  const [revenueModel, setRevenueModel] = useState("");
  const [fundingRequirements, setFundingRequirements] = useState("");


  const [salaries, setSalaries] = useState([{ id: '1', role: 'Founder', count: 1, avg_salary: 5000 }]);
  const [marketingCosts, setMarketingCosts] = useState([{ id: '1', channel: 'Social Media Ads', cost: 1000 }]);
  const [operationalCosts, setOperationalCosts] = useState([{ id: '1', item: 'Office Rent', cost: 2000 }]);


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [staticGuidanceModal, setStaticGuidanceModal] = useState({ isOpen: false, sectionId: '' });
  const [mentorModal, setMentorModal] = useState({ isOpen: false, sectionId: '', sectionTitle: '', fieldKey: '' });
 
  const router = useRouter();


  const debugSupabaseError = async (context, error, payload = null) => {
  console.groupCollapsed(`❌ [Supabase ${context}]`);
  console.error("Message:", error?.message || error);


  if (payload) console.log("Payload:", payload);


  // Supabase v2 returns richer error objects
  if (error && typeof error === "object") {
    for (const key of Object.keys(error)) {
      console.log(`${key}:`, error[key]);
    }
  }


  // In case it's a fetch response:
  if (error?.response) {
    try {
      const data = await error.response.json();
      console.log("Response JSON:", data);
    } catch (_) {}
  }


  console.groupEnd();
};




  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const ventures = await Venture.filter({ created_by: user.email }, "-created_date");


      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);


        const existingPlans = await businessPlanEntity.filter({ venture_id: currentVenture.id });


        if (existingPlans.length > 0) {
          const plan = existingPlans[0];
          setMission(plan.mission || "");
          setProblem(plan.problem || "");
          setSolution(plan.solution || "");
          setProductDetails(plan.product_details || "");
          setMarketSize(plan.market_size || "");
          setTargetCustomers(plan.target_customers || "");
          setCompetition(plan.competition || "");
          setEntrepreneurBackground(plan.entrepreneur_background || "");
          setRevenueModel(plan.revenue_model || "");
          setFundingRequirements(plan.funding_requirements || "");
        }


        const existingBudgets = await Budget.filter({ venture_id: currentVenture.id });
        if (existingBudgets.length > 0) {
          const budget = existingBudgets[0];
          if (budget.salaries && budget.salaries.length > 0) setSalaries(budget.salaries);
          if (budget.marketing_costs && budget.marketing_costs.length > 0) setMarketingCosts(budget.marketing_costs);
          if (budget.operational_costs && budget.operational_costs.length > 0) setOperationalCosts(budget.operational_costs);
        }
      }
    } catch (error) {
      debugSupabaseError("loadData", error);
      console.error("Error loading business plan:", error);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    loadData();
  }, [loadData]);


  const addSalaryRow = () => {
    setSalaries([...salaries, { id: Date.now().toString(), role: '', count: 1, avg_salary: 0 }]);
  };


  const removeSalaryRow = (id) => {
    setSalaries(salaries.filter(s => s.id !== id));
  };


  const updateSalary = (id, field, value) => {
    setSalaries(salaries.map(s => s.id === id ? { ...s, [field]: value } : s));
  };


  const addMarketingRow = () => {
    setMarketingCosts([...marketingCosts, { id: Date.now().toString(), channel: '', cost: 0 }]);
  };


  const removeMarketingRow = (id) => {
    setMarketingCosts(marketingCosts.filter(m => m.id !== id));
  };


  const updateMarketing = (id, field, value) => {
    setMarketingCosts(marketingCosts.map(m => m.id === id ? { ...m, [field]: value } : m));
  };


  const addOperationalRow = () => {
    setOperationalCosts([...operationalCosts, { id: Date.now().toString(), item: '', cost: 0 }]);
  };


  const removeOperationalRow = (id) => {
    setOperationalCosts(operationalCosts.filter(o => o.id !== id));
  };


  const updateOperational = (id, field, value) => {
    setOperationalCosts(operationalCosts.map(o => o.id === id ? { ...o, [field]: value } : o));
  };


  const calculateTotalBudget = () => {
    const totalSalaries = salaries.reduce((sum, s) => sum + (s.count * s.avg_salary * 12), 0);
    const totalMarketing = marketingCosts.reduce((sum, m) => sum + (m.cost * 12), 0);
    const totalOperational = operationalCosts.reduce((sum, o) => sum + (o.cost * 12), 0);
    return {
      salaries: totalSalaries,
      marketing: totalMarketing,
      operational: totalOperational,
      total: totalSalaries + totalMarketing + totalOperational,
      monthlyBurn: (totalSalaries + totalMarketing + totalOperational) / 12
    };
  };


  const calculateCompletion = () => {
    const sections = [
      mission, problem, solution, productDetails, marketSize,
      targetCustomers, competition, entrepreneurBackground, revenueModel, fundingRequirements
    ];
    const completed = sections.filter(s => s.trim().length >= 50).length;
    return Math.round((completed / sections.length) * 100);
  };


  const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
    setMentorModal({ isOpen: true, sectionId, sectionTitle, fieldKey });
  };


  const closeMentorModal = () => {
    setMentorModal({ isOpen: false, sectionId: '', sectionTitle: '', fieldKey: '' });
  };


  const handleMentorUpdate = (newValue) => {
    if (mentorModal.fieldKey) {
      const setters = {
        mission: setMission,
        problem: setProblem,
        solution: setSolution,
        productDetails: setProductDetails,
        marketSize: setMarketSize,
        targetCustomers: setTargetCustomers,
        competition: setCompetition,
        entrepreneurBackground: setEntrepreneurBackground,
        revenueModel: setRevenueModel,
        fundingRequirements: setFundingRequirements
      };
      if (setters[mentorModal.fieldKey]) {
        setters[mentorModal.fieldKey](newValue);
      }
    }
  };


  // Safe getter instead of eval()
  const getFieldValue = (fieldKey) => {
    switch (fieldKey) {
      case 'mission': return mission;
      case 'problem': return problem;
      case 'solution': return solution;
      case 'productDetails': return productDetails;
      case 'marketSize': return marketSize;
      case 'targetCustomers': return targetCustomers;
      case 'competition': return competition;
      case 'entrepreneurBackground': return entrepreneurBackground;
      case 'revenueModel': return revenueModel;
      case 'fundingRequirements': return fundingRequirements;
      default: return '';
    }
  };


  const handleSave = async () => {
    if (!venture) return;


    setIsSaving(true);
    try {
      const user = await User.me();   // need this!
      const planData = {
        venture_id: venture.id,
        created_by_id: user.id || null,
        created_by: user.email,     // ←  Supabase ז400
        mission,
        problem,
        solution,
        product_details: productDetails,
        market_size: marketSize,
        target_customers: targetCustomers,
        competition,
        entrepreneur_background: entrepreneurBackground,
        revenue_model: revenueModel,
        funding_requirements: fundingRequirements,
        completion_percentage: calculateCompletion()
      };


      const existingPlans = await businessPlanEntity.filter({ venture_id: venture.id });
      if (existingPlans.length > 0) {
        await businessPlanEntity.update(existingPlans[0].id, planData);
      } else {
        await businessPlanEntity.create(planData);
      }


      const budgetData = {
        venture_id: venture.id,
        salaries,
        marketing_costs: marketingCosts,
        operational_costs: operationalCosts,
        is_complete: true,
        created_by: user.email,
        created_by_id: user.id || null,
      };


      const existingBudgets = await Budget.filter({ venture_id: venture.id });
      if (existingBudgets.length > 0) {
        await Budget.update(existingBudgets[0].id, budgetData);
      } else {
        await Budget.create(budgetData);
      }


      const completion = calculateCompletion();
      await Venture.update(venture.id, {
        business_plan_completion: completion,
        funding_plan_completed: true
      });


      if (completion === 100 && venture.phase === 'business_plan') {
  // 1. עדכון הנתונים הפיננסיים ב-Database
  await Venture.update(venture.id, { 
    phase: 'mvp',
    virtual_capital: 15000,          // הזרקת התקציב
    monthly_burn_rate: 5000,        // הגדרת קצב השריפה
    last_burn_deduction: new Date().toISOString().split('T')[0] // איפוס התאריך להיום
  });

  // 2. יצירת ההודעה באנגלית כפי שביקשת
  await VentureMessage.create({
    venture_id: venture.id,
    message_type: 'phase_complete',
    title: '💰 Capital Injection: $15,000',
    content: `Congratulations! Your business plan is 100% complete. A starting capital of $15,000 has been deposited. Note: Your monthly burn rate is now set to $5,000.`,
    phase: 'business_plan',
    created_by: user.email
  });
}


      alert("Business plan and funding plan saved successfully!");
      router.push(createPageUrl("Dashboard"));
    } catch (error) {
      debugSupabaseError("handleSave", error, { ventureId: venture?.id });
      console.error("Error saving business plan:", error);
      alert("There was an error saving your business plan. Please try again.");
    }
    setIsSaving(false);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }


  const budget = calculateTotalBudget();


  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Plan</h1>
              <p className="text-gray-600 mt-2">Build a comprehensive plan for your venture</p>
            </div>
            <Button variant="outline" onClick={() => router.push(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>


          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Business Plan Completion</span>
                <span className="text-sm text-gray-600">{calculateCompletion()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${calculateCompletion()}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Each section requires at least 50 characters</p>
            </CardContent>
          </Card>


          <div className="space-y-6">
            {/* Mission */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>1. Mission Statement</CardTitle>
                    <CardDescription>What is your company's core purpose and vision?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mission_statement' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('mission_statement', 'Mission Statement', 'mission')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="Describe your company's mission..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{mission.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Problem */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>2. Problem Statement</CardTitle>
                    <CardDescription>What specific problem does your venture solve?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'problem_statement' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('problem_statement', 'Problem Statement', 'problem')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the problem..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{problem.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Solution */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>3. Solution Overview</CardTitle>
                    <CardDescription>How does your venture solve this problem?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'proposed_solution' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('proposed_solution', 'Solution Overview', 'solution')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Describe your solution..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{solution.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Product details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>4. Product/Service Details</CardTitle>
                    <CardDescription>Describe your product or service features</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'product_details' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('product_details', 'Product/Service Details', 'productDetails')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  placeholder="Describe your product..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{productDetails.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Market size */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>5. Market Size & Opportunity</CardTitle>
                    <CardDescription>What is the size of your target market?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'market_size' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('market_size', 'Market Size & Opportunity', 'marketSize')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={marketSize}
                  onChange={(e) => setMarketSize(e.target.value)}
                  placeholder="Describe your market..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{marketSize.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Target customers */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>6. Target Customers</CardTitle>
                    <CardDescription>Who are your ideal customers?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'target_customers' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('target_customers', 'Target Customers', 'targetCustomers')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={targetCustomers}
                  onChange={(e) => setTargetCustomers(e.target.value)}
                  placeholder="Describe your target customers..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{targetCustomers.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Competition */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>7. Competitive Landscape</CardTitle>
                    <CardDescription>Who are your main competitors and what's your advantage?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'competition' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('competition', 'Competitive Landscape', 'competition')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  placeholder="Describe your competition..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{competition.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Founder background */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>8. Founder Background</CardTitle>
                    <CardDescription>What makes you and your team qualified?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'entrepreneur_background' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('entrepreneur_background', 'Founder Background', 'entrepreneurBackground')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={entrepreneurBackground}
                  onChange={(e) => setEntrepreneurBackground(e.target.value)}
                  placeholder="Describe your background..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{entrepreneurBackground.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Revenue model */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>9. Revenue Model</CardTitle>
                    <CardDescription>How will your venture make money?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'revenue_model' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('revenue_model', 'Revenue Model', 'revenueModel')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={revenueModel}
                  onChange={(e) => setRevenueModel(e.target.value)}
                  placeholder="Describe how you'll make money..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{revenueModel.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Funding requirements */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>10. Funding Requirements</CardTitle>
                    <CardDescription>How much funding do you need and how will you use it?</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'funding_requirements' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('funding_requirements', 'Funding Requirements', 'fundingRequirements')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={fundingRequirements}
                  onChange={(e) => setFundingRequirements(e.target.value)}
                  placeholder="Describe your funding needs..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">{fundingRequirements.trim().length}/50 characters minimum</p>
              </CardContent>
            </Card>


            {/* Funding plan & budgets (kept intact) */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Funding Plan & Budget Breakdown</CardTitle>
                    <CardDescription>Plan your monthly operational expenses and funding requirements for your first year</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'budget_planning' })}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Tips
                    </Button>
                    <MentorButton onClick={() => openMentorModal('budget_planning', 'Budget Planning', '')} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Team Salaries (Monthly)</h3>
                    <Button type="button" onClick={addSalaryRow} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Role
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {salaries.map((salary) => (
                      <div key={salary.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          <Input
                            value={salary.role}
                            onChange={(e) => updateSalary(salary.id, 'role', e.target.value)}
                            placeholder="Role"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={salary.count}
                            onChange={(e) => updateSalary(salary.id, 'count', parseInt(e.target.value) || 0)}
                            placeholder="Count"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            value={salary.avg_salary}
                            onChange={(e) => updateSalary(salary.id, 'avg_salary', parseInt(e.target.value) || 0)}
                            placeholder="Avg Salary"
                          />
                        </div>
                        <div className="col-span-2 text-sm font-medium">
                          ${(salary.count * salary.avg_salary).toLocaleString()}
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSalaryRow(salary.id)}
                            disabled={salaries.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Total Annual Salaries: ${budget.salaries.toLocaleString()}</p>
                  </div>
                </div>


                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Marketing Costs (Monthly)</h3>
                    <Button type="button" onClick={addMarketingRow} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Channel
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {marketingCosts.map((marketing) => (
                      <div key={marketing.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-6">
                          <Input
                            value={marketing.channel}
                            onChange={(e) => updateMarketing(marketing.id, 'channel', e.target.value)}
                            placeholder="Marketing Channel"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            type="number"
                            value={marketing.cost}
                            onChange={(e) => updateMarketing(marketing.id, 'cost', parseInt(e.target.value) || 0)}
                            placeholder="Monthly Cost"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMarketingRow(marketing.id)}
                            disabled={marketingCosts.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Total Annual Marketing: ${budget.marketing.toLocaleString()}</p>
                  </div>
                </div>


                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Operational Costs (Monthly)</h3>
                    <Button type="button" onClick={addOperationalRow} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cost
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {operationalCosts.map((operational) => (
                      <div key={operational.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-6">
                          <Input
                            value={operational.item}
                            onChange={(e) => updateOperational(operational.id, 'item', e.target.value)}
                            placeholder="Operational Item"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            type="number"
                            value={operational.cost}
                            onChange={(e) => updateOperational(operational.id, 'cost', parseInt(e.target.value) || 0)}
                            placeholder="Monthly Cost"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOperationalRow(operational.id)}
                            disabled={operationalCosts.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium">Total Annual Operations: ${budget.operational.toLocaleString()}</p>
                  </div>
                </div>


                <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4">Total Annual Budget</h3>
                  <p className="text-3xl font-bold text-indigo-600 mb-2">${budget.total.toLocaleString()}</p>
                  <p className="text-sm text-indigo-700">Monthly Burn: ${budget.monthlyBurn.toLocaleString()}</p>
                  <p className="text-xs text-indigo-600 mt-3 italic">
                    This budget serves as a projection for investors and will not impact your actual venture balance until funding is secured.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>


          <div className="sticky bottom-0 bg-white border-t p-4 mt-8">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Business Plan
                </>
              )}
            </Button>
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
        fieldValue={getFieldValue(mentorModal.fieldKey)}
        onUpdateField={handleMentorUpdate}
        ventureId={venture?.id}
      />
    </>
  );
}



import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Investor } from '@/src/api/entities';
import { Venture } from '@/src/api/entities';
import { User } from '@/src/api/entities';
import PitchModal from '@/components/angels/PitchModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Users,
  DollarSign,
  Target,
  Briefcase,
  Rocket,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Search
} from 'lucide-react';

const INVESTORS_PER_PAGE = 3;

export default function AngelArena() {
  const [investors, setInvestors] = useState([]);
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [focusFilter, setFocusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [angelInvestors, user] = await Promise.all([Investor.list(), User.me()]);
        setInvestors(angelInvestors);
        
        const userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (userVentures.length > 0) {
          setVenture(userVentures[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const focusAreas = useMemo(() => {
    const allAreas = new Set(investors.flatMap(investor => investor.focus_sectors));
    return ['all', 'no_preference', ...Array.from(allAreas)];
  }, [investors]);

  const formatMoney = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };
  
  const handleMeetClick = (investor) => {
    if (!venture) {
      alert("Please create a venture first.");
      return;
    }
    setSelectedInvestor(investor);
  };
  
  const handleCloseModal = () => {
    setSelectedInvestor(null);
  };

  const handleFilterChange = (value) => {
    setFocusFilter(value);
    setCurrentPage(0); // Reset to first page on filter change
  };

  const filteredInvestors = useMemo(() => {
    if (focusFilter === 'all') return investors;
    if (focusFilter === 'no_preference') {
      return investors.filter(investor => investor.focus_sectors.length === 0);
    }
    return investors.filter(investor => investor.focus_sectors.includes(focusFilter));
  }, [investors, focusFilter]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredInvestors.length / INVESTORS_PER_PAGE);
  const startIndex = currentPage * INVESTORS_PER_PAGE;
  const currentInvestors = filteredInvestors.slice(startIndex, startIndex + INVESTORS_PER_PAGE);

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Angel Arena</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with experienced angel investors. Meet with them personally to pitch your venture and secure the seed funding you need to grow.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mb-8 max-w-sm mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-500"/>
                  <Label htmlFor="focus-filter" className="font-semibold">Filter by Focus Area</Label>
                </div>
                <Select value={focusFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger id="focus-filter" className="w-full mt-2">
                    <SelectValue placeholder="Select a focus area..." />
                  </SelectTrigger>
                  <SelectContent>
                    {focusAreas.map(area => (
                       <SelectItem key={area} value={area}>
                          {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                       </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {currentInvestors.length === 0 ? (
            <Card className="text-center p-8">
              <CardTitle>No Investors Found</CardTitle>
              <CardDescription>No investors match your current filter. Try selecting another focus area.</CardDescription>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentInvestors.map((investor) => (
                  <Card key={investor.id} className="flex flex-col hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold">{investor.name}</CardTitle>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm text-gray-700 leading-relaxed min-h-[56px]">
                        {investor.background}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow space-y-6 pt-0">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">Typical Investment</p>
                            <p className="text-gray-600">{formatMoney(investor.typical_check_min)} - {formatMoney(investor.typical_check_max)}</p>
                          </div>
                        </div>
                        
                        {investor.preferred_valuation_max && (
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">Preferred Valuation</p>
                              <p className="text-gray-600">{formatMoney(investor.preferred_valuation_min)} - {formatMoney(investor.preferred_valuation_max)}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-indigo-500"/>
                            <h4 className="text-sm font-semibold text-gray-900">Focus Areas</h4>
                          </div>
                          {investor.focus_sectors && investor.focus_sectors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {investor.focus_sectors.map(sector => (
                                <Badge key={sector} variant="outline" className="text-xs">
                                  {sector.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                             <Badge variant="secondary">No Preference</Badge>
                          )}
                        </div>
                    </CardContent>
                    
                    <div className="p-6 pt-0">
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3"
                        onClick={() => handleMeetClick(investor)}
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Meet with Investor
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={i === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className="w-10"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {selectedInvestor && venture && (
        <PitchModal 
            investor={selectedInvestor} 
            venture={venture} 
            isOpen={!!selectedInvestor} 
            onClose={handleCloseModal} 
        />
      )}
    </>
  );
}
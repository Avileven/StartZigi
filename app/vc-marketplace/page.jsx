"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { VCFirm } from '@/api/entities.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index.js';
import { 
  Building2, 
  ChevronsRight, 
  Newspaper,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Target,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function VCMarketplace() {
  const [firms, setFirms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusFilter, setFocusFilter] = useState('all');

  useEffect(() => {
    const loadFirms = async () => {
      setIsLoading(true);
      try {
        const allFirms = await VCFirm.list("-created_date");
        setFirms(allFirms);
      } catch (error) {
        console.error("Error loading VC firms:", error);
      }
      setIsLoading(false);
    };
    loadFirms();
  }, []);

  const fundAnnouncements = useMemo(() => {
    return firms
      .filter(firm => firm.funding_info)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  }, [firms]);

  const filteredFirms = useMemo(() => {
    return firms.filter(firm => {
      const matchesSearch = firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (firm.background && firm.background.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFocus = focusFilter === 'all' || (firm.focus_areas && firm.focus_areas.includes(focusFilter));
      return matchesSearch && matchesFocus;
    });
  }, [firms, searchTerm, focusFilter]);

  const allFocusAreas = useMemo(() => {
    const areas = new Set();
    firms.forEach(firm => {
      if (firm.focus_areas) {
        firm.focus_areas.forEach(area => areas.add(area));
      }
    });
    return Array.from(areas).sort();
  }, [firms]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">VC Marketplace</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and connect with top-tier venture capital firms ready to fund the next generation of breakout companies.
          </p>
        </div>

        {/* Recent Fund News */}
        <div className="mb-12">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Newspaper className="w-6 h-6 text-indigo-600"/>
                Recent Fund News
              </CardTitle>
              <CardDescription>The latest funding announcements from across the StartZig ecosystem.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fundAnnouncements.length > 0 ? (
                  fundAnnouncements.map(firm => (
                    <div key={firm.id} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                      <p className="text-xs text-gray-500 mb-2">Published by StartZig News Group</p>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{firm.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Announced <span className="font-medium text-indigo-700">{firm.funding_info}</span>.
                      </p>
                      <Link to={createPageUrl(`VCFirmPage?slug=${firm.slug}`)}>
                        <Button variant="outline" size="sm" className="w-full">
                          Visit Firm Profile <ChevronsRight className="w-4 h-4 ml-2"/>
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">No recent fund announcements available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search VC firms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={focusFilter} onValueChange={setFocusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Focus Areas</SelectItem>
                      {allFocusAreas.map(area => (
                        <SelectItem key={area} value={area}>
                          {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VC Firms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFirms.map(firm => (
            <Card key={firm.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  {firm.founded && (
                    <Badge variant="outline" className="text-xs">
                      Since {firm.founded}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold">{firm.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-3 h-[4.5rem]">
                  {firm.background}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {firm.typical_check && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Check: {firm.typical_check}</span>
                      </div>
                    )}
                    {firm.investment_stages && firm.investment_stages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Stages: {firm.investment_stages.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="my-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-indigo-500"/>
                      <h4 className="text-sm font-semibold text-gray-900">Focus Areas</h4>
                    </div>
                    {firm.focus_areas && firm.focus_areas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {firm.focus_areas.slice(0, 3).map(area => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {firm.focus_areas.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{firm.focus_areas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                       <Badge variant="secondary" className="text-xs">Sector Agnostic</Badge>
                    )}
                  </div>

                  {/* Internal Parameters Display */}
                  {firm.internal_parameters && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-red-500"/>
                        <h4 className="text-sm font-semibold text-gray-900">Investment Criteria</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {firm.internal_parameters.sector_restriction && (
                          <Badge variant="destructive" className="text-xs">Sector Restricted</Badge>
                        )}
                        {firm.internal_parameters.revenue_only && (
                          <Badge variant="destructive" className="text-xs">Revenue Required</Badge>
                        )}
                        {firm.internal_parameters.team_required && (
                          <Badge variant="destructive" className="text-xs">Team Required</Badge>
                        )}
                        {firm.internal_parameters.investment_frozen && (
                          <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">Investment Frozen</Badge>
                        )}
                        {(!firm.internal_parameters.sector_restriction && 
                          !firm.internal_parameters.revenue_only && 
                          !firm.internal_parameters.team_required && 
                          !firm.internal_parameters.investment_frozen) && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">Open to All</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl(`VCFirmPage?slug=${firm.slug}`)} className="mt-4">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    View Firm Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFirms.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No firms found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
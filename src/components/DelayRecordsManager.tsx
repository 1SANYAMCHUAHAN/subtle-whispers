import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DelayRecord } from './DelayAlertSystem';
import { Search, Download, Filter, Calendar, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DelayRecordsManagerProps {
  delayRecords: DelayRecord[];
}

export const DelayRecordsManager: React.FC<DelayRecordsManagerProps> = ({
  delayRecords
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  const filteredRecords = delayRecords.filter(record => {
    const matchesSearch = record.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.reasonForDelay.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = filterTeam === 'all' || record.responsibleTeam === filterTeam;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const recordDate = new Date(record.createdAt);
      const now = new Date();
      const daysAgo = parseInt(filterDateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      matchesDate = recordDate >= cutoffDate;
    }
    
    return matchesSearch && matchesTeam && matchesDate;
  });

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Project Name': record.projectName,
      'Product Code': record.productCode,
      'Original Deadline': record.originalDeadline,
      'Actual Completion': record.actualCompletionDate,
      'Delay Duration (Days)': record.delayDuration,
      'Responsible Team': record.responsibleTeam,
      'Reason for Delay': record.reasonForDelay,
      'Impact Assessment': record.impactAssessment,
      'Stage': record.stage,
      'Recorded Date': new Date(record.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // Project Name
      { wch: 15 }, // Product Code
      { wch: 15 }, // Original Deadline
      { wch: 15 }, // Actual Completion
      { wch: 12 }, // Delay Duration
      { wch: 15 }, // Responsible Team
      { wch: 40 }, // Reason for Delay
      { wch: 40 }, // Impact Assessment
      { wch: 12 }, // Stage
      { wch: 15 }  // Recorded Date
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delay Records');
    
    const fileName = `delay_records_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getDelayStats = () => {
    const totalDelays = filteredRecords.length;
    const avgDelayDuration = totalDelays > 0 
      ? Math.round(filteredRecords.reduce((sum, record) => sum + record.delayDuration, 0) / totalDelays)
      : 0;
    const mostCommonTeam = totalDelays > 0
      ? filteredRecords.reduce((acc, record) => {
          acc[record.responsibleTeam] = (acc[record.responsibleTeam] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {};
    
    const topTeam = Object.entries(mostCommonTeam).sort(([,a], [,b]) => b - a)[0];
    
    return { totalDelays, avgDelayDuration, topTeam };
  };

  const stats = getDelayStats();

  const getImpactSeverity = (delayDuration: number) => {
    if (delayDuration <= 2) return { label: 'Low', variant: 'secondary' as const };
    if (delayDuration <= 5) return { label: 'Medium', variant: 'warning' as const };
    return { label: 'High', variant: 'destructive' as const };
  };

  if (delayRecords.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-success mb-4">
            <TrendingUp className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Delay Records</h3>
          <p className="text-muted-foreground text-center">
            Great job! No packaging delays have been recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Total Delays</p>
                <p className="text-2xl font-bold">{stats.totalDelays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Delay Duration</p>
                <p className="text-2xl font-bold">{stats.avgDelayDuration} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Most Affected Team</p>
                <p className="text-lg font-bold capitalize">
                  {stats.topTeam ? stats.topTeam[0] : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delay Records Management
            </div>
            <Button
              onClick={exportToExcel}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-elegant"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects, codes, or reasons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
                <SelectItem value="quality">Quality Control</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="external">External Vendor</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Delay</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const impactSeverity = getImpactSeverity(record.delayDuration);
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm">{record.productCode}</div>
                          <div className="text-xs text-muted-foreground">{record.projectName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">Original: {new Date(record.originalDeadline).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            Actual: {new Date(record.actualCompletionDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={impactSeverity.variant} className="text-xs">
                          {record.delayDuration} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={impactSeverity.variant} className="text-xs">
                          {impactSeverity.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {record.responsibleTeam}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-sm truncate" title={record.reasonForDelay}>
                          {record.reasonForDelay}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
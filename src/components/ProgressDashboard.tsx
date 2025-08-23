import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProductionItem } from './ProductionPlanner';
import { DelayRecord } from './DelayAlertSystem';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';

interface ProgressDashboardProps {
  items: ProductionItem[];
  delayRecords: DelayRecord[];
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  items,
  delayRecords
}) => {
  const calculateOverallStats = () => {
    const totalItems = items.length;
    const completedItems = items.filter(item => {
      const totalRequiredDays = Object.values(item.stages).reduce((sum, stage) => sum + stage.duration, 0);
      const completedDays = Object.entries(item.dailyStatus).filter(([_, dayStatus]) => dayStatus.status === 'Y').length;
      return completedDays === totalRequiredDays;
    }).length;

    const inProgressItems = items.filter(item => {
      const totalRequiredDays = Object.values(item.stages).reduce((sum, stage) => sum + stage.duration, 0);
      const completedDays = Object.entries(item.dailyStatus).filter(([_, dayStatus]) => dayStatus.status === 'Y').length;
      return completedDays > 0 && completedDays < totalRequiredDays;
    }).length;

    const notStartedItems = totalItems - completedItems - inProgressItems;

    const overallProgress = totalItems > 0 
      ? Math.round(((completedItems + (inProgressItems * 0.5)) / totalItems) * 100)
      : 0;

    return {
      totalItems,
      completedItems,
      inProgressItems,
      notStartedItems,
      overallProgress
    };
  };

  const calculateStageProgress = () => {
    const stageStats = {
      raised: { completed: 0, total: 0 },
      preProduction: { completed: 0, total: 0 },
      production: { completed: 0, total: 0 },
      packaging: { completed: 0, total: 0 }
    };

    items.forEach(item => {
      Object.entries(item.stages).forEach(([stageName, stage]) => {
        const stageKey = stageName as keyof typeof stageStats;
        stageStats[stageKey].total += stage.duration;
        
        // Count completed days for this stage
        for (let day = stage.start; day < stage.start + stage.duration; day++) {
          if (item.dailyStatus[day]?.status === 'Y') {
            stageStats[stageKey].completed++;
          }
        }
      });
    });

    return stageStats;
  };

  const getDelayTrends = () => {
    const last30Days = delayRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return recordDate >= thirtyDaysAgo;
    });

    const avgDelayDuration = last30Days.length > 0
      ? Math.round(last30Days.reduce((sum, record) => sum + record.delayDuration, 0) / last30Days.length)
      : 0;

    return {
      recentDelays: last30Days.length,
      avgDelayDuration,
      totalDelays: delayRecords.length
    };
  };

  const getUpcomingDeadlines = () => {
    const today = new Date().getDate();
    const upcoming = items.filter(item => {
      const daysUntilDeadline = item.deadline - today;
      return daysUntilDeadline > 0 && daysUntilDeadline <= 7;
    }).sort((a, b) => a.deadline - b.deadline);

    return upcoming;
  };

  const stats = calculateOverallStats();
  const stageProgress = calculateStageProgress();
  const delayTrends = getDelayTrends();
  const upcomingDeadlines = getUpcomingDeadlines();

  const getStageProgressPercentage = (stage: { completed: number; total: number }) => {
    return stage.total > 0 ? Math.round((stage.completed / stage.total) * 100) : 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{stats.overallProgress}%</p>
                <Progress value={stats.overallProgress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedItems}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalItems} projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressItems}</p>
                <p className="text-xs text-muted-foreground">active projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Recent Delays</p>
                <p className="text-2xl font-bold">{delayTrends.recentDelays}</p>
                <p className="text-xs text-muted-foreground">last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stage Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Raised</span>
                <span className="text-sm text-muted-foreground">
                  {getStageProgressPercentage(stageProgress.raised)}%
                </span>
              </div>
              <Progress 
                value={getStageProgressPercentage(stageProgress.raised)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stageProgress.raised.completed} / {stageProgress.raised.total} days
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pre Production</span>
                <span className="text-sm text-muted-foreground">
                  {getStageProgressPercentage(stageProgress.preProduction)}%
                </span>
              </div>
              <Progress 
                value={getStageProgressPercentage(stageProgress.preProduction)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stageProgress.preProduction.completed} / {stageProgress.preProduction.total} days
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Production</span>
                <span className="text-sm text-muted-foreground">
                  {getStageProgressPercentage(stageProgress.production)}%
                </span>
              </div>
              <Progress 
                value={getStageProgressPercentage(stageProgress.production)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stageProgress.production.completed} / {stageProgress.production.total} days
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Packaging</span>
                <span className="text-sm text-muted-foreground">
                  {getStageProgressPercentage(stageProgress.packaging)}%
                </span>
              </div>
              <Progress 
                value={getStageProgressPercentage(stageProgress.packaging)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {stageProgress.packaging.completed} / {stageProgress.packaging.total} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines and Delay Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming deadlines in the next 7 days
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((item) => {
                  const daysUntil = item.deadline - new Date().getDate();
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">{item.productCode}</div>
                        <div className="text-xs text-muted-foreground">{item.productName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                          {item.priority}
                        </Badge>
                        <Badge variant={daysUntil <= 2 ? 'destructive' : 'warning'} className="text-xs">
                          {daysUntil} days
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delay Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Delay Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Total Delays</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {delayTrends.totalDelays}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Recent Delays</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
                <div className="text-2xl font-bold text-warning">
                  {delayTrends.recentDelays}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Avg Delay Duration</p>
                  <p className="text-xs text-muted-foreground">Recent delays</p>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {delayTrends.avgDelayDuration} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  Pill,
  TestTube,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const reportCards = [
  {
    title: 'Appointment Reports',
    description: 'View detailed appointment analytics and trends',
    icon: Calendar,
    href: '/reports/appointments',
    stats: '1,234 appointments this month',
    trend: '+12%',
    trendUp: true,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  },
  {
    title: 'Revenue Reports',
    description: 'Financial performance and revenue analysis',
    icon: DollarSign,
    href: '/reports/revenue',
    stats: '$45,670 this month',
    trend: '+8%',
    trendUp: true,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  },
  {
    title: 'Doctor Performance',
    description: 'Individual doctor statistics and ratings',
    icon: Stethoscope,
    href: '/reports/doctors',
    stats: '12 active doctors',
    trend: '+2 new',
    trendUp: true,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  },
  {
    title: 'Patient Reports',
    description: 'Patient demographics and visit patterns',
    icon: Users,
    href: '/reports/patients',
    stats: '856 patients this month',
    trend: '+15%',
    trendUp: true,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  },
  {
    title: 'Pharmacy Reports',
    description: 'Medicine sales and inventory analytics',
    icon: Pill,
    href: '/reports/pharmacy',
    stats: '2,450 prescriptions filled',
    trend: '-3%',
    trendUp: false,
    color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
  },
  {
    title: 'Lab Reports',
    description: 'Laboratory test volumes and results',
    icon: TestTube,
    href: '/reports/lab',
    stats: '678 tests conducted',
    trend: '+22%',
    trendUp: true,
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
  },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive reports and insights for your clinic
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Export All Reports
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$125K</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4,521</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+18%</p>
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportCards.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', report.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      report.trendUp ? 'text-green-600' : 'text-red-600'
                    )}>
                      {report.trendUp ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {report.trend}
                    </div>
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{report.stats}</p>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

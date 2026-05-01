'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Filter, Search, User, Clock, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  userRole: string;
  target: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'USER_CREATED',
    user: 'Super Admin',
    userRole: 'superadmin',
    target: 'john.doe@example.com',
    details: 'Created new admin user',
    timestamp: '2026-04-21T10:30:00Z',
    severity: 'info',
  },
  {
    id: '2',
    action: 'COURSE_DELETED',
    user: 'Admin User',
    userRole: 'admin',
    target: 'Advanced TypeScript',
    details: 'Permanently deleted course and all associated content',
    timestamp: '2026-04-21T09:15:00Z',
    severity: 'warning',
  },
  {
    id: '3',
    action: 'SYSTEM_SETTING_CHANGED',
    user: 'Super Admin',
    userRole: 'superadmin',
    target: 'Maintenance Mode',
    details: 'Enabled maintenance mode for system update',
    timestamp: '2026-04-20T22:00:00Z',
    severity: 'critical',
  },
  {
    id: '4',
    action: 'USER_ROLE_CHANGED',
    user: 'Super Admin',
    userRole: 'superadmin',
    target: 'jane.smith@example.com',
    details: 'Changed role from tutor to admin',
    timestamp: '2026-04-20T14:30:00Z',
    severity: 'warning',
  },
  {
    id: '5',
    action: 'LOGIN_FAILED',
    user: 'Unknown',
    userRole: 'unknown',
    target: 'admin@example.com',
    details: 'Multiple failed login attempts detected',
    timestamp: '2026-04-20T08:45:00Z',
    severity: 'critical',
  },
];

export default function SuperAdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="h-4 w-4" />;
    if (action.includes('SYSTEM')) return <Shield className="h-4 w-4" />;
    if (action.includes('LOGIN')) return <AlertCircle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl text-white shadow-xl shadow-slate-200">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
              <p className="text-gray-500 font-medium">System activity and security events</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-lg rounded-[2rem]">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <Button variant="outline" className="rounded-xl">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-100">
            <CardTitle className="text-xl font-black">Activity Log</CardTitle>
            <CardDescription className="font-medium">
              Recent system events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No logs found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search filters.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-xl ${getSeverityColor(log.severity)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">{log.action}</h4>
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user} ({log.userRole})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p className="font-medium">{log.target}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

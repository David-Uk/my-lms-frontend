'use client';

import { useState } from 'react';
import SuperAdminLayout from '../layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Server, Save, RotateCcw, Database, Shield, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemSettings {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
}

export default function SuperAdminSystemPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Edo LMS',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    maxUploadSize: 50,
    sessionTimeout: 60,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default?')) {
      setSettings({
        siteName: 'Edo LMS',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        maxUploadSize: 50,
        sessionTimeout: 60,
      });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-xl shadow-emerald-200">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
              <p className="text-gray-500 font-medium">Configure global system parameters</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-xl"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <Card className="border-none shadow-lg rounded-[2rem]">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">General Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Site Name</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Max Upload Size (MB)
                </label>
                <Input
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Session Timeout (minutes)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card className="border-none shadow-lg rounded-[2rem]">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-bold">Feature Toggles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Allow Registration</p>
                  <p className="text-sm text-gray-500">New users can sign up</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowRegistration ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Send email alerts to users</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-none shadow-lg rounded-[2rem] md:col-span-2">
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg font-bold">System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid gap-4 md:grid-cols-4">
                <StatusCard
                  title="Database"
                  status="operational"
                  color="green"
                />
                <StatusCard
                  title="API Server"
                  status="operational"
                  color="green"
                />
                <StatusCard
                  title="File Storage"
                  status="operational"
                  color="green"
                />
                <StatusCard
                  title="Email Service"
                  status="degraded"
                  color="yellow"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusCard({ title, status, color }: { title: string; status: string; color: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <Badge variant="outline" className={`mt-2 ${colors[color]}`}>
        {status}
      </Badge>
    </div>
  );
}

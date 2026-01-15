import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, Eye, Settings } from 'lucide-react';

// Type definitions
type SiteStatus = 'ONLINE' | 'ALERT' | 'LOCKDOWN';

interface StatusData {
  status: SiteStatus;
  lastUpdated: string;
  updatedBy: string | null;
  userLevel: number;
  canEdit: boolean;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock Clerk Authentication (simplified for demonstration)
// In production, replace with actual Clerk integration
const mockClerkUser = {
  id: 'user_demo123',
  isSignedIn: true,
};

export default function App() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(1);

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/site02/status`, {
        headers: {
          'x-user-id': mockClerkUser.id,
        },
      });
      const data = await response.json();
      setStatusData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setLoading(false);
      // Fallback to demo data if backend is not running
      setStatusData({
        status: 'ONLINE',
        lastUpdated: new Date().toISOString(),
        updatedBy: null,
        userLevel: 5, // Set to 5 for demo purposes
        canEdit: true,
      });
    }
  };

  // Update status (Level 5+ only)
  const updateStatus = async (newStatus: SiteStatus) => {
    if (!statusData?.canEdit) {
      alert('Access Denied\n\nYou need Level 5 (Admin) permissions to change the site status.');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/site02/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': mockClerkUser.id,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchStatus();
        alert(`Success\n\nSite 02 status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        alert(`Error\n\n${error.error || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback for demo
      setStatusData(prev => prev ? {
        ...prev,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      } : null);
    }
    setUpdating(false);
  };

  // Lockdown flashing animation
  useEffect(() => {
    if (statusData?.status === 'LOCKDOWN') {
      const interval = setInterval(() => {
        setFlashOpacity(prev => prev === 1 ? 0.3 : 1);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setFlashOpacity(1);
    }
  }, [statusData?.status]);

  useEffect(() => {
    fetchStatus();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []); // fetchStatus is stable and doesn't use external dependencies

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (statusData?.status) {
      case 'ONLINE':
        return 'bg-green-600';
      case 'ALERT':
        return 'bg-yellow-500';
      case 'LOCKDOWN':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (statusData?.status) {
      case 'ONLINE':
        return <Shield size={48} className="text-white" />;
      case 'ALERT':
        return <AlertTriangle size={48} className="text-white" />;
      case 'LOCKDOWN':
        return <Lock size={48} className="text-white" />;
      default:
        return <Eye size={48} className="text-white" />;
    }
  };

  const lockdownBackground = statusData?.status === 'LOCKDOWN';

  return (
    <div className="relative min-h-screen bg-slate-950">
      {lockdownBackground && (
        <div
          className="absolute inset-0 bg-red-600 transition-opacity duration-500"
          style={{ opacity: flashOpacity }}
        />
      )}

      <div className="relative flex min-h-screen flex-col px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">FCF Status Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Site 02 Monitoring System</p>
        </div>

        {/* User Level Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center rounded-lg bg-blue-600 px-4 py-2">
            <Settings size={20} className="text-white" />
            <span className="ml-2 font-semibold text-white">
              Level {statusData?.userLevel || 1}
            </span>
            <span className="ml-2 text-blue-200">
              {statusData?.canEdit ? '(Admin)' : '(Read-Only)'}
            </span>
          </div>
          {!statusData?.canEdit && (
            <div className="flex items-center">
              <Eye size={20} className="text-gray-400" />
              <span className="ml-1 text-sm text-gray-400">View Only</span>
            </div>
          )}
        </div>

        {/* Status Card */}
        <div className={`mb-6 rounded-2xl p-6 ${getStatusColor()}`}>
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            <h2 className="mt-4 text-4xl font-bold text-white">SITE 02</h2>
            <p className="mt-2 text-2xl font-semibold text-white">
              {statusData?.status || 'UNKNOWN'}
            </p>
            <p className="mt-2 text-sm text-white/80">
              Last Updated: {statusData?.lastUpdated 
                ? new Date(statusData.lastUpdated).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Control Buttons (Level 5+ only) */}
        {statusData?.canEdit && (
          <div className="space-y-3">
            <p className="mb-2 text-sm text-gray-400">CONTROL PANEL</p>
            
            <button
              className={`w-full rounded-lg p-4 transition-opacity ${
                statusData.status === 'ONLINE' ? 'bg-green-700' : 'bg-green-600'
              } ${updating || statusData.status === 'ONLINE' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
              onClick={() => updateStatus('ONLINE')}
              disabled={updating || statusData.status === 'ONLINE'}
            >
              <div className="flex items-center justify-center">
                <Shield size={24} className="text-white" />
                <span className="ml-2 text-lg font-semibold text-white">
                  SET ONLINE
                </span>
              </div>
            </button>

            <button
              className={`w-full rounded-lg p-4 transition-opacity ${
                statusData.status === 'ALERT' ? 'bg-yellow-600' : 'bg-yellow-500'
              } ${updating || statusData.status === 'ALERT' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
              onClick={() => updateStatus('ALERT')}
              disabled={updating || statusData.status === 'ALERT'}
            >
              <div className="flex items-center justify-center">
                <AlertTriangle size={24} className="text-white" />
                <span className="ml-2 text-lg font-semibold text-white">
                  SET ALERT
                </span>
              </div>
            </button>

            <button
              className={`w-full rounded-lg p-4 transition-opacity ${
                statusData.status === 'LOCKDOWN' ? 'bg-red-700' : 'bg-red-600'
              } ${updating || statusData.status === 'LOCKDOWN' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
              onClick={() => updateStatus('LOCKDOWN')}
              disabled={updating || statusData.status === 'LOCKDOWN'}
            >
              <div className="flex items-center justify-center">
                <Lock size={24} className="text-white" />
                <span className="ml-2 text-lg font-semibold text-white">
                  ACTIVATE LOCKDOWN
                </span>
              </div>
            </button>

            {updating && (
              <div className="mt-4 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            )}
          </div>
        )}

        {/* Read-Only Message */}
        {!statusData?.canEdit && (
          <div className="rounded-lg border border-blue-600 bg-blue-600/20 p-4">
            <p className="text-center text-blue-400">
              You have read-only access. Level 5 (Admin) required to edit status.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-6">
          <p className="text-center text-xs text-gray-500">
            FCF Site 02 Status Application v1.0
          </p>
          <p className="mt-1 text-center text-xs text-gray-600">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}

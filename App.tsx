import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, AlertTriangle, Lock, Eye, Settings } from 'lucide-react-native';

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
const API_BASE_URL = 'http://localhost:3001/api';

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
  const flashAnim = useState(new Animated.Value(1))[0];

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
      Alert.alert(
        'Access Denied',
        'You need Level 5 (Admin) permissions to change the site status.'
      );
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
        Alert.alert('Success', `Site 02 status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to update status');
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
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      flashAnim.setValue(1);
    }
  }, [statusData?.status]);

  useEffect(() => {
    fetchStatus();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-white mt-4 text-lg">Loading...</Text>
      </View>
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
        return <Shield size={48} color="white" />;
      case 'ALERT':
        return <AlertTriangle size={48} color="white" />;
      case 'LOCKDOWN':
        return <Lock size={48} color="white" />;
      default:
        return <Eye size={48} color="white" />;
    }
  };

  const lockdownBackground = statusData?.status === 'LOCKDOWN';

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {lockdownBackground && (
        <Animated.View
          className="absolute inset-0 bg-red-600"
          style={{ opacity: flashAnim }}
        />
      )}

      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold">FCF Status Dashboard</Text>
          <Text className="text-gray-400 text-sm mt-1">Site 02 Monitoring System</Text>
        </View>

        {/* User Level Badge */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center bg-blue-600 rounded-lg px-4 py-2">
            <Settings size={20} color="white" />
            <Text className="text-white ml-2 font-semibold">
              Level {statusData?.userLevel || 1}
            </Text>
            <Text className="text-blue-200 ml-2">
              {statusData?.canEdit ? '(Admin)' : '(Read-Only)'}
            </Text>
          </View>
          {!statusData?.canEdit && (
            <View className="flex-row items-center">
              <Eye size={20} color="#94a3b8" />
              <Text className="text-gray-400 ml-1 text-sm">View Only</Text>
            </View>
          )}
        </View>

        {/* Status Card */}
        <View className={`rounded-2xl p-6 mb-6 ${getStatusColor()}`}>
          <View className="items-center">
            {getStatusIcon()}
            <Text className="text-white text-4xl font-bold mt-4">
              SITE 02
            </Text>
            <Text className="text-white text-2xl font-semibold mt-2">
              {statusData?.status || 'UNKNOWN'}
            </Text>
            <Text className="text-white/80 text-sm mt-2">
              Last Updated: {statusData?.lastUpdated 
                ? new Date(statusData.lastUpdated).toLocaleString()
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Control Buttons (Level 5+ only) */}
        {statusData?.canEdit && (
          <View className="space-y-3">
            <Text className="text-gray-400 text-sm mb-2">CONTROL PANEL</Text>
            
            <TouchableOpacity
              className={`rounded-lg p-4 ${
                statusData.status === 'ONLINE' ? 'bg-green-700' : 'bg-green-600'
              }`}
              onPress={() => updateStatus('ONLINE')}
              disabled={updating || statusData.status === 'ONLINE'}
            >
              <View className="flex-row items-center justify-center">
                <Shield size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  SET ONLINE
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`rounded-lg p-4 mt-3 ${
                statusData.status === 'ALERT' ? 'bg-yellow-600' : 'bg-yellow-500'
              }`}
              onPress={() => updateStatus('ALERT')}
              disabled={updating || statusData.status === 'ALERT'}
            >
              <View className="flex-row items-center justify-center">
                <AlertTriangle size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  SET ALERT
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`rounded-lg p-4 mt-3 ${
                statusData.status === 'LOCKDOWN' ? 'bg-red-700' : 'bg-red-600'
              }`}
              onPress={() => updateStatus('LOCKDOWN')}
              disabled={updating || statusData.status === 'LOCKDOWN'}
            >
              <View className="flex-row items-center justify-center">
                <Lock size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  ACTIVATE LOCKDOWN
                </Text>
              </View>
            </TouchableOpacity>

            {updating && (
              <View className="items-center mt-4">
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            )}
          </View>
        )}

        {/* Read-Only Message */}
        {!statusData?.canEdit && (
          <View className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
            <Text className="text-blue-400 text-center">
              You have read-only access. Level 5 (Admin) required to edit status.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View className="mt-auto pt-6">
          <Text className="text-gray-500 text-center text-xs">
            FCF Site 02 Status Application v1.0
          </Text>
          <Text className="text-gray-600 text-center text-xs mt-1">
            Authorized Personnel Only
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

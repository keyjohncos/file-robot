'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPracticeRecords, getPracticeStats } from '@/lib/practice-records';
import { PracticeRecord } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Activity, 
  Calendar, 
  BookOpen, 
  Languages, 
  FileText,
  TrendingUp,
  LogOut,
  Target,
  Clock
} from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const records = getPracticeRecords(user.id);
    const statistics = getPracticeStats(user.id);
    
    setPracticeRecords(records);
    setStats(statistics);
    
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const getToolTypeLabel = (type: string) => {
    const labels = {
      chinese: '中文练习',
      english: '英文练习',
      poem: '诗词练习'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getToolTypeIcon = (type: string) => {
    switch (type) {
      case 'chinese':
        return <Languages className="h-4 w-4" />;
      case 'english':
        return <BookOpen className="h-4 w-4" />;
      case 'poem':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getToolTypeColor = (type: string) => {
    switch (type) {
      case 'chinese':
        return 'bg-blue-100 text-blue-800';
      case 'english':
        return 'bg-green-100 text-green-800';
      case 'poem':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = selectedDate 
    ? practiceRecords.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate === selectedDate;
      })
    : practiceRecords;

  const todayRecords = practiceRecords.filter(record => {
    const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return recordDate === today;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">请先登录</h1>
          <p className="text-gray-600">登录后才能查看个人仪表板</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-indigo-800 mb-2">个人仪表板</h1>
            <p className="text-gray-600">欢迎回来，{user.username}</p>
            <p className="text-sm text-gray-500">
              账户类型：{user.role === 'admin' ? '管理员' : '学生'}
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总练习次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">累计练习记录</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日练习</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayRecords.length}</div>
              <p className="text-xs text-muted-foreground">今日练习次数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">中文练习</CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.byTool?.chinese || 0}</div>
              <p className="text-xs text-muted-foreground">汉字练习次数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">诗词练习</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.byTool?.poem || 0}</div>
              <p className="text-xs text-muted-foreground">诗词练习次数</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              练习记录筛选
            </CardTitle>
            <CardDescription>
              选择特定日期查看练习记录，或留空查看所有记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Button 
                onClick={() => setSelectedDate('')}
                variant="outline"
                size="sm"
              >
                显示全部
              </Button>
              <span className="text-sm text-gray-600">
                共 {filteredRecords.length} 条记录
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              练习记录详情
            </CardTitle>
            <CardDescription>
              {selectedDate ? `显示 ${selectedDate} 的练习记录` : '显示所有练习记录'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无练习记录
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getToolTypeIcon(record.toolType)}
                        <Badge className={getToolTypeColor(record.toolType)}>
                          {getToolTypeLabel(record.toolType)}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{record.action}</p>
                        {record.details && (
                          <p className="text-sm text-gray-600">
                            {JSON.stringify(record.details)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

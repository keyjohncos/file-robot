import { PracticeRecord } from '@/types/user';

const PRACTICE_RECORDS_KEY = 'file-matcher-practice-records';

export const recordPractice = (
  userId: string,
  username: string,
  toolType: 'chinese' | 'english' | 'poem',
  action: string,
  details?: any
) => {
  try {
    const existingRecords = JSON.parse(localStorage.getItem(PRACTICE_RECORDS_KEY) || '[]');
    
    const newRecord: PracticeRecord = {
      id: `record-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      toolType,
      action,
      timestamp: new Date(),
      details,
    };
    
    existingRecords.push(newRecord);
    localStorage.setItem(PRACTICE_RECORDS_KEY, JSON.stringify(existingRecords));
    
    return true;
  } catch (error) {
    console.error('Failed to record practice:', error);
    return false;
  }
};

export const getPracticeRecords = (userId?: string): PracticeRecord[] => {
  try {
    const records = JSON.parse(localStorage.getItem(PRACTICE_RECORDS_KEY) || '[]');
    
    if (userId) {
      return records.filter((record: PracticeRecord) => record.userId === userId);
    }
    
    return records;
  } catch (error) {
    console.error('Failed to get practice records:', error);
    return [];
  }
};

export const getPracticeRecordsByDate = (date: Date): PracticeRecord[] => {
  try {
    const records = getPracticeRecords();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return records.filter((record: PracticeRecord) => {
      const recordDate = new Date(record.timestamp);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === targetDate.getTime();
    });
  } catch (error) {
    console.error('Failed to get practice records by date:', error);
    return [];
  }
};

export const getPracticeStats = (userId?: string) => {
  const records = getPracticeRecords(userId);
  
  const stats = {
    total: records.length,
    byTool: {
      chinese: records.filter(r => r.toolType === 'chinese').length,
      english: records.filter(r => r.toolType === 'english').length,
      poem: records.filter(r => r.toolType === 'poem').length,
    },
    byDate: {} as Record<string, number>,
  };
  
  records.forEach(record => {
    const date = new Date(record.timestamp).toLocaleDateString();
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;
  });
  
  return stats;
};

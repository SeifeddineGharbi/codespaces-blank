// Tasks screen placeholder - this will be the main screen of the app

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/src/constants';
import { MVP_TASKS } from '@/src/types';

const TasksScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
      <ScrollView className="flex-1">
        <View className="px-6 pt-4 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
              Good Morning! 🌅
            </Text>
            <Text className="text-lg" style={{ color: COLORS.text.secondary }}>
              Ready to CONQUER your day?
            </Text>
          </View>

        {/* Task Preview */}
        <View className="mb-6">
          <Text className="text-xl font-semibold mb-4" style={{ color: COLORS.text.primary }}>
            Today's Tasks
          </Text>
          
          {MVP_TASKS.map((task) => (
            <View key={task.id} className="flex-row items-center p-4 mb-3 rounded-xl bg-white shadow-sm">
              <Text className="text-2xl mr-3">{task.emoji}</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold" style={{ color: COLORS.text.primary }}>
                  {task.name}
                </Text>
                <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
                  {task.description}
                </Text>
              </View>
              <View 
                className="w-6 h-6 rounded-full border-2" 
                style={{ borderColor: task.color }}
              />
            </View>
          ))}
        </View>

          <View className="bg-white p-6 rounded-xl">
            <Text className="text-center text-lg font-semibold mb-2" style={{ color: COLORS.text.primary }}>
              Tasks Screen
            </Text>
            <Text className="text-center" style={{ color: COLORS.text.secondary }}>
              This screen will be implemented by the Tasks Agent with full functionality for task completion, scoring, and daily submission.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TasksScreen;
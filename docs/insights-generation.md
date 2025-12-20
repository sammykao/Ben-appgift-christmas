# Insights Generation System

## Overview

The insights system in `src/api/stats.ts` uses a **rule-based approach** to generate personalized insights based on user statistics. It analyzes patterns in mood, activity, and engagement to provide actionable feedback.

## How It Works

The `generateInsights()` function takes three inputs:
1. **StatsSummary**: Overall statistics (streak, average mood, trend direction)
2. **WorkoutTypeStats[]**: Distribution of activities with mood scores
3. **TimePatternStats[]**: Mood patterns by time of day

### Insight Rules (Priority Order)

1. **Streak Insights** (High Priority)
   - If streak ≥ 7 days: "🔥 Amazing! You're on a X-day streak!"
   - If streak > 0: "Keep it up! You've logged entries for X days in a row."

2. **Mood Trend Insights**
   - **Improving**: "📈 Your mood has been improving over this period!"
   - **Declining**: "💪 Consider trying different activities to boost your mood."

3. **Activity Insights**
   - If top workout type has average mood ≥ 7: "⭐ [Activity] sessions are your mood booster (avg X.X/10)!"

4. **Time Pattern Insights**
   - If best time of day has average mood ≥ 7: "🌅 Your best mood scores come during [Time] sessions."

5. **Average Mood Insights**
   - If average ≥ 8: "✨ You're maintaining excellent mood scores!"
   - If average ≥ 6: "👍 You're doing well! Keep tracking to see patterns."

6. **Fallback**
   - If no insights generated: "Start logging entries to see your insights!"

## Architecture Decisions

### Why Rule-Based?

- **Transparency**: Users understand why they see each insight
- **Predictability**: Same data always produces same insights
- **Performance**: No ML model overhead, instant generation
- **Maintainability**: Easy to add/modify rules

### Future Enhancements

1. **Machine Learning**: Could add ML model for more sophisticated pattern detection
2. **Personalization**: Learn user preferences for insight tone/style
3. **Contextual Insights**: Time-based insights (e.g., "You usually log entries in the morning")
4. **Comparative Insights**: "Your mood is 15% higher than last month"

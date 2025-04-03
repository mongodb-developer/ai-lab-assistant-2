import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import User from '@/models/User';
import ChatSession from '@/models/ChatSession';
import RagDocument from '@/models/RagDocument';
import RagChunk from '@/models/RagChunk';
import RagUsageMetrics from '@/models/RagUsageMetrics';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total chat sessions
    const totalChats = await ChatSession.countDocuments();
    
    // Get total feedback
    const totalFeedback = await Feedback.countDocuments();
    
    // Get RAG metrics
    const totalDocuments = await RagDocument.countDocuments();
    const totalChunks = await RagChunk.countDocuments();
    
    // Get RAG usage metrics
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    const [dailyRagUsage, weeklyRagUsage, monthlyRagUsage] = await Promise.all([
      RagUsageMetrics.countDocuments({ created_at: { $gte: oneDayAgo } }),
      RagUsageMetrics.countDocuments({ created_at: { $gte: oneWeekAgo } }),
      RagUsageMetrics.countDocuments({ created_at: { $gte: oneMonthAgo } })
    ]);
    
    // Get most used documents
    const mostUsedDocuments = await RagUsageMetrics.aggregate([
      {
        $group: {
          _id: '$document_id',
          count: { $sum: 1 },
          avgRelevance: { $avg: '$relevance_score' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'ragdocuments',
          localField: '_id',
          foreignField: '_id',
          as: 'document'
        }
      },
      { $unwind: '$document' }
    ]);
    
    // Get feedback with satisfaction ratings
    const feedback = await Feedback.find({}, 'ratings created_at');
    
    // Calculate average satisfaction
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    
    feedback.forEach(item => {
      if (item.ratings?.satisfaction) {
        totalSatisfaction += item.ratings.satisfaction;
        satisfactionCount++;
      }
    });
    
    const averageSatisfaction = satisfactionCount > 0 
      ? (totalSatisfaction / satisfactionCount).toFixed(1) 
      : 0;
    
    // Calculate active users
    const dailyActiveUsers = await User.countDocuments({
      last_active: { $gte: oneDayAgo }
    });
    
    const weeklyActiveUsers = await User.countDocuments({
      last_active: { $gte: oneWeekAgo }
    });
    
    const monthlyActiveUsers = await User.countDocuments({
      last_active: { $gte: oneMonthAgo }
    });
    
    // Get recent feedback with sentiment
    const recentFeedback = await Feedback.find()
      .sort({ created_at: -1 })
      .limit(10)
      .select('workshop_id module_id trigger_type ratings sentiment_analysis created_at');
    
    return NextResponse.json({
      stats: {
        totalUsers,
        totalChats,
        totalFeedback,
        averageSatisfaction,
        activeUsers: {
          daily: dailyActiveUsers,
          weekly: weeklyActiveUsers,
          monthly: monthlyActiveUsers
        },
        ragMetrics: {
          totalDocuments,
          totalChunks,
          usage: {
            daily: dailyRagUsage,
            weekly: weeklyRagUsage,
            monthly: monthlyRagUsage
          },
          mostUsedDocuments: mostUsedDocuments.map(doc => ({
            title: doc.document.title,
            count: doc.count,
            avgRelevance: doc.avgRelevance.toFixed(2)
          }))
        }
      },
      recentFeedback: recentFeedback.map(feedback => ({
        createdAt: feedback.created_at,
        workshop: feedback.workshop_id,
        module: feedback.module_id,
        type: feedback.trigger_type,
        satisfaction: feedback.ratings?.satisfaction,
        sentiment: feedback.sentiment_analysis?.dominant_emotion
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 
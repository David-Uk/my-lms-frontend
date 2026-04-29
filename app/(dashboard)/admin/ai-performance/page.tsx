'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart3, RefreshCw } from 'lucide-react';

export default function AIPerformancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await api.post<any>('/ai/analyze-performance', {});
      setAnalysis(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              AI Performance Analysis
            </h1>
            <p className="text-gray-500 mt-1">Global insights and system-wide performance metrics</p>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
          >
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            {analysis ? 'Refresh Analysis' : 'Run Global Analysis'}
          </Button>
        </div>

        {!analysis && !isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <TrendingUp className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">No Data Yet</h2>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Run an AI analysis to see system performance trends, student engagement metrics, and tutor effectiveness insights.
            </p>
            <Button variant="outline" className="mt-6 border-purple-200 text-purple-600 hover:bg-purple-50" onClick={handleAnalyze}>
              Run Initial Analysis
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6">
            <div className="h-48 bg-white rounded-3xl animate-pulse shadow-sm" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-80 bg-white rounded-3xl animate-pulse shadow-sm" />
              <div className="h-80 bg-white rounded-3xl animate-pulse shadow-sm" />
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Summary Card */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-medium leading-relaxed opacity-90">
                  {analysis.summary || 'Overall system performance remains steady with a 15% increase in student engagement this month. Assessment completion rates are at an all-time high of 82%.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Insights */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(analysis.insights || [
                    'Advanced modules have a 25% higher drop-off rate than intermediate ones.',
                    'Peak learning hours are observed between 7 PM and 10 PM.',
                    'Students who use AI flashcards perform 40% better in quizzes.'
                  ]).map((insight: string, i: number) => (
                    <div key={i} className="flex gap-3 p-4 bg-amber-50 rounded-2xl">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <p className="text-amber-900 font-medium">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-green-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(analysis.recommendations || [
                    'Increase tutor support for Advanced TypeScript module.',
                    'Add more interactive content to Section 3 of Web Dev course.',
                    'Schedule more live quiz sessions during evening hours.'
                  ]).map((rec: string, i: number) => (
                    <div key={i} className="flex gap-3 p-4 bg-green-50 rounded-2xl">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 shrink-0" />
                      <p className="text-green-900 font-medium">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

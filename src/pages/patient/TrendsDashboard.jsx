import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Target, Calendar, CheckCircle } from 'lucide-react';

const TrendsDashboard = () => {
    const [selectedParameter, setSelectedParameter] = useState('Blood Sugar');
    const [timeRange, setTimeRange] = useState('3months');
    const [trendData, setTrendData] = useState(null);
    const [aiSummary, setAiSummary] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setTrendData({
                parameter: selectedParameter,
                timeRange,
                trendData: [
                    { date: '2024-11-01', value: 140, status: 'high' },
                    { date: '2024-11-08', value: 135, status: 'high' },
                    { date: '2024-11-15', value: 128, status: 'borderline' },
                    { date: '2024-11-22', value: 122, status: 'normal' },
                    { date: '2024-11-29', value: 118, status: 'normal' },
                    { date: '2024-12-06', value: 115, status: 'normal' }
                ],
                stats: {
                    average: 126.3,
                    min: 115,
                    max: 140,
                    latest: 115,
                    trend: 'decreasing',
                    changePercentage: '-17.9'
                }
            });

            setAiSummary({
                summary: 'Your blood sugar levels have shown significant improvement over the past 3 months, decreasing by 17.9%. This positive trend indicates better glucose management.',
                keyInsights: [
                    'Fasting glucose improved by 17.9% (140 → 115 mg/dL)',
                    'Consistent downward trend observed since November',
                    'Last 3 readings are within normal range'
                ],
                positiveChanges: [
                    'Achieved normal blood sugar range',
                    'No critical readings in past month'
                ],
                recommendations: [
                    'Continue current diet and exercise routine',
                    'Maintain medication schedule',
                    'Monitor levels weekly to ensure stability'
                ],
                overallTrend: 'improving'
            });

            setAlerts([
                {
                    type: 'success',
                    severity: 'low',
                    parameter: 'Blood Sugar',
                    message: 'Blood sugar has been in normal range for 3 consecutive readings',
                    recommendation: 'Excellent progress! Keep up the good work'
                }
            ]);

            setGoals([
                {
                    _id: '1',
                    parameter: 'Blood Sugar',
                    targetValue: 110,
                    currentValue: 115,
                    unit: 'mg/dL',
                    goalType: 'decrease',
                    deadline: '2025-01-31',
                    progress: 78,
                    status: 'in-progress'
                }
            ]);

            setLoading(false);
        }, 1000);
    }, [selectedParameter, timeRange]);

    const parameters = [
        'Blood Sugar',
        'Blood Pressure',
        'Hemoglobin',
        'Cholesterol',
        'Creatinine',
        'TSH'
    ];

    const timeRanges = [
        { value: '1week', label: '1 Week' },
        { value: '1month', label: '1 Month' },
        { value: '3months', label: '3 Months' },
        { value: '6months', label: '6 Months' },
        { value: '1year', label: '1 Year' }
    ];

    const getTrendIcon = (trend) => {
        if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-red-500" />;
        if (trend === 'decreasing') return <TrendingDown className="w-5 h-5 text-green-500" />;
        return <Activity className="w-5 h-5 text-blue-500" />;
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-300 text-red-800';
            case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'low': return 'bg-green-100 border-green-300 text-green-800';
            default: return 'bg-blue-100 border-blue-300 text-blue-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-[#00a896]" />
                    Health Trends & Analytics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Parameter
                        </label>
                        <select
                            value={selectedParameter}
                            onChange={(e) => setSelectedParameter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896]"
                        >
                            {parameters.map(param => (
                                <option key={param} value={param}>{param}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Time Range
                        </label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896]"
                        >
                            {timeRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-600 mb-1">Latest</p>
                    <p className="text-2xl font-bold text-[#00a896]">{trendData.stats.latest}</p>
                    <p className="text-base text-gray-500 mt-1">mg/dL</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-600 mb-1">Average</p>
                    <p className="text-2xl font-bold text-gray-900">{trendData.stats.average}</p>
                    <p className="text-base text-gray-500 mt-1">mg/dL</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-600 mb-1">Min</p>
                    <p className="text-2xl font-bold text-green-600">{trendData.stats.min}</p>
                    <p className="text-base text-gray-500 mt-1">mg/dL</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-600 mb-1">Max</p>
                    <p className="text-2xl font-bold text-red-600">{trendData.stats.max}</p>
                    <p className="text-base text-gray-500 mt-1">mg/dL</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-600 mb-1">Change</p>
                    <div className="flex items-center">
                        {getTrendIcon(trendData.stats.trend)}
                        <p className={`text-2xl font-bold ml-2 ${parseFloat(trendData.stats.changePercentage) < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {trendData.stats.changePercentage}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedParameter} Trend
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData.trendData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00a896" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#00a896" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#00a896"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* AI Summary */}
            {aiSummary && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        AI Health Insights
                    </h3>

                    <p className="text-gray-700 mb-4">{aiSummary.summary}</p>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">📊 Key Insights</h4>
                            <ul className="space-y-2">
                                {aiSummary.keyInsights.map((insight, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        <span className="text-gray-700">{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">✅ Recommendations</h4>
                            <ul className="space-y-2">
                                {aiSummary.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                        <span className="text-gray-700">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                        Health Alerts
                    </h3>
                    {alerts.map((alert, idx) => (
                        <div key={idx} className={`rounded-lg p-4 border-2 ${getAlertColor(alert.severity)}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-semibold mb-1">{alert.message}</p>
                                    <p className="text-base">{alert.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Goals */}
            {goals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-purple-600" />
                        Your Health Goals
                    </h3>

                    <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{goal.parameter}</h4>
                                        <p className="text-base text-gray-600">
                                            Target: {goal.targetValue} {goal.unit} by {new Date(goal.deadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-base font-medium ${goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
                                        goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {goal.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-base">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-semibold text-gray-900">{goal.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-[#00a896] h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-base text-gray-600">
                                        <span>Current: {goal.currentValue} {goal.unit}</span>
                                        <span>Target: {goal.targetValue} {goal.unit}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendsDashboard;
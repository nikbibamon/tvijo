'use client';

import { useState, useEffect } from 'react';
import { useNewsAdminAuth } from '@/contexts/newsadmin-auth';
import { seoAPI } from '@/services/seo-api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

// Types
interface SEOSummary {
  total_keywords: number;
  total_clicks: number;
  total_impressions: number;
  avg_ctr: string;
  avg_position: string;
}

interface Keyword {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: string;
}

interface SEOSnapshot {
  date: string;
  keywords: number;
  clicks: number;
  position: number;
}

interface SEOError {
  type: string;
  count: number;
  url?: string;
}

// ============================================================================
// SEO Dashboard Page
// ============================================================================

export default function SEODashboardPage() {
  useNewsAdminAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SEOSummary | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [history, setHistory] = useState<SEOSnapshot[]>([]);
  const [errors, setErrors] = useState<SEOError[]>([]);
  const [period, setPeriod] = useState(28);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSEOData();
  }, [period]);

  const loadSEOData = async () => {
    setLoading(true);
    try {
      // Load current data
      const data = await seoAPI.getKeywords(period, 50);
      setSummary(data.summary);
      setKeywords(data.top_keywords || []);

      // Load historical data for chart
      const histData = await seoAPI.getHistory(30);
      setHistory(histData);

      // Load errors/issues
      const errorData = await seoAPI.getIssues();
      setErrors(errorData);
    } catch (error) {
      console.error('Failed to load SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter keywords by search
  const filteredKeywords = keywords.filter(kw =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Position color helper
  const getPositionColor = (pos: number) => {
    if (pos <= 3) return 'text-yellow-600 bg-yellow-100';
    if (pos <= 10) return 'text-green-600 bg-green-100';
    if (pos <= 20) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  // CTR color helper
  const getCTRColor = (ctr: string) => {
    const value = parseFloat(ctr);
    if (value >= 5) return 'text-green-600';
    if (value >= 2) return 'text-orange-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка SEO данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
          SEO Аналитика
        </h1>
        <p className="mt-2 text-gray-600">
          Данные из Google Search Console — реальные поисковые запросы и позиции
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {[7, 28, 90].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === days
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {days === 7 ? '7 дней' : days === 28 ? '28 дней' : '90 дней'}
          </button>
        ))}
        <button
          onClick={loadSEOData}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ключевых слов</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.total_keywords}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Клики</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.total_clicks}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Показы</p>
                <p className="text-2xl font-bold text-purple-600">
                  {summary.total_impressions >= 1000
                    ? `${(summary.total_impressions / 1000).toFixed(1)}K`
                    : summary.total_impressions}
                </p>
              </div>
              <GlobeAltIcon className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний CTR</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.avg_ctr}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средняя позиция</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {summary.avg_position}
                </p>
              </div>
              <ArrowTrendingDownIcon className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* History Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Динамика кликов</h3>
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">
              Недостаточно данных для графика
            </p>
          )}
        </div>

        {/* Keywords Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Топ ключевых слов по кликам</h3>
          {keywords.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={keywords.slice(0, 8)}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="keyword" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">
              Нет данных о ключевых словах
            </p>
          )}
        </div>
      </div>

      {/* Errors/Issues */}
      {errors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            SEO Проблемы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  error.type.includes('5xx')
                    ? 'bg-red-50 border border-red-200'
                    : error.type.includes('404')
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <p className="font-medium">{error.type}</p>
                <p className="text-2xl font-bold">{error.count}</p>
                {error.url && (
                  <p className="text-sm text-gray-600 truncate">{error.url}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Ключевые слова</h3>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Поиск ключевых слов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ключевое слово
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Клики
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Показы
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  CTR
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Позиция
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredKeywords.length > 0 ? (
                filteredKeywords.map((kw, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{kw.keyword}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">
                      {kw.clicks}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {kw.impressions >= 1000
                        ? `${(kw.impressions / 1000).toFixed(1)}K`
                        : kw.impressions}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${getCTRColor(
                        kw.ctr
                      )}`}
                    >
                      {kw.ctr}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionColor(
                          parseFloat(kw.position)
                        )}`}
                      >
                        {kw.position}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery
                      ? 'Нет результатов поиска'
                      : 'Нет данных о ключевых словах. Данные появятся через 2-4 недели после индексации сайта.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Как читать данные
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>
            <strong>Клики</strong> — сколько раз пользователи кликнули на ваш
            сайт в результатах Google
          </li>
          <li>
            <strong>Позиция 1-3</strong> — 🥇 золотая зона, первая страница
          </li>
          <li>
            <strong>Позиция 4-10</strong> — 🟢 хорошо, первая страница
          </li>
          <li>
            <strong>CTR</strong> — процент кликов от показов. Низкий CTR (&lt;2%)
            означает, что заголовок/описание нужно улучшить
          </li>
          <li>
            <strong>Ошибки 5xx</strong> — серверные ошибки, нужно срочно
            исправить
          </li>
        </ul>
      </div>
    </div>
  );
}

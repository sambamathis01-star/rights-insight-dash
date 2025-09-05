import React from 'react';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['hsl(217, 91%, 59%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 100%, 70%)'];

interface ChartProps {
  data: any[];
  title: string;
}

interface StatusData {
  name: string;
  value: number;
  percentage: string;
}

interface RegionStats {
  count: number;
  totalScore: number;
}

interface YearStats {
  count: number;
  totalScore: number;
  items: any[];
}

export function StatusDistributionChart({ data, title }: ChartProps) {
  const statusCounts = data.reduce<Record<string, number>>((acc, item) => {
    const status = item.Status || 'Non défini';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData: StatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: ((count / data.length) * 100).toFixed(1)
  }));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({name, percentage}) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RegionChart({ data, title }: ChartProps) {
  const regionData = data.reduce<Record<string, RegionStats>>((acc, item) => {
    const region = item.Region || 'Non définie';
    if (!acc[region]) {
      acc[region] = { count: 0, totalScore: 0 };
    }
    acc[region].count += 1;
    // Try to find a total score field
    const scoreField = Object.keys(item).find(key => 
      key.toLowerCase().includes('total') && typeof item[key] === 'number'
    );
    if (scoreField && typeof item[scoreField] === 'number') {
      acc[region].totalScore += item[scoreField];
    }
    return acc;
  }, {});

  const chartData = Object.entries(regionData).map(([region, stats]) => ({
    region,
    count: stats.count,
    averageScore: stats.totalScore > 0 ? Number((stats.totalScore / stats.count).toFixed(1)) : 0
  }));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="region" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(217, 91%, 59%)" name="Nombre de pays" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function YearlyTrendChart({ data, title }: ChartProps) {
  const yearlyData = data.reduce<Record<string, YearStats>>((acc, item) => {
    const year = item.Année || item.Year || 'Non définie';
    if (!acc[year]) {
      acc[year] = { count: 0, totalScore: 0, items: [] };
    }
    acc[year].count += 1;
    acc[year].items.push(item);
    
    // Calculate average score for the year
    const scoreFields = Object.keys(item).filter(key => 
      key.toLowerCase().includes('total') && typeof item[key] === 'number'
    );
    
    if (scoreFields.length > 0) {
      const avgScore = scoreFields.reduce((sum, field) => sum + (item[field] || 0), 0) / scoreFields.length;
      acc[year].totalScore += avgScore;
    }
    
    return acc;
  }, {});

  const chartData = Object.entries(yearlyData)
    .map(([year, stats]) => ({
      year,
      count: stats.count,
      averageScore: stats.totalScore > 0 ? Number((stats.totalScore / stats.count).toFixed(1)) : 0
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              stroke="hsl(217, 91%, 59%)" 
              strokeWidth={2}
              name="Score moyen"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ScoreDistributionChart({ data, title }: ChartProps) {
  // Find the main total score field
  const scoreField = Object.keys(data[0] || {}).find(key => 
    key.toLowerCase().includes('total') && 
    !key.toLowerCase().includes('processus') &&
    !key.toLowerCase().includes('pluralisme') &&
    typeof data[0]?.[key] === 'number'
  );

  if (!scoreField) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun champ de score total trouvé</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data
    .filter(item => typeof item[scoreField] === 'number')
    .map(item => ({
      country: item.Pays || item.Country || 'Pays inconnu',
      score: item[scoreField],
      status: item.Status || 'Non défini'
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Top 20

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="country" 
              angle={-45}
              textAnchor="end"
              height={120}
              fontSize={10}
            />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="score" 
              fill="hsl(217, 91%, 59%)"
              name="Score"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
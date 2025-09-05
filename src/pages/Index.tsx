import React, { useState, useMemo } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { MetricCard } from '@/components/MetricCard';
import { DataTable } from '@/components/DataTable';
import { Filters } from '@/components/Filters';
import { StatusDistributionChart, RegionChart, YearlyTrendChart, ScoreDistributionChart } from '@/components/Charts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  BarChart3, 
  AlertCircle,
  Database,
  Filter,
  PieChart
} from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    region?: string;
    status?: string;
    year?: string;
    country?: string;
  }>({});

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.region && item.Region !== filters.region) return false;
      if (filters.status && item.Status !== filters.status) return false;
      if (filters.year && String(item.Année || item.Year) !== filters.year) return false;
      if (filters.country && (item.Pays || item.Country) !== filters.country) return false;
      return true;
    });
  }, [data, filters]);

  const metrics = useMemo(() => {
    if (data.length === 0) return null;

    const totalCountries = data.length;
    const statusCounts = data.reduce((acc, item) => {
      const status = item.Status || 'Non défini';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const freeCount = statusCounts['Free'] || statusCounts['Libre'] || 0;
    const partlyFreeCount = statusCounts['Partly Free'] || statusCounts['Partiellement libre'] || 0;
    const notFreeCount = statusCounts['Not Free'] || statusCounts['Non libre'] || 0;

    const regions = new Set(data.map(item => item.Region).filter(Boolean)).size;
    
    // Calculate average score if available
    const scoreField = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('total') && 
      !key.toLowerCase().includes('processus') &&
      typeof data[0][key] === 'number'
    );
    
    let averageScore = null;
    if (scoreField) {
      const scores = data
        .map(item => item[scoreField])
        .filter(score => typeof score === 'number');
      averageScore = scores.length > 0 
        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
        : null;
    }

    return {
      totalCountries,
      freeCount,
      partlyFreeCount,
      notFreeCount,
      regions,
      averageScore
    };
  }, [data]);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleDataLoad = (newData: any[]) => {
    setData(newData);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-dashboard-bg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Dashboard Démocratie & Droits Civils
            </h1>
            <p className="text-xl text-muted-foreground">
              Analysez les données de liberté politique et de droits civils dans le monde
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FileUpload onDataLoad={handleDataLoad} onError={handleError} />

          <Card className="mt-8 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Format de données attendu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Votre fichier CSV/Excel doit contenir les colonnes suivantes pour une analyse optimale :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Informations de base :</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Pays / Country</li>
                    <li>• Region</li>
                    <li>• Année / Year</li>
                    <li>• Status</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Métriques :</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Droits politiques</li>
                    <li>• Libertés civiles</li>
                    <li>• Scores par catégorie</li>
                    <li>• Totaux par processus</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="border-b bg-dashboard-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Démocratie & Droits Civils
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyse de {data.length} enregistrements • {filteredData.length} résultats filtrés
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Métriques principales */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Pays"
              value={metrics.totalCountries}
              description="Pays analysés"
              icon={Globe}
              variant="default"
            />
            <MetricCard
              title="Pays Libres"
              value={metrics.freeCount}
              description={`${((metrics.freeCount / metrics.totalCountries) * 100).toFixed(1)}% du total`}
              icon={TrendingUp}
              variant="success"
            />
            <MetricCard
              title="Partiellement Libres"
              value={metrics.partlyFreeCount}
              description={`${((metrics.partlyFreeCount / metrics.totalCountries) * 100).toFixed(1)}% du total`}
              icon={Users}
              variant="warning"
            />
            <MetricCard
              title="Non Libres"
              value={metrics.notFreeCount}
              description={`${((metrics.notFreeCount / metrics.totalCountries) * 100).toFixed(1)}% du total`}
              icon={BarChart3}
              variant="danger"
            />
          </div>
        )}

        {/* Filtres */}
        <Filters
          data={data}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Contenu avec onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview" className="gap-2">
              <PieChart className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Graphiques
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Données
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusDistributionChart 
                data={filteredData} 
                title="Répartition par Statut de Liberté"
              />
              <RegionChart 
                data={filteredData} 
                title="Nombre de Pays par Région"
              />
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <YearlyTrendChart 
                data={filteredData} 
                title="Évolution Temporelle des Scores"
              />
              <ScoreDistributionChart 
                data={filteredData} 
                title="Top 20 des Pays par Score"
              />
            </div>
          </TabsContent>

          <TabsContent value="data">
            <DataTable 
              data={filteredData} 
              title="Données Détaillées"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

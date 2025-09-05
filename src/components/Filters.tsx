import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FiltersProps {
  data: any[];
  filters: {
    region?: string;
    status?: string;
    year?: string;
    country?: string;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  onClearFilters: () => void;
}

export function Filters({ data, filters, onFilterChange, onClearFilters }: FiltersProps) {
  const getUniqueValues = (field: string) => {
    const values = data
      .map(item => item[field])
      .filter(value => value !== null && value !== undefined && value !== '')
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return values;
  };

  const regions = getUniqueValues('Region');
  const statuses = getUniqueValues('Status');
  const years = getUniqueValues('Année').length > 0 ? getUniqueValues('Année') : getUniqueValues('Year');
  const countries = getUniqueValues('Pays').length > 0 ? getUniqueValues('Pays') : getUniqueValues('Country');

  const hasActiveFilters = Object.values(filters).some(filter => filter !== undefined);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtres</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Effacer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {regions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Région</label>
              <Select
                value={filters.region || ''}
                onValueChange={(value) => onFilterChange('region', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {statuses.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {years.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Année</label>
              <Select
                value={filters.year || ''}
                onValueChange={(value) => onFilterChange('year', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {countries.length > 0 && countries.length <= 300 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Pays</label>
              <Select
                value={filters.country || ''}
                onValueChange={(value) => onFilterChange('country', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {countries.slice(0, 100).map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Filtres actifs:</span>
            {Object.entries(filters).map(([key, value]) => 
              value && (
                <div
                  key={key}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                >
                  <span className="capitalize">{key}:</span>
                  <span className="font-medium">{value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-primary/20"
                    onClick={() => onFilterChange(key, undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onDataLoad: (data: any[]) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onDataLoad, onError }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook;
        
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'string' });
        } else {
          workbook = XLSX.read(data, { type: 'array' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          onError('Le fichier semble vide ou mal formaté');
          return;
        }
        
        onDataLoad(jsonData);
      } catch (error) {
        onError('Erreur lors de la lecture du fichier : ' + (error as Error).message);
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [onDataLoad, onError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <Card className="p-8 border-2 border-dashed transition-all duration-300 hover:border-primary/50 bg-gradient-card shadow-card">
      <div
        {...getRootProps()}
        className={`text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'scale-105' : ''
        } ${isDragReject ? 'border-destructive' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-all duration-300 ${
            isDragActive 
              ? 'bg-primary/20 text-primary' 
              : 'bg-dashboard-accent text-muted-foreground'
          }`}>
            {isDragReject ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive ? 'Déposez votre fichier ici' : 'Importez vos données'}
            </h3>
            <p className="text-muted-foreground">
              Glissez-déposez votre fichier CSV ou Excel ici, ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-muted-foreground">
              Formats supportés: .csv, .xlsx, .xls (max 50MB)
            </p>
          </div>
          
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Choisir un fichier
          </Button>
        </div>
      </div>
    </Card>
  );
}
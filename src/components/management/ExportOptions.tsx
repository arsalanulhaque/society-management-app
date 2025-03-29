
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, FileText, UserX } from 'lucide-react';
import { toast } from 'sonner';

const ExportOptions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
        <CardDescription>
          Print or export your maintenance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => toast.success('Printing initiated')}
          >
            <Printer size={16} />
            Print Data
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => toast.success('PDF export initiated')}
          >
            <FileText size={16} />
            Export as PDF
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => toast.success('Excel export initiated')}
          >
            <FileDown size={16} />
            Export as Excel
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => toast.success('Defaulter list generated')}
          >
            <UserX size={16} />
            Export Defaulters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;

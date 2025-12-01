import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

export default function ExampleTooltip({ title, content }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50">
          <Lightbulb className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{title}</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              {content}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
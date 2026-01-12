"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface OptionsCardProps {
  question: string;
  options: Option[];
  allowCustomInput: boolean;
  multiSelect: boolean;
  onSelect: (selectedIds: string[], customValue?: string) => void;
  disabled?: boolean;
}

export function OptionsCard({
  question,
  options,
  allowCustomInput,
  multiSelect,
  onSelect,
  disabled = false,
}: OptionsCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleOptionClick = (optionId: string) => {
    if (disabled) return;

    if (multiSelect) {
      const newSelected = new Set(selected);
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId);
      } else {
        newSelected.add(optionId);
      }
      setSelected(newSelected);
    } else {
      // Single select - immediately send
      onSelect([optionId]);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onSelect([], customValue.trim());
      setCustomValue("");
      setShowCustomInput(false);
    }
  };

  const handleMultiSelectSubmit = () => {
    if (selected.size > 0) {
      onSelect(Array.from(selected));
    }
  };

  return (
    <Card className="p-4 mt-3 bg-muted/30 border-muted">
      <p className="text-sm font-medium mb-3">{question}</p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={selected.has(option.id) ? "default" : "outline"}
            size="sm"
            onClick={() => handleOptionClick(option.id)}
            disabled={disabled}
            className={cn(
              "h-auto py-2 px-3 text-left",
              option.description && "flex-col items-start"
            )}
          >
            <span className="flex items-center gap-2">
              {multiSelect && selected.has(option.id) && (
                <Check className="h-3 w-3" />
              )}
              {option.label}
            </span>
            {option.description && (
              <span className="text-xs text-muted-foreground font-normal mt-0.5">
                {option.description}
              </span>
            )}
          </Button>
        ))}

        {allowCustomInput && !showCustomInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            disabled={disabled}
            className="h-auto py-2 px-3 text-muted-foreground"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Type your own...
          </Button>
        )}
      </div>

      {showCustomInput && (
        <div className="flex gap-2 mt-3">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Type your answer..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCustomSubmit();
              }
            }}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleCustomSubmit}
            disabled={!customValue.trim() || disabled}
          >
            Send
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
            }}
            disabled={disabled}
          >
            Cancel
          </Button>
        </div>
      )}

      {multiSelect && selected.size > 0 && (
        <div className="mt-3 pt-3 border-t">
          <Button
            onClick={handleMultiSelectSubmit}
            disabled={disabled}
            size="sm"
          >
            Confirm {selected.size} selection{selected.size > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </Card>
  );
}

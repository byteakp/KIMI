"use client"
import { Button } from "@/components/ui/button"
import { Code, Brain, Heart, Activity } from "lucide-react" // Imported new icons

interface SuggestionChipsProps {
  onChipClick: (suggestion: string) => void
}

export function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
  const suggestions = [
    { text: "Code in Python recursion", icon: Code }, // New suggestion
    { text: "Reasoning question", icon: Brain }, // New suggestion
    { text: "Love question", icon: Heart }, // New suggestion
    { text: "Health question", icon: Activity }, // New suggestion
  ]

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      {suggestions.map((chip, index) => (
        <Button
          key={index}
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
          onClick={() => onChipClick(chip.text)}
        >
          <chip.icon className="h-4 w-4 text-purple" />
          <span>{chip.text}</span>
        </Button>
      ))}
    </div>
  )
}

"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowUp, Paperclip, SlidersHorizontal, ChevronDown, X, Pencil, Package, Globe, Lightbulb } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Model } from "@/hooks/use-chat"

interface ChatInputBarProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading: boolean
  selectedModel: string
  setSelectedModel: (modelId: string) => void
  enableSearch: boolean
  setEnableSearch: (enabled: boolean) => void
  extendedThinking: boolean
  setExtendedThinking: (enabled: boolean) => void
  models: Model[]
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  attachedFile: File | null
  setAttachedFile: (file: File | null) => void
  researcherMode: boolean
  setResearcherMode: (mode: boolean) => void
}

export function ChatInputBar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  selectedModel,
  setSelectedModel,
  enableSearch,
  setEnableSearch,
  extendedThinking,
  setExtendedThinking,
  models,
  handleFileChange,
  fileInputRef,
  attachedFile,
  setAttachedFile,
  researcherMode,
  setResearcherMode,
}: ChatInputBarProps) {
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (attachedFile) {
      const url = URL.createObjectURL(attachedFile)
      setImagePreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setImagePreviewUrl(null)
    }
  }, [attachedFile])

  return (
    <form
      onSubmit={handleSubmit}
      // Adjusted padding and gap for a more compact look matching the image
      className="relative w-full max-w-3xl bg-card rounded-xl shadow-lg border border-border mb-4 flex items-center px-4 py-2 space-x-3"
    >
      {imagePreviewUrl && (
        <div className="absolute bottom-full left-0 mb-2 ml-4 p-2 bg-card rounded-md text-sm flex items-center space-x-2 border border-border">
          <Image
            src={imagePreviewUrl || "/placeholder.svg"}
            alt="Attached file preview"
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
          <span>{attachedFile?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachedFile(null)}
            className="h-auto p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Ask Anything..."
        // Added border, focus ring, and adjusted placeholder/padding to match image
        className="flex-grow min-h-[50px] px-3 py-2 resize-none border border-border rounded-lg focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple bg-transparent text-light-gray placeholder:text-light-gray whitespace-nowrap overflow-hidden text-ellipsis"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
          }
        }}
      />
      <div className="flex-shrink-0 flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            {/* Adjusted button styling to match image's dark background/light icon */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-muted text-light-gray hover:bg-accent hover:text-accent-foreground"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 bg-card text-card-foreground border-border p-4 rounded-lg shadow-md"
            align="end"
          >
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="search-mode" className="text-sm">
                      Search
                    </Label>
                    <p className="text-xs text-muted-foreground">Disable to stop searching</p>
                  </div>
                </div>
                <Switch
                  id="search-mode"
                  checked={enableSearch}
                  onCheckedChange={setEnableSearch}
                  className="data-[state=checked]:bg-purple data-[state=unchecked]:bg-muted"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="extended-thinking" className="text-sm">
                      Extended Thinking
                    </Label>
                    <p className="text-xs text-muted-foreground">Enable for reasoning</p>
                  </div>
                </div>
                <Switch
                  id="extended-thinking"
                  checked={extendedThinking}
                  onCheckedChange={setExtendedThinking}
                  className="data-[state=checked]:bg-purple data-[state=unchecked]:bg-muted"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 px-3 py-1 rounded-full text-sm",
            // Adjusted default state to match image's dark background/light text
            researcherMode
              ? "bg-purple text-primary-foreground hover:bg-purple-dark"
              : "bg-muted text-light-gray hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => setResearcherMode(!researcherMode)}
          type="button"
        >
          <Pencil className="h-4 w-4" />
          <span>Researcher</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Adjusted button styling to match image's dark background/light text */}
            <Button
              variant="outline"
              className="justify-between bg-muted text-light-gray border-border hover:bg-accent hover:text-accent-foreground"
            >
              {models.find((m) => m.id === selectedModel)?.name || "Select Model"}{" "}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-popper-anchor-width] bg-card text-card-foreground border-border max-h-60 overflow-y-auto">
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => requestAnimationFrame(() => setSelectedModel(model.id))} // Wrapped in requestAnimationFrame
                className="flex flex-col items-start cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center w-full">
                  <span>{model.name}</span>
                  {model.isNew && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-purple text-primary-foreground">
                      New
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {/* Adjusted button styling to match image's dark background/light icon */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-muted text-light-gray hover:bg-accent hover:text-accent-foreground"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        {/* Adjusted button styling to match image's dark background/light icon */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-muted text-light-gray hover:bg-accent hover:text-accent-foreground"
        >
          <Package className="h-5 w-5" />
        </Button>
        <Button type="submit" size="icon" className="bg-purple hover:bg-purple-dark text-primary-foreground">
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}

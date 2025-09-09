"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Code2,
  Sparkles,
  Zap,
  ArrowRight,
  Github,
  Linkedin,
  Clock,
  MemoryStick,
  TrendingUp,
  CheckCircle,
  Activity,
} from "lucide-react"

export default function Page() {
  const apiKey = "AIzaSyAvSu5-5RGWOBR0LT2p_79v0cZxxThGR-M"
  const [userCode, setUserCode] = useState(`def reverse_function(s):
    reversed_s = ""
    for char in s:
        reversed_s = char + reversed_s
    return reversed_s`)
  const [evolvedCode, setEvolvedCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("Ready to evolve your code")
  const [comparison, setComparison] = useState<{
    original: { timeComplexity: string; spaceComplexity: string; runtimePer1000: string }
    evolved: { timeComplexity: string; spaceComplexity: string; runtimePer1000: string }
    improvements: {
      category: string
      title: string
      description: string
      impact: string
      icon: string
    }[]
  } | null>(null)

  const analyzeComplexity = (code: string) => {
    const codeLines = code.toLowerCase()

    // Analyze time complexity
    let timeComplexity = "O(1)"
    if (/for\s+.*:\s*[\s\S]*?for\s+.*:|while\s+.*:\s*[\s\S]*?while\s+.*:/.test(codeLines)) {
      timeComplexity = "O(n²)"
    } else if (/for\s+.*:\s*[\s\S]*?for\s+.*:\s*[\s\S]*?for\s+.*:/.test(codeLines)) {
      timeComplexity = "O(n³)"
    } else if (/for\s+.*:|while\s+.*:/.test(codeLines)) {
      timeComplexity = "O(n)"
    } else if (/\.sort\(|sorted\(/.test(codeLines)) {
      timeComplexity = "O(n log n)"
    } else if (/\.reverse\(|reversed\(|\[::-1\]|\.join\(/.test(codeLines)) {
      timeComplexity = "O(n)"
    }

    // Analyze space complexity
    let spaceComplexity = "O(1)"
    if (codeLines.includes('reversed_s = ""') || codeLines.includes("result = []")) {
      spaceComplexity = "O(n)"
    } else if (/list\(|\.copy\(|\[::-1\]/.test(codeLines)) {
      spaceComplexity = "O(n)"
    } else if (/reversed\(/.test(codeLines) && !codeLines.includes("list(")) {
      spaceComplexity = "O(1)"
    }

    // Estimate runtime per 1000 inputs (rough estimates in milliseconds)
    let runtimePer1000 = "~1ms"
    if (timeComplexity === "O(n²)") {
      runtimePer1000 = "~100ms"
    } else if (timeComplexity === "O(n³)") {
      runtimePer1000 = "~1000ms"
    } else if (timeComplexity === "O(n log n)") {
      runtimePer1000 = "~10ms"
    } else if (timeComplexity === "O(n)") {
      runtimePer1000 = codeLines.includes("reversed(") || codeLines.includes("[::-1]") ? "~2ms" : "~5ms"
    }

    return { timeComplexity, spaceComplexity, runtimePer1000 }
  }

  const generateImprovements = (originalCode: string, evolvedCode: string) => {
    const improvements = []

    // Performance improvements
    if (evolvedCode.includes("reversed(") || evolvedCode.includes("[::-1]")) {
      improvements.push({
        category: "Performance",
        title: "Built-in Function Optimization",
        description: "Leverages Python's optimized built-in functions instead of manual loops",
        impact: "High",
        icon: "⚡",
      })
    }

    // Code structure improvements
    if (originalCode.split("\n").length > evolvedCode.split("\n").length) {
      const reduction = Math.round(
        ((originalCode.split("\n").length - evolvedCode.split("\n").length) / originalCode.split("\n").length) * 100,
      )
      improvements.push({
        category: "Code Quality",
        title: "Reduced Code Complexity",
        description: `Simplified implementation with ${reduction}% fewer lines of code`,
        impact: "Medium",
        icon: "📝",
      })
    }

    // Algorithm improvements
    if (!evolvedCode.includes("for ") && originalCode.includes("for ")) {
      improvements.push({
        category: "Algorithm",
        title: "Loop Elimination",
        description: "Replaced explicit iteration with more efficient built-in operations",
        impact: "High",
        icon: "🔄",
      })
    }

    // Memory efficiency
    if (evolvedCode.includes("[::-1]") && originalCode.includes('""')) {
      improvements.push({
        category: "Memory",
        title: "Memory Efficiency",
        description: "Eliminated intermediate string concatenation, reducing memory overhead",
        impact: "Medium",
        icon: "💾",
      })
    }

    // Pythonic improvements
    if (evolvedCode.includes("return ") && evolvedCode.split("return ").length === 2) {
      improvements.push({
        category: "Best Practices",
        title: "Pythonic Implementation",
        description: "Follows Python idioms and conventions for cleaner, more readable code",
        impact: "Medium",
        icon: "🐍",
      })
    }

    // Maintainability
    if (evolvedCode.length < originalCode.length) {
      improvements.push({
        category: "Maintainability",
        title: "Enhanced Maintainability",
        description: "Simpler logic reduces debugging complexity and improves code maintainability",
        impact: "Medium",
        icon: "🔧",
      })
    }

    return improvements.length > 0
      ? improvements
      : [
          {
            category: "Optimization",
            title: "Code Structure Optimized",
            description: "Enhanced code organization and structure for better maintainability",
            impact: "Low",
            icon: "✨",
          },
        ]
  }

  const createPrompt = (codeString: string) => {
    return `You are an expert Python programmer and performance analyst. Your task is to:

1. Take the given Python function and propose a functionally equivalent but more efficient and Pythonic version
2. Analyze both the original and your improved version for:
   - Time complexity (Big O notation)
   - Space complexity (Big O notation)
   - Estimated runtime per 1000 inputs

Please provide your response in this exact format:

IMPROVED_CODE:
[Your optimized Python function here - no markdown formatting]

ORIGINAL_ANALYSIS:
Time Complexity: [Big O notation]
Space Complexity: [Big O notation]
Runtime per 1000 inputs: [estimate in milliseconds]

IMPROVED_ANALYSIS:
Time Complexity: [Big O notation]
Space Complexity: [Big O notation]
Runtime per 1000 inputs: [estimate in milliseconds]

Here is the function to improve:
\`\`\`python
${codeString}
\`\`\``
  }

  const getLlmSuggestion = async (apiKey: string, userCode: string) => {
    const model = "gemini-2.5-flash-lite"
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const prompt = createPrompt(userCode)
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }

    setStatus("AI is analyzing your code...")
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error.message || "API request failed")
    }

    const data = await response.json()
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      throw new Error("Invalid response from API.")
    }

    return data.candidates[0].content.parts[0].text.trim()
  }

  const parseGeminiResponse = (response: string) => {
    const sections = response.split(/(?:IMPROVED_CODE:|ORIGINAL_ANALYSIS:|IMPROVED_ANALYSIS:)/)

    let evolvedCode = ""
    const originalAnalysis = { timeComplexity: "O(n)", spaceComplexity: "O(n)", runtimePer1000: "~5ms" }
    const evolvedAnalysis = { timeComplexity: "O(n)", spaceComplexity: "O(1)", runtimePer1000: "~2ms" }

    if (sections.length >= 2) {
      evolvedCode = sections[1]
        .trim()
        .replace(/^```python\s*/, "")
        .replace(/```$/, "")
        .trim()
    }

    if (sections.length >= 3) {
      const originalSection = sections[2].trim()
      const timeMatch = originalSection.match(/Time Complexity:\s*([^\n]+)/)
      const spaceMatch = originalSection.match(/Space Complexity:\s*([^\n]+)/)
      const runtimeMatch = originalSection.match(/Runtime per 1000 inputs:\s*([^\n]+)/)

      if (timeMatch) originalAnalysis.timeComplexity = timeMatch[1].trim()
      if (spaceMatch) originalAnalysis.spaceComplexity = spaceMatch[1].trim()
      if (runtimeMatch) originalAnalysis.runtimePer1000 = runtimeMatch[1].trim()
    }

    if (sections.length >= 4) {
      const evolvedSection = sections[3].trim()
      const timeMatch = evolvedSection.match(/Time Complexity:\s*([^\n]+)/)
      const spaceMatch = evolvedSection.match(/Space Complexity:\s*([^\n]+)/)
      const runtimeMatch = evolvedSection.match(/Runtime per 1000 inputs:\s*([^\n]+)/)

      if (timeMatch) evolvedAnalysis.timeComplexity = timeMatch[1].trim()
      if (spaceMatch) evolvedAnalysis.spaceComplexity = spaceMatch[1].trim()
      if (runtimeMatch) evolvedAnalysis.runtimePer1000 = runtimeMatch[1].trim()
    }

    return { evolvedCode, originalAnalysis, evolvedAnalysis }
  }

  const handleEvolveClick = async () => {
    if (!userCode.trim()) {
      setStatus("Please enter code to evolve")
      return
    }

    setIsLoading(true)
    setStatus("Connecting to Gemini AI...")
    setEvolvedCode("")
    setComparison(null)

    try {
      const response = await getLlmSuggestion(apiKey, userCode)
      const { evolvedCode, originalAnalysis, evolvedAnalysis } = parseGeminiResponse(response)

      setEvolvedCode(evolvedCode)

      const improvements = generateImprovements(userCode, evolvedCode)

      setComparison({
        original: originalAnalysis,
        evolved: evolvedAnalysis,
        improvements,
      })

      setStatus("Evolution complete! 🎉")
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Code Evolver</h1>
                <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Beta
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Optimize Python Code with AI</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Transform Your Code with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Paste your Python function and let advanced AI discover more efficient, Pythonic solutions. Powered by
            Google's Gemini AI for professional-grade code optimization.
          </p>
        </div>
      </section>

      {/* Main Application */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Code Evolution Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Code */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Your Code
                </CardTitle>
                <CardDescription>Paste your Python function here for optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="def your_function():\n    # Your code here\n    pass"
                  className="min-h-[400px] font-mono text-sm resize-none"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* Output Code */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Evolved Code
                </CardTitle>
                <CardDescription>Optimized version will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto">
                  {evolvedCode || (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Click "Evolve Code" to see the optimized version
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evolution Controls */}
          <div className="mt-8 text-center space-y-4 bg-background p-8 rounded-lg">
            <button
              onClick={handleEvolveClick}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              style={{
                backgroundColor: "#1e293b",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#334155"
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#1e293b"
                }
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Evolving...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Evolve Code
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
            <p className="text-muted-foreground font-medium">{status}</p>
          </div>

          {/* Code Comparison & Improvements */}
          {comparison && (
            <div className="mt-12 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Analysis & Improvements
                  </CardTitle>
                  <CardDescription>
                    Complexity and runtime analysis of your original code vs. AI-evolved version
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Performance Metrics Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Performance Metrics
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Time Complexity</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            {comparison.original.timeComplexity}
                          </Badge>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="default" className="text-xs font-mono">
                            {comparison.evolved.timeComplexity}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Space Complexity</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Original:</span>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono max-w-full truncate"
                              title={comparison.original.spaceComplexity}
                            >
                              {comparison.original.spaceComplexity.length > 15
                                ? comparison.original.spaceComplexity.substring(0, 15) + "..."
                                : comparison.original.spaceComplexity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Evolved:</span>
                            <Badge
                              variant="default"
                              className="text-xs font-mono max-w-full truncate"
                              title={comparison.evolved.spaceComplexity}
                            >
                              {comparison.evolved.spaceComplexity.length > 15
                                ? comparison.evolved.spaceComplexity.substring(0, 15) + "..."
                                : comparison.evolved.spaceComplexity}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Runtime/1000</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12 flex-shrink-0">Orig:</span>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono flex-1 truncate"
                              title={comparison.original.runtimePer1000}
                            >
                              {comparison.original.runtimePer1000.length > 12
                                ? comparison.original.runtimePer1000.substring(0, 12) + "..."
                                : comparison.original.runtimePer1000}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12 flex-shrink-0">Evol:</span>
                            <Badge
                              variant="default"
                              className="text-xs font-mono flex-1 truncate"
                              title={comparison.evolved.runtimePer1000}
                            >
                              {comparison.evolved.runtimePer1000.length > 12
                                ? comparison.evolved.runtimePer1000.substring(0, 12) + "..."
                                : comparison.evolved.runtimePer1000}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Improvements Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Key Improvements
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {comparison.improvements.length} Enhancement{comparison.improvements.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="grid gap-4">
                      {comparison.improvements.map((improvement, index) => (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-lg">
                                {improvement.icon}
                              </div>
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-sm text-foreground">{improvement.title}</h5>
                                <Badge
                                  variant={
                                    improvement.impact === "High"
                                      ? "default"
                                      : improvement.impact === "Medium"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {improvement.impact} Impact
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground leading-relaxed">{improvement.description}</p>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {improvement.category}
                                </Badge>
                                <div className="flex-1 h-px bg-border"></div>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            </div>
                          </div>

                          {/* Subtle gradient overlay for visual appeal */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      ))}
                    </div>

                    {/* Summary stats */}
                    <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-accent">Optimization Summary</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your code has been enhanced across {comparison.improvements.length} key area
                        {comparison.improvements.length !== 1 ? "s" : ""}, focusing on performance, maintainability, and
                        Python best practices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Separator className="my-16" />

      {/* Footer */}
      <footer className="py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Code2 className="w-5 h-5" />
              <span className="text-sm">Inspired by Google DeepMind research: AlphaEvolve</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <a href="https://github.com/RishitSaxena55/AlphaEvolve" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <a
                  href="https://www.linkedin.com/in/rishit-saxena-12922531b/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Built with Next.js, Tailwind CSS, and shadcn/ui</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

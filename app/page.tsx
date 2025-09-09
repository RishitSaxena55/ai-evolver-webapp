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
  FileText,
  TrendingUp,
  CheckCircle,
  Activity,
} from "lucide-react"

export default function AICodeEvolver() {
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
    original: { lines: number; complexity: string; readability: string; bigO: string }
    evolved: { lines: number; complexity: string; readability: string; bigO: string }
    improvements: string[]
  } | null>(null)

  const analyzeBigO = (code: string): string => {
    const codeLines = code.toLowerCase()

    // Check for nested loops
    const nestedLoopPattern = /for\s+.*:\s*[\s\S]*?for\s+.*:|while\s+.*:\s*[\s\S]*?while\s+.*:/
    if (nestedLoopPattern.test(codeLines)) {
      return "O(n²)"
    }

    // Check for triple nested structures
    const tripleNestedPattern = /for\s+.*:\s*[\s\S]*?for\s+.*:\s*[\s\S]*?for\s+.*:/
    if (tripleNestedPattern.test(codeLines)) {
      return "O(n³)"
    }

    // Check for single loops
    if (/for\s+.*:|while\s+.*:/.test(codeLines)) {
      return "O(n)"
    }

    // Check for recursive patterns
    if (
      codeLines.includes("def ") &&
      new RegExp(codeLines.match(/def\s+(\w+)/)?.[1] || "").test(codeLines.slice(codeLines.indexOf("def")))
    ) {
      return "O(n)"
    }

    // Check for built-in operations
    if (/\.sort\(|sorted\(/.test(codeLines)) {
      return "O(n log n)"
    }

    if (/\.reverse\(|reversed\(|\[::-1\]|\.join\(/.test(codeLines)) {
      return "O(n)"
    }

    // Default to constant time for simple operations
    return "O(1)"
  }

  const analyzeCode = (code: string) => {
    const lines = code.trim().split("\n").length
    const hasLoops = /for\s+|while\s+/.test(code)
    const hasNestedStructures = code.split("\n").some((line) => line.match(/^\s{4,}/))
    const hasBuiltins = /\.join\(|\.reverse\(|reversed\(|list\(/.test(code)
    const bigO = analyzeBigO(code)

    let complexity = "Low"
    if (hasLoops && hasNestedStructures) complexity = "High"
    else if (hasLoops || hasNestedStructures) complexity = "Medium"

    let readability = "Good"
    if (hasBuiltins && !hasNestedStructures) readability = "Excellent"
    else if (hasNestedStructures || lines > 10) readability = "Fair"

    return { lines, complexity, readability, bigO }
  }

  const generateImprovements = (originalCode: string, evolvedCode: string) => {
    const improvements = []

    if (evolvedCode.includes("reversed(") || evolvedCode.includes("[::-1]")) {
      improvements.push("Uses built-in Python functions for better performance")
    }
    if (originalCode.split("\n").length > evolvedCode.split("\n").length) {
      improvements.push("Reduced code length and complexity")
    }
    if (!evolvedCode.includes("for ") && originalCode.includes("for ")) {
      improvements.push("Eliminated explicit loops for cleaner code")
    }
    if (evolvedCode.includes("return ") && evolvedCode.split("return ").length === 2) {
      improvements.push("Simplified to single return statement")
    }

    return improvements.length > 0 ? improvements : ["Code structure optimized for better maintainability"]
  }

  const createPrompt = (codeString: string) => {
    return `You are an expert Python programmer. Your task is to take a given Python function and propose a functionally equivalent but more efficient and Pythonic version. Your goal is to dramatically improve the function's performance. **CRITICAL**: You must provide *only* the complete, new Python function in your response. Do not include any explanations, introductory text, or markdown formatting like \`\`\`python. Here is the function to improve:\n\`\`\`python\n${codeString}\n\`\`\``
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

    const cleanedCode = data.candidates[0].content.parts[0].text
      .trim()
      .replace(/^```python\s*/, "")
      .replace(/```$/, "")
      .trim()

    return cleanedCode
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
      const evolved = await getLlmSuggestion(apiKey, userCode)
      setEvolvedCode(evolved)

      const originalMetrics = analyzeCode(userCode)
      const evolvedMetrics = analyzeCode(evolved)
      const improvements = generateImprovements(userCode, evolved)

      setComparison({
        original: originalMetrics,
        evolved: evolvedMetrics,
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
          <div className="mt-8 text-center space-y-4">
            <Button
              onClick={handleEvolveClick}
              disabled={isLoading}
              size="lg"
              className="px-8 py-3 text-lg font-semibold"
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
            </Button>
            <p className="text-muted-foreground font-medium">{status}</p>
          </div>

          {/* Code Comparison & Improvements */}
          {comparison && (
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Code Comparison & Improvements
                  </CardTitle>
                  <CardDescription>Analysis of your original code vs. AI-evolved version</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Metrics Comparison */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Code Metrics
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Lines of Code</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {comparison.original.lines}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="default" className="text-xs">
                              {comparison.evolved.lines}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Complexity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {comparison.original.complexity}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="default" className="text-xs">
                              {comparison.evolved.complexity}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Readability</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {comparison.original.readability}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="default" className="text-xs">
                              {comparison.evolved.readability}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Time Complexity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {comparison.original.bigO}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="default" className="text-xs font-mono">
                              {comparison.evolved.bigO}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Improvements List */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Key Improvements
                      </h4>
                      <div className="space-y-2">
                        {comparison.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">{improvement}</span>
                          </div>
                        ))}
                      </div>
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

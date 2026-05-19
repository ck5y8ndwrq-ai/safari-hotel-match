"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";

interface ParsedHotel {
  regionNameZh: string;
  nameZh: string;
  nameEn: string;
  accommodationType: string;
  starRating?: number;
  roomTypes?: { nameZh: string; roomCategory: string; seasonalPrices?: { priceRoomOnly?: number }[] }[];
}

interface ImportResult {
  nameZh: string;
  success: boolean;
  error?: string;
}

// Client-side PDF text extraction using pdfjs-dist
async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import pdfjs-dist (saves bundle size)
  const pdfjsLib = await import("pdfjs-dist");

  // Use local worker file (no CDN dependency)
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str || "" : ""))
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n---\n");
}

export default function ImportHotelsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ParsedHotel[] | null>(null);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
      setResults(null);
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type === "application/pdf" || f.name.endsWith(".pdf"))) {
      setFile(f);
      setPreview(null);
      setResults(null);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError("");
    setPreview(null);
    setResults(null);

    try {
      // Extract text from PDF in browser
      const text = await extractTextFromPDF(file);

      if (!text.trim() || text.length < 20) {
        setError("未能从PDF中提取到足够的文字内容，请确认PDF是否为文字版（非扫描图片）");
        setAnalyzing(false);
        return;
      }

      // Send extracted text to API for AI analysis
      const res = await fetch("/api/hotels/import", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: text,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!data.hotels || data.hotels.length === 0) {
        setError("未能从文档中识别出酒店信息，请检查PDF内容");
      } else {
        setPreview(data.hotels);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) return;

    setImporting(true);
    setError("");

    try {
      const res = await fetch("/api/hotels/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", hotels: preview }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults(data.results);
      setPreview(null);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
    }
  };

  const accommodationLabels: Record<string, string> = {
    lodge: "野奢酒店", tented_camp: "野奢帐篷", hotel: "酒店", resort: "度假村", villa: "别墅",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">批量导入酒店</h1>
        <p className="text-muted-foreground mt-1">上传酒店介绍 PDF，系统自动识别并导入</p>
      </div>

      {/* Upload area */}
      {!preview && !results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">上传文件</CardTitle>
            <CardDescription>支持 PDF 格式的酒店介绍文档</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-10 w-10 mx-auto text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="font-medium">点击选择或拖拽 PDF 文件到此处</p>
                  <p className="text-sm text-muted-foreground">支持酒店介绍手册、价目表等 PDF 文档</p>
                </div>
              )}
            </div>

            {file && (
              <Button
                className="w-full mt-4"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在分析中...（需要几秒钟）
                  </>
                ) : (
                  "开始分析"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">导入失败</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setError(""); setFile(null); setPreview(null); }}>
                  重新上传
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              识别结果
              <span className="text-sm font-normal text-muted-foreground ml-2">
                共识别到 {preview.length} 家酒店，请确认后导入
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.map((hotel, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{hotel.nameZh || hotel.nameEn}</h3>
                    <p className="text-sm text-muted-foreground">{hotel.nameEn}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{hotel.regionNameZh}</p>
                    <p className="text-muted-foreground">{accommodationLabels[hotel.accommodationType] || hotel.accommodationType}</p>
                    {hotel.starRating && <p>{"★".repeat(hotel.starRating)}</p>}
                  </div>
                </div>
                {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {hotel.roomTypes.map((rt, j) => (
                      <span key={j} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {rt.nameZh}
                        {rt.seasonalPrices?.[0]?.priceRoomOnly && ` · $${rt.seasonalPrices[0].priceRoomOnly}/晚`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                取消
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在导入...
                  </>
                ) : (
                  `确认导入 ${preview.length} 家酒店`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">导入结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-secondary/50">
                {r.success ? (
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium">{r.nameZh}</p>
                  {r.error && <p className="text-xs text-destructive">{r.error}</p>}
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground pt-2">
              成功: {results.filter((r) => r.success).length} / 共: {results.length}
            </p>
            <Button className="mt-3" onClick={() => { setResults(null); setFile(null); }}>
              继续导入
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

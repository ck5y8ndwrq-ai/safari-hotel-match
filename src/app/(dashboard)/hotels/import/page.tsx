"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle, Loader2, Eye } from "lucide-react";

interface Region {
  id: number;
  nameZh: string;
  nameEn?: string;
}

interface SeasonalPrice {
  seasonName: string;
  dateStart: string;
  dateEnd: string;
  priceRoomOnly?: number;
  priceHalfBoard?: number;
  priceFullBoard?: number;
  currency?: string;
}

interface RoomType {
  nameZh: string;
  nameEn?: string;
  roomCategory: string;
  maxGuests?: number;
  bedType?: string;
  seasonalPrices?: SeasonalPrice[];
}

interface HotelTag {
  tagCode: string;
  weight?: number;
}

interface TargetSpecies {
  species: string;
  bestSeasonStart?: number;
  bestSeasonEnd?: number;
}

interface ParsedHotel {
  regionNameZh: string;
  nameZh: string;
  nameEn: string;
  accommodationType: string;
  starRating?: number;
  guestRating?: number;
  latitude?: number;
  longitude?: number;
  distanceToParkGate?: number;
  nearestAirstrip?: string;
  distanceToAirstrip?: number;
  transferProvided?: boolean;
  hasChineseService?: boolean;
  descriptionZh?: string;
  totalRooms?: number;
  roomTypes?: RoomType[];
  amenities?: string[];
  tags?: HotelTag[];
  targetSpecies?: TargetSpecies[];
}

interface ImportResult {
  nameZh: string;
  nameEn?: string;
  success: boolean;
  error?: string;
}

interface Correction {
  regionNameZh: string;
  tags: string;
  remark: string;
}

// Client-side PDF text extraction using pdfjs-dist
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
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

  // Correction state
  const [corrections, setCorrections] = useState<Record<number, Correction>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCorrection, setEditCorrection] = useState<Correction>({ regionNameZh: "", tags: "", remark: "" });
  const [submittingCorrected, setSubmittingCorrected] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);

  const fetchRegions = useCallback(async () => {
    try {
      const res = await fetch("/api/regions");
      const data = await res.json();
      if (data.regions) setRegions(data.regions);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchRegions(); }, [fetchRegions]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
      setResults(null);
      setError("");
      setCorrections({});
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
      setCorrections({});
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setPreview(null);
    setResults(null);
    setCorrections({});
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim() || text.length < 20) {
        setError("未能从PDF中提取到足够的文字内容，请确认PDF是否为文字版（非扫描图片）");
        setAnalyzing(false);
        return;
      }
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
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setImporting(false);
    }
  };

  const openEdit = (index: number) => {
    if (!preview || !results) return;
    const hotel = preview[index];
    const saved = corrections[index];
    const existingRegion = saved?.regionNameZh || hotel.regionNameZh || "";
    const existingTags = saved?.tags || "";
    const existingRemark = saved?.remark || "";
    setEditCorrection({ regionNameZh: existingRegion, tags: existingTags, remark: existingRemark });
    setEditingIndex(index);
  };

  const handleSaveCorrection = () => {
    if (editingIndex === null) return;
    setCorrections((prev) => ({ ...prev, [editingIndex]: { ...editCorrection } }));
    setEditingIndex(null);
    setEditCorrection({ regionNameZh: "", tags: "", remark: "" });
  };

  const handleSubmitCorrected = async () => {
    if (!preview || !results) return;
    const correctedIndices = Object.keys(corrections).map(Number);
    if (correctedIndices.length === 0) return;

    setSubmittingCorrected(true);
    setError("");

    try {
      // Build corrected hotels array: merge corrections into original preview data
      const correctedHotels = correctedIndices.map((i) => ({
        ...preview[i],
        regionNameZh: corrections[i].regionNameZh || preview[i].regionNameZh,
      }));

      const res = await fetch("/api/hotels/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", hotels: correctedHotels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Merge new results into existing results
      const newResults = [...results];
      data.results.forEach((r: ImportResult, idx: number) => {
        newResults[correctedIndices[idx]] = r;
      });
      setResults(newResults);
      setCorrections({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "重新导入失败");
    } finally {
      setSubmittingCorrected(false);
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
              <Button className="w-full mt-4" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在分析中...（需要几秒钟）</>
                ) : "开始分析"}
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
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setError(""); setFile(null); setPreview(null); setResults(null); setCorrections({}); }}>
                  重新上传
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview && !results && (
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
              <Button variant="outline" onClick={() => { setPreview(null); setFile(null); }}>
                取消
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在导入...</>
                ) : `确认导入 ${preview.length} 家酒店`}
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.nameZh || r.nameEn || "未命名酒店"}</p>
                  {r.error && <p className="text-xs text-destructive">{r.error}</p>}
                  {corrections[i] && (
                    <p className="text-xs text-green-600 mt-0.5">
                      已修正: 区域→{corrections[i].regionNameZh}
                      {corrections[i].tags && `, 标签→${corrections[i].tags}`}
                    </p>
                  )}
                </div>
                {!r.success && (
                  <Button variant="ghost" size="sm" onClick={() => openEdit(i)}>
                    <Eye className="h-4 w-4 mr-1" />详情
                  </Button>
                )}
              </div>
            ))}
            <p className="text-sm text-muted-foreground pt-2">
              成功: {results.filter((r) => r.success).length} / 共: {results.length}
              {Object.keys(corrections).length > 0 && ` · 待重新导入: ${Object.keys(corrections).length}`}
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setResults(null); setPreview(null); setFile(null); setCorrections({}); }}>
                继续导入
              </Button>
              {Object.keys(corrections).length > 0 && (
                <Button onClick={handleSubmitCorrected} disabled={submittingCorrected}>
                  {submittingCorrected ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />重新导入中...</>
                  ) : `重新导入已修正 (${Object.keys(corrections).length})`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit correction modal */}
      <Dialog open={editingIndex !== null} onOpenChange={(open) => { if (!open) setEditingIndex(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              编辑 - {preview && editingIndex !== null ? (preview[editingIndex]?.nameZh || preview[editingIndex]?.nameEn) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">区域</label>
              <Select
                value={editCorrection.regionNameZh}
                onValueChange={(v) => setEditCorrection({ ...editCorrection, regionNameZh: v || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择或输入区域" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.nameZh}>
                      {region.nameZh}{region.nameEn ? ` (${region.nameEn})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                如果目标区域不存在，请先在"区域管理"中创建
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">标签（可选，多个用英文逗号分隔）</label>
              <Input
                placeholder="例如: 帐篷营地, 豪华, 观兽"
                value={editCorrection.tags}
                onChange={(e) => setEditCorrection((prev) => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            {/* Remark */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">备注（可选）</label>
              <textarea
                rows={2}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
                placeholder="添加备注信息..."
                value={editCorrection.remark}
                onChange={(e) => setEditCorrection((prev) => ({ ...prev, remark: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIndex(null)}>取消</Button>
            <Button onClick={handleSaveCorrection}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

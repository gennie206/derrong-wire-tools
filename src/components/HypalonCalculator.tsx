import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Zap, Thermometer, Cable, Layers } from "lucide-react";

type WireType = "hypalon" | "pvc";

// 華新麗華 600V 海帕龍電線規格數據（導體最高工作溫度 90°C）
const SPEC_DATA_HYPALON = [
  { size: "0.75", pipe_in: 18, air_in: 16 },
  { size: "1.25", pipe_in: 25, air_in: 22 },
  { size: "2.0", pipe_in: 32, air_in: 28 },
  { size: "3.5", pipe_in: 47, air_in: 42 },
  { size: "5.5", pipe_in: 61, air_in: 55 },
  { size: "8", pipe_in: 76, air_in: 69 },
  { size: "14", pipe_in: 114, air_in: 104 },
  { size: "22", pipe_in: 154, air_in: 141 },
  { size: "30", pipe_in: 186, air_in: 172 },
  { size: "38", pipe_in: 216, air_in: 200 },
  { size: "50", pipe_in: 254, air_in: 238 },
  { size: "60", pipe_in: 292, air_in: 275 },
  { size: "80", pipe_in: 354, air_in: 335 },
  { size: "100", pipe_in: 409, air_in: 389 },
  { size: "125", pipe_in: 464, air_in: 445 },
  { size: "150", pipe_in: 506, air_in: 487 },
  { size: "200", pipe_in: 610, air_in: 593 },
  { size: "250", pipe_in: 690, air_in: 676 },
  { size: "325", pipe_in: 799, air_in: 791 },
  { size: "400", pipe_in: 900, air_in: 900 },
];

// 600V 105°C PVC 軟電線規格數據（表1：標準條件下電流）
const SPEC_DATA_PVC = [
  { size: "1.25", pipe_in: 23, air_in: 21 },
  { size: "2.0", pipe_in: 33, air_in: 30 },
  { size: "3.5", pipe_in: 48, air_in: 44 },
  { size: "5.5", pipe_in: 66, air_in: 61 },
  { size: "8", pipe_in: 87, air_in: 81 },
  { size: "14", pipe_in: 127, air_in: 119 },
  { size: "22", pipe_in: 170, air_in: 160 },
  { size: "30", pipe_in: 205, air_in: 195 },
  { size: "38", pipe_in: 239, air_in: 228 },
  { size: "50", pipe_in: 280, air_in: 268 },
  { size: "60", pipe_in: 322, air_in: 310 },
  { size: "80", pipe_in: 390, air_in: 378 },
  { size: "100", pipe_in: 450, air_in: 440 },
  { size: "125", pipe_in: 513, air_in: 504 },
  { size: "150", pipe_in: 559, air_in: 552 },
  { size: "200", pipe_in: 675, air_in: 673 },
  { size: "250", pipe_in: 764, air_in: 768 },
  { size: "325", pipe_in: 888, air_in: 901 },
];

// 海帕龍 溫度修正係數（90°C）
const TEMP_FACTORS_HYPALON = {
  pipe: { 20: 1.04, 25: 1.0, 30: 0.96, 35: 0.92, 40: 0.88, 45: 0.83, 50: 0.78 },
  air: { 20: 1.18, 25: 1.14, 30: 1.1, 35: 1.05, 40: 1.0, 45: 0.95, 50: 0.89 },
};

// 105°C PVC 軟電線 溫度換算係數（表2 電線管 f1、表4 空中及暗渠 f3）
const TEMP_FACTORS_PVC = {
  pipe: { 20: 1.03, 25: 1.0, 30: 0.97, 35: 0.94, 40: 0.9, 45: 0.87, 50: 0.83 },
  air: { 20: 1.14, 25: 1.11, 30: 1.07, 35: 1.04, 40: 1.0, 45: 0.96, 50: 0.92 },
};

// 同一管內多條電線換算係數 f2（海帕龍與 PVC 共用，表3）
type QuantityOption = {
  value: string;
  label: string;
  factor: number;
};

const QUANTITY_OPTIONS: QuantityOption[] = [
  { value: "1", label: "1 條", factor: 1.0 },
  { value: "2", label: "2 條", factor: 0.7 },
  { value: "3", label: "3 條", factor: 0.7 },
  { value: "4", label: "4 條", factor: 0.63 },
  { value: "5-6", label: "5-6 條", factor: 0.56 },
  { value: "7-15", label: "7-15 條", factor: 0.49 },
  { value: "16-40", label: "16-40 條", factor: 0.43 },
  { value: "41-60", label: "41-60 條", factor: 0.39 },
  { value: "60+", label: "60+ 條", factor: 0.34 },
];

const QUANTITY_FACTORS = QUANTITY_OPTIONS.reduce<Record<string, number>>((acc, option) => {
  acc[option.value] = option.factor;
  return acc;
}, {});

// 空中及暗渠多條佈設換算係數 f4（表5：條數 × 配列間距）
type AirSpacing = "S=d" | "S=2d" | "S=3d";
const AIR_F4_FACTORS: Record<AirSpacing, Record<number, number>> = {
  "S=d": { 1: 1.0, 2: 0.85, 3: 0.8, 4: 0.7, 6: 0.7, 8: 0.6, 9: 0.6, 12: 0.6 },
  "S=2d": { 1: 1.0, 2: 0.95, 3: 0.95, 4: 0.9, 6: 0.9, 8: 0.9, 9: 0.85, 12: 0.8 },
  "S=3d": { 1: 1.0, 2: 1.0, 3: 1.0, 4: 0.95, 6: 0.95, 8: 0.95, 9: 0.9, 12: 0.85 },
};

const AIR_COUNT_OPTIONS = [1, 2, 3, 4, 6, 8, 9, 12] as const;

type InstallMethod = "pipe" | "air";

const SPEC_BY_TYPE = { hypalon: SPEC_DATA_HYPALON, pvc: SPEC_DATA_PVC } as const;
const TEMP_BY_TYPE = { hypalon: TEMP_FACTORS_HYPALON, pvc: TEMP_FACTORS_PVC } as const;

const HypalonCalculator = () => {
  const [wireType, setWireType] = useState<WireType>("hypalon");
  const [wireSize, setWireSize] = useState<string>("5.5");
  const [installMethod, setInstallMethod] = useState<InstallMethod>("pipe");
  const [temperature, setTemperature] = useState<number>(25);
  const [quantity, setQuantity] = useState<string>("1");
  const [airSpacing, setAirSpacing] = useState<AirSpacing>("S=d");
  const [airCount, setAirCount] = useState<number>(1);

  const specData = SPEC_BY_TYPE[wireType];
  const tempFactors = TEMP_BY_TYPE[wireType];

  // 切換電線類型時，若目前截面積不在該類型規格內，改為該類型第一個規格
  const setWireTypeAndAdjustSize = (type: WireType) => {
    const list = SPEC_BY_TYPE[type];
    const hasCurrent = list.some((s) => s.size === wireSize);
    setWireType(type);
    if (!hasCurrent) setWireSize(list[0].size);
  };

  // 計算安全電流
  const safeAmperage = useMemo(() => {
    const spec = specData.find((s) => s.size === wireSize);
    if (!spec) return 0;

    const tempKey = Math.round(temperature / 5) * 5;
    const clampedTemp = Math.max(20, Math.min(50, tempKey)) as 20 | 25 | 30 | 35 | 40 | 45 | 50;

    let calculated = 0;

    if (installMethod === "pipe") {
      const baseAmp = spec.pipe_in;
      const tempFactor = tempFactors.pipe[clampedTemp];
      const quantityFactor = QUANTITY_FACTORS[quantity] ?? 1;
      calculated = baseAmp * tempFactor * quantityFactor;
    } else {
      const baseAmp = spec.air_in;
      const tempFactor = tempFactors.air[clampedTemp];
      const f4 = AIR_F4_FACTORS[airSpacing][airCount] ?? 1;
      calculated = baseAmp * tempFactor * f4;
    }

    return Math.round(calculated);
  }, [wireSize, installMethod, temperature, quantity, airSpacing, airCount, specData, tempFactors]);

  const currentSpec = specData.find((s) => s.size === wireSize);
  const maxTemp = wireType === "pvc" ? 105 : 90;

  return (
    <div className="min-h-screen min-h-[100dvh] calculator-page-bg p-4 md:p-8 safe-area-inset flex flex-col items-center">
      <div className="w-full max-w-lg min-w-0 space-y-4 flex-1 flex flex-col">
        {/* 標題區域 */}
        <div className="text-center space-y-2 flex-shrink-0 w-full min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-foreground shadow-sm">
            <Zap className="h-5 w-5 text-[#334155]" />
            <span className="text-sm font-medium text-[#334155]">華新麗華規格</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground min-h-[2.5rem] md:min-h-[2.75rem] flex items-center justify-center">
            {wireType === "hypalon" ? "600V 海帕龍電線" : "600V 105°C PVC 軟電線"}
          </h1>
          <p className="text-muted-foreground text-sm">
            安全電流查詢工具 · 導體最高工作溫度 {maxTemp}°C
          </p>
        </div>

        {/* 電線類型切換 - 與「選擇品牌」相同按鈕樣式：未選中白底灰框，選中白底藍/紫框 */}
        <div className="space-y-2 w-full min-w-0">
          <Label className="block text-sm font-medium text-foreground w-full">
            選擇電線類型
          </Label>
          <RadioGroup
            value={wireType}
            onValueChange={(v) => setWireTypeAndAdjustSize(v as WireType)}
            className="grid grid-cols-2 gap-3 w-full"
          >
            <Label
              htmlFor="hypalon"
              className={`flex w-full cursor-pointer items-center justify-center rounded-md border-2 bg-white px-4 py-3 min-h-[48px] transition-all text-sm font-medium min-w-0 ${
                wireType === "hypalon"
                  ? "border-primary text-primary"
                  : "border-input text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              <RadioGroupItem value="hypalon" id="hypalon" className="sr-only" />
              海帕龍 (90°C)
            </Label>
            <Label
              htmlFor="pvc"
              className={`flex w-full cursor-pointer items-center justify-center rounded-md border-2 bg-white px-4 py-3 min-h-[48px] transition-all text-sm font-medium min-w-0 ${
                wireType === "pvc"
                  ? "border-primary text-primary"
                  : "border-input text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              <RadioGroupItem value="pvc" id="pvc" className="sr-only" />
              PVC 軟線 (105°C)
            </Label>
          </RadioGroup>
        </div>

        {/* 主計算卡片 - 白卡、細微陰影、圓角與牌價系統一致 */}
        <Card className="bg-white rounded-lg shadow-sm border border-border w-full min-w-0">
          <CardHeader className="border-b border-border rounded-t-lg pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              參數設定
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              請選擇電線規格與佈設條件
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* 規格尺寸 - 標題置於下拉選單上方 */}
            <div className="space-y-2 w-full min-w-0">
              <Label className="block text-sm font-medium text-foreground w-full">
                規格尺寸
              </Label>
              <Select value={wireSize} onValueChange={setWireSize}>
                <SelectTrigger className="w-full min-w-0 min-h-[48px] text-base placeholder:text-muted-foreground">
                  <SelectValue placeholder="請先選擇規格" />
                </SelectTrigger>
                <SelectContent>
                  {specData.map((spec) => (
                    <SelectItem 
                      key={spec.size} 
                      value={spec.size}
                      className="min-h-[44px] text-base"
                    >
                      {spec.size} mm²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 佈設方式 - 與選擇品牌相同按鈕樣式 */}
            <div className="space-y-2 w-full min-w-0">
              <Label className="block text-sm font-medium text-foreground w-full">
                佈設方式
              </Label>
              <RadioGroup
                value={installMethod}
                onValueChange={(v) => setInstallMethod(v as InstallMethod)}
                className="grid grid-cols-2 gap-3 w-full"
              >
                <Label
                  htmlFor="pipe"
                  className={`flex w-full cursor-pointer items-center justify-center rounded-md border-2 bg-white px-4 py-3 min-h-[48px] transition-all text-sm font-medium min-w-0 ${
                    installMethod === "pipe"
                      ? "border-primary text-primary"
                      : "border-input text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem value="pipe" id="pipe" className="sr-only" />
                  電線管
                </Label>
                <Label
                  htmlFor="air"
                  className={`flex w-full cursor-pointer items-center justify-center rounded-md border-2 bg-white px-4 py-3 min-h-[48px] transition-all text-sm font-medium min-w-0 ${
                    installMethod === "air"
                      ? "border-primary text-primary"
                      : "border-input text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  <RadioGroupItem value="air" id="air" className="sr-only" />
                  空中 / 暗渠
                </Label>
              </RadioGroup>
            </div>

            {/* 周圍溫度 */}
            <div className="space-y-2 w-full min-w-0">
              <Label className="flex items-center justify-between text-sm font-medium text-foreground w-full">
                <span>周圍溫度</span>
                <span className="font-semibold text-foreground tabular-nums">{temperature}°C</span>
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                min={20}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20°C</span>
                <span>30°C</span>
                <span>40°C</span>
                <span>50°C</span>
              </div>
            </div>

            {/* 同管條數（僅在電線管模式顯示） */}
            {installMethod === "pipe" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 w-full min-w-0">
                <Label className="block text-sm font-medium text-foreground w-full">
                  同管條數
                </Label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="w-full min-w-0 min-h-[48px] text-base placeholder:text-muted-foreground">
                    <SelectValue placeholder="請先選擇條數" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUANTITY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="min-h-[44px] text-base"
                      >
                        {option.label} (係數: {option.factor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 空中/暗渠：間距與條數 f4（僅在空中/暗渠模式顯示） */}
            {installMethod === "air" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 w-full min-w-0">
                <div className="space-y-2 w-full min-w-0">
                  <Label className="block text-sm font-medium text-foreground w-full">
                    多條佈設間距（配列）
                  </Label>
                  <RadioGroup
                    value={airSpacing}
                    onValueChange={(v) => setAirSpacing(v as AirSpacing)}
                    className="grid grid-cols-3 gap-3 w-full"
                  >
                    {(["S=d", "S=2d", "S=3d"] as const).map((spacing) => (
                      <Label
                        key={spacing}
                        htmlFor={`air-${spacing}`}
                        className={`flex w-full cursor-pointer items-center justify-center rounded-md border-2 bg-white px-3 py-3 min-h-[48px] transition-all text-sm font-medium min-w-0 ${
                          airSpacing === spacing
                            ? "border-primary text-primary"
                            : "border-input text-muted-foreground hover:border-muted-foreground/50"
                        }`}
                      >
                        <RadioGroupItem value={spacing} id={`air-${spacing}`} className="sr-only" />
                        {spacing}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2 w-full min-w-0">
                  <Label className="block text-sm font-medium text-foreground w-full">
                    條數（f4 係數）
                  </Label>
                  <Select
                    value={String(airCount)}
                    onValueChange={(v) => setAirCount(Number(v))}
                  >
                    <SelectTrigger className="w-full min-w-0 min-h-[48px] text-base placeholder:text-muted-foreground">
                      <SelectValue placeholder="請先選擇條數" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIR_COUNT_OPTIONS.map((n) => (
                        <SelectItem
                          key={n}
                          value={String(n)}
                          className="min-h-[44px] text-base"
                        >
                          {n} 條 (f4: {AIR_F4_FACTORS[airSpacing][n]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 主要按鈕 - 深色背景 #334155、白字、w-full */}
            <Button
              type="button"
              className="w-full bg-[#334155] hover:bg-[#334155]/90 text-white font-semibold py-6 text-base rounded-md"
              onClick={() => document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth" })}
            >
              查詢安全電流
            </Button>
          </CardContent>
        </Card>

        {/* 結果卡片 - 白卡、紅色數值置中、字級與快速報價按鈕一致 */}
        <Card id="result-card" className="bg-white rounded-lg shadow-sm border border-border overflow-hidden flex-shrink-0 w-full min-w-0">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">計算結果</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center w-full space-y-4">
              {/* 安全電流值置中、紅色 #FF0000、字體大小與按鈕感官一致 */}
              <div className="flex flex-col items-center justify-center w-full space-y-1">
                <p className="text-sm text-muted-foreground">安全電流值</p>
                <p className="text-4xl md:text-5xl font-bold tracking-tight text-center tabular-nums text-[#FF0000]">
                  {safeAmperage}
                  <span className="text-xl md:text-2xl ml-2 text-[#FF0000]">A</span>
                </p>
              </div>

              {/* 計算詳情 - 等寬網格 1fr 1fr */}
              <div className="grid grid-cols-[1fr_1fr] gap-4 pt-4 border-t border-border w-full min-w-0">
                <div className="text-center p-3 rounded-lg bg-muted/50 min-w-0 overflow-hidden">
                  <p className="text-xs text-muted-foreground mb-1">基準電流</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {installMethod === "pipe" ? currentSpec?.pipe_in : currentSpec?.air_in} A
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50 min-w-0 overflow-hidden">
                  <p className="text-xs text-muted-foreground mb-1">溫度係數</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {(() => {
                      const tempKey = Math.round(temperature / 5) * 5;
                      const clampedTemp = Math.max(20, Math.min(50, tempKey)) as 20 | 25 | 30 | 35 | 40 | 45 | 50;
                      return installMethod === "pipe"
                        ? tempFactors.pipe[clampedTemp]
                        : tempFactors.air[clampedTemp];
                    })()}
                  </p>
                </div>
                {installMethod === "pipe" && (
                  <div className="col-span-2 text-center p-3 rounded-lg bg-muted/50 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">條數係數 f2</p>
                    <p className="font-semibold text-foreground tabular-nums">{QUANTITY_FACTORS[quantity]}</p>
                  </div>
                )}
                {installMethod === "air" && (
                  <div className="col-span-2 text-center p-3 rounded-lg bg-muted/50 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">多條佈設係數 f4（{airSpacing}，{airCount} 條）</p>
                    <p className="font-semibold text-foreground tabular-nums">{AIR_F4_FACTORS[airSpacing][airCount]}</p>
                  </div>
                )}
              </div>

              {/* 公式說明 */}
              <div className="text-xs text-muted-foreground pt-4 border-t border-border w-full text-center">
                {installMethod === "pipe" ? (
                  <p>I = I<sub>n</sub> × f<sub>1</sub>(溫度) × f<sub>2</sub>(條數)</p>
                ) : (
                  <p>I = I<sub>n</sub> × f<sub>3</sub>(溫度) × f<sub>4</sub>(多條佈設)</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 免責聲明 - 左側橘色邊條、編號列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-4 disclaimer-block flex-shrink-0 w-full min-w-0">
          <p className="text-sm font-semibold text-foreground mb-2">【免責聲明】</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>本查詢結果僅供參考，實際應用請依現場佈設條件與相關規範核算。</li>
            <li>安全電流會隨環境溫度、敷設方式及條數而異，使用時請依最新規格表與法規為準。</li>
            <li>本公司不因本工具之計算結果承擔任何工程或法律責任。</li>
          </ol>
        </div>

        {/* 資料來源 - 橘色圓點列表（與牌價系統一致） */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-4 flex-shrink-0 w-full min-w-0">
          <p className="text-sm font-semibold text-foreground mb-2">資料來源</p>
          <ul className="data-source-list text-sm text-muted-foreground space-y-1.5">
            {wireType === "hypalon" ? (
              <>
                <li>華新麗華 600V 海帕龍電線規格表</li>
                <li>導體最高工作溫度：90°C</li>
              </>
            ) : (
              <>
                <li>600V 105°C PVC 軟電線安全電流表</li>
                <li>符合 CNS 679、UL 1581</li>
                <li>安全電流計算依據 JCS 0168-1 規範</li>
                <li>導體最高工作溫度：105°C</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HypalonCalculator;

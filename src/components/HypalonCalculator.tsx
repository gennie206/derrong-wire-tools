import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Zap, Thermometer, Cable, Layers } from "lucide-react";

// 華新麗華 600V 海帕龍電線規格數據
const SPEC_DATA = [
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

// 溫度修正係數
const TEMP_FACTORS = {
  pipe: { 20: 1.04, 25: 1.0, 30: 0.96, 35: 0.92, 40: 0.88, 45: 0.83, 50: 0.78 },
  air: { 20: 1.18, 25: 1.14, 30: 1.1, 35: 1.05, 40: 1.0, 45: 0.95, 50: 0.89 },
};

// 同管條數修正係數
const QUANTITY_FACTORS: Record<string, number> = {
  "1": 1.0,
  "2-3": 0.7,
  "4": 0.63,
  "5-6": 0.56,
  "7-15": 0.49,
};

type InstallMethod = "pipe" | "air";

const HypalonCalculator = () => {
  const [wireSize, setWireSize] = useState<string>("5.5");
  const [installMethod, setInstallMethod] = useState<InstallMethod>("pipe");
  const [temperature, setTemperature] = useState<number>(25);
  const [quantity, setQuantity] = useState<string>("1");

  // 計算安全電流
  const safeAmperage = useMemo(() => {
    const spec = SPEC_DATA.find((s) => s.size === wireSize);
    if (!spec) return 0;

    // 取得最接近的溫度係數
    const tempKey = Math.round(temperature / 5) * 5;
    const clampedTemp = Math.max(20, Math.min(50, tempKey)) as keyof typeof TEMP_FACTORS.pipe;

    if (installMethod === "pipe") {
      // 電線管佈設：I = I_pipe_in × f1(溫度) × f2(條數)
      const baseAmp = spec.pipe_in;
      const tempFactor = TEMP_FACTORS.pipe[clampedTemp];
      const quantityFactor = QUANTITY_FACTORS[quantity];
      return Math.round(baseAmp * tempFactor * quantityFactor * 10) / 10;
    } else {
      // 空中及暗渠佈設：I = I_air_in × f3(溫度)
      const baseAmp = spec.air_in;
      const tempFactor = TEMP_FACTORS.air[clampedTemp];
      return Math.round(baseAmp * tempFactor * 10) / 10;
    }
  }, [wireSize, installMethod, temperature, quantity]);

  // 取得目前選擇的規格
  const currentSpec = SPEC_DATA.find((s) => s.size === wireSize);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background p-4 md:p-8 safe-area-inset flex flex-col">
      <div className="mx-auto max-w-2xl space-y-6 flex-1 flex flex-col">
        {/* 標題區域 */}
        <div className="text-center space-y-2 flex-shrink-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium">華新麗華規格</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            600V 海帕龍電線
          </h1>
          <p className="text-muted-foreground">
            安全電流查詢工具 · 導體最高工作溫度 90°C
          </p>
        </div>

        {/* 主計算卡片 */}
        <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <CardHeader className="bg-tech-gradient text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Cable className="h-5 w-5" />
              參數設定
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              請選擇電線規格與佈設條件
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 電線截面積選擇 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Cable className="h-4 w-4 text-primary" />
                電線標稱截面積
              </Label>
              <Select value={wireSize} onValueChange={setWireSize}>
                <SelectTrigger className="w-full min-h-[48px] text-base">
                  <SelectValue placeholder="選擇截面積" />
                </SelectTrigger>
                <SelectContent>
                  {SPEC_DATA.map((spec) => (
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

            {/* 佈設方式 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Layers className="h-4 w-4 text-primary" />
                佈設方式
              </Label>
              <RadioGroup
                value={installMethod}
                onValueChange={(v) => setInstallMethod(v as InstallMethod)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="pipe"
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-4 min-h-[56px] transition-all active:scale-[0.98] ${
                    installMethod === "pipe"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="pipe" id="pipe" className="sr-only" />
                  <span className="font-medium text-base">電線管</span>
                </Label>
                <Label
                  htmlFor="air"
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-4 min-h-[56px] transition-all active:scale-[0.98] ${
                    installMethod === "air"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="air" id="air" className="sr-only" />
                  <span className="font-medium text-base">空中 / 暗渠</span>
                </Label>
              </RadioGroup>
            </div>

            {/* 周圍溫度 */}
            <div className="space-y-4">
              <Label className="flex items-center justify-between text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  周圍溫度
                </span>
                <span className="text-lg font-bold text-primary">{temperature}°C</span>
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
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="h-4 w-4 text-primary" />
                  同管條數
                </Label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="w-full min-h-[48px] text-base">
                    <SelectValue placeholder="選擇條數" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUANTITY_FACTORS).map(([key, factor]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        className="min-h-[44px] text-base"
                      >
                        {key} 條 (係數: {factor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 結果卡片 - 手機版置中顯示 */}
        <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden flex-shrink-0 md:flex-shrink">
          <CardHeader className="bg-secondary">
            <CardTitle className="text-lg">計算結果</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">安全電流值</p>
                <p
                  className="text-5xl md:text-6xl font-bold tracking-tight text-result"
                  style={{ textShadow: "0 0 20px hsl(var(--result-glow))" }}
                >
                  {safeAmperage}
                  <span className="text-2xl md:text-3xl ml-2">A</span>
                </p>
              </div>

              {/* 計算詳情 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">基準電流</p>
                  <p className="font-semibold text-foreground">
                    {installMethod === "pipe" ? currentSpec?.pipe_in : currentSpec?.air_in} A
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">溫度係數</p>
                  <p className="font-semibold text-foreground">
                    {(() => {
                      const tempKey = Math.round(temperature / 5) * 5;
                      const clampedTemp = Math.max(20, Math.min(50, tempKey)) as keyof typeof TEMP_FACTORS.pipe;
                      return installMethod === "pipe"
                        ? TEMP_FACTORS.pipe[clampedTemp]
                        : TEMP_FACTORS.air[clampedTemp];
                    })()}
                  </p>
                </div>
                {installMethod === "pipe" && (
                  <div className="col-span-2 text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">條數係數</p>
                    <p className="font-semibold text-foreground">{QUANTITY_FACTORS[quantity]}</p>
                  </div>
                )}
              </div>

              {/* 公式說明 */}
              <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                {installMethod === "pipe" ? (
                  <p>I = I<sub>pipe</sub> × f<sub>溫度</sub> × f<sub>條數</sub></p>
                ) : (
                  <p>I = I<sub>air</sub> × f<sub>溫度</sub></p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 說明區塊 */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pb-20 md:pb-4 flex-shrink-0">
          <p>資料來源：華新麗華 600V 海帕龍電線規格表</p>
          <p>導體最高工作溫度：90°C</p>
        </div>
      </div>
    </div>
  );
};

export default HypalonCalculator;

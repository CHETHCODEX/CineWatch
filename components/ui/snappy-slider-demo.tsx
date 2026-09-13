"use client"

import * as React from "react"
import { SnappySlider } from "@/components/ui/snappy-slider"

// Radio station data for London FM
const LONDON_FM_STATIONS: Record<number, string> = {
  87.7: "Resonance FM",
  88.8: "BBC Radio 2",
  91.0: "BBC Radio 3",
  93.2: "BBC Radio 4",
  94.9: "BBC London",
  95.8: "Capital FM",
  97.3: "LBC News",
  98.5: "Capital XTRA",
  100.0: "Kiss FM",
  102.2: "Magic FM",
  104.9: "XFM London"
}

function RadioDisplay({ frequency }: { frequency: number }) {
  const roundedFreq = Number(frequency.toFixed(1))
  return (
    <div className="mt-2 text-sm">
      <span className="font-mono">{roundedFreq} MHz</span>
      {LONDON_FM_STATIONS[roundedFreq] && (
        <span className="ml-2 font-medium text-foreground">
          {LONDON_FM_STATIONS[roundedFreq]}
        </span>
      )}
    </div>
  )
}

function SnappySliderRadio() {
  const [frequency, setFrequency] = React.useState(95.8)
  
  return (
    <div className="space-y-2 w-full max-w-[400px]">
      <SnappySlider
        values={Object.keys(LONDON_FM_STATIONS).map(Number)}
        defaultValue={95.8}
        value={frequency}
        onChange={setFrequency}
        min={87.5}
        max={108.0}
        snapping={true}
        step={0.1}
        label="FM Radio Frequency"
        suffix="&nbsp;MHz"
        config={{ snappingThreshold: 0.3 }}
      />
      <RadioDisplay frequency={frequency} />
    </div>
  )
}

function SnappySliderGrowthStages() {
  const [stage1Growth, setStage1Growth] = React.useState(10)
  const [stage1Duration, setStage1Duration] = React.useState(5)
  const [stage2Growth, setStage2Growth] = React.useState(5)
  const [stage2Duration, setStage2Duration] = React.useState(5)
  const [terminalGrowth, setTerminalGrowth] = React.useState(2.5)
  
  const durationMarks = [1, 2, 3, 5, 10, 15, 20, 25, 30]
  const growthRateMarks = [-20, -10, -5, -2, -1, 0, 1, 2, 3, 4, 5, 10, 15, 20, 30, 50]
  
  return (
    <div className="space-y-8 w-full max-w-[600px]">
      <div className="space-y-6">
        {/* Stage 1 */}
        <section>
          <h3 className="text-sm font-medium mb-4">Growth Stage 1</h3>
          <div className="grid grid-cols-2 gap-4">
            <SnappySlider
              values={durationMarks}
              defaultValue={5}
              value={stage1Duration}
              onChange={setStage1Duration}
              min={1}
              max={30}
              snapping={true}
              step={1}
              label="Duration"
              suffix="&nbsp;years"
            />
            <SnappySlider   
              values={growthRateMarks}
              defaultValue={10}
              value={stage1Growth}
              onChange={setStage1Growth}
              min={-20}
              max={50}
              snapping={true}
              step={0.1}
              label="Growth Rate"
              suffix="%"
            />
          </div>
        </section>

        {/* Stage 2 */}
        <section>
          <h3 className="text-sm font-medium mb-4">Growth Stage 2</h3>
          <div className="grid grid-cols-2 gap-4">
            <SnappySlider
              values={durationMarks}
              defaultValue={5}
              value={stage2Duration}
              onChange={setStage2Duration}
              min={1}
              max={30}
              snapping={true}
              step={1}
              label="Duration"
              suffix="&nbsp;years"
            />
            <SnappySlider
              values={growthRateMarks}
              defaultValue={5}
              value={stage2Growth}
              onChange={setStage2Growth}
              min={-20}
              max={50}
              snapping={true}
              step={0.1}
              label="Growth Rate"
              suffix="%"
            />
          </div>
        </section>

        {/* Terminal Stage */}
        <section>
          <h3 className="text-sm font-medium mb-4">Terminal Stage</h3>
          <div className="grid grid-cols-2 gap-4">
            <SnappySlider
              values={growthRateMarks}
              defaultValue={2.5}
              value={terminalGrowth}
              onChange={setTerminalGrowth}
              min={-20}
              max={20}
              snapping={true}
              step={0.1}
              label="Terminal Growth Rate"
              suffix="%"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function SnappySliderWithReset() {
  const [value, setValue] = React.useState(5)
  const [resetKey, setResetKey] = React.useState(0)
  
  const handleReset = () => {
    setValue(5)
    setResetKey(prev => prev + 1)
  }

  return (
    <div className="space-y-4 w-full max-w-[400px]">
      <SnappySlider
        key={resetKey}
        resetKey={resetKey}
        values={[1, 2, 3, 5, 10, 15, 20]}
        defaultValue={5}
        value={value}
        onChange={setValue}
        min={1}
        max={20}
        snapping={true}
        step={1}
        label="Resettable Value"
        suffix="&nbsp;units"
      />
      <button 
        type="button"
        onClick={handleReset}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Reset Slider
      </button>
    </div>
  )
}

function SnappySliderCoffee() {
    const [waterVolume, setWaterVolume] = React.useState(300); // default 300ml
    const [coffeeRatio, setCoffeeRatio] = React.useState(15); // default 1:15
    const [coffeeWeight, setCoffeeWeight] = React.useState(300 / 15); // Initialize based on default values

    // Handler for coffee ratio change
    const handleRatioChange = (newRatio: number) => {
        setCoffeeRatio(newRatio);
        setCoffeeWeight(waterVolume / newRatio);
    };

    // Handler for water volume change
    const handleWaterVolumeChange = (newWaterVolume: number) => {
        setWaterVolume(newWaterVolume);
        setCoffeeWeight(newWaterVolume / coffeeRatio);
    };

    // Handler for coffee weight change
    const handleCoffeeWeightChange = (newCoffeeWeight: number) => {
        setCoffeeWeight(newCoffeeWeight);
        setWaterVolume(newCoffeeWeight * coffeeRatio);
    };

    return (
        <div className="space-y-8 w-full max-w-[400px]">
            <section>
                <h3 className="text-base font-medium mb-4">Coffee Brewing Adjustments</h3>

                <SnappySlider
                    values={[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]}
                    defaultValue={15}
                    value={coffeeRatio}
                    onChange={handleRatioChange}
                    min={10}
                    max={20}
                    snapping={true}
                    step={0.1}
                    label="Water-Coffee Ratio"
                    prefix="1&nbsp;:"
                    config={{ snappingThreshold: 0.2 }}
                />

                <SnappySlider
                    values={[150, 160, 170, 180, 200, 250, 300, 350, 400, 500, 600, 700]}
                    defaultValue={300}
                    value={waterVolume}
                    onChange={handleWaterVolumeChange}
                    min={150}
                    max={700}
                    snapping={true}
                    step={10}
                    label="Water Volume"
                    suffix="&nbsp;ml"
                    config={{ snappingThreshold: 10 }}
                />

                <SnappySlider
                    values={[10, 15, 20, 25, 30, 35, 40, 45, 50]}
                    defaultValue={waterVolume / coffeeRatio}
                    value={coffeeWeight}
                    onChange={handleCoffeeWeightChange}
                    min={10}
                    max={50}
                    snapping={true}
                    step={0.1}
                    label="Coffee Bean Weight"
                    suffix="&nbsp;g"
                    config={{ snappingThreshold: 0.5 }}
                />
            </section>
        </div>
    );
}

export { SnappySliderRadio, SnappySliderGrowthStages, SnappySliderWithReset, SnappySliderCoffee }

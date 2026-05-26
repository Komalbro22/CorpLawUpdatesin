// src/components/drafting/PrintCalibrator.tsx
'use client'

import React, { useState } from 'react'
import { Sliders, CheckCircle, Printer, HelpCircle } from 'lucide-react'

interface PrintCalibratorProps {
  paddingTop: number
  setPaddingTop: (val: number) => void
  paddingX: number
  setPaddingX: (val: number) => void
}

export function PrintCalibrator({
  paddingTop,
  setPaddingTop,
  paddingX,
  setPaddingX
}: PrintCalibratorProps) {
  const [calibrated, setCalibrated] = useState(false)

  const saveCalibration = () => {
    localStorage.setItem('letterhead_top_px', String(paddingTop))
    localStorage.setItem('letterhead_x_px', String(paddingX))
    setCalibrated(true)
    setTimeout(() => setCalibrated(false), 2500)
  }

  const printTestPage = () => {
    const testWindow = window.open('', '_blank')
    if (!testWindow) return
    
    testWindow.document.write(`
      <html>
        <head>
          <title>Printer Spacing Test Sheet</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            .test-header {
              height: ${paddingTop}px;
              border-bottom: 2px dashed #DC2626;
              position: relative;
              box-sizing: border-box;
            }
            .test-line {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              text-align: center;
              color: #DC2626;
              font-size: 11px;
              font-weight: bold;
              padding-bottom: 4px;
            }
            .content-box {
              padding: 20px ${paddingX}px;
              color: #1E293B;
            }
            .crosshair {
              position: absolute;
              width: 20px;
              height: 20px;
              border: 1px solid #DC2626;
              border-radius: 50%;
            }
            .ch-left { left: ${paddingX}px; bottom: 0; transform: translateY(50%); }
            .ch-right { right: ${paddingX}px; bottom: 0; transform: translateY(50%); }
          </style>
        </head>
        <body>
          <div class="test-header">
            <div class="test-line">--- PHYSICAL LETTERHEAD ALIGNMENT LINE (Calibrated at ${paddingTop}px) ---</div>
          </div>
          <div class="crosshair ch-left"></div>
          <div class="crosshair ch-right"></div>
          <div class="content-box">
            <h3>Printer Margin Spacing Test Sheet</h3>
            <p>1. Feed a blank sheet of your official physical letterhead paper into your printer.</p>
            <p>2. Print this sheet. Check if the dashed red line aligns perfectly right under your physical logo/header details.</p>
            <p>3. If it overlaps your logo, increase the Top Margin slider. If it is too low, decrease the slider.</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    testWindow.document.close()
  }

  return (
    <div className="bg-brand-navy/40 border border-white/5 rounded-badge p-5 space-y-5 text-white">
      
      {/* Header Info */}
      <div>
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
          <Sliders className="h-4 w-4" />
          Printer Spacing Calibration
        </h4>
        <p className="text-[10px] text-brand-muted leading-relaxed mt-1">
          Physical printers handle margin alignments differently (4–17mm). Use the sliders below to calibrate so the resolution prints exactly under your official physical letterhead.
        </p>
      </div>

      {/* Spacing Controls */}
      <div className="space-y-4 font-sans text-xs">
        <div>
          <div className="flex justify-between font-bold text-brand-muted mb-1.5">
            <span>Physical Letterhead Spacing</span>
            <span className="text-brand-gold">{paddingTop}px</span>
          </div>
          <input
            type="range"
            min="120"
            max="380"
            value={paddingTop}
            onChange={(e) => setPaddingTop(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-gold"
          />
        </div>

        <div>
          <div className="flex justify-between font-bold text-brand-muted mb-1.5">
            <span>Side Margin Spacing</span>
            <span className="text-brand-gold">{paddingX}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="45"
            value={paddingX}
            onChange={(e) => setPaddingX(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-brand-navy rounded-lg appearance-none cursor-pointer accent-brand-gold"
          />
        </div>
      </div>

      {/* Execution Buttons */}
      <div className="flex gap-2">
        <button
          onClick={printTestPage}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-brand-navy text-brand-muted border border-white/10 hover:bg-brand-navy/60 px-3 py-2.5 rounded-badge transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Test
        </button>
        <button
          onClick={saveCalibration}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-3 py-2.5 rounded-badge transition-colors"
        >
          {calibrated ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-status-verified" />
              Saved!
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>

    </div>
  )
}

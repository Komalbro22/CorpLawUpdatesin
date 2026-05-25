'use client'

import React, { useState, useEffect } from 'react'
import { Sliders, HelpCircle, CheckCircle, Printer } from 'lucide-react'

export default function PrintCalibrator() {
  const [paddingTop, setPaddingTop] = useState(240)
  const [paddingX, setPaddingX] = useState(15)
  const [calibrated, setCalibrated] = useState(false)

  useEffect(() => {
    const cachedTop = localStorage.getItem('letterhead_top_px')
    const cachedX = localStorage.getItem('letterhead_x_px')
    if (cachedTop) setPaddingTop(parseInt(cachedTop))
    if (cachedX) setPaddingX(parseInt(cachedX))
  }, [])

  const saveCalibration = () => {
    localStorage.setItem('letterhead_top_px', String(paddingTop))
    localStorage.setItem('letterhead_x_px', String(paddingX))
    setCalibrated(true)
    setTimeout(() => setCalibrated(false), 3000)
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
            body { margin: 0; padding: 0; font-family: sans-serif; }
            .test-header {
              height: ${paddingTop}px;
              border-bottom: 2px dashed #EF4444;
              position: relative;
              box-sizing: border-box;
            }
            .test-line {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              text-align: center;
              color: #EF4444;
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
              border: 1px solid #EF4444;
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 font-heading font-bold text-navy mb-4">
        <Sliders className="h-5 w-5 text-amber-500" />
        Printer Spacing Calibration (Mode B)
      </h3>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Physical printer feeds handle margins differently (4–17mm). Adjust the sliders below so that your resolution prints perfectly right below your physical company letterhead.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Top Spacing Margin:</span>
            <span className="text-gold font-bold">{paddingTop}px</span>
          </div>
          <input
            type="range"
            min="120"
            max="380"
            value={paddingTop}
            onChange={(e) => setPaddingTop(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Side Margin Spacing:</span>
            <span className="text-gold font-bold">{paddingX}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="45"
            value={paddingX}
            onChange={(e) => setPaddingX(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={printTestPage}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-2.5 rounded-lg transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print Test Page
        </button>
        <button
          onClick={saveCalibration}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-navy text-gold hover:bg-slate-900 border border-navy px-3 py-2.5 rounded-lg transition-colors"
        >
          {calibrated ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-400" />
              Calibrated!
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </div>
  )
}

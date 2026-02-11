
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { QRConfig } from '../types';

interface QRCanvasProps {
  config: QRConfig;
  type: 'canvas' | 'svg';
}

export const QRCanvas = forwardRef<{ getCanvas: () => HTMLCanvasElement | null, getSVG: () => SVGSVGElement | null }, QRCanvasProps>(
  ({ config, type }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getSVG: () => svgRef.current,
    }));

    const commonProps = {
      value: config.value,
      size: config.size,
      fgColor: config.fgColor,
      bgColor: config.bgColor,
      level: config.level,
      includeMargin: config.includeMargin,
      imageSettings: config.logo ? {
        src: config.logo,
        x: undefined,
        y: undefined,
        height: config.logoHeight || 40,
        width: config.logoWidth || 40,
        excavate: true,
      } : undefined,
    };

    return (
      <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-100 dark:border-slate-700">
        {type === 'canvas' ? (
          <QRCodeCanvas 
            ref={canvasRef} 
            {...commonProps} 
          />
        ) : (
          <QRCodeSVG 
            ref={svgRef} 
            {...commonProps} 
          />
        )}
      </div>
    );
  }
);

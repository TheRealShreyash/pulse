import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Download, X } from "lucide-react";
import { Button } from "../ui/Button";

interface PollQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pollUrl: string;
}

export function PollQRCodeModal({
  isOpen,
  onClose,
  title,
  pollUrl,
}: PollQRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // High-res export (e.g. 1024x1024 for print/slides)
    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const a = document.createElement("a");
      a.download = `poll-qr-${Date.now()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-bg-1 p-6 shadow-2xl text-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-3 hover:text-ink-1 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-[17px] font-semibold text-ink-1 truncate mb-1">
          Scan to Vote
        </h3>
        <p className="text-[12px] text-ink-3 line-clamp-1 mb-5">{title}</p>

        {/* QR Code Container (white background ensures camera scanning works reliably) */}
        <div className="mx-auto w-56 h-56 p-4 rounded-xl bg-white flex items-center justify-center shadow-inner">
          <QRCodeSVG
            ref={svgRef}
            value={pollUrl}
            size={192}
            level="H" // High error correction
            includeMargin={false}
          />
        </div>

        {/* URL Pill */}
        <p className="mt-4 text-[11px] font-mono text-ink-3 truncate px-3 py-1.5 rounded-lg bg-bg-2 border border-white/5">
          {pollUrl}
        </p>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-center gap-1.5 border border-white/10 hover:bg-white/5"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy URL
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-center gap-1.5 border border-white/10 hover:bg-white/5"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            Save PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
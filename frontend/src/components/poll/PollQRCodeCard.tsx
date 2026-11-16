import { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";

interface PollQRCodeCardProps {
  title: string;
  shareUrl: string;
  pollSlugOrId: string;
}

export function PollQRCodeCard({
  title,
  shareUrl,
  pollSlugOrId,
}: PollQRCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = `pulse-poll-${pollSlugOrId}-qr.png`;
    a.href = url;
    a.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <aside className="space-y-3">
      <p className="flex items-center gap-2 text-[10px] font-mono font-medium text-green-acc uppercase tracking-widest">
        <span aria-hidden="true" className="w-4 h-px bg-green-acc opacity-60" />
        Live Voting QR
      </p>

      <div className="bg-bg-2 border border-white/6 rounded-xl p-5 hover:border-white/10 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {/* QR Display Container */}
        <div className="relative mx-auto w-fit p-3 rounded-xl bg-white shadow-[0_0_24px_rgba(74,222,128,0.08)] flex items-center justify-center">
          <QRCodeSVG
            value={shareUrl}
            size={180}
            level="M"
            marginSize={1}
            title={title}
          />
        </div>

        {/* Hidden high-res Canvas for crisp PNG download */}
        <div className="hidden" aria-hidden="true">
          <QRCodeCanvas
            ref={canvasRef}
            value={shareUrl}
            size={1024}
            level="H"
            marginSize={2}
          />
        </div>

        {/* Caption */}
        <div className="mt-4 text-center">
          <p className="text-[12px] font-medium text-ink-1">Scan to vote</p>
          <p className="text-[11px] font-mono text-ink-3 mt-0.5">
            Point camera to open on mobile
          </p>
        </div>

        {/* Share Link Pill */}
        <div className="mt-3 px-2.5 py-1.5 rounded-md bg-bg-1 border border-white/6 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-ink-2 truncate">
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            className="text-ink-3 hover:text-green-acc transition-colors p-0.5 shrink-0"
            title="Copy link"
            aria-label="Copy poll link"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-acc" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="justify-center text-[11px] px-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-acc" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="justify-center text-[11px] px-2"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-acc" />
                  Saved!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Save PNG
                </>
              )}
            </Button>
          </div>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center text-[11px] gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live Poll
            </Button>
          </a>
        </div>
      </div>
    </aside>
  );
}

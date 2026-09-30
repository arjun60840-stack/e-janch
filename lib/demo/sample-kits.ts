// ==============================================================================
// E-JAANCH: HACKATHON DEMO SAMPLES & SYNTHETIC FIELD KITS
// Generates realistic colorimetric field test images with reference cards for testing
// ==============================================================================

export interface DemoSampleDefinition {
  id: string;
  name: string;
  expectedResult: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'INVALID_IMAGE';
  reagentName: string;
  reactionColor: { r: number; g: number; b: number };
  description: string;
  simulateBlur?: boolean;
  simulateGlare?: boolean;
  missingReferenceCard?: boolean;
}

export const DEMO_SAMPLES: DemoSampleDefinition[] = [
  {
    id: 'demo-positive-cobalt',
    name: 'Field Sample A-01: Strong Positive (Cobalt Blue)',
    expectedResult: 'POSITIVE',
    reagentName: 'Cobalt Thiocyanate Multi-Zone Reagent',
    reactionColor: { r: 24, g: 78, b: 180 }, // Deep vibrant cyan-blue
    description: 'Rapid chromophore development into vivid blue. Presumptive positive for cocaine/alkaloid salt.',
  },
  {
    id: 'demo-negative-blank',
    name: 'Field Sample B-04: Negative (Reagent Blank)',
    expectedResult: 'NEGATIVE',
    reagentName: 'Cobalt Thiocyanate Multi-Zone Reagent',
    reactionColor: { r: 236, g: 222, b: 188 }, // Pale amber blank
    description: 'No colorimetric transition. Solution maintains pale straw/amber reagent blank coloration.',
  },
  {
    id: 'demo-inconclusive-trace',
    name: 'Field Sample C-12: Inconclusive (Trace/Dilute Tint)',
    expectedResult: 'INCONCLUSIVE',
    reagentName: 'Cobalt Thiocyanate Multi-Zone Reagent',
    reactionColor: { r: 155, g: 165, b: 185 }, // Faint grayish blue, borderline saturation
    description: 'Faint muted coloration with low chromatic saturation. Falls within inconclusive uncertainty boundary.',
  },
  {
    id: 'demo-invalid-blurred',
    name: 'Field Sample D-99: Invalid (Severe Motion Blur & Glare)',
    expectedResult: 'INVALID_IMAGE',
    reagentName: 'Cobalt Thiocyanate Multi-Zone Reagent',
    reactionColor: { r: 100, g: 120, b: 160 },
    simulateBlur: true,
    simulateGlare: true,
    description: 'Excessive motion blur and specular surface reflection preventing accurate colorimetry.',
  },
];

/**
 * Procedurally draws a realistic field-test kit photo onto an HTML canvas.
 * Includes:
 * 1. Background lab/field bench surface texture
 * 2. Standardized 3-tone reference colour calibration card (White, Gray, Black)
 * 3. Colorimetric reaction well / vial with chemical reaction fluid
 * 4. Identification text & timestamp markings
 */
export function generateSyntheticTestKitImage(
  sample: DemoSampleDefinition,
  width: number = 800,
  height: number = 600
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    // 1. Background: Neutral field surface (matte slate/gray)
    ctx.fillStyle = '#E5E9F0';
    ctx.fillRect(0, 0, width, height);

    // Add subtle surface noise
    const noise = ctx.createImageData(width, height);
    for (let i = 0; i < noise.data.length; i += 4) {
      const grain = Math.floor((Math.random() - 0.5) * 16);
      noise.data[i] = 230 + grain;
      noise.data[i + 1] = 233 + grain;
      noise.data[i + 2] = 240 + grain;
      noise.data[i + 3] = 255;
    }
    ctx.putImageData(noise, 0, 0);

    // 2. Reference Colour Card (Left Area: x: 0.10 -> 0.38, y: 0.15 -> 0.85)
    if (!sample.missingReferenceCard) {
      const cardX = width * 0.10;
      const cardY = height * 0.15;
      const cardW = width * 0.28;
      const cardH = height * 0.70;

      // Card Base with drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.restore();

      // Card Header & Border
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('E-JAANCH CALIBRATION', cardX + 12, cardY + 22);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('REF STANDARD NIST-TRACEABLE', cardX + 12, cardY + 36);

      // White Patch (Target: 245, 245, 245)
      const pW = cardW * 0.74;
      const pH = cardH * 0.20;
      const pX = cardX + cardW * 0.13;

      ctx.fillStyle = 'rgb(246, 245, 247)';
      ctx.fillRect(pX, cardY + cardH * 0.10, pW, pH);
      ctx.strokeRect(pX, cardY + cardH * 0.10, pW, pH);
      ctx.fillStyle = '#4B5563';
      ctx.font = '9px monospace';
      ctx.fillText('WHITE REF (95%)', pX + 8, cardY + cardH * 0.10 + pH - 8);

      // Neutral Gray Patch (Target: 128, 128, 128)
      ctx.fillStyle = 'rgb(127, 128, 130)';
      ctx.fillRect(pX, cardY + cardH * 0.38, pW, pH);
      ctx.strokeRect(pX, cardY + cardH * 0.38, pW, pH);
      ctx.fillStyle = '#F3F4F6';
      ctx.fillText('18% GRAY REF', pX + 8, cardY + cardH * 0.38 + pH - 8);

      // Black Patch (Target: 25, 25, 25)
      ctx.fillStyle = 'rgb(26, 25, 28)';
      ctx.fillRect(pX, cardY + cardH * 0.66, pW, pH);
      ctx.strokeRect(pX, cardY + cardH * 0.66, pW, pH);
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText('BLACK REF (3%)', pX + 8, cardY + cardH * 0.66 + pH - 8);
    }

    // 3. Test Kit Well / Cassette (Right Area: x: 0.52 -> 0.90, y: 0.25 -> 0.75)
    const kitX = width * 0.52;
    const kitY = height * 0.22;
    const kitW = width * 0.38;
    const kitH = height * 0.56;

    // Kit Plastic Casing
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(kitX, kitY, kitW, kitH, 16);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Kit Branding
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('COLORIMETRIC FIELD ASSAY', kitX + 18, kitY + 28);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(sample.reagentName.toUpperCase(), kitX + 18, kitY + 44);

    // Reaction Well (Circular / Oval Window)
    const wellCenterX = kitX + kitW * 0.5;
    const wellCenterY = kitY + kitH * 0.55;
    const wellRadius = Math.min(kitW, kitH) * 0.32;

    // Well Inner Shadow & Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(wellCenterX, wellCenterY, wellRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.stroke();

    // Reaction Liquid Color
    const { r, g, b } = sample.reactionColor;
    const grad = ctx.createRadialGradient(
      wellCenterX - wellRadius * 0.2,
      wellCenterY - wellRadius * 0.2,
      wellRadius * 0.1,
      wellCenterX,
      wellCenterY,
      wellRadius
    );
    grad.addColorStop(0, `rgb(${Math.min(255, r + 25)}, ${Math.min(255, g + 25)}, ${Math.min(255, b + 25)})`);
    grad.addColorStop(0.7, `rgb(${r}, ${g}, ${b})`);
    grad.addColorStop(1, `rgb(${Math.max(0, r - 35)}, ${Math.max(0, g - 35)}, ${Math.max(0, b - 35)})`);

    ctx.beginPath();
    ctx.arc(wellCenterX, wellCenterY, wellRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular liquid reflection
    if (!sample.simulateBlur) {
      ctx.beginPath();
      ctx.ellipse(
        wellCenterX - wellRadius * 0.35, 
        wellCenterY - wellRadius * 0.35, 
        wellRadius * 0.25, 
        wellRadius * 0.12, 
        Math.PI / 4, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
    }
    ctx.restore();

    // Glare Simulation
    if (sample.simulateGlare) {
      const glareGrad = ctx.createLinearGradient(0, 0, width, height);
      glareGrad.addColorStop(0.3, 'rgba(255,255,255,0)');
      glareGrad.addColorStop(0.5, 'rgba(255,255,255,0.75)');
      glareGrad.addColorStop(0.7, 'rgba(255,255,255,0)');
      ctx.fillStyle = glareGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Blur simulation
    if (sample.simulateBlur) {
      ctx.filter = 'blur(12px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }

    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/jpeg', 0.92);
  });
}

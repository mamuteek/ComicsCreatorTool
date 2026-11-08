import React, { useState, useEffect } from 'react';
import { Group, Rect, Image as KonvaImage } from 'react-konva';
import { ComicPanel, SpeechBubble } from '../../types/comic';
import { SpeechBubbleItem } from './SpeechBubbleItem';

interface Props {
  panel: ComicPanel;
  stageWidth: number;
  stageHeight: number;
  isSelected: boolean;
  selectedBubbleId: string | null;
  onSelectPanel: () => void;
  onSelectBubble: (bubbleId: string | null) => void;
  onUpdatePanel: (updated: ComicPanel) => void;
}

export const PanelItem: React.FC<Props> = ({
  panel,
  stageWidth,
  stageHeight,
  isSelected,
  selectedBubbleId,
  onSelectPanel,
  onSelectBubble,
  onUpdatePanel,
}) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Compute pixel bounds from percentage
  const pixelX = (panel.x / 100) * stageWidth;
  const pixelY = (panel.y / 100) * stageHeight;
  const pixelW = (panel.width / 100) * stageWidth;
  const pixelH = (panel.height / 100) * stageHeight;

  // Load image if url is provided
  useEffect(() => {
    if (!panel.imageUrl) {
      setImageObj(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = panel.imageUrl;
    img.onload = () => setImageObj(img);
  }, [panel.imageUrl]);

  const handleUpdateBubble = (updatedBubble: SpeechBubble) => {
    const newBubbles = panel.bubbles.map((b) =>
      b.id === updatedBubble.id ? updatedBubble : b
    );
    onUpdatePanel({ ...panel, bubbles: newBubbles });
  };

  return (
    <Group x={pixelX} y={pixelY} onClick={onSelectPanel} onTap={onSelectPanel}>
      {/* Panel Background & Border */}
      <Rect
        width={pixelW}
        height={pixelH}
        fill="#ffffff"
        stroke={isSelected ? '#3b82f6' : '#000000'}
        strokeWidth={isSelected ? 4 : 3}
        cornerRadius={2}
        shadowColor="black"
        shadowBlur={isSelected ? 8 : 2}
        shadowOpacity={0.15}
      />

      {/* Clipped Panel Content (Image) */}
      <Group
        clipFunc={(ctx) => {
          ctx.rect(0, 0, pixelW, pixelH);
        }}
      >
        {imageObj && (
          <KonvaImage
            image={imageObj}
            x={panel.imageOffsetX || 0}
            y={panel.imageOffsetY || 0}
            width={pixelW * (panel.imageScale || 1)}
            height={pixelH * (panel.imageScale || 1)}
            draggable={isSelected}
            onDragEnd={(e) => {
              onUpdatePanel({
                ...panel,
                imageOffsetX: e.target.x(),
                imageOffsetY: e.target.y(),
              });
            }}
          />
        )}
      </Group>

      {/* Speech Bubbles */}
      {panel.bubbles.map((bubble) => (
        <SpeechBubbleItem
          key={bubble.id}
          bubble={bubble}
          isSelected={selectedBubbleId === bubble.id}
          onSelect={() => onSelectBubble(bubble.id)}
          onChange={handleUpdateBubble}
        />
      ))}
    </Group>
  );
};


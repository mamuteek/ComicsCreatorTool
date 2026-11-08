import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Image as KonvaImage, Transformer, Text } from 'react-konva';
import { ComicPanel, SpeechBubble } from '../../types/comic';
import { SpeechBubbleItem } from './SpeechBubbleItem';

interface Props {
  panel: ComicPanel;
  stageWidth: number;
  stageHeight: number;
  isSelected: boolean;
  selectedBubbleId: string | null;
  panelEditMode: 'frame' | 'image';
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
  panelEditMode,
  onSelectPanel,
  onSelectBubble,
  onUpdatePanel,
}) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const panelGroupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Compute pixel bounds from percentage (0-100)
  const pixelX = (panel.x / 100) * stageWidth;
  const pixelY = (panel.y / 100) * stageHeight;
  const pixelW = (panel.width / 100) * stageWidth;
  const pixelH = (panel.height / 100) * stageHeight;

  // Attach transformer when panel is selected in 'frame' mode
  useEffect(() => {
    if (isSelected && panelEditMode === 'frame' && transformerRef.current && panelGroupRef.current) {
      transformerRef.current.nodes([panelGroupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, panelEditMode, pixelX, pixelY, pixelW, pixelH]);

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

  const handleDragEnd = (e: any) => {
    // Only update position if dragging the panel group itself
    if (e.target === panelGroupRef.current) {
      const newXPercent = Math.max(0, Math.min(100 - panel.width, (e.target.x() / stageWidth) * 100));
      const newYPercent = Math.max(0, Math.min(100 - panel.height, (e.target.y() / stageHeight) * 100));

      onUpdatePanel({
        ...panel,
        x: Math.round(newXPercent * 10) / 10,
        y: Math.round(newYPercent * 10) / 10,
      });
    }
  };

  const handleTransformEnd = () => {
    const node = panelGroupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newPixelW = Math.max(60, pixelW * scaleX);
    const newPixelH = Math.max(60, pixelH * scaleY);
    const newPixelX = node.x();
    const newPixelY = node.y();

    const newWPercent = Math.min(100, (newPixelW / stageWidth) * 100);
    const newHPercent = Math.min(100, (newPixelH / stageHeight) * 100);
    const newXPercent = Math.max(0, Math.min(100 - newWPercent, (newPixelX / stageWidth) * 100));
    const newYPercent = Math.max(0, Math.min(100 - newHPercent, (newPixelY / stageHeight) * 100));

    onUpdatePanel({
      ...panel,
      x: Math.round(newXPercent * 10) / 10,
      y: Math.round(newYPercent * 10) / 10,
      width: Math.round(newWPercent * 10) / 10,
      height: Math.round(newHPercent * 10) / 10,
    });
  };

  return (
    <>
      <Group
        ref={panelGroupRef}
        x={pixelX}
        y={pixelY}
        draggable={isSelected && panelEditMode === 'frame'}
        onClick={onSelectPanel}
        onTap={onSelectPanel}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Panel Background & Border */}
        <Rect
          width={pixelW}
          height={pixelH}
          fill="#ffffff"
          stroke={isSelected ? '#3b82f6' : '#000000'}
          strokeWidth={isSelected ? 3.5 : 2.5}
          cornerRadius={2}
          shadowColor="black"
          shadowBlur={isSelected ? 6 : 2}
          shadowOpacity={0.15}
        />

        {/* Panel Number Badge (top-left) */}
        <Rect
          x={0}
          y={0}
          width={22}
          height={18}
          fill={isSelected ? '#3b82f6' : '#1e293b'}
          cornerRadius={[2, 0, 4, 0]}
        />
        <Text
          x={2}
          y={3}
          width={18}
          text={String(panel.order)}
          fontSize={11}
          fontFamily="sans-serif"
          fontStyle="bold"
          fill="#ffffff"
          align="center"
        />

        {/* Clipped Panel Content (Image) */}
        <Group
          clipFunc={(ctx) => {
            ctx.rect(0, 0, pixelW, pixelH);
          }}
        >
          {imageObj ? (
            <KonvaImage
              image={imageObj}
              x={panel.imageOffsetX || 0}
              y={panel.imageOffsetY || 0}
              width={pixelW * (panel.imageScale || 1)}
              height={pixelH * (panel.imageScale || 1)}
              draggable={isSelected && panelEditMode === 'image'}
              onDragEnd={(e) => {
                onUpdatePanel({
                  ...panel,
                  imageOffsetX: e.target.x(),
                  imageOffsetY: e.target.y(),
                });
              }}
            />
          ) : (
            /* Empty panel visual guide */
            <Group>
              <Text
                x={10}
                y={pixelH / 2 - 10}
                width={pixelW - 20}
                text={panel.description || 'Empty Panel — click Generate to create image'}
                fontSize={12}
                fontFamily="sans-serif"
                fill="#94a3b8"
                align="center"
                verticalAlign="middle"
              />
            </Group>
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

      {/* Frame Transformer handles when editing panel frame */}
      {isSelected && panelEditMode === 'frame' && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={[
            'top-left',
            'top-center',
            'top-right',
            'middle-right',
            'bottom-right',
            'bottom-center',
            'bottom-left',
            'middle-left',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

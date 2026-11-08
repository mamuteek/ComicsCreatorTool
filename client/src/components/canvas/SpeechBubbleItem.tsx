import React, { useRef, useEffect } from 'react';
import { Group, Rect, Path, Text, Circle, Transformer } from 'react-konva';
import { SpeechBubble } from '../../types/comic';

interface Props {
  bubble: SpeechBubble;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newBubble: SpeechBubble) => void;
}

export const SpeechBubbleItem: React.FC<Props> = ({
  bubble,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Compute tail path SVG string connecting bubble center-bottom to (tailX, tailY)
  const renderTail = () => {
    if (bubble.type === 'caption') return null; // Captions don't have tails

    const originX = bubble.width / 2;
    const originY = bubble.height;
    const targetX = bubble.tailX;
    const targetY = bubble.tailY;

    const baseWidth = Math.min(24, bubble.width * 0.25);
    const leftBaseX = originX - baseWidth / 2;
    const rightBaseX = originX + baseWidth / 2;

    const pathData = `M ${leftBaseX} ${originY - 2} Q ${(leftBaseX + targetX) / 2} ${(originY + targetY) / 2} ${targetX} ${targetY} Q ${(rightBaseX + targetX) / 2} ${(originY + targetY) / 2} ${rightBaseX} ${originY - 2} Z`;

    return (
      <Path
        data={pathData}
        fill={bubble.bgColor || '#ffffff'}
        stroke={bubble.borderColor || '#000000'}
        strokeWidth={2.5}
      />
    );
  };

  return (
    <>
      <Group
        ref={shapeRef}
        x={bubble.x}
        y={bubble.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...bubble,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...bubble,
            x: node.x(),
            y: node.y(),
            width: Math.max(60, node.width() * scaleX),
            height: Math.max(30, node.height() * scaleY),
          });
        }}
      >
        {/* Tail */}
        {renderTail()}

        {/* Bubble Body */}
        {bubble.type === 'shout' ? (
          <Rect
            width={bubble.width}
            height={bubble.height}
            fill={bubble.bgColor || '#ffffff'}
            stroke={bubble.borderColor || '#000000'}
            strokeWidth={3}
            cornerRadius={4}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.2}
          />
        ) : (
          <Rect
            width={bubble.width}
            height={bubble.height}
            fill={bubble.bgColor || '#ffffff'}
            stroke={bubble.borderColor || '#000000'}
            strokeWidth={2.5}
            cornerRadius={bubble.type === 'thought' ? 24 : 16}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.15}
          />
        )}

        {/* Dialogue Text */}
        <Text
          text={bubble.text}
          fontSize={bubble.fontSize || 14}
          fontFamily={bubble.fontFamily || 'Comic Neue'}
          fontStyle={bubble.type === 'thought' ? 'italic' : 'bold'}
          fill={bubble.textColor || '#000000'}
          width={bubble.width - 16}
          x={8}
          y={8}
          align="center"
          verticalAlign="middle"
          listening={false}
        />

        {/* Draggable Tail Tip Handle (only shown when selected) */}
        {isSelected && bubble.type !== 'caption' && (
          <Circle
            x={bubble.tailX}
            y={bubble.tailY}
            radius={8}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              // Keep tail relative to bubble group
              onChange({
                ...bubble,
                tailX: e.target.x(),
                tailY: e.target.y(),
              });
            }}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};


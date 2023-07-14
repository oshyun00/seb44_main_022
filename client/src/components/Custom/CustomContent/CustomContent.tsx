import React, { useState, useEffect, useRef } from 'react';
import { addCustom } from '../../../api/customApis';
import ColorInput from './ColorInput';
import EraseButton from './EraseButton';
import RangeInput from './RangeInput';
import RangeInputContainer from './RangeInputContainer';
import UploadButton from './UploadButton';
import { CanvasWrapper, Canvas } from './CanvasComponent';
import UndoButton from './UndoButton';
import { ContentContainer } from './ContentContainer';
import SaveImageButton from './SaveImageButton';

const CustomContent: React.FC<{ selectedImageProp: string }> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<number>(5);
  const [color, setColor] = useState<string>('#000000');
  const [eraser, setEraser] = useState<boolean>(false);
  const [images, setImages] = useState<
    { imageUrl: string; x: number; y: number; width: number; height: number }[]
  >([]);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number>(-1);

  const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(Number(event.target.value));
  };

  const handleChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const handleUploadImage = (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDragging(false);

    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      const { naturalWidth, naturalHeight } = image;
      const targetWidth = 100;
      const targetHeight = 100;
      const aspectRatio = naturalWidth / naturalHeight;

      let width = targetWidth;
      let height = targetHeight;

      if (targetWidth / targetHeight > aspectRatio) {
        height = targetWidth / aspectRatio;
      } else {
        width = targetHeight * aspectRatio;
      }

      const newImages = [
        ...images,
        {
          imageUrl: image.src,
          x: 250,
          y: 250,
          width: width,
          height: height,
        },
      ];

      setImages(newImages);
    };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const draggedIndex = images.findIndex((imageData) => {
      const { x: imageX, y: imageY, width, height } = imageData;
      return x >= imageX && x <= imageX + width && y >= imageY && y <= imageY + height;
    });

    if (draggedIndex !== -1 && !drawingMode) {
      setIsDragging(true);
      setDraggedImageIndex(draggedIndex);
    } else if (isDragging && draggedImageIndex >= 0) {
      const draggedImage = images[draggedImageIndex];

      const newImages = images.map((imageData, index) => {
        if (index === draggedImageIndex) {
          return {
            ...imageData,
            x: x - draggedImage.width / 2,
            y: y - draggedImage.height / 2,
          };
        }
        return imageData;
      });

      setImages(newImages);
    } else {
      if (event.buttons !== 1) return;

      ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
      ctx.lineWidth = size;
      ctx.strokeStyle = eraser ? 'rgba(0,0,0,1)' : color;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas && !drawingMode) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const target = eraser ? 'destination-out' : 'source-over';
        ctx.globalCompositeOperation = target;
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (eraser) {
          const eraserWidth = ctx.lineWidth + 2;
          const temp = ctx.fillStyle;
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fillRect(x - eraserWidth / 2, y - eraserWidth / 2, eraserWidth, eraserWidth);
          ctx.fillStyle = temp;
        }
      }

      setIsDragging(true);
    }
  };

  const handleEraseButtonClick = () => {
    setEraser(!eraser);
    setDrawingMode(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedImage(null);
    setDraggedImageIndex(-1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Make sure the canvas dimensions match its CSS size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const handleImageDrag = (event: React.DragEvent<HTMLImageElement>, index: number) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { clientX, clientY } = event;
    const rect = canvas.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    if (index === draggedImageIndex) {
      const newImages = images.map((imageData, i) => {
        if (i === index) {
          return {
            ...imageData,
            x: offsetX - imageData.width / 2,
            y: offsetY - imageData.height / 2,
          };
        }
        return imageData;
      });

      setImages(newImages);
    }
  };

  const handleImageDragEnd = () => {
    setIsDragging(false);
  };
  const handleDragStartImage = (
    event: React.DragEvent<HTMLImageElement>,
    imageUrl: string,
    index: number
  ) => {
    setDraggedImageIndex(index);
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const imageUrl = event.dataTransfer.getData('text/plain');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const image = new Image();
    image.onload = () => {
      const { naturalWidth, naturalHeight } = image;
      const targetWidth = 100;
      const targetHeight = 100;
      const aspectRatio = naturalWidth / naturalHeight;
      let width = targetWidth;
      let height = targetHeight;
      if (targetWidth / targetHeight > aspectRatio) {
        width = targetHeight * aspectRatio;
      } else {
        height = targetWidth / aspectRatio;
      }

      const newImages = [
        ...images,
        {
          imageUrl: image.src,
          x: x - width / 2,
          y: y - height / 2,
          width: width,
          height: height,
        },
      ];

      setImages(newImages);
    };

    image.src = imageUrl;

    setDraggedImage(null);
    setDraggedImageIndex(-1);
  };

  const handleUndoButtonClick = () => {
    if (images.length > 0) {
      const updatedImages = [...images];
      updatedImages.pop();
      setImages(updatedImages);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setDraggedImage(null);
    setDraggedImageIndex(-1);
  };

  type ImageData = {
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };

  const handleSaveAsImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const originalCanvas = document.createElement('canvas');
    originalCanvas.width = canvas.width;
    originalCanvas.height = canvas.height;
    const originalContext = originalCanvas.getContext('2d');
    originalContext?.drawImage(canvas, 0, 0);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadAndDrawImage = (imageData: ImageData): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData.imageUrl;
        img.onload = () => {
          ctx.drawImage(img, imageData.x, imageData.y, imageData.width, imageData.height);
          resolve();
        };
      });
    };

    const promises = images.map((imageData: ImageData) => loadAndDrawImage(imageData));

    await Promise.all(promises);

    ctx.drawImage(originalCanvas, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    const byteString = atob(dataUrl.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    const file = new File([blob], 'canvas.png', { type: 'image/png' });
    try {
      const store_id = 1;
      const product_id = 1;
      await addCustom(store_id, product_id, file);
      alert('Image saved successfully.');
    } catch (error) {
      alert('Failed to save image.');
    }
  };

  return (
    <ContentContainer>
      <RangeInputContainer>
        <RangeInput value={size} onChange={handleChangeSize} />
        <ColorInput value={color} onChange={handleChangeColor} />
        <EraseButton eraser={eraser} onClick={handleEraseButtonClick} />
        <UploadButton onUpload={handleUploadImage} />
        <UndoButton onUndo={handleUndoButtonClick} />
        <SaveImageButton onSave={handleSaveAsImage} />
      </RangeInputContainer>
      <CanvasWrapper onDragOver={handleDragOver} onDrop={handleDrop}>
        {images.map((imageData, index) => (
          <img
            key={index}
            src={imageData.imageUrl}
            alt="Dragged Image"
            draggable={!isDragging}
            onDrag={(event) => handleImageDrag(event, index)}
            onDragEnd={handleImageDragEnd}
            style={{
              position: 'absolute',
              left: `${imageData.x}px`,
              top: `${imageData.y}px`,
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
            onDragStart={(event) => handleDragStartImage(event, imageData.imageUrl, index)}
          />
        ))}
        <Canvas
          forwardedRef={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </CanvasWrapper>
    </ContentContainer>
  );
};

export default CustomContent;

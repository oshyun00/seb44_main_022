import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-bottom: 30px;
  margin-left: 11px;
  @media (max-width: 200px) {
    width: 40%;
  }
`;

const SectionTitle = styled.p`
  font-family: 'Open Sans', cursive;
  font-size: 20px;
  color: var(--light-black);
  text-align: left;
  margin-left: 12px;
  margin-bottom: 12px;
`;

const ContentItem = styled.div`
  margin-left: 1.5%;
  width: 88%;
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding-left: 13px;
  padding-bottom: 10px;
`;

const ContentImage = styled.img`
  width: 57px;
  height: 57px;
  margin-right: 5px;
  border: 0.9px solid var(--light-gray);
  border-radius: 8px;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  cursor: grab;
  &:hover {
    background-color: var(--gray);
  }
  &:active {
    transform: scale(1.02);
  }
`;

const ContentImageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  grid-auto-rows: 1fr;
  gap: 8px;
  max-width: 100%;
  overflow-y: scroll;
  margin-top: 8px;
`;

interface Cream {
  ingredientName: string;
  ingredientImage: string;
  ingredientPrice: number;
}

interface CreamSectionProps {
  onImageDragStart: (event: React.DragEvent<HTMLImageElement>, imageUrl: string) => void;
  creamIngredientList: Cream[];
}

function CreamSection({ onImageDragStart, creamIngredientList }: CreamSectionProps) {
  const handleImageDragStart = (event: React.DragEvent<HTMLImageElement>) => {
    event.dataTransfer.setData('text/plain', '');
    const imageUrl = event.currentTarget.getAttribute('src');
    if (imageUrl) {
      onImageDragStart(event, imageUrl);
    }
  };

  return (
    <SectionContainer>
      <SectionTitle>크림</SectionTitle>
      <ContentItem>
        <ContentImageContainer>
          {creamIngredientList.map((cream, index) => (
            <ContentImage
              key={index}
              src={cream.ingredientImage}
              alt={cream.ingredientName}
              draggable
              onDragStart={handleImageDragStart}
            />
          ))}
        </ContentImageContainer>
      </ContentItem>
    </SectionContainer>
  );
}

export default CreamSection;

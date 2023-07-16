import { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import modal_cake from '../../../assets/images/img_modal/modal_cake.png';
import saveAsImage from '../CustomContent/UseSaveAsImage';
import ProductCartAlert from '../../../share/ProductCartAlert';
import axiosInstance from '../../../api/apis';
import CloseButton from './CloseButton';
import CartButton from './CartButton';
import Popup from './Popup';

const ImageBox = styled.div`
  position: absolute;
  background-color: #fab65d;
  width: 155px;
  height: 75px;
  bottom: 0px;
  right: 115px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px 0px 0px 0px;
`;

const blink = keyframes`
  0% {opacity: 1;}
  50% {opacity: 0.55;}
  100% {opacity: 1;}
`;

const Image = styled.img<{ blinking: boolean }>`
  width: 50px;
  height: 50px;
  cursor: pointer;

  ${({ blinking }) =>
    blinking &&
    css`
      animation: ${blink} 1.5s linear infinite;
    `}
`;
const CenteredAlertContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 58%;
  transform: translate(-50%, -50%);
  z-index: 30;
`;
type ModalButtonsProps = {
  onRequestClose: () => void;
  images: ImageData[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  storeId: number;
  productId: number;
};
type ImageData = {
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const ModalButtons = ({
  onRequestClose,
  images,
  canvasRef,
  storeId,
  productId,
}: ModalButtonsProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [blinking, setBlinking] = useState(true);
  const popupRef = useRef(null);

  const closeAlert = () => {
    setShowAlert(false);
  };

  const handleImageClick = () => {
    setBlinking(false);
    setShowPopup((prevState) => !prevState);
  };
  useEffect(() => {
    setBlinking(true);
  }, []);

  const handleSubmit = async () => {
    const formData = {
      storeId: 1,
      productId: 1,
    };
    try {
      const url = `/store/${storeId}/custom/${productId}`;
      await axiosInstance.post(url, formData);
      setShowAlert(true);
      console.log('POST 요청 성공');
    } catch (error) {
      console.error('POST 요청 실패:', error);
    }
  };

  const onSaveImage = async () => {
    const result = await saveAsImage(images, canvasRef, storeId, productId);
    if (result) {
      handleSubmit();
    }
  };

  return (
    <>
      <CloseButton onClick={onRequestClose} />
      <ImageBox ref={popupRef}>
        <Image src={modal_cake} alt="Cart" onClick={handleImageClick} blinking={blinking} />
        <CenteredAlertContainer>
          {showAlert && <ProductCartAlert closeModal={closeAlert} />}
        </CenteredAlertContainer>
      </ImageBox>
      <CartButton onSaveImage={onSaveImage} />
      {showPopup && <Popup />}
    </>
  );
};

export default ModalButtons;

import styled, {keyframes} from 'styled-components';
import { useState } from 'react';
import { BsArrowDownSquare } from 'react-icons/bs';
import { CartListName} from '../../components/CartItem/CartItem.style';
import {MypageOrderListProps} from '../../assets/interface/Mypage.interface'
import MypageOrderDetail from './MypageOrderDetail';
import DateFormatter from './DateFormatter';  
import { priceFormatter } from './PriceFormatter';

//닉네임 유효성 검사.
//CSS 반응형으로 다시 간격 조정.<-하..어렵네 
//분리할 수 있는 기능들은 분리하기
function MypageOrderList({ products  }: MypageOrderListProps) {
    const [isOpenedLocal, setIsOpenedLocal] = useState(false); 
    const handleListClick = () => {
        setIsOpenedLocal(!isOpenedLocal);
      };
    const getOrderStatusText = (status: string) => {
        if (status === 'SUSPENSION') {
          return '주문접수';
        } else if(status ==="CANCELLATION"){
            return '주문취소';
        } else if(status ==="FAILURE"){
            return '주문실패';
        } else if(status==="COMPLETION"){
            return '배송완료';
        }
        return status;
      };
    
  return <div>
    <div style={{ display: 'flex', fontSize: '14px', cursor:'pointer' }} onClick={handleListClick} >
      <CartListName style={{justifyContent:'flex-start', paddingLeft:'2rem', maxWidth:'3%'}}>
         {products.orderCount}.
      </CartListName >
      <CartListName style={{ padding: '1rem', justifyContent:'flex-start', maxWidth:'10%' }}>
        <img
          src={products.orderProductInfos[0].productImage}
          style={{ width: '4rem', height: '4rem', objectFit: 'cover' }}
        />
      </CartListName>
      <CartListName style={{ fontSize: '14px', fontWeight: 'bold', lineHeight:'1.4', minWidth:'30%', maxWidth: '30%' }}>
        {products.orderProductInfos[0].productName} <span style={{minWidth:'80px'}}><span style={{color:"var(--dark-purple)", marginLeft:'5px'}}>포함 총 {products.orderProductInfos.length}</span>건</span>
      </CartListName>
      <CartListName style={{ fontWeight: 'bold', maxWidth: '15%' }}>
        {priceFormatter(products.totalPrice)}원
      </CartListName>
      <CartListName
        style={{ fontSize: '15px', maxWidth: '22%'  }} className="hide-under-1260"
      >
       <DateFormatter timestamp={products.createdAt}></DateFormatter>
      </CartListName>
      <CartListName
        style={{ fontSize: '16px',fontWeight: 'bold' , justifyContent:'flex-end', minWidth:'10%', maxWidth: '20%' ,paddingRight:'1rem' }}
      >
        {getOrderStatusText(products.orderStatus)} <BsArrowDownSquare style={{
              fontSize:'20px',
              marginLeft: '10px',
              cursor: 'pointer',
              color: 'var(--dark-purple)',
              transform: isOpenedLocal ? 'scaleY(-1)' : 'scaleY(1)',
              transition: 'transform 0.5s ease',
            }}/>
      </CartListName>      
    </div>
    {isOpenedLocal && (
        <SlideDown>
          {products.orderProductInfos.map((product, index) => (
            <MypageOrderDetail key={index} product={product} />
          ))}
        </SlideDown>
      )}
  </div>;
}
export default MypageOrderList;

const slideDown = keyframes`
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000px;
    opacity: 1;
  }
`;

const SlideDown = styled.div`
  animation: ${slideDown} 1s ease;
`;

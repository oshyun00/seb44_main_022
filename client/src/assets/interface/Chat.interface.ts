export interface messageList {
  senderId: number;
  receiverId: number;
  content: string;
}

export interface ChatBoxProps {
  setIsOpenChatting: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: number;
}

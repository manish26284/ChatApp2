import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{
    
    const [messages, setMessages] = useState([]);
    // Users for leftSidebar
    const [users, setUsers] = useState([]);
    // We will select the id of user whom we want to chat
    const [selectedUser, setSelectedUser] = useState(null);
    // Here we will store userId and their no. of messages which we unseen
    // We will store key - value pair
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);


    // FUnction to get all users for sidebar
    const getUsers = async ()=>{
        try {
            
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    // Function to get messages for selected user
    const getMessages = async (userId)=>{
       try {
          const {data} = await axios.get(`/api/messages/${userId}`);
          if(data.success){
            setMessages(data.messages);
          }
       } catch (error) {
          toast.error(error.message);
       }
    }

    // function to send message to selected user
    const sendMessage = async (messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,
                messageData);

            if(data.success){
               setMessages((prevMessages)=>[...prevMessages, data.newMessage]);
            } 
            else{
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to subscribe to messages for selected user
    // Using this we get new messages in real time
    const subscribeToMessages = async ()=>{

        // if socket is not connected
        if(!socket){
            return;
        }
        
        socket.on("newMessage", (newMessage)=>{
           
            //Chat box is open 
           if(selectedUser && newMessage.senderId === selectedUser._id){
              newMessage.seen = true;
              setMessages((prevMessages)=> [...prevMessages, newMessage]);
              axios.put(`/api/messages/mark/${newMessage._id}`);
           } 

           else{
               // if there is prev unseen msg then inc their cnt by 1 else just add 1
               setUnseenMessages((prevUnseenMessages)=>({
                ...prevUnseenMessages, [newMessage.senderId] :
                prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
               }))
           }
        })

    }

    // Function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");

    }
    
    // Whenever selected user changes these function will called
    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
         messages,
         users,
         selectedUser,
         getUsers,
         getMessages,
         sendMessage,
         setSelectedUser,
         unseenMessages,
         setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
           {children}
        </ChatContext.Provider>
    )

}

import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import styles from "./Chatbot.module.css";
import axios from "axios";
import gif from "../../assets/output-onlinegiftools.gif";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { toast } from "react-toastify";

export default function Chatbot() {
    const [userPrompt, setUserPrompt] = useState("");
    const [allMsgs, setAllMsgs] = useState([]);
    const [convHistory, setConvHistory] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if(scrollRef.current){
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [allMsgs]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!userPrompt){
            toast.error("Empty messages are not allowed!");
            return;
        }
        setisLoading(true);
        try {
            setAllMsgs((p) => {
                return [...p, <Message message={userPrompt} role="user" />];
            });

            setUserPrompt("");

            let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chatbot/askAi`, {
                userInp: userPrompt,
                convHistory,
            });

            console.log(res.data.data);

            setAllMsgs((p) => {
                return [
                    ...p,
                    <Message
                        message={res.data.data.content}
                        role={res.data.data.role}
                    />,
                ];
            });

            setConvHistory((p) => {
                return [
                    ...p,
                    `User ${userPrompt}`,
                    `Assistant ${res.data.data.content}`,
                ];
            });
        } catch (e) {
            alert(e.message);
        } finally {
            setisLoading(false);
        }
    };

    return (
        <div className="border-gray-600 border rounded-2xl sm:w-8/12 w-full sm:m-5 mx-2 p-5 flex flex-col h-98 sm:mt-[7rem] max-sm:mt-[7em] ">
            <div className="text-center text-3xl">
                <Typography
                    variant="h4"
                    sx={{
                        color: "white",
                        fontFamily: "'Orbitron', sans-serif",
                    }}
                >
                    ExoBot
                </Typography>
            </div>

            {/* Message container, grows to fill the available space */}
            <div
                className={`${styles.scrollable} h-64 flex-grow overflow-y-auto `}
                ref={scrollRef}
            >
                <Message
                    message="Welcome to ExoPlant. You AI assistant to ask any thing related ExoPlanets"
                    role="assistant"
                />
                {allMsgs.map((v, i) => {
                    console.log(v);
                    return v;
                })}
            </div>

            {/* Input section sticks to the bottom */}

            {isLoading && <img src={gif} className="h-18 w-16" />}

            <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-row justify-between"
            >
                <input
                    type="text"
                    placeholder="Type your message here"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="bg-transparent border border-gray-600 float-start flex-grow rounded-lg px-3 py-1 outline-none"
                />
                <button
                    className="float-end text-center rounded-full px-3 ml-4 bg-gray-700"
                    type="submit"
                >
                    ^
                </button>
            </form>
        </div>
    );
}

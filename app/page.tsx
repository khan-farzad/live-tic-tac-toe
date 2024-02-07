"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://server-2sjq.onrender.com");

export default function Home() {
  const [room, setroom] = useState("");
  const [users, setUsers] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [game, setGame] = useState<string[]>(Array(9).fill(""));
  const [chat, setChat] = useState("");
  const [p1id, setP1Id] = useState('')
  const [p2id, setP2Id] = useState('')


  useEffect(() => {
    socket.on("chat message", (data) => {
      setChat(data);
    });
  }, []);

  useEffect(() => {
    socket.on("playgame", (m) => {
      const { p1, p2 } = m.data;
      const { myId } = m;
      setToken(uid === m.data.p1.id ? "x" : "o");

      const newGame = Array(9).fill("");
    });
  }, [uid]);
  
  useEffect(() => {
    console.log("connecting to server");
    socket.connect();
    socket.on("join", (d) => {
      try {
        setIsLoading(true);
        setUid(d.id);
        console.log("Updated uid:", d.id);
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    });
    socket.on("notification", (data) => {
      alert(data.noti);
    });

    return () => {
      socket.disconnect();
      console.log("disconnecting");
    };
  }, []);

  const joinRoom = () => {
    socket.emit("joinRoom", room);
  };

  const sendMessage = () => {
    socket.emit("chat message", { msg: "Hello from client!" });
  };
  const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setroom(e.target.value);
  };

  const playgame = (idx: number) => {
    let updatedGame = [...game];
    if (!updatedGame[idx]) {
      // console.log(idx)
      updatedGame[idx] = token;
      setGame(updatedGame);
      console.log("updated game", game);
      socket.emit("updateGame", {
        roomId: room,
        game: updatedGame,
      });
    }
  };
  useEffect(() => {
    socket.on("gameUpdated", (updatedGame) => {
      setGame(updatedGame);
    });
  }, []);

  return (
    <>
      <div className="">
        <div>
          <button onClick={sendMessage}>Send Message</button>
          <input type="text" onChange={handleRoomChange} />
          <button onClick={joinRoom}>Jion room</button>
          {/* <p>Number of users: {users}</p>
        <p>{`uid: ${uid}`}</p>
        <p>Your Room:{room}</p>
        <p>isLoading {isLoading}</p>
      <p>No. of rooms {rooms}</p> */}
          <p>{chat}</p>
          <p>{`token -> ${token}`}</p>

          <p>
            Game:
            {game.map((value, index) => (
              <span key={index}>{value} </span>
            ))}
          </p>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="grid bg-black grid-cols-3 gap-[10px] grid-rows-3 h-[620px] w-[620px]">
          {game.map((value, index) => (
            <div
              key={index}
              className="bg-white h-[200px] w-[200px] flex justify-center items-center text-9xl"
              onClick={() => playgame(index)}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

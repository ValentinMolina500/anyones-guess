import React, { useEffect, useState, useRef } from "react";

import { useLocation, useHistory } from "react-router-dom";
import {
  Box,
  Input,
  List,
  ListItem,
  Button,
  GridItem,
  Grid,
  Text,
  Heading,
  Tag,
  Spinner,
  Flex
} from "@chakra-ui/react";
import socket from "./utilities/socket";

const Status = {
  WAITING_FOR_PLAYERS: 0,
  IN_GAME: 1
};

export default function ClientComponent() {
  const history = useHistory();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [users, setUsers] = useState([]);
  const [gameState, setGameState] = useState({})
  const temp = useLocation();

  if (!temp.username) {
    history.push("/");
  }
  useEffect(() => {
    socket.auth = { username: temp.username }
    socket.connect();

    /* Setup listeners */
    socket.on("users", (users) => {
      setUsers(users);
    });

    socket.on("user connected", (user) => {
      setUsers((oldUsers) => [...oldUsers, user]);
    });

    socket.on("user disconnected", (id) => {
      console.log("id: ", id);
      setUsers((oldUsers) => oldUsers.filter((user) => user.userID !== id));
    });

    socket.on("new message", (msg) => {
      setMessages((oldMsgs) => [...oldMsgs, msg]);
    });

    socket.on("game state", (state) => {
      console.log("this is state: ", state);
      setGameState(state)
    })

    return () => socket.disconnect();
  }, []);

  const renderUsers = () => {
    return users.map((user, i) => {
      return (
        <ListItem p="0.5rem" key={i}>
          {user.username}
        </ListItem>
      );
    });
  };

  const renderMessages = () => {
    return messages.map((msg, i) => {
      const date = new Date(msg.timestamp);
      const timestamp = "Sent " + date.toLocaleTimeString('en-US');
      return (
        <ListItem p="0.5rem" key={i}>
          <Text fontSize="sm" fontWeight="bold" color="gray.300">{msg.username}</Text>
          <Tag colorScheme={msg.id === socket.id ? "teal" : "blue"}>{msg.content}</Tag>
          <Text fontSize="xs" fontStyle = "italic" color="gray.300">{timestamp}</Text>
        </ListItem>
      );
    });
  };

  const sendMsg = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("message sent", value);
      setValue("");
    }
  };

  return (
    <Grid gridTemplateColumns="auto 1fr" h="100vh" w="100vw">
      <GridItem pt="1rem" overflow="hidden" bg="gray.700" boxShadow="lg" gridColumn="1" w="20rem" borderRight="1px solid" borderRightColor="gray.900">
        <Box textAlign="center" w="100%" maxW="20rem">
          <Heading bg="gray.700" fontSize="md" textColor="white">Lobby</Heading>
        </Box>
        <List overflowY="auto"  textAlign="center"   color="white">
          {renderUsers()}
        </List>
        {
          gameState.status === Status.WAITING_FOR_PLAYERS &&
          <Flex mt="1rem" flexDirection="column" alignItems="center">
            <Spinner color="white"/>
            <Text color="white">Wating for more players...</Text>
          </Flex>
        }
      </GridItem>

      <GridItem overflow="hidden"  h="100%">
        <Grid h="100%"  gridTemplateRows="1fr auto">
          <List overflowY="auto" bg="gray.800" color="white">
            {renderMessages()}
          </List>
          <Box p="1rem" bg="gray.700" >
            <form style={{display: "flex"}}>
              <Input value={value} onChange={(e) => setValue(e.target.value)} color="white" variant="outline" placeholder="Message" />
              <Button ml="1rem" onClick={sendMsg} colorScheme="teal" type="submit">Send</Button>
            </form>
           
          </Box>
        </Grid>
      </GridItem>
    </Grid>
  );
}

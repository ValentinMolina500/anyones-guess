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
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import socket from "./utilities/socket";

const Status = {
  WAITING_FOR_PLAYERS: 0,
  IN_GAME: 1,
};

const TurnStatus = {
  PLAYER1_ASK: 0,
  PLAYER1_RESPONSE: 1,
  PLAYER2_ASK: 2,
  PLAYYER2_RESPONSE: 3,
};

export default function ClientComponent() {
  const history = useHistory();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [users, setUsers] = useState([]);
  const [gameState, setGameState] = useState({});
  const [winner, setWinner] = useState(false);
  const temp = useLocation();

  /* Send user back on invalid username */
  if (!temp.username) {
    history.push("/");
  }

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.auth = { username: temp.username };
    socket.connect();

    /* Setup listeners */
    socket.on("users", (users) => {
      setUsers(users);
    });

    socket.on("user connected", (user) => {
      setUsers((oldUsers) => [...oldUsers, user]);
    });

    socket.on("user disconnected", (id) => {
      setUsers((oldUsers) => oldUsers.filter((user) => user.userID !== id));
    });

    socket.on("new message", (msg) => {
      setMessages((oldMsgs) => [...oldMsgs, msg]);
    });

    socket.on("game state", (state) => {
      setGameState(state);
    });

    socket.on("game win", (user) => {
      setWinner(user)
    })

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current.scrollIntoView();
  }, [messages]);

  const shouldRenderNoun = (user) => {
    const isPlayerOne = user.userID === gameState.playerOne.userID;
    const isPlayerTwo = user.userID === gameState.playerTwo.userID;

    if (socket.id === gameState.playerOne.userID && isPlayerOne) {
      return (
        <>
          <Text fontWeight="bold">???</Text>
          <Text>Tries: {gameState.playerOneTries}</Text>
        </>
      )
    }

    if (socket.id === gameState.playerTwo.userID && isPlayerTwo) {
      return (
        <>
          <Text fontWeight="bold">???</Text>
          <Text>Tries: {gameState.playerTwoTries}</Text>
        </>
      )
    }
    if (isPlayerOne) {
      return (
        <>
          <Text fontWeight="bold">{gameState.playerOneNoun}</Text>
          <Text>Tries: {gameState.playerOneTries}</Text>
        </>
      )
    } else if (isPlayerTwo) {
      return (
        <>
          <Text fontWeight="bold">{gameState.playerTwoNoun}</Text>
          <Text>Tries: {gameState.playerTwoTries}</Text>
        </>
      )
    } else {
      return null;
    }
  };
  const renderUsers = () => {
    return users.map((user, i) => {
      if (gameState.status === Status.IN_GAME) {
        const isPlayerOne = user.userID === gameState.playerOne.userID;
        const isPlayerTwo = user.userID === gameState.playerTwo.userID;

        return (
          <ListItem
            border={user.userID === socket.id ? "2px dashed white" : "unset"}
            bg={isPlayerOne ? "teal.500" : isPlayerTwo ? "blue.500" : "unset"}
            p="0.5rem"
            key={i}
          >
            {user.username}
            {shouldRenderNoun(user)}
          </ListItem>
        );
      }

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
      const timestamp = "Sent " + date.toLocaleTimeString("en-US");
      if (msg.type === "regular") {
        return (
          <ListItem p="0.5rem" key={i}>
            <Text fontSize="sm" fontWeight="bold" color="gray.300">
              {msg.username}
            </Text>
            <Text
              py="0.25rem"
              px="0.5rem"
              w="fit-content"
              borderRadius="md"
              bg={msg.id === socket.id ? "teal.400" : "white"}
              color={msg.id === socket.id ? "white" : "gray.800"}
            >
              {msg.content}
            </Text>
            <Text fontSize="xs" fontStyle="italic" color="gray.300">
              {timestamp}
            </Text>
          </ListItem>
        );
      } else if (msg.type === "system") {
        return (
          <ListItem textAlign="center">
            <Text textDecor="underline">{msg.content}</Text>
          </ListItem>
        );
      } else if (msg.type === "playerOneAsk") {
        return (
          <ListItem textAlign="center">
            <Text bg="teal.500" color="white">
              {msg.content}
            </Text>
          </ListItem>
        );
      } else if (msg.type === "playerTwoAsk"){
        return (
          <ListItem textAlign="center">
            <Text bg="blue.500" color="white">
              {msg.content}
            </Text>
          </ListItem>
        );
      } else {
        return (
          <ListItem textAlign="center">
            <Text fontStyle="italic"  color="white">
              {`${msg.username} guessed ${msg.content} (INCORRECT!)`}
            </Text>
          </ListItem>
        )
        
      }
    });
  };

  const sendMsg = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("message sent", value);
      setValue("");
    }
  };

  const onPlayerOneAskSend = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("player one ask", value);
      setValue("");
    }
  };

  const onPlayerTwoAskSend = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("player two ask", value);
      setValue("");
    }
  };

  const onPlayerOneResponse = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("player one response", value);
      setValue("");
    }
  };

  const onPlayerTwoResponse = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("player two response", value);
      setValue("");
    }
  };

  const onPlayerOneGuess = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("player one guess", value);
      setValue("");
    }
  }

  const onPlayerTwoGuess = (e) => {
    e.preventDefault();
    if (value !== "") {
      socket.emit("player two guess", value);
      setValue("");
    }
  }

  const renderWinModal = () => {
    if (socket.id === gameState.playerOne.userID) {
      if (socket.id === winner.userID) {
        history.push({
          pathname: './GameOver',
          status: 'Win',
        });
        return "You win!"
      } else {
        history.push({
          pathname: './GameOver',
          status: 'Lost',
        });
        return "You lost!"
      }
    }

    if (socket.id === gameState.playerTwo.userID) {
      if (socket.id === winner.userID) {
        history.push({
          pathname: './GameOver',
          status: 'Win',
        });
        return "You win!"
      } else {
        history.push({
          pathname: './GameOver',
          status: 'Lost',
        });
        return "You lost!"
      }
    }

    else {
      history.push({
        pathname: './GameOver',
        status: '',
      });
      return `${winner.username} won!`
    }

  }

  const renderControls = () => {
    if (
      gameState.status === Status.WAITING_FOR_PLAYERS ||
      (gameState &&
        Object.keys(gameState).length === 0 &&
        gameState.constructor === Object)
    ) {
      return (
        <form style={{ display: "flex" }}>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            color="white"
            placeholder="Message"
          />
          <Button ml="1rem" onClick={sendMsg} colorScheme="teal" type="submit">
            Send
          </Button>
        </form>
      );
    } else {
      if (gameState.turnStatus === TurnStatus.PLAYER1_ASK) {
        if (socket.id === gameState.playerOne.userID) {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                placeholder="Ask a yes or no question"
              />
              <Button onClick={onPlayerOneGuess} ml="1rem" colorScheme="teal">
                Guess
              </Button>
              <Button
                ml="1rem"
                onClick={onPlayerOneAskSend}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        } else {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                isDisabled={true}
                placeholder="Waiting for response..."
              />
              <Button
                ml="1rem"
                isDisabled={true}
                onClick={sendMsg}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        }
      }

      if (gameState.turnStatus === TurnStatus.PLAYER2_ASK) {
        if (socket.id === gameState.playerTwo.userID) {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                placeholder="Ask a yes or no question"
              />
              <Button onClick={onPlayerTwoGuess} ml="1rem" colorScheme="teal">
                Guess
              </Button>
              <Button
                ml="1rem"
                onClick={onPlayerTwoAskSend}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        } else {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                isDisabled={true}
                placeholder="Waiting for response..."
              />
              <Button
                ml="1rem"
                isDisabled={true}
                onClick={sendMsg}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        }
      }

      if (gameState.turnStatus === TurnStatus.PLAYER1_RESPONSE) {
        if (socket.id === gameState.playerOne.userID) {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                isDisabled={true}
                placeholder="Waiting for response..."
              />
              <Button isDisabled={true}  ml="1rem" colorScheme="teal">
                Guess
              </Button>
              <Button
                ml="1rem"
                isDisabled={true}
                onClick={sendMsg}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        } else if (
          gameState.fsm2_list.find((elem) => elem.userID === socket.id) !==
          undefined
        ) {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                placeholder="Answer yes/no/maybe?"
              />
              <Button
                ml="1rem"
                onClick={onPlayerOneResponse}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        } else {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                isDisabled={true}
                placeholder="Waiting for response"
              />
              <Button
                ml="1rem"
                isDisabled={true}
                onClick={sendMsg}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        }
      }

      if (gameState.turnStatus === TurnStatus.PLAYER2_RESPONSE) {
        if (socket.id === gameState.playerTwo.userID) {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                isDisabled={true}
                placeholder="Waiting for response..."
              />
              <Button isDisabled={true}  ml="1rem" colorScheme="teal">
                Guess
              </Button>
              <Button
                ml="1rem"
                isDisabled={true}
                onClick={sendMsg}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        } else if (
          gameState.fsm4_list.find((elem) => elem.userID === socket.id) !==
          undefined
        ) {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                placeholder="Answer yes/no/maybe?"
              />
              <Button
                ml="1rem"
                onClick={onPlayerTwoResponse}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        } else {
          return (
            <form style={{ display: "flex" }}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                color="white"
                isDisabled={true}
                placeholder="Waiting for response..."
              />
              <Button
                ml="1rem"
                isDisabled={true}
                onClick={sendMsg}
                colorScheme="teal"
                type="submit"
              >
                Send
              </Button>
            </form>
          );
        }
      }
    }
  };

  return (
    <Grid gridTemplateColumns="auto 1fr" h="100vh" w="100vw">

      {
        winner && (
          <Modal isOpen={winner}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>A winner!</ModalHeader>
          <ModalBody>
            {renderWinModal()}
          </ModalBody>

          
        </ModalContent>
      </Modal>
        )
      }
      
      <GridItem
        pt="1rem"
        overflow="hidden"
        bg="gray.800"
        boxShadow="lg"
        gridColumn="1"
        w="20rem"
        borderRight="1px solid"
        borderRightColor="gray.900"
      >
        <Box overflowY="auto" h="100%">
          <Box textAlign="center" w="100%" maxW="20rem">
            <Heading bg="gray.800" fontSize="md" textColor="white">
              Lobby
            </Heading>
          </Box>
          <List textAlign="center" color="white">
            {renderUsers()}
          </List>
          {gameState.status === Status.WAITING_FOR_PLAYERS && (
            <Flex mt="1rem" flexDirection="column" alignItems="center">
              <Spinner color="white" />
              <Text color="white">Wating for more players...</Text>
            </Flex>
          )}
          {
            gameState.status === Status.WAITING_FOR_PLAYERS && (
              <Box textAlign="center" mt="1rem">
                <Button onClick={() => socket.emit("start game")} colorScheme="teal">Start Game</Button>
              </Box>
            )
          }
        </Box>
      </GridItem>

      <GridItem overflow="hidden" h="100%">
        <Grid h="100%" gridTemplateRows="1fr auto">
          <List overflowY="auto" bg="gray.700" color="white">
            {renderMessages()}
            <div ref={messagesEndRef} />
          </List>
          <Box p="1rem" bg="gray.700">
            {renderControls()}
          </Box>
        </Grid>
      </GridItem>
    </Grid>
  );
}

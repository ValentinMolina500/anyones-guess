import { Button, Grid, Heading, Input, Box, Flex } from '@chakra-ui/react';
import firebase from './utilities/firebase';
import API from './utilities/API';

function Test() {

  const testAPI = async () => {
    const result = await API.test();
    console.log(await result.text());
  }

  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column" pt="4rem" w="40rem" d="block" mx="auto" className="Test">
      <Button onClick={() => firebase.addPlayer("example")}>Add Player</Button>
      <Button onClick={testAPI}>Test Server</Button>
    </Flex>
  );
}

export default Test;
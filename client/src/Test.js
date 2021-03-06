import { Button, Grid, Heading, Input, Box, Flex } from '@chakra-ui/react';
import firebase from './utilities/firebase';

function Test() {
  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column" pt="4rem" w="40rem" d="block" mx="auto" className="Test">
      <Button onClick={() => firebase.addPlayer("example")}>Add Player</Button>
      
    </Flex>
  );
}

export default Test;
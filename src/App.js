import { Button, Grid, Heading, Input, Box } from '@chakra-ui/react';


function App() {
  return (
    <Grid h="100vh" w="100vw" placeItems="center">
      <Box textAlign="center" w="100%" maxW="20rem">
        <Heading mb="2.5rem">Anyones Guess</Heading>
        <Input mb="1rem" />
        <Button w="100% ">Play Game</Button>
      </Box>
    </Grid>
  );
}

export default App;

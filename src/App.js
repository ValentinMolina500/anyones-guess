import { Button, Grid, Heading, Input, Box } from '@chakra-ui/react';


function App() {
  return (
    <Grid h="100vh" w="100vw" placeItems="center">
      <Box textAlign="center">
        <Heading mb="8">Anyones Guess</Heading>
        <Input mb="8"></Input>
        <Button>Play Game</Button>
      </Box>
    </Grid>
  );
}

export default App;

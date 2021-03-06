import { Button, Grid, Heading, Input, Box, background } from '@chakra-ui/react';
import Background from './images/thinking.jpg';

const styles = {
  paperContainer: {
    backgroundImage: `url(${Background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
};


function App() {
  return (
    <Grid style={styles.paperContainer} h="100vh" w="100vw" placeItems="center">
      <Box textAlign="center" w="100%" maxW="20rem">
        <Heading textColor="white" mb="1.5rem">Anyone's Guess</Heading>
        <Input color="white" mb="1rem" placeholder="In Game Name"/>
        <Button w="50%" >Play Game</Button>
      </Box>
    </Grid>
  );
}

export default App;

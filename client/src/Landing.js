import { Button, Grid, Heading, Input, Box, background } from '@chakra-ui/react';
import Background from './images/thinking.jpg';
import React from 'react';
import API from './utilities/API';
import { useHistory } from 'react-router-dom';

const styles = {
  paperContainer: {
    backgroundImage: `url(${Background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
};

function Landing() {
  const handleChange = (event) => setValue(event.target.value)
  const [value, setValue] = React.useState("")

  const history = useHistory();

  const testAPI = async (username) =>{
    history.push({
      pathname: './Game',
      username: value,
    });
  }

  return (
    <Grid style={styles.paperContainer} h="100vh" w="100vw" placeItems="center">
      <Box textAlign="center" w="100%" maxW="20rem">
        <Heading textColor="white" mb="1.5rem">Anyone's Guess</Heading>
        <Input onChange={handleChange} color="white" mb="1rem" placeholder="In Game Name"/>
        <Button w="50%" onClick={() => testAPI(value)}>Play Game</Button>
      </Box>
    </Grid>
  )
}

export default Landing;
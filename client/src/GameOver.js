import { Button, Grid, Heading, Input, Box, background } from '@chakra-ui/react';
import BackgroundWin from './images/Congrats.jpg';
import BackgroundLoss from './images/thinking.jpg';
import React from 'react';
import API from './utilities/API';
import { useHistory } from 'react-router-dom';

const stylesWin = {
  paperContainer: {
    backgroundImage: `url(${BackgroundWin})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }
};

const stylesLoss = {
    paperContainer: {
      backgroundImage: `url(${BackgroundLoss})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }
  };

function GameOver() {

  let textEntered = false;

  const handleChange = (event) => {
    setValue(event.target.value)
  };

  const [value, setValue] = React.useState("")
  const history = useHistory();

  const testAPI = async (username) =>{
    history.push({
      pathname: './Landing',
      username: value,
    });
  }

  if(true){
    return (
        <Grid style={stylesWin.paperContainer} h="100vh" w="100vw" placeItems="center">
        <Box textAlign="center" w="100%" maxW="20rem">
            <Heading textColor="white" mb="1.5rem">You Won!</Heading>
            <Button w="50%" onClick={() => testAPI(value)}>Play Again</Button>
        </Box>
        </Grid>
    )
    }
    else{
        return (
            <Grid style={stylesLoss.paperContainer} h="100vh" w="100vw" placeItems="center">
            <Box textAlign="center" w="100%" maxW="20rem">
                <Heading textColor="white" mb="1.5rem">Anyone's Guess</Heading>
                <Button w="50%" onClick={() => testAPI(value)}>Play Again</Button>
            </Box>
            </Grid>
        )
    }
}

export default GameOver;
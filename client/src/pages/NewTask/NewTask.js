import React, {useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import {useNavigator} from 'react-animated-navigator';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';

const useStyles = makeStyles(theme => ({
  barRoot: {
    flexGrow: 1,
  },
  closeButton: {
  },
  title: {
    flexGrow: 1,
  },





  formRoot: {
    padding: theme.spacing(3, 2),
  },

  formActionRoot: {
    textAlign: 'center'
  },
}))

const TASK_MUTATION = gql`
    mutation($name: String) {
        writeANewTask(name: $name)
    }
`


export default function SearchAppBar() {
  const classes = useStyles()
  const [go] = useNavigator()
  const [name, setName] = useState('')

  const dismiss = () => go(-1)

  const [mutationTask] = useMutation(TASK_MUTATION, {
    onCompleted: dismiss
  });

  const addTask = () => mutationTask({
    variables: {
      name
    }
  })

  return (
    <div>
      <div className={classes.barRoot}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              New Task
            </Typography>
            <IconButton
              edge="end"
              className={classes.closeButton}
              color="inherit"
              onClick={dismiss}
            >
              <CloseIcon/>
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>


      <div className={classes.formRoot}>
        <TextField inputProps={{onKeyPress: (event) => {
            if(event.key === 'Enter') {
              addTask()
            }
          }}} onChange={event => setName(event.target.value)} value={name} fullWidth id="outlined-basic" label="Task name" placeholder="Buy coffee" variant="outlined" />
      </div>

      <div className={classes.formActionRoot}>
        <Button variant="contained" color="primary" onClick={addTask}>Save</Button>
        &nbsp; &nbsp;
        <Button onClick={dismiss}>Cancel</Button>
      </div>




    </div>
  )
}
import React, {useReducer, useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import {fade, makeStyles} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import {useNavigator, SharedElement} from 'react-animated-navigator';
import {useQuery, useSubscription} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {formatRelative} from 'date-fns';
import Divider from '@material-ui/core/Divider';
import produce from 'immer';
import emptyIcon from '../../images/empty.png';
import {Code} from 'react-content-loader'

const useStyles = makeStyles(theme => ({
  barRoot: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  },



  listRoot: {
    width: '100%',
  },



  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },

  loadingRoot: {
    margin: theme.spacing(3),
  }
}))

const TASKS_QUERY = gql`
    query {
        tasks {
            uuid
            name
            createdAt
        }
    }
`

const TASKS_SUBSCRIPTION = gql`
    subscription {
        taskWasNoted {
            uuid
            name
            createdAt
        }
    }
`


const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return produce(state, draftState => {
        // clean tasks list
        while (draftState.length) {
          draftState.pop();
        }
        // append each task
        action.tasks.forEach(task => draftState.push(task))
      })
    case 'APPEND_TASK':
      return produce(state, draftState => {
        draftState.push(action.task)
      })
    default:
      throw new Error('INVALID_ACTION')
  }
}

export default function SearchAppBar() {
  const classes = useStyles()
  const [go] = useNavigator()

  // const seeTaskDetail = (task, sourceId) => {
  //   go({
  //     pathname: `/${task.uuid}`,
  //     state: {
  //       sourceId,
  //       task
  //     }
  //   })
  // }

  const [tasks, dispatch] = useReducer(taskReducer, [0])

  useQuery(TASKS_QUERY, {
      fetchPolicy: 'network-only',
      onCompleted: data => {
        dispatch({
          type: 'SET_TASKS',
          tasks: data.tasks
        })
      }
    }
  )

  useSubscription(TASKS_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      const newTask = subscriptionData.data.taskWasNoted;

      dispatch({
        type: 'APPEND_TASK',
        task: newTask
      })
    }
  })


  const [keyword, setKeyword] = useState('')

  const now = new Date()

  return (
    <div>
      <div className={classes.barRoot}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} variant="h6" noWrap>
              Todo
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
          </Toolbar>
        </AppBar>
      </div>

      {(tasks[0] !== 0) ?
        (tasks.length > 0 ?
            (
              <List className={classes.listRoot}>
                {tasks
                  .filter(task => task.name.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) > -1)
                  .map(task => (
                    <React.Fragment key={task.uuid}>
                      <SharedElement id={task.uuid}>
                        <ListItem>
                          <ListItemText primary={task.name} secondary={formatRelative(new Date(task.createdAt), now)} />
                        </ListItem>
                      </SharedElement>
                      <Divider/>
                    </React.Fragment>
                ))}
              </List>
            )
            :
            (
              <div><img src={emptyIcon} width={'100%'} /></div>
            )
        )
        :
        (
          <div className={classes.loadingRoot}>
            <Code />
          </div>
        )
      }


      <Fab color="primary" aria-label="add" className={classes.fab} onClick={() => go('/new', 'flyUp')}>
        <AddIcon />
      </Fab>
    </div>
  )
}